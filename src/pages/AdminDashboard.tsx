"use client";

import { Button, Modal, Card, Avatar, Textarea, Table, Spinner } from "flowbite-react";
import { useEffect, useState } from "react";
import { supabase } from "../db/supabase";
import { useUser } from "../lib/UserContext";

const AdminDashboard = () => {
  const { current } = useUser();
  //console.log(current?.id)
  const [ndcRequests, setNdcRequests] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [openModal, setOpenModal] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchRequests = async () => {
    if (!current) return;
    setLoading(true);

     
  
    // 1. Get pending approvals for current admin
    const { data: approvals, error } = await supabase
      .from("ndc_approval")
      .select("request_id")
      .eq("admin_id", current.id) // must use correct current.id from `profile`
      .eq("status", "pending");
  
    if (error) {
      console.error("Error fetching approvals:", error);
      setLoading(false);
      return;
    }
  
    const requestIds = approvals.map((a) => a.request_id);
  
    if (requestIds.length === 0) {
      setNdcRequests([]);
      setLoading(false);
      return;
    }
  
    // 2. Fetch student data from ndc_part_one
    const { data: ndcData, error: ndcError } = await supabase
      .from("ndc_part_one")
      .select("*")
      .in("id", requestIds);
  
    if (ndcError) {
      console.error("Error fetching NDC details:", ndcError);
    } else {
      setNdcRequests(ndcData);
    }
  
    setLoading(false);
  };
  

  const handleRequestClick = (request: any) => {
    setSelectedRequest(request);
    setOpenModal(true);
  };

  const handleDecision = async (status: "approved" | "rejected") => {
    if (!selectedRequest || !current) return;

    const { error } = await supabase
      .from("ndc_approval")
      .update({
        status,
        remarks,
        updated_at: new Date().toISOString(),
      })
      .match({
        admin_id: current.id,
        request_id: selectedRequest.id,
      });

    if (error) {
      console.error("Failed to update approval:", error);
      return;
    }

    setOpenModal(false);
    setRemarks("");
    fetchRequests(); // Refresh list
  };

  useEffect(() => {
    fetchRequests();
  }, [current]);

  return (
    <div className="container mx-auto p-4">
      <p className="font-semibold text-center text-sm p-2">
        Welcome {current?.username}
      </p>

      <h2 className="text-2xl font-semibold mb-4">NDC Requests</h2>

      {loading ? (
        <div className="flex justify-center">
          <Spinner color="info" aria-label="Loading" />
        </div>
      ) : ndcRequests.length === 0 ? (
        <p className="text-center text-gray-500">No pending NDC requests.</p>
      ) : (
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell>NDC ID</Table.HeadCell>
            <Table.HeadCell>Name</Table.HeadCell>
            <Table.HeadCell>Course</Table.HeadCell>
            <Table.HeadCell>Roll</Table.HeadCell>
            <Table.HeadCell>Action</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {ndcRequests.map((request) => (
              <Table.Row key={request.id}>
                <Table.Cell>{request.id}</Table.Cell>
                <Table.Cell>{request.student_name}</Table.Cell>
                <Table.Cell>{request.course}</Table.Cell>
                <Table.Cell>{request.roll_number}</Table.Cell>
                <Table.Cell>
                  <Button size="xs" onClick={() => handleRequestClick(request)}>View</Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}

      {/* Modal for Request Details */}
      <Modal show={openModal && selectedRequest} size="md" onClose={() => setOpenModal(false)}>
        <Modal.Header>NDC Request Details</Modal.Header>
        <Modal.Body>
          <div className="flex items-center mb-4">
            <Avatar
              rounded
              img={`https://source.unsplash.com/100x100/?student&${selectedRequest?.id}`}
            />
            <div className="ml-3">
              <h3 className="text-lg font-semibold">{selectedRequest?.student_name}</h3>
              <p className="text-sm text-gray-500">{selectedRequest?.email}</p>
            </div>
          </div>
          <Card>
            <p><strong>Course:</strong> {selectedRequest?.course}</p>
            <p><strong>Roll:</strong> {selectedRequest?.roll_number}</p>
            <p><strong>Phone:</strong> {selectedRequest?.phone_number}</p>
            <p><strong>Email:</strong> {selectedRequest?.email}</p>
          </Card>
          <div className="mt-4">
            <label htmlFor="remarks" className="block mb-2 text-sm font-medium">
              Remarks:
            </label>
            <Textarea
              id="remarks"
              rows={3}
              placeholder="Write your remarks..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="success" onClick={() => handleDecision("approved")}>Approve</Button>
          <Button color="failure" onClick={() => handleDecision("rejected")}>Reject</Button>
          <Button color="gray" onClick={() => setOpenModal(false)}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminDashboard;

"use client";

import { useEffect, useState } from "react";
import { supabase } from "../db/supabase";
import { useUser } from "../lib/UserContext";
import {
  Button,
  Card,
  Modal,
  Textarea,
  Spinner,
  Table,
  Avatar,
} from "flowbite-react";
import { HiOutlineRefresh, HiOutlineEye } from "react-icons/hi";

const AdminDashboard = () => {
  const { current } = useUser();
  const [ndcRequests, setNdcRequests] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [openModal, setOpenModal] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchRequests = async () => {
    if (!current) return;
    setLoading(true);

    const { data: approvals, error } = await supabase
      .from("ndc_approval")
      .select("request_id")
      .eq("admin_id", current.id)
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
      .update({ status, remarks, updated_at: new Date().toISOString() })
      .match({ admin_id: current.id, request_id: selectedRequest.id });

    if (error) {
      console.error("Failed to update approval:", error);
      return;
    }

    setOpenModal(false);
    setRemarks("");
    fetchRequests();
  };

  useEffect(() => {
    fetchRequests();
  }, [current]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6 text-center">
        <p className="text-sm text-gray-500 mb-1">
          Welcome, <span className="font-semibold">{current?.username}</span>
        </p>
        <h2 className="text-3xl font-bold text-gray-800">
          Pending NDC Approvals
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Review and take action on submitted requests
        </p>
      </div>

      <div className="flex justify-end mb-4">
        <Button size="xs" color="success" onClick={fetchRequests} className="rounded-md shadow">
          <HiOutlineRefresh className="mr-2 h-5 w-5" /> Refresh
        </Button>
      </div>

      <div className="bg-white p-4">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Spinner color="info" aria-label="Loading" />
          </div>
        ) : ndcRequests.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-lg text-gray-500">No pending requests.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table hoverable>
              <Table.Head>
                <Table.HeadCell>NDC ID</Table.HeadCell>
                <Table.HeadCell>Name</Table.HeadCell>
                <Table.HeadCell>Course</Table.HeadCell>
                <Table.HeadCell>Roll No.</Table.HeadCell>
                <Table.HeadCell>Action</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {ndcRequests.map((request) => (
                  <Table.Row key={request.id} className="transition-all hover:bg-gray-50">
                    <Table.Cell>{request.id}</Table.Cell>
                    <Table.Cell>{request.student_name}</Table.Cell>
                    <Table.Cell>{request.course}</Table.Cell>
                    <Table.Cell>{request.roll_number}</Table.Cell>
                    <Table.Cell>
                      <Button size="xs" onClick={() => handleRequestClick(request)}>
                        <HiOutlineEye className="mr-2 h-5 w-5" />
                        View Details
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        )}
      </div>

      <Modal show={openModal && selectedRequest} size="md" onClose={() => setOpenModal(false)}>
        <Modal.Header>Request Details</Modal.Header>
        <Modal.Body>
          <div className="flex items-center mb-4">
            <Avatar rounded size="lg" img={selectedRequest?.photo_url} />
            <div className="ml-4">
              <h3 className="text-xl font-semibold">{selectedRequest?.student_name}</h3>
              <p className="text-sm text-gray-500">{selectedRequest?.email}</p>
            </div>
          </div>

          <Card className="bg-gray-50">
            <div className="space-y-1">
              <p><span className="font-semibold">Course:</span> {selectedRequest?.course}</p>
              <p><span className="font-semibold">Roll:</span> {selectedRequest?.roll_number}</p>
              <p><span className="font-semibold">Phone:</span> {selectedRequest?.phone_number}</p>
              <p><span className="font-semibold">Email:</span> {selectedRequest?.email}</p>
            </div>
          </Card>

          <div className="mt-4">
            <label htmlFor="remarks" className="block text-sm font-medium mb-1">
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
          <Button color="success" onClick={() => handleDecision("approved")}>
            Approve
          </Button>
          <Button color="failure" onClick={() => handleDecision("rejected")}>
            Reject
          </Button>
          <Button color="gray" onClick={() => setOpenModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminDashboard;

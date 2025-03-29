import { Button, Modal, Card, Avatar, Textarea, Table } from "flowbite-react";
import { useState } from "react";

const AdminDashboard = () => {
  const [openModal, setOpenModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [remarks, setRemarks] = useState("");

  const ndcRequests = [
    {
      id: 12,
      course: "B.Tech",
      roll: 1,
      name: "Alice Johnson",
      email: "alice.johnson@example.com",
      phone: "123-456-7890",
    },
    {
      id: 24,
      course: "B.Tech",
      roll: 2,
      name: "Bob Williams",
      email: "bob.williams@example.com",
      phone: "987-654-3210",
    },
    {
      id: 23,
      course: "B.Tech",
      roll: 3,
      name: "Charlie Brown",
      email: "charlie.brown@example.com",
      phone: "555-123-4567",
    },
  ];

  const handleRequestClick = (request) => {
    setSelectedRequest(request);
    setOpenModal(true);
  };

  const handleApprove = () => {
    console.log("Approved:", selectedRequest, "Remarks:", remarks);
    setOpenModal(false);
  };

  const handleReject = () => {
    console.log("Rejected:", selectedRequest, "Remarks:", remarks);
    setOpenModal(false);
  };

  return (
    <div>
      {/* <Header /> */}
      <div className="container mx-auto">
        <p className="font-semibold text-center text-sm p-2">Welcome Paddy! (RA)</p>
      </div>
      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-semibold mb-4">NDC Requests</h2>
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
              <Table.Row key={request.id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                  {request.id}
                </Table.Cell>
                <Table.Cell>{request.name}</Table.Cell>
                <Table.Cell>{request.course}</Table.Cell>
                <Table.Cell>{request.roll}</Table.Cell>
                <Table.Cell>
                  <Button size="xs" onClick={() => handleRequestClick(request)}>View</Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>

      <Modal show={openModal && selectedRequest} size={"md"} onClose={() => setOpenModal(false)}>
        <Modal.Header>NDC Request Details</Modal.Header>
        <Modal.Body>
          <div className="flex items-center mb-4">
            <Avatar rounded img={`https://source.unsplash.com/100x100/?student&${selectedRequest?.id}`} />
            <div className="ml-3">
              <h3 className="text-lg font-semibold">{selectedRequest?.name}</h3>
              <p className="text-sm text-gray-500">{selectedRequest?.email}</p>
            </div>
          </div>
          <Card>
            <p><strong>NDC ID:</strong> {selectedRequest?.id}</p>
            <p><strong>Course:</strong> {selectedRequest?.course}</p>
            <p><strong>Roll:</strong> {selectedRequest?.roll}</p>
            <p><strong>Phone:</strong> {selectedRequest?.phone}</p>
          </Card>
          <div className="mt-4">
            <label htmlFor="remarks" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Remarks:
            </label>
            <Textarea id="remarks" rows={4} placeholder="Enter your remarks here..." value={remarks} onChange={(e) => setRemarks(e.target.value)} />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="success" onClick={handleApprove}>
            Approve
          </Button>
          <Button color="failure" onClick={handleReject}>
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
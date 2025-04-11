import { useEffect, useState } from "react";
import { useForm } from "../lib/ndcFormContext";
import { Table, Spinner, Button } from "flowbite-react";
import jsPDF from "jspdf";
import { useUser } from "../lib/UserContext";

interface Ticket {
  id: number;
  student_name: string;
  course: string;
  batch: string;
  roll_number: string;
  phone_number: string;
  email: string;
  address: string;
  user_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const SuperAdminDashboard = () => {
  const { listTickets } = useForm();
  const { current } = useUser();

  const [loadingTickets, setLoadingTickets] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const fetchTickets = async () => {
    setLoadingTickets(true);
    try {
      const data: Ticket[] = await listTickets();
      setTickets(data);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const isLoading = loadingTickets;

  // Function to download ticket data as PDF
  const downloadTicketAsPDF = (ticket: Ticket) => {
    const doc = new jsPDF();

    // Add ticket details to the PDF
    doc.setFontSize(16);
    doc.text("NDC Request Details", 10, 10);
    doc.setFontSize(12);
    doc.text(`ID: ${ticket.id}`, 10, 20);
    doc.text(`Student Name: ${ticket.student_name}`, 10, 30);
    doc.text(`Course: ${ticket.course}`, 10, 40);
    doc.text(`Batch: ${ticket.batch}`, 10, 50);
    doc.text(`Roll Number: ${ticket.roll_number}`, 10, 60);
    doc.text(`Phone Number: ${ticket.phone_number}`, 10, 70);
    doc.text(`Email: ${ticket.email}`, 10, 80);
    doc.text(`Address: ${ticket.address}`, 10, 90);
    doc.text(`Status: ${ticket.status}`, 10, 100);
    doc.text(`Created At: ${ticket.created_at}`, 10, 110);
    doc.text(`Updated At: ${ticket.updated_at}`, 10, 120);

    // Save the PDF
    doc.save(`NDC_Request_${ticket.id}.pdf`);
  };

  return (
    <div className="container mx-auto p-4">
      <p className="p-2 text-center text-sm font-semibold">Welcome, {current?.email}</p>

      <h2 className="mb-4 text-2xl font-semibold">NDC Requests</h2>

      {/* Refresh Button */}
      <div className="mb-4 flex justify-end">
        <Button onClick={fetchTickets} color="info">
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <Spinner color="info" aria-label="Loading" />
        </div>
      ) : tickets.length === 0 ? (
        <p className="text-center text-gray-500">No pending NDC requests.</p>
      ) : (
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell>NDC ID</Table.HeadCell>
            <Table.HeadCell>Batch</Table.HeadCell>
            <Table.HeadCell>Course</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
            <Table.HeadCell>Action</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {tickets.map((ticket) => (
              <Table.Row key={ticket.id}>
                <Table.Cell>{ticket.id}</Table.Cell>
                <Table.Cell>{ticket.batch}</Table.Cell>
                <Table.Cell>{ticket.course}</Table.Cell>
                <Table.Cell>{ticket.status}</Table.Cell>
                <Table.Cell>
                  <Button
                    size="xs"
                    color="success"
                    onClick={() => downloadTicketAsPDF(ticket)}
                  >
                    Download PDF
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
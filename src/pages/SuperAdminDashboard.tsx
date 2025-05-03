import { useEffect, useState } from "react";
import { useForm } from "../lib/ndcFormContext";
import { Table, Spinner, Button } from "flowbite-react";
import jsPDF from "jspdf";
import { useUser } from "../lib/UserContext";
import { trackApprovalStatus } from "../lib/trackApprovalStatus";

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
      const data = await listTickets();
      if (Array.isArray(data)) {
        setTickets(data);
      } else {
        setTickets([]);
      }
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
  const downloadTicketAsPDF = async (ticket: Ticket) => {
    const doc = new jsPDF();

    // Get approval status from all admins
    const approvalStatus = await trackApprovalStatus(String(ticket.id));

    // College Header
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("ITM Skill University", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text("No-Due Certificate Request", 105, 28, { align: "center" });
    doc.setFontSize(10);
    doc.text("Generated on: " + new Date().toLocaleDateString(), 105, 35, { align: "center" });

    // Draw a line
    doc.setDrawColor(0, 0, 0);
    doc.line(20, 40, 190, 40);

    // Student Information Section
    let y = 50;
    const lineGap = 7;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("STUDENT DETAILS", 20, y);
    y += lineGap + 2;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const studentDetails = [
      ["Name", ticket.student_name],
      ["Course", ticket.course],
      ["Batch", ticket.batch],
      ["Roll Number", ticket.roll_number],
      ["Email", ticket.email],
      ["Phone", ticket.phone_number],
      ["Address", ticket.address]
    ];

    studentDetails.forEach(([label, value]) => {
      doc.text(`${label}:`, 25, y);
      doc.setFont("helvetica", "bold");
      doc.text(value, 60, y);
      doc.setFont("helvetica", "normal");
      y += lineGap;
    });

    y += lineGap;

    // Request Information
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("REQUEST INFORMATION", 20, y);
    y += lineGap + 2;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Request ID:`, 25, y);
    doc.setFont("helvetica", "bold");
    doc.text(String(ticket.id), 60, y);
    doc.setFont("helvetica", "normal");
    y += lineGap;

    doc.text(`Status:`, 25, y);
    doc.setFont("helvetica", "bold");
    doc.text(ticket.status, 60, y);
    doc.setFont("helvetica", "normal");
    y += lineGap;

    doc.text(`Created:`, 25, y);
    doc.setFont("helvetica", "bold");
    doc.text(new Date(ticket.created_at).toLocaleDateString(), 60, y);
    doc.setFont("helvetica", "normal");
    y += lineGap * 2;

    // Approval Status Section
    if (approvalStatus.success && approvalStatus.statusList) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("APPROVAL STATUS", 20, y);
      y += lineGap + 2;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Overall Progress:`, 25, y);
      doc.setFont("helvetica", "bold");
      doc.text(`${approvalStatus.progressPercent}% (${approvalStatus.approved}/${approvalStatus.totalAdmins} approved)`, 60, y);
      doc.setFont("helvetica", "normal");
      y += lineGap * 2;

      // Individual Admin Statuses
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Approving Authorities:", 25, y);
      doc.setFont("helvetica", "normal");
      y += lineGap;

      // Create a table-like structure for admin statuses
      const startX = 25;
      const nameWidth = 60;
      const statusWidth = 40;
      const statusX = startX + nameWidth + 10;

      // Table header
      doc.setFont("helvetica", "bold");
      doc.text("Name", startX, y);
      doc.text("Status", statusX, y);
      doc.setFont("helvetica", "normal");
      y += lineGap;

      // Draw a line under header
      doc.line(startX, y - 2, startX + nameWidth + statusWidth + 10, y - 2);

      // Admin status rows
      approvalStatus.statusList.forEach((status: any) => {
        doc.text(status.profile.name || "Admin", startX, y);
        doc.text(status.status.toUpperCase(), statusX, y);
        y += lineGap;
      });
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("This is a computer-generated document. No signature required.", 105, 285, { align: "center" });

    doc.save(`NDC_Request_${ticket.id}.pdf`);
  };

  return (
    <div className="container mx-auto p-4">
      <p className="p-2 text-center text-sm font-semibold">
        Welcome, {current?.email}
      </p>

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

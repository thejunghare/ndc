import { useEffect, useState } from "react";
import { useForm } from "../lib/ndcFormContext";
import { Spinner, Button, Select, Tooltip } from "flowbite-react";
import { useUser } from "../lib/UserContext";
import { trackApprovalStatus } from "../lib/trackApprovalStatus";
import jsPDF from "jspdf";
import { supabase } from "../db/supabase";
import { HiOutlineRefresh, HiDownload, HiClipboard } from "react-icons/hi";

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
  photo_url: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ApprovalStatus {
  approved: number;
  totalAdmins: number;
  progressPercent: number;
  statusList: any[];
  success: boolean;
}

const SuperAdminDashboard = () => {
  const { listTickets } = useForm();
  const { current } = useUser();

  const [loadingTickets, setLoadingTickets] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [courses, setCourses] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [approvalStatuses, setApprovalStatuses] = useState<Record<number, ApprovalStatus>>({});
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const fetchTickets = async () => {
    setLoadingTickets(true);
    try {
      const data = await listTickets();
      if (Array.isArray(data)) {
        setTickets(data);

        const statuses: Record<number, ApprovalStatus> = {};
        await Promise.all(
          data.map(async (ticket: Ticket) => {
            const status = await trackApprovalStatus(String(ticket.id));
            statuses[ticket.id] = status;
          })
        );
        setApprovalStatuses(statuses);
      } else {
        setTickets([]);
        setApprovalStatuses({});
      }
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setLoadingTickets(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase.from("course").select("name");
      if (error) {
        console.error("Error fetching courses:", error);
        return;
      }
      const courseNames = data.map((course: any) => course.name);
      setCourses(courseNames);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchCourses();
  }, []);

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCourse(e.target.value);
  };

  const filteredTickets = selectedCourse
    ? tickets.filter((ticket) => ticket.course === selectedCourse)
    : tickets;

  const downloadTicketAsPDF = async (ticket: Ticket) => {
    const doc = new jsPDF();
    const approvalStatus = await trackApprovalStatus(String(ticket.id));

    doc.setFontSize(16).setFont("helvetica", "bold")
      .text("ITM Skill University", 105, 20, { align: "center" });
    doc.setFontSize(12)
      .text("No-Due Certificate Request", 105, 28, { align: "center" })
      .setFontSize(10)
      .text("Generated on: " + new Date().toLocaleDateString(), 105, 35, { align: "center" });

    doc.line(20, 40, 190, 40);
    let y = 50;
    const lineGap = 7;

    doc.setFontSize(12).setFont("helvetica", "bold").text("STUDENT DETAILS", 20, y);
    y += lineGap + 2;

    doc.addImage(ticket.photo_url, 'jpg', 140, 50, 50, 50);

    doc.setFontSize(10).setFont("helvetica", "normal");
    const studentDetails = [
      ["Name", ticket.student_name],
      ["Course", ticket.course],
      ["Batch", ticket.batch],
      ["Roll Number", ticket.roll_number],
      ["Email", ticket.email],
      ["Phone", ticket.phone_number],
      ["Address", ticket.address],
    ];

    studentDetails.forEach(([label, value]) => {
      doc.text(`${label}:`, 25, y);
      doc.setFont("helvetica", "bold").text(value, 60, y);
      doc.setFont("helvetica", "normal");
      y += lineGap;
    });

    y += lineGap;

    doc.setFontSize(12).setFont("helvetica", "bold").text("REQUEST INFORMATION", 20, y);
    y += lineGap + 2;

    doc.setFontSize(10).setFont("helvetica", "normal");
    doc.text(`Request ID:`, 25, y);
    doc.setFont("helvetica", "bold").text(String(ticket.id), 60, y);
    y += lineGap;

    doc.text(`Status:`, 25, y);
    doc.setFont("helvetica", "bold").text(ticket.status, 60, y);
    y += lineGap;

    doc.text(`Created:`, 25, y);
    doc.setFont("helvetica", "bold").text(new Date(ticket.created_at).toLocaleDateString(), 60, y);
    y += lineGap * 2;

    if (approvalStatus.success && approvalStatus.statusList) {
      doc.setFontSize(12).setFont("helvetica", "bold").text("APPROVAL STATUS", 20, y);
      y += lineGap + 2;

      doc.setFontSize(10).setFont("helvetica", "normal");
      doc.text(`Overall Progress:`, 25, y);
      doc.setFont("helvetica", "bold").text(
        `${approvalStatus.progressPercent}% (${approvalStatus.approved}/${approvalStatus.totalAdmins} approved)`,
        60, y
      );
      y += lineGap * 2;

      doc.setFont("helvetica", "bold").text("Approving Authorities:", 25, y);
      y += lineGap;

      const startX = 25;
      const statusX = startX + 70;

      doc.setFont("helvetica", "bold").text("Name", startX, y);
      doc.text("Status", statusX, y);
      y += lineGap;
      doc.line(startX, y - 12, startX + 120, y - 12);

      approvalStatus.statusList.forEach((status: any) => {
        doc.setFont("helvetica", "normal").text(status.profile.name || "Admin", startX, y);
        doc.text(status.status.toUpperCase(), statusX, y);
        y += lineGap;
      });
    }

    doc.setFontSize(8).setTextColor(100, 100, 100)
      .text("This is a computer-generated document. No signature required.", 105, 285, { align: "center" });

    doc.save(`NDC_Request_${ticket.id}.pdf`);
  };

  const getDynamicStatus = (progressPercent: number | undefined) => {
    if (progressPercent === undefined) return "Loading...";
    if (progressPercent >= 100) return "Completed";
    if (progressPercent >= 50) return "Under Review";
    return "Pending";
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-600";
      case "Under Review":
        return "bg-yellow-100 text-yellow-600";
      case "Pending":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const handleCopy = async (id: number) => {
    await navigator.clipboard.writeText(String(id));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6 text-center">
        <p className="text-sm text-gray-500 mb-1">
          Welcome, <span className="font-semibold">{current?.email}</span>
        </p>
        <h2 className="text-3xl font-bold text-gray-800">
          No-Due Certificate Requests
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Manage your pending requests and download certificates easily
        </p>
      </div>

      <div className="flex justify-between mb-4">
        <div className="w-64">
          <Select value={selectedCourse} onChange={handleCourseChange}>
            <option value="">All Courses</option>
            {courses.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </Select>
        </div>

        <Button onClick={fetchTickets} size="xs" color="success" className="rounded-md shadow">
          <HiOutlineRefresh className="mr-2 h-5 w-5" />
          Refresh
        </Button>
      </div>

      <div className="bg-white  rounded-xl p-4">
        {loadingTickets ? (
          <div className="flex justify-center items-center h-40">
            <Spinner color="info" aria-label="Loading" />
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-lg text-gray-500">No NDC requests.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-600">
              <thead className="text-xs uppercase bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-3">NDC ID</th>
                  <th className="px-4 py-3">Batch</th>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Approvals</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTickets.map((ticket) => {
                  const approval = approvalStatuses[ticket.id];
                  const progress = approval?.progressPercent;
                  const approvalProgress = approval
                    ? `${approval.approved}/${approval.totalAdmins} (${progress}%)`
                    : "Loading...";
                  const dynamicStatus = getDynamicStatus(progress);
                  return (
                    <tr key={ticket.id}>
                      <td className="px-4 py-3 font-medium flex items-center">
                        {ticket.id}
                        <Tooltip content={copiedId === ticket.id ? "Copied!" : "Copy"}>
                          <button
                            className="ml-2 text-gray-500 hover:text-blue-600"
                            onClick={() => handleCopy(ticket.id)}
                          >
                            <HiClipboard />
                          </button>
                        </Tooltip>
                      </td>
                      <td className="px-4 py-3">{ticket.batch}</td>
                      <td className="px-4 py-3">{ticket.course}</td>
                      <td className="px-4 py-3">{approvalProgress}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(dynamicStatus)}`}
                        >
                          {dynamicStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          size="xs"
                          color="success"
                          className="rounded-md shadow"
                          onClick={() => downloadTicketAsPDF(ticket)}
                        >
                          <HiDownload className="mr-2 h-5 w-5" />
                          View PDF
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;

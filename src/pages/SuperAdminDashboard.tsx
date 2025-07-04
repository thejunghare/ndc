import { useForm } from "../lib/ndcFormContext";
import { Spinner, Button, Select, Tooltip } from "flowbite-react";
import { useUser } from "../lib/UserContext";
import { trackApprovalStatus } from "../lib/trackApprovalStatus";
import jsPDF from "jspdf";
import { supabase } from "../db/supabase";
import { HiOutlineRefresh, HiDownload, HiClipboard } from "react-icons/hi";
import {
  FiChevronDown,
  FiChevronsRight,
  FiHome,
  FiLogOut,
} from "react-icons/fi";
import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { IconType } from "react-icons";

interface SidebarProps {
  selected: string;
  setSelected: React.Dispatch<React.SetStateAction<string>>;
  logoutOption: () => void;
}

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
  photo_url?: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

interface ApprovalStatus {
  approved?: number;
  totalAdmins?: number;
  progressPercent?: number;
  statusList?: any[];
  success: boolean;
  error?: string;
}

const SuperAdminDashboard = () => {
  const { listTickets } = useForm();
  const { current, logout } = useUser();
  const navigate = useNavigate();

  const [selectedSection, setSelectedSection] = useState("dashboard");
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [courses, setCourses] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [approvalStatuses, setApprovalStatuses] = useState<
    Record<number, ApprovalStatus>
  >({});
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const logoutOption = async () => {
    await logout();
    navigate("/");
  };

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
          }),
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

    doc
      .setFontSize(16)
      .setFont("helvetica", "bold")
      .text("ITM Skill University", 105, 20, { align: "center" });
    doc
      .setFontSize(12)
      .text("No-Due Certificate Request", 105, 28, { align: "center" });
    doc
      .setFontSize(10)
      .text("Generated on: " + new Date().toLocaleDateString(), 105, 35, {
        align: "center",
      });
    doc.line(20, 40, 190, 40);

    let y = 50;
    const lineGap = 7;

    doc
      .setFontSize(12)
      .setFont("helvetica", "bold")
      .text("STUDENT DETAILS", 20, y);
    y += lineGap + 2;

    if (ticket.photo_url) {
      try {
        doc.addImage(ticket.photo_url, "JPEG", 140, 50, 50, 50);
      } catch (e) {
        console.warn("Image loading failed for PDF.");
      }
    }

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
    doc
      .setFontSize(12)
      .setFont("helvetica", "bold")
      .text("REQUEST INFORMATION", 20, y);
    y += lineGap + 2;

    doc.setFontSize(10).setFont("helvetica", "normal");
    doc.text(`Request ID:`, 25, y);
    doc.setFont("helvetica", "bold").text(String(ticket.id), 60, y);
    y += lineGap;

    doc.text(`Created:`, 25, y);
    doc
      .setFont("helvetica", "bold")
      .text(new Date(ticket.created_at).toLocaleDateString(), 60, y);
    y += lineGap * 2;

    if (approvalStatus.success && approvalStatus.statusList) {
      doc
        .setFontSize(12)
        .setFont("helvetica", "bold")
        .text("APPROVAL STATUS", 20, y);
      y += lineGap + 2;

      doc.setFontSize(10).setFont("helvetica", "normal");
      doc.text(`Overall Progress:`, 25, y);
      doc
        .setFont("helvetica", "bold")
        .text(
          `${approvalStatus.progressPercent}% (${approvalStatus.approved}/${approvalStatus.totalAdmins} approved)`,
          60,
          y,
        );
      y += lineGap * 2;

      doc.setFont("helvetica", "bold").text("Approving Authorities:", 25, y);
      y += lineGap;

      const startX = 25;
      const statusX = startX + 70;

      doc.text("Name", startX, y);
      doc.text("Status", statusX, y);
      y += lineGap;
      doc.line(startX, y - 12, startX + 120, y - 12);

      approvalStatus.statusList.forEach((status: any) => {
        doc
          .setFont("helvetica", "normal")
          .text(status.profile.name || "Admin", startX, y);
        doc.text(status.status.toUpperCase(), statusX, y);
        y += lineGap;
      });
    }

    doc
      .setFontSize(8)
      .setTextColor(100, 100, 100)
      .text(
        "This is a computer-generated document. No signature required.",
        105,
        285,
        { align: "center" },
      );

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

  const renderSection = () => {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="mb-6 text-center">
          <p className="mb-1 text-sm text-gray-500">
            Welcome, <span className="font-semibold">{current?.email}</span>
          </p>
          <h2 className="text-3xl font-bold text-gray-800">
            No-Due Certificate Requests
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            Manage your pending requests and download certificates easily
          </p>
        </div>

        <div className="mb-4 flex justify-between">
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
          <Button
            onClick={fetchTickets}
            size="xs"
            color="success"
            className="rounded-md shadow"
          >
            <HiOutlineRefresh className="mr-2 h-5 w-5" />
            Refresh
          </Button>
        </div>

        <div className=" p-4">
          {loadingTickets ? (
            <div className="flex h-40 items-center justify-center">
              <Spinner color="info" aria-label="Loading" />
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-lg text-gray-500">No NDC requests.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full rounded-lg text-left text-sm text-gray-600">
                <thead className="bg-white text-xs uppercase text-gray-700">
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
                        <td className="flex items-center px-4 py-3 font-medium">
                          {ticket.id}
                          <Tooltip
                            content={
                              copiedId === ticket.id ? "Copied!" : "Copy"
                            }
                          >
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
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                              dynamicStatus,
                            )}`}
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

  return (
    <div className="flex bg-indigo-50">
      <Sidebar
        selected={selectedSection}
        setSelected={setSelectedSection}
        logoutOption={logoutOption}
      />
      <div className="h-full w-full p-4">{renderSection()}</div>
    </div>
  );
};

export default SuperAdminDashboard;

// Sidebar
const Sidebar = ({ selected, setSelected, logoutOption }: SidebarProps) => {
  const [open, setOpen] = useState(true);

  return (
    <motion.nav
      layout
      className="sticky top-0 h-screen shrink-0 border-r border-slate-300 bg-white p-2"
      style={{
        width: open ? "225px" : "fit-content",
      }}
    >
      <TitleSection open={open} />

      <div className="space-y-1">
        <Option
          Icon={FiHome}
          title="Dashboard"
          selected={selected}
          setSelected={setSelected}
          open={open}
        />

        <Option
          Icon={FiLogOut}
          title="logout"
          selected={selected}
          setSelected={(title) => {
            if (title === "logout") logoutOption();
            else setSelected(title);
          }}
          open={open}
        />
      </div>

      <ToggleClose open={open} setOpen={setOpen} />
    </motion.nav>
  );
};

// Option
const Option = ({
  Icon,
  title,
  selected,
  setSelected,
  open,
  notifs,
}: {
  Icon: IconType;
  title: string;
  selected: string;
  setSelected: Dispatch<SetStateAction<string>>;
  open: boolean;
  notifs?: number;
}) => {
  return (
    <motion.button
      layout
      onClick={() => setSelected(title)}
      className={`relative flex h-10 w-full items-center rounded-md transition-colors ${
        selected === title
          ? "bg-indigo-100 text-indigo-800"
          : "text-slate-500 hover:bg-slate-100"
      }`}
    >
      <motion.div
        layout
        className="grid h-full w-10 place-content-center text-lg"
      >
        <Icon />
      </motion.div>
      {open && (
        <motion.span
          layout
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.125 }}
          className="text-xs font-medium"
        >
          {title.charAt(0).toUpperCase() + title.slice(1)}
        </motion.span>
      )}

      {notifs && open && (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ y: "-50%" }}
          transition={{ delay: 0.5 }}
          className="absolute right-2 top-1/2 size-4 rounded bg-indigo-500 text-xs text-white"
        >
          {notifs}
        </motion.span>
      )}
    </motion.button>
  );
};

// Title section
const TitleSection = ({ open }: { open: boolean }) => {
  return (
    <div className="mb-3 border-b border-slate-300 pb-3">
      <div className="flex cursor-pointer items-center justify-between rounded-md transition-colors hover:bg-slate-100">
        <div className="flex items-center gap-2">
          <Logo />
          {open && (
            <motion.div
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.125 }}
            >
              <span className="block text-xs font-semibold">NDC SAdmin</span>
              <span className="block text-xs text-slate-500">ISU</span>
            </motion.div>
          )}
        </div>
        {open && <FiChevronDown className="mr-2" />}
      </div>
    </div>
  );
};

// Logo
const Logo = () => (
  <motion.div
    layout
    className="grid size-10 shrink-0 place-content-center rounded-md"
  >
    <img
      src="/isu_logo.jpeg"
      alt="ISU Logo"
      width={32}
      height={32}
      className="object-contain"
    />
  </motion.div>
);

// Collapse
const ToggleClose = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  return (
    <motion.button
      layout
      onClick={() => setOpen((pv) => !pv)}
      className="absolute bottom-0 left-0 right-0 border-t border-slate-300 transition-colors hover:bg-slate-100"
    >
      <div className="flex items-center p-2">
        <motion.div
          layout
          className="grid size-10 place-content-center text-lg"
        >
          <FiChevronsRight
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          />
        </motion.div>
        {open && (
          <motion.span
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.125 }}
            className="text-xs font-medium"
          >
            Hide
          </motion.span>
        )}
      </div>
    </motion.button>
  );
};

// Main content
// const ExampleContent = ({
//   renderSection,
// }: {
//   renderSection: () => React.ReactNode;
// }) => <div className="h-[200vh] w-full p-4">{renderSection()}</div>;

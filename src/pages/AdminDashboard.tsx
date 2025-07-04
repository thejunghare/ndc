"use client";

import { useEffect, useState, Dispatch, SetStateAction } from "react";
import { supabase } from "../db/supabase";
import { useUser } from "../lib/UserContext";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Modal,
  Textarea,
  Spinner,
  Table,
  Avatar,
} from "flowbite-react";
import {
  FiChevronDown,
  FiChevronsRight,
  FiHome,
  FiLogOut,
} from "react-icons/fi";
import { HiOutlineRefresh, HiOutlineEye } from "react-icons/hi";
import { motion } from "framer-motion";
import { IconType } from "react-icons";

interface SidebarProps {
  selected: string;
  setSelected: React.Dispatch<React.SetStateAction<string>>;
  logoutOption: () => void;
}

const AdminDashboard = () => {
  const { current, logout } = useUser();
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState("admin");
  const [ndcRequests, setNdcRequests] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [openModal, setOpenModal] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  const logoutOption = async () => {
    await logout();
    navigate("/");
  };

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
    <div className="flex">
      <Sidebar
        selected={selectedSection}
        setSelected={setSelectedSection}
        logoutOption={logoutOption}
      />
      <div className="w-full p-6">
        <div className="mb-6 text-center">
          <p className="mb-1 text-sm text-gray-500">
            Welcome, <span className="font-semibold">{current?.email}</span>
          </p>
          <h2 className="text-3xl font-bold text-gray-800">
            Pending NDC Approvals
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            Review and take action on submitted requests
          </p>
        </div>

        <div className="mb-4 flex justify-end">
          <Button
            size="xs"
            color="success"
            onClick={fetchRequests}
            className="rounded-md shadow"
          >
            <HiOutlineRefresh className="mr-2 h-5 w-5" /> Refresh
          </Button>
        </div>

        <div className="bg-white p-4">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Spinner color="info" aria-label="Loading" />
            </div>
          ) : ndcRequests.length === 0 ? (
            <div className="py-10 text-center">
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
                    <Table.Row
                      key={request.id}
                      className="transition-all hover:bg-gray-50"
                    >
                      <Table.Cell>{request.id}</Table.Cell>
                      <Table.Cell>{request.student_name}</Table.Cell>
                      <Table.Cell>{request.course}</Table.Cell>
                      <Table.Cell>{request.roll_number}</Table.Cell>
                      <Table.Cell>
                        <Button
                          size="xs"
                          onClick={() => handleRequestClick(request)}
                        >
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

        <Modal
          show={openModal && selectedRequest}
          size="md"
          onClose={() => setOpenModal(false)}
        >
          <Modal.Header>Request Details</Modal.Header>
          <Modal.Body>
            <div className="mb-4 flex items-center">
              <Avatar rounded size="lg" img={selectedRequest?.photo_url} />
              <div className="ml-4">
                <h3 className="text-xl font-semibold">
                  {selectedRequest?.student_name}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedRequest?.email}
                </p>
              </div>
            </div>

            <Card className="bg-gray-50">
              <div className="space-y-1">
                <p>
                  <span className="font-semibold">Course:</span>{" "}
                  {selectedRequest?.course}
                </p>
                <p>
                  <span className="font-semibold">Roll:</span>{" "}
                  {selectedRequest?.roll_number}
                </p>
                <p>
                  <span className="font-semibold">Phone:</span>{" "}
                  {selectedRequest?.phone_number}
                </p>
                <p>
                  <span className="font-semibold">Email:</span>{" "}
                  {selectedRequest?.email}
                </p>
              </div>
            </Card>

            <div className="mt-4">
              <label
                htmlFor="remarks"
                className="mb-1 block text-sm font-medium"
              >
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
    </div>
  );
};

export default AdminDashboard;

// --- Sidebar Components ---
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
}) => (
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
        className="absolute right-2 top-1/2 size-4 rounded bg-indigo-500 text-xs text-white"
        style={{ y: "-50%" }}
      >
        {notifs}
      </motion.span>
    )}
  </motion.button>
);

const TitleSection = ({ open }: { open: boolean }) => (
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
            <span className="block text-xs font-semibold">NDC Admin</span>
            <span className="block text-xs text-slate-500">ISU</span>
          </motion.div>
        )}
      </div>
      {open && <FiChevronDown className="mr-2" />}
    </div>
  </div>
);

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

const ToggleClose = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => (
  <motion.button
    layout
    onClick={() => setOpen((pv) => !pv)}
    className="absolute bottom-0 left-0 right-0 border-t border-slate-300 transition-colors hover:bg-slate-100"
  >
    <div className="flex items-center p-2">
      <motion.div layout className="grid size-10 place-content-center text-lg">
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

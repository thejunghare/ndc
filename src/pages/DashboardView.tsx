"use client";

import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { useUser } from "../lib/UserContext";
import { IconType } from "react-icons";
import {
  FiChevronDown,
  FiChevronsRight,
  FiHome,
  FiEye,
  FiLogOut,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { supabase } from "../db/supabase";
import MyRequest from "./MyRequests";
import DashboardSection from "./DashboardSection";
import { useNavigate } from "react-router-dom";
interface SidebarProps {
  selected: string;
  setSelected: React.Dispatch<React.SetStateAction<string>>;
  logoutOption: () => void;
}

const DashboardView = () => {
  const { current, logout } = useUser();
  const navigate = useNavigate();

  const [_userProfile, setUserProfile] = useState<{
    username: string;
    designation: string;
  } | null>(null);

  const [selectedSection, setSelectedSection] = useState("dashboard");

  const logoutOption = async () => {
    await logout();
    navigate("/");
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!current?.id) return;

      const { data, error } = await supabase
        .from("profile")
        .select("username, designation")
        .eq("user_id", current.id)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        return;
      }

      if (data) {
        setUserProfile({
          username: data.username || "User",
          designation: data.designation || "No designation",
        });
      }
    };

    fetchUserProfile();
  }, [current?.id]);

  const renderSection = () => {
    switch (selectedSection) {
      case "dashboard":
        return <DashboardSection />;

      case "requests":
        return <MyRequest currentUserId={current?.id || ""} />;

      default:
        return <DashboardSection />;
    }
  };

  return (
    <div className="flex bg-indigo-50">
      <Sidebar
        selected={selectedSection}
        setSelected={setSelectedSection}
        logoutOption={logoutOption}
      />
      <ExampleContent renderSection={renderSection} />
    </div>
  );
};

export default DashboardView;

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
          title="dashboard"
          selected={selected}
          setSelected={setSelected}
          open={open}
        />
        <Option
          Icon={FiEye}
          title="requests"
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
              <span className="block text-xs font-semibold">NDC Portal</span>
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
// const ExampleContent = ({ renderSection }) => (
//   <div className="h-[200vh] w-full p-4">{renderSection()}</div>
// );

const ExampleContent = ({
  renderSection,
}: {
  renderSection: () => React.ReactNode;
}) => <div className="h-[200vh] w-full p-4">{renderSection()}</div>;

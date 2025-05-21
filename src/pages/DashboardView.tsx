"use client";

import {
  Badge,
  Sidebar,
  SidebarCTA,
  SidebarItem,
  SidebarItemGroup,
  SidebarItems,
  Spinner,
} from "flowbite-react";
import { useState, useEffect } from "react";
import { useUser } from "../lib/UserContext";
import {
  HiCloudDownload,
  HiInbox,
  HiOutlineAdjustments,
  HiUserCircle,
} from "react-icons/hi";
import { supabase } from "../db/supabase";
import MyRequest from "./MyRequests";
import ProfileView from "./ProfileView";
import SettingsView from "./SettingsView";
import DashboardSection from "./DashboardSection";


const DashboardView = () => {
  const { current } = useUser();
  const [userProfile, setUserProfile] = useState<{
    username: string;
    designation: string;
  } | null>(null);

  // Fetch user profile info
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

 
  //console.log('list of courses: ',courses);




  const [selectedSection, setSelectedSection] = useState("dashboard");

  const renderSection = () => {
    switch (selectedSection) {
      case "dashboard":
        return <DashboardSection/>;
      case "profile":
        return <ProfileView />;
      case "requests":
        return <MyRequest currentUserId={current?.id || ""} />;
      case "settings":
        return <SettingsView />;
      default:
        return <DashboardSection />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-full">
        <div
          className="group fixed z-50 flex h-screen w-16 flex-col overflow-hidden bg-white
                  shadow-md transition-all duration-300 ease-in-out
                  hover:w-48 md:w-64 md:hover:w-64"
        >
          <div className="flex-1 overflow-y-auto">
            {" "}
            {/* Added vertical scroll */}
            <Sidebar aria-label="Sidebar" className="h-full">
              <SidebarItems>
                <SidebarItemGroup>
                  <div className="mb-4 p-4">
                    <p className="text-sm font-semibold text-gray-700">
                      {userProfile ? (
                        <>
                          Welcome, {userProfile.username}
                          <br />
                          <span className="text-xs text-gray-500">
                            {userProfile.designation}
                          </span>
                        </>
                      ) : (
                        <Spinner size="sm" />
                      )}
                    </p>
                  </div>
                  {[
                    {
                      key: "dashboard",
                      icon: HiCloudDownload,
                      label: "Dashboard",
                    },
                    { key: "profile", icon: HiUserCircle, label: "Profile" },
                    { key: "requests", icon: HiInbox, label: "My Requests" },
                    {
                      key: "settings",
                      icon: HiOutlineAdjustments,
                      label: "Settings",
                    },
                  ].map(({ key, icon, label }) => (
                    <SidebarItem
                      key={key}
                      icon={icon}
                      active={selectedSection === key}
                      onClick={() => setSelectedSection(key)}
                      className="whitespace-nowrap px-4 transition-all duration-200"
                    >
                      <span className="hidden overflow-hidden truncate group-hover:inline-block md:inline-block">
                        {label}
                      </span>
                    </SidebarItem>
                  ))}
                </SidebarItemGroup>
              </SidebarItems>

              {/* CTA Section */}
              <SidebarItemGroup className="mt-4 border-t pt-4">
                <SidebarCTA className="px-4">
                  <div className="mb-3 flex items-center">
                    <Badge color="warning">Beta</Badge>
                    <button
                      aria-label="Close"
                      className="-m-1.5 ml-auto hidden h-6 w-6 rounded-lg bg-gray-100 p-1 text-cyan-900 hover:bg-gray-200 md:inline-flex"
                    >
                      {/* SVG icon */}
                    </button>
                  </div>
                  <div className="mb-3 hidden truncate text-sm text-cyan-900 group-hover:block md:block">
                    Preview the new NDC dashboard! Found a bug? Report it.
                  </div>
                  <a
                    className="hidden truncate text-sm text-cyan-900 underline hover:text-cyan-800 group-hover:block md:block"
                    href="#"
                  >
                    Feedback Form
                  </a>
                </SidebarCTA>
              </SidebarItemGroup>
            </Sidebar>
          </div>
        </div>

        {/* Main Content - Prevent overflow */}
        <div className="ml-16 w-[calc(100%-4rem)] p-4 sm:p-6 md:ml-64 md:w-[calc(100%-16rem)]">
          {renderSection()}
        </div>

       
      </div>
    </div>
  );
};

export default DashboardView;

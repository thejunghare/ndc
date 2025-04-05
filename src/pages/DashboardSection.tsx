"use client";

import {
  Button,
  Modal,
  Select,
  Label,
  TextInput,
  FileInput,
  Textarea,
  Progress,
  ListGroup,
  ListGroupItem,
  Badge,
  Sidebar,
  SidebarCTA,
  SidebarItem,
  SidebarItemGroup,
  SidebarItems,
} from "flowbite-react";
import { useState, useEffect } from "react";
import SpinnerComponent from "../reuseables/SpinnerComponent";
import ToastComponent from "../reuseables/ToastComponent";
import { useForm } from "../lib/ndcFormContext";
import { useUser } from "../lib/UserContext";
import {
  HiCloudDownload,
  HiInbox,
  HiOutlineAdjustments,
  HiUserCircle,
  HiRefresh
} from "react-icons/hi";
import { supabase } from "../db/supabase";
import { trackApprovalStatus } from "../lib/trackApprovalStatus";
import MyRequest from "./MyRequests";
import ProfileView from "./ProfileView";
import SettingsView from "./SettingsView";

const DashboardSection = () => {
    const [showSpinner, setShowSpinner] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [progress, setProgress] = useState(0);
    const { current } = useUser();
    //  if (current){
    //    console.log(current);
    //  }else {
    //    console.log('not auth')
    //  }
    const {
      formData,
      updateFormData,
      resetForm,
      submitForm,
      courses,
      listCourses,
    } = useForm();
    //console.log('list of courses: ',courses);
  
    const [isSubmitting, setIsSubmitting] = useState(false);
  
    useEffect(() => {
      const fetchData = async () => {
        await listCourses();
      };
  
      fetchData();
      //console.log('list ',courses)
    }, []);
  
    useEffect(() => {
      if (isSubmitting) {
        let currentProgress = 0;
        const interval = setInterval(() => {
          if (currentProgress >= 50) {
            clearInterval(interval);
          } else {
            currentProgress += 1;
            setProgress(currentProgress);
          }
        }, 20);
  
        return () => clearInterval(interval);
      }
    }, [isSubmitting]);
  
    const [openModal, setOpenModal] = useState(false);
    const [openStatusModal, setOpenStatusModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
  
    const onCloseModal = () => setOpenModal(false);
    const onCloseStatusModal = () => setOpenStatusModal(false);
  
    const handleNextPage = () => {
      if (currentPage < 2) setCurrentPage(currentPage + 1);
    };
  
    const handlePrevPage = () => {
      if (currentPage > 1) setCurrentPage(currentPage - 1);
    };
  
    const handleSubmit = async () => {
      setOpenModal(false);
      setShowSpinner(true);
  
      try {
        const response = await submitForm();
  
        setShowSpinner(false);
  
        if (response.success) {
          alert("Form submitted successfully!");
          setShowToast(true);
          updateFormData({ id: response.requestId }); // 🔥 Save requestId here
          resetForm();
        } else {
          console.error("Submission error:", response.error);
          alert("Form submission failed: " + response.error);
          setShowToast(true);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        alert("Unexpected error occurred while submitting form");
      } finally {
        setTimeout(() => setShowToast(false), 2000);
      }
    };
  
    const [ticketNumberInput, setTicketNumberInput] = useState("");
    const [approvalStatusList, setApprovalStatusList] = useState([]);
    const [trackError, setTrackError] = useState("");
  
    const handleTrackStatusSubmit = async () => {
      const requestId = ticketNumberInput.trim();
      if (!requestId) return alert("Please enter a ticket number");
  
      const result = await trackApprovalStatus(requestId);
  
      if (result.success) {
        setProgress(result.progressPercent);
        setApprovalStatusList(result.statusList);
        setTrackError("");
      } else {
        setTrackError(result.error || "Error fetching status");
        setApprovalStatusList([]);
        setProgress(0);
      }
    };
  
    const handleReviewRequest = async (requestId: string) => {
      try {
        if (!requestId || typeof requestId !== 'string') {
          alert("Invalid request ID");
          return;
        }
    
        const { error: resetError } = await supabase
          .from("ndc_approval")
          .update({ 
            status: "pending",
            review_requested: true,
            decision: null,
            remarks: null,
            updated_at: new Date().toISOString()
          })
          .eq("request_id", requestId);
    
        if (resetError) throw resetError;
    
        // Update main request using existing columns
        const { error: requestError } = await supabase
          .from("ndc_part_one")
          .update({
            status: "under_review",
            updated_at: new Date().toISOString()
          })
          .eq("id", requestId);
    
        if (requestError) throw requestError;
    
        alert("Review request sent successfully!");
        handleTrackStatusSubmit();
      } catch (err) {
        console.error("Review request error:", err);
        alert(`Failed to request review: ${err.message}`);
      }
    };
  
    <Button onClick={() => handleReviewRequest(selectedRequest.id)}>
      Request Re-Review
    </Button>;
    
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="text-xl font-bold">Welcome </div>
      {/*<p>*/}
      {/*  {current?.email*/}
      {/*    ? `${current.email} - ${current.id}`*/}
      {/*    : "No User Found"}*/}
      {/*</p>*/}

      <div className="relative flex space-x-4">
        {/* Fill NDC */}
        <div className="relative">
          <Button onClick={() => setOpenModal(true)}>Fill NDC Form</Button>
          {showSpinner && (
            <div className="absolute bottom-0 left-0 right-0 top-0 z-10 flex items-center justify-center bg-gray-800 bg-opacity-50">
              <SpinnerComponent />
            </div>
          )}
        </div>
        <Modal show={openModal} size="xl" onClose={onCloseModal} popup>
          <Modal.Header />
          <div className="p-4">
            {/* Modal content */}
            {currentPage === 1 && (
              <div className="space-y-4">
                <h2 className="mb-4 border-b-2 border-gray-300 pb-2 text-center text-2xl font-extrabold text-gray-900 dark:text-white">
                  Part 1: Personal Details
                </h2>
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <div className="mb-2 block">
                      <Label htmlFor="name" value="Name of Student" />
                    </div>
                    <TextInput
                      id="name"
                      placeholder="Enter Name"
                      type="text"
                      value={formData.studentName}
                      onChange={(e) =>
                        updateFormData({ studentName: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="flex-1">
                    <div className="mb-2 block">
                      <Label
                        htmlFor="passport_photo"
                        value="Passport Size Photo"
                      />
                    </div>
                    {/*<FileInput*/}
                    {/*  id="passport_photo"*/}
                    {/*  accept="image/*"*/}
                    {/*  onChange={(e) => {*/}
                    {/*    const file = e.target.files?.[0];*/}
                    {/*    if (file) {*/}
                    {/*      // Validate file size (e.g., max 2MB)*/}
                    {/*      if (file.size > 2 * 1024 * 1024) {*/}
                    {/*        alert('Please upload an image smaller than 2MB');*/}
                    {/*        return;*/}
                    {/*      }*/}
                    {/*      updateFormData({*/}
                    {/*        studentPassportSizePhoto: file*/}
                    {/*      });*/}
                    {/*    }*/}
                    {/*  }}*/}
                    {/*  required*/}
                    {/*/>*/}
                  </div>
                </div>

                <div className="flex space-x-4">
                  <div className="flex-1">
                    <div className="mb-2 block">
                      <Label htmlFor="course" value="Course" />
                    </div>
                    {/*   <Select
                        id="course"
                        required
                        value={formData.studentCourseName}
                        onChange={(e) => updateFormData({studentCourseName: e.target.value})}
                      >
                        <option value="">Select a course</option>
                        {courses.map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.name}
                          </option>
                        ))}
                      </Select> */}

                    <TextInput
                      id="name"
                      placeholder="Enter Name"
                      value={formData.studentCourseName}
                      onChange={(e) =>
                        updateFormData({ studentCourseName: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="flex-1">
                    <div className="mb-2 block">
                      <Label htmlFor="batch" value="Batch" />
                    </div>
                    {/*   <Select
                        id="batch"
                        required
                        value={formData.studentBatch}
                        onChange={(e) => updateFormData({studentBatch: e.target.value})}
                      >
                        <option value="">Select batch</option>
                        <option value="1">2021-2025</option>
                        <option value="2">2022-2026</option>
                        <option value="3">2023-2027</option>
                        <option value="4">2024-2028</option>
                      </Select> */}
                    <TextInput
                      id="name"
                      placeholder="Enter Name"
                      value={formData.studentBatch}
                      onChange={(e) =>
                        updateFormData({ studentBatch: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <div className="flex-1">
                    <div className="mb-2 block">
                      <Label htmlFor="roll_no" value="Roll Number" />
                    </div>
                    <TextInput
                      id="roll_no"
                      placeholder="Enter Roll Number"
                      type="text"
                      value={formData.studentRollNumber}
                      onChange={(e) =>
                        updateFormData({ studentRollNumber: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="flex-1">
                    <div className="mb-2 block">
                      <Label htmlFor="Phone_number" value="Phone Number" />
                    </div>
                    <TextInput
                      id="batch"
                      placeholder="Enter Phone Number"
                      type="text"
                      value={formData.studentPhoneNumber}
                      onChange={(e) =>
                        updateFormData({ studentPhoneNumber: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {currentPage === 2 && (
              <div className="space-y-4">
                <h2 className="mb-4 border-b-2 border-gray-300 pb-2 text-center text-2xl font-extrabold text-gray-900 dark:text-white">
                  Part 2: Additional Details
                </h2>
                <div className="flex">
                  <div className="flex-1">
                    <div className="mb-2 block">
                      <Label htmlFor="email" value="Your Email*" />
                    </div>
                    <TextInput
                      id="address"
                      placeholder="Enter Email"
                      required
                      value={formData.studentEmailAddress}
                      onChange={(e) =>
                        updateFormData({
                          studentEmailAddress: e.target.value,
                        })
                      }
                      type="email"
                    />
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-1">
                    <div className="mb-2 block">
                      <Label htmlFor="address" value="Your Address*" />
                    </div>
                    <Textarea
                      id="address"
                      placeholder="Enter Address"
                      value={formData.studentAddress}
                      onChange={(e) =>
                        updateFormData({ studentAddress: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-between p-4">
            {currentPage === 1 && (
              <Button color="gray" onClick={onCloseModal}>
                Cancel
              </Button>
            )}

            {currentPage > 1 && (
              <Button color="gray" onClick={handlePrevPage}>
                Previous
              </Button>
            )}

            {currentPage < 2 ? (
              <Button onClick={handleNextPage}>Next</Button>
            ) : (
              <Button onClick={handleSubmit}>Submit & Send Request</Button>
            )}
          </div>
        </Modal>

        {/* Track status */}
        <Button onClick={() => setOpenStatusModal(true)}>Track Status</Button>
        <Modal
          show={openStatusModal}
          size="xl"
          onClose={onCloseStatusModal}
          popup
        >
          <Modal.Header />
          <div className="space-y-4 p-4">
            {/* Ticket Number Input */}
            <div>
              <Label value="Ticket Number" />
              <TextInput
                value={ticketNumberInput}
                onChange={(e) => setTicketNumberInput(e.target.value)}
                className="mb-4"
                placeholder="Enter request ID"
              />
            </div>

            <Button
              onClick={handleTrackStatusSubmit}
              className="w-full"
              disabled={!ticketNumberInput.trim()}
            >
              Check Status
            </Button>

            {/* Status Display */}
            {approvalStatusList.length > 0 && (
              <div className="space-y-4">
                {/* Overall Status */}
                <div className="text-center">
                  <h3 className="text-xl font-semibold">
                    Approval Status:{" "}
                    <span
                      className={
                        approvalStatusList.every((s) => s.status === "rejected")
                          ? "text-red-600"
                          : approvalStatusList.every(
                                (s) => s.status === "approved",
                              )
                            ? "text-green-600"
                            : "text-yellow-600"
                      }
                    >
                      {approvalStatusList.every((s) => s.status === "rejected")
                        ? "Rejected"
                        : approvalStatusList.every(
                              (s) => s.status === "approved",
                            )
                          ? "Approved"
                          : "In Review"}
                    </span>
                  </h3>
                </div>

                {/* Progress Bar */}
                <Progress
                  progress={progress}
                  size="lg"
                  color={
                    approvalStatusList.every((s) => s.status === "rejected")
                      ? "red"
                      : approvalStatusList.every((s) => s.status === "approved")
                        ? "green"
                        : "blue"
                  }
                  labelPosition="inside"
                  textLabel={`${progress}% complete`}
                />

                {/* Detailed Status List */}
                <div className="space-y-2">
                  {approvalStatusList.map((status, index) => (
                    <div
                      key={index}
                      className="flex flex-col space-y-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="block truncate font-medium">
                          {status.profile?.designation || `Admin ${index + 1}`}
                        </span>

                        {status.status === "rejected" && (
                          <div className="mt-1 truncate text-sm text-red-700">
                            <strong>Remark:</strong>{" "}
                            {status?.remarks || `Error Something went wrong!!`}
                          </div>
                        )}
                      </div>

                      <div className="mt-2 flex items-center space-x-2 sm:mt-0">
                        <span
                          className={`rounded-full px-3 py-1 text-sm capitalize ${
                            status.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : status.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {status.status}
                        </span>

                        {status.status === "rejected" && (
                          <Button
                            size="xs"
                            color="warning"
                            onClick={() =>
                              handleReviewRequest(ticketNumberInput)
                            }
                            disabled={status.review_requested}
                          >
                            {status.review_requested ? (
                              <span className="flex items-center">
                                <HiCheck className="mr-1" /> Requested
                              </span>
                            ) : (
                              <span className="flex items-center">
                                <HiRefresh className="mr-1" /> Re-Review
                              </span>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error Message */}
            {trackError && (
              <div className="rounded-lg bg-red-50 p-3">
                <p className="text-center text-red-600">{trackError}</p>
              </div>
            )}

            {/* Loading State */}
            {isSubmitting && (
              <div className="flex justify-center py-4">
                <Spinner size="md" />
              </div>
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default DashboardSection;

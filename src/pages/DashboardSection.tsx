"use client";

import {
  Button,
  Modal,
  Label,
  TextInput,
  Textarea,
  Progress,
  Spinner,
  FileInput,
  Select,
} from "flowbite-react";
import { useState, useEffect } from "react";
import SpinnerComponent from "../reuseables/SpinnerComponent";
import { useForm } from "../lib/ndcFormContext";
// import { useUser } from "../lib/UserContext";
import { HiRefresh, HiCheck } from "react-icons/hi";
import { supabase } from "../db/supabase.tsx";
import { trackApprovalStatus } from "../lib/trackApprovalStatus";
import type { ApprovalStatus } from "../lib/trackApprovalStatus";
import ToastComponent from "../reuseables/ToastComponent";

const DashboardSection = () => {
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  // const { current } = useUser();
  // const inputRef = useRef(null);
  const {
    formData,
    updateFormData,
    resetForm,
    submitForm,
    courses,
    listCourses,
  } = useForm();
  const [isSubmitting, _setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      await listCourses();
    };
    fetchData();
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
  const [ticketNumberInput, setTicketNumberInput] = useState("");
  // const [approvalStatusList, setApprovalStatusList] = useState([]);
  const [approvalStatusList, setApprovalStatusList] = useState<
    ApprovalStatus[]
  >([]);

  const [trackError, setTrackError] = useState("");

  const onCloseModal = () => setOpenModal(false);
  const onCloseStatusModal = () => setOpenStatusModal(false);

  const handleNextPage = () => {
    if (currentPage < 2) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setOpenModal(false);
    setShowSpinner(true);

    try {
      const response = await submitForm();
      setShowSpinner(false);

      if (response.success) {
        setShowToast(true);
        updateFormData({ id: response.requestId });
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

  const handleTrackStatusSubmit = async () => {
    const requestId = ticketNumberInput.trim();
    if (!requestId) return alert("Please enter a ticket number");

    const result = await trackApprovalStatus(requestId);

    if (result.success) {
      if (typeof result.progressPercent === "number") {
        setProgress(result.progressPercent);
      } else {
        setProgress(0); // or leave it unchanged
      }

      if (Array.isArray(result.statusList)) {
        setApprovalStatusList(result.statusList);
      } else {
        setApprovalStatusList([]);
      }

      setTrackError("");
    } else {
      setTrackError(result.error || "Error fetching status");
      setApprovalStatusList([]);
      setProgress(0);
    }
  };

  const handleReviewRequest = async (requestId: string, adminId?: string) => {
    try {
      if (!requestId || !adminId) {
        alert("Invalid request ID or admin ID");
        return;
      }

      const { error: resetError } = await supabase
        .from("ndc_approval")
        .update({
          status: "pending",
          review_requested: false,
          updated_at: new Date().toISOString(),
        })
        .eq("request_id", requestId)
        .eq("admin_id", adminId); // Add this filter to target specific admin

      if (resetError) throw resetError;

      // Update main request timestamp (optional)
      const { error: requestError } = await supabase
        .from("ndc_part_one")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", requestId);

      if (requestError) throw requestError;

      alert("Review request sent successfully!");
      handleTrackStatusSubmit();
    } catch (err) {
      console.error("Review request error:", err);
      alert(
        `Failed to request review: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="relative flex space-x-4">
        <div className="relative">
          <Button
            onClick={() => setOpenModal(true)}
            color={"dark"}
            className="rounded-md text-sm font-medium shadow"
          >
            Fill NDC Form
          </Button>
          {/* <EncryptButton /> */}
          {showSpinner && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-800 bg-opacity-50">
              <SpinnerComponent />
            </div>
          )}
        </div>

        <Modal show={openModal} size="xl" onClose={onCloseModal} popup>
          <Modal.Header />
          <form onSubmit={handleSubmit}>
            <div className="p-4">
              {currentPage === 1 && (
                <div className="space-y-4">
                  <h2 className="mb-4 border-b-2 text-center text-2xl font-bold text-gray-900">
                    Part 1: Personal Details
                  </h2>

                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <Label htmlFor="name" value="Name of Student *" />
                      <TextInput
                        id="name"
                        placeholder="Enter Name"
                        value={formData.studentName}
                        onChange={(e) =>
                          updateFormData({ studentName: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="flex-1">
                      <Label
                        htmlFor="passport_photo"
                        value="Passport Size Photo * (JPG/PNG, Max 2MB)"
                      />
                      <FileInput
                        id="passport_photo"
                        accept="image/jpeg, image/png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 2 * 1024 * 1024) {
                              alert("Please upload an image smaller than 2MB");
                              return;
                            }
                            if (
                              !["image/jpeg", "image/png"].includes(file.type)
                            ) {
                              alert("Only JPG or PNG files allowed");
                              return;
                            }
                            updateFormData({ studentPassportSizePhoto: file });
                          }
                        }}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <Label htmlFor="course" value="Course *" />
                      <Select
                        id="course"
                        value={formData.studentCourseName}
                        onChange={(e) =>
                          updateFormData({ studentCourseName: e.target.value })
                        }
                        required
                      >
                        <option value="">Select a course</option>
                        {courses.map((course) => (
                          <option key={course.id} value={course.name}>
                            {course.name}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div className="flex-1">
                      <Label htmlFor="batch" value="Batch *" />
                      <TextInput
                        id="batch"
                        placeholder="Enter Batch (eg: 2021-2025)"
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
                      <Label htmlFor="roll_no" value="Roll Number *" />
                      <TextInput
                        id="roll_no"
                        placeholder="Enter Roll Number"
                        value={formData.studentRollNumber}
                        onChange={(e) =>
                          updateFormData({ studentRollNumber: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="flex-1">
                      <Label
                        htmlFor="phone"
                        value="Phone Number * (10 digits)"
                      />
                      <TextInput
                        id="phone"
                        placeholder="Enter Phone Number"
                        value={formData.studentPhoneNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, "");
                          if (value.length <= 10)
                            updateFormData({ studentPhoneNumber: value });
                        }}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentPage === 2 && (
                <div className="space-y-4">
                  <h2 className="mb-4 border-b-2 text-center text-2xl font-bold text-gray-900">
                    Part 2: Additional Details
                  </h2>

                  <div>
                    <Label htmlFor="email" value="Your Email *" />
                    <TextInput
                      id="email"
                      type="email"
                      placeholder="Enter Email"
                      value={formData.studentEmailAddress}
                      onChange={(e) =>
                        updateFormData({ studentEmailAddress: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="address" value="Your Address *" />
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
              )}
            </div>

            <div className="flex justify-between p-4">
              <Button
                type="button"
                color={currentPage === 1 ? "gray" : undefined}
                onClick={currentPage === 1 ? onCloseModal : handlePrevPage}
              >
                {currentPage === 1 ? "Cancel" : "Previous"}
              </Button>
              <Button
                type={currentPage < 2 ? "button" : "submit"}
                onClick={currentPage < 2 ? handleNextPage : undefined}
              >
                {currentPage < 2 ? "Next" : "Submit & Send Request"}
              </Button>
            </div>
          </form>
        </Modal>

        <Button
          onClick={() => setOpenStatusModal(true)}
          color={"white"}
          className="rounded-md font-semibold shadow"
        >
          Track Status
        </Button>

        <Modal
          show={openStatusModal}
          size="xl"
          onClose={onCloseStatusModal}
          popup
        >
          <Modal.Header />
          <div className="space-y-4 p-4">
            <Label value="Ticket Number" />
            <TextInput
              value={ticketNumberInput}
              onChange={(e) => setTicketNumberInput(e.target.value)}
              placeholder="Enter request ID"
              autoFocus
            />
            <Button
              onClick={handleTrackStatusSubmit}
              disabled={!ticketNumberInput.trim()}
              className="w-full"
            >
              Check Status
            </Button>

            {/* Status Results */}
            {approvalStatusList.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-center text-xl font-semibold">
                  Approval Status:{" "}
                  {approvalStatusList.every((s) => s.status === "approved") ? (
                    <span className="text-green-600">Approved</span>
                  ) : approvalStatusList.every(
                      (s) => s.status === "rejected",
                    ) ? (
                    <span className="text-red-600">Rejected</span>
                  ) : (
                    <span className="text-yellow-600">In Review</span>
                  )}
                </h3>
                <Progress
                  progress={progress}
                  size="lg"
                  color="blue"
                  textLabel={`${progress}% complete`}
                  textLabelPosition="inside"
                />
                <div className="space-y-2">
                  {approvalStatusList.map((status, index) => (
                    <div
                      key={index}
                      className="flex justify-between rounded-lg border p-3"
                    >
                      <div>
                        <div className="font-medium">
                          {status.profile?.name || `Admin ${index + 1}`}
                        </div>
                        {status.status === "rejected" && (
                          <div className="text-sm text-red-600">
                            Remark: {status.remarks || "No remarks"}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
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
                              handleReviewRequest(
                                ticketNumberInput,
                                status.admin_id,
                              )
                            }
                            disabled={status.review_requested}
                          >
                            {status.review_requested ? (
                              <>
                                <HiCheck className="mr-1" /> Requested
                              </>
                            ) : (
                              <>
                                <HiRefresh className="mr-1" /> Re-Review
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {trackError && (
              <div className="text-center text-red-600">{trackError}</div>
            )}
            {isSubmitting && (
              <div className="flex justify-center">
                <Spinner size="md" />
              </div>
            )}
          </div>
        </Modal>
      </div>

      {showToast && (
        <div className="fixed right-0 top-0 z-50 m-4">
          <ToastComponent />
        </div>
      )}
    </div>
  );
};

export default DashboardSection;

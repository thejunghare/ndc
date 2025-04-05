"use client";

import { createContext, useContext, useState } from "react";
import { supabase } from "../db/supabase";
import { useUser } from "./UserContext";

interface PersonalDetailsFormData {
  userId?: number;
  studentName: string;
  studentPassportSizePhoto: File | null;
  studentCourseName: string;
  studentBatch: string;
  studentRollNumber: string;
  studentPhoneNumber: string;
  studentEmailAddress: string;
  studentAddress: string;
  status?: string;
  ticketNumber?: string;
}

interface Course {
  id: number;
  name: string;
}

interface FormContextType {
  formData: PersonalDetailsFormData;
  updateFormData: (newData: Partial<PersonalDetailsFormData>) => void;
  resetForm: () => void;
  submitForm: () => Promise<{ success: boolean; error?: string }>;
  listCourses: () => Promise<void>;
  courses: Course[];
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider = ({ children }: { children: React.ReactNode }) => {
  const { current } = useUser();
  const [courses, setCourses] = useState<Course[]>([]);
  //console.log(course);
  const [formData, setFormData] = useState<PersonalDetailsFormData>({
    studentName: "",
    studentPassportSizePhoto: null,
    studentCourseName: "",
    studentBatch: "",
    studentRollNumber: "",
    studentPhoneNumber: "",
    studentEmailAddress: "",
    studentAddress: "",
    status: "pending",
  });

  const updateFormData = (newData: Partial<PersonalDetailsFormData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const resetForm = () => {
    setFormData({
      studentName: "",
      studentPassportSizePhoto: null,
      studentCourseName: "",
      studentBatch: "",
      studentRollNumber: "",
      studentPhoneNumber: "",
      studentEmailAddress: "",
      studentAddress: "",
      status: "pending",
    });
  };

  const listCourses = async () => {
    const { data, error } = await supabase.from("course").select("name");

    if (error) {
      console.log(error);
    } else {
      setCourses(data);
    }
  };

  const submitForm = async () => {
    try {
      if (!current) throw new Error("User not authenticated");
  
      const ticketNumber = `NDC-${Math.floor(100000 + Math.random() * 900000)}`;
  
      // Step 1: Insert form data
      const { data: insertResult, error: insertError } = await supabase
        .from("ndc_part_one")
        .insert([
          {
            student_name: formData.studentName,
            course: formData.studentCourseName,
            batch: formData.studentBatch,
            roll_number: formData.studentRollNumber,
            phone_number: formData.studentPhoneNumber,
            email: formData.studentEmailAddress,
            address: formData.studentAddress,
            user_id: current.id,
            status: "pending",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select("id")
        .single();
  
      if (insertError) throw insertError;
  
      const ndcRequestId = insertResult.id;
  
      // ✅ Step 2: Fetch admins by role and select user_id
      const { data: adminsRaw, error: adminFetchError } = await supabase
        .from("profile")
        .select("user_id")
        .eq("role", 2);
  
      if (adminFetchError) throw adminFetchError;
  
      const validAdmins = (adminsRaw || []).filter(
        (admin) => typeof admin.user_id === "string" && admin.user_id.length > 0
      );
  
      if (validAdmins.length === 0) {
        throw new Error("No valid admins found for approvals.");
      }
  
      // Step 3: Create approval entries with correct admin_id = user_id
      const approvalEntries = validAdmins.map((admin) => ({
        request_id: ndcRequestId,
        admin_id: admin.user_id,
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
  
      const { error: approvalInsertError } = await supabase
        .from("ndc_approval")
        .insert(approvalEntries);
  
      if (approvalInsertError) throw approvalInsertError;
  
      updateFormData({ ticketNumber });
  
      return { success: true };
    } catch (error) {
      console.error("Error submitting form:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  };
  
  
  

  return (
    <FormContext.Provider
      value={{
        formData,
        updateFormData,
        resetForm,
        submitForm,
        listCourses,
        courses,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};

export const useForm = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useForm must be used within a FormProvider");
  }
  return context;
};

"use client";

import React, { createContext, useContext, useState } from "react";
import { supabase } from "../db/supabase";
import { useUser } from "./UserContext";

interface PersonalDetailsFormData {
  id?: number;
  userId?: number;
  studentName: string;
  studentPassportSizePhoto: File | null;
  studentCourseName: string;
  studentBatch: string;
  studentRollNumber: string;
  studentPhoneNumber: string;
  studentEmailAddress: string;
  studentAddress: string;
  //status?: string;
  ticketNumber?: string;
}

interface Course {
  id: number;
  name: string;
}

interface ndcTickets {
  id: number;
  ticket_number: string;
  student_name: string;
  course: string;
  batch: string;
  roll_number: string;
  phone_number: string;
  email: string;
  address: string;
  user_id: string;
  //status: string;
  created_at: string;
  updated_at: string;
}

interface FormContextType {
  formData: PersonalDetailsFormData;
  updateFormData: (newData: Partial<PersonalDetailsFormData>) => void;
  resetForm: () => void;
  submitForm: () => Promise<{
    success: boolean;
    error?: string;
    requestId?: number;
  }>;
  listCourses: () => Promise<void>;
  listTickets: () => Promise<ndcTickets[]>;

  courses: Course[];
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider = ({ children }: { children: React.ReactNode }) => {
  const { current } = useUser();
  const [courses, setCourses] = useState<Course[]>([]);
  const [ndcTickets, setNdcTickets] = useState<ndcTickets[]>([]);
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
    //status: "pending",
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
      //status: "pending",
    });
  };

  const listCourses = async () => {
    const { data, error } = await supabase.from("course").select("name");

    if (error) {
      console.log(error);
    } else {
      // @ts-ignore
      setCourses(data);
    }
  };

  const listTickets = async (): Promise<ndcTickets[]> => {
    const { data, error } = await supabase.from("ndc_part_one").select();

    if (error) {
      console.log(error);
      return [];
    } else {
      setNdcTickets(data);
      return data;
    }
  };

  const submitForm = async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    try {
      if (!current) {
        return {
          success: false,
          error: "User not authenticated. Please log in to submit the form.",
        };
      }

      const ticketNumber = `NDC-${Math.floor(100000 + Math.random() * 900000)}`;

      let photoUrl = null;
      if (formData.studentPassportSizePhoto) {
        const file = formData.studentPassportSizePhoto;
        const fileExt = file.name.split(".").pop();
        const fileName = `${current.id}/${ticketNumber}-${Date.now()}.${fileExt}`;
        console.log(`uploaded file name ${fileName}`);
        const { error: uploadError } = await supabase.storage
          .from("ndc-passport-size-photo")
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          return {
            success: false,
            error: "Failed to upload photo",
          };
        } else {
          console.info("file uploaded");
        }

        const {
          data: { publicUrl },
        } = supabase.storage
          .from("ndc-passport-size-photo")
          .getPublicUrl(fileName);

        photoUrl = publicUrl;
      } else {
        console.log("file not found");
      }

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
            //status: "pending",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            photo_url: photoUrl,
            // ticket_number: ticketNumber,
          },
        ])
        .select("id")
        .single();

      if (insertError) {
        return {
          success: false,
          error: `Failed to save form data: ${insertError.message}`,
        };
      }

      const ndcRequestId = insertResult.id;

      const { data: adminsRaw, error: adminFetchError } = await supabase
        .from("profile")
        .select("user_id")
        .eq("role", 2);

      if (adminFetchError) {
        return {
          success: false,
          error: adminFetchError.message,
        };
      }

      const validAdmins = (adminsRaw || []).filter(
        (admin) =>
          typeof admin.user_id === "string" && admin.user_id.length > 0,
      );

      if (validAdmins.length === 0) {
        return {
          success: false,
          error: `No valid admins found for approvals.`,
        };
      }

      const approvalEntries = validAdmins.map((admin) => ({
        request_id: ndcRequestId,
        admin_id: admin.user_id,
        //status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { error: approvalInsertError } = await supabase
        .from("ndc_approval")
        .insert(approvalEntries);

      if (approvalInsertError) {
        return {
          success: false,
          error: approvalInsertError.message,
        };
      }

      updateFormData({ ticketNumber });

      return { success: true };
    } catch (error) {
      console.error("Error submitting form:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
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
        listTickets,
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

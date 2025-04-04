"use client";

import {createContext, useContext, useState} from "react";
import {supabase} from "../db/supabase";
import {useUser} from './UserContext';

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

export const FormProvider = ({children}: { children: React.ReactNode }) => {
  const {current} = useUser();
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
    setFormData((prev) => ({...prev, ...newData}));
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
    const {data, error} = await supabase
      .from('course')
      .select('name')

    if (error) {
      console.log(error);
    } else {
      setCourses(data);
    }
  }

  const submitForm = async () => {
    try {
      if (!current) throw new Error("User not authenticated");

      const ticketNumber = `NDC-${Math.floor(100000 + Math.random() * 900000)}`;
      let photoUrl = '';

      // Upload passport photo
//      if (formData.studentPassportSizePhoto) {
//        const file = formData.studentPassportSizePhoto;
//        const fileExt = file.name.split('.').pop();
//        const fileName = `${ticketNumber}.${fileExt}`;
//        const filePath = `user_${current?.id}/${fileName}`;
//
//        const { error: uploadError } = await supabase.storage
//          .from("ndcstudentpassortsizephoto")
//          .upload(filePath, file, {
//            cacheControl: "3600",
//            upsert: false,
//          });
//
//        if (uploadError) throw uploadError;
//
//        // Get public URL
//        const { data: urlData } = supabase.storage
//          .from("ndcstudentpassortsizephoto")
//          .getPublicUrl(filePath);
//
//        photoUrl = urlData.publicUrl;
//      }


      // Insert form data into Supabase
      const { error } = await supabase
        .from("ndc_part_one")
        .insert([
          {
            student_name: formData.studentName,
//            passport_photo_url: photoUrl || null,
            course: formData.studentCourseName,
            batch: formData.studentBatch,
            roll_number: formData.studentRollNumber,
            phone_number: formData.studentPhoneNumber,
            email: formData.studentEmailAddress,
            address: formData.studentAddress,
            user_id: current?.id,
            status: "pending",
        //    ticket_number: ticketNumber,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);

      if (error) throw error;

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
    <FormContext.Provider value={{formData, updateFormData, resetForm, submitForm, listCourses, courses}}>
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
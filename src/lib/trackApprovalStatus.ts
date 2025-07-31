import { supabase } from "../db/supabase.tsx";

export interface ApprovalStatus {
  admin_id: string;
  profile: {
    name: string;
  };
  status: "approved" | "rejected" | "pending";
  remarks: string;
  review_requested: boolean;
}

export const trackApprovalStatus = async (requestId: string) => {
  const { data: admins, error: adminError } = await supabase
    .from("profile")
    .select("user_id, username")
    .eq("role", 2);

  if (adminError) return { success: false, error: adminError.message };

  // Get approvals for this request
  const { data: approvals, error: approvalError } = await supabase
    .from("ndc_approval")
    .select("admin_id, status, remarks, review_requested")
    .eq("request_id", requestId);

  if (approvalError) return { success: false, error: approvalError.message };

  // Create status list with admin details
  const statusList: ApprovalStatus[] = admins.map((admin) => {
    const approval = approvals.find((a) => a.admin_id === admin.user_id);
    return {
      admin_id: admin.user_id,
      profile: { name: admin.username },
      status: approval?.status || "pending",
      remarks: approval?.remarks || "No remarks provided",
      review_requested: approval?.review_requested || false,
    };
  });

  // Calculate progress
  const approvedCount = statusList.filter(
    (s) => s.status === "approved",
  ).length;
  const totalAdmins = admins.length;
  const progressPercent = Math.round((approvedCount / totalAdmins) * 100);

  return {
    success: true,
    progressPercent,
    statusList,
    totalAdmins,
    approved: approvedCount,
  };
};

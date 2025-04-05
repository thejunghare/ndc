import { supabase } from '../db/supabase' // adjust path if needed

export const trackApprovalStatus = async (requestId: string) => {
    // Get all admins
    const { data: admins, error: adminError } = await supabase
      .from("profile")
      .select("user_id")
      .eq("role", 2);
  
    if (adminError) return { success: false, error: adminError.message };
  
    // Get approvals for this request
    const { data: approvals, error: approvalError } = await supabase
      .from("ndc_approval")
      .select("admin_id, status")
      .eq("request_id", requestId);
  
    if (approvalError) return { success: false, error: approvalError.message };
  
    // Create status list with admin details
    const statusList = admins.map(admin => {
      const approval = approvals.find(a => a.admin_id === admin.user_id);
      return {
        admin_id: admin.user_id,
        profile: { name: admin.name },
        status: approval?.status || "pending"
      };
    });
  
    // Calculate progress
    const approvedCount = statusList.filter(s => s.status === "approved").length;
    const totalAdmins = admins.length;
    const progressPercent = Math.round((approvedCount / totalAdmins) * 100);
  
    return {
      success: true,
      progressPercent,
      statusList,
      totalAdmins,
      approved: approvedCount
    };
  };

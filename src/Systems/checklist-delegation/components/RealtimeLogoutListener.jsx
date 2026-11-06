import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../SupabaseClient";

// Users who signed in through the main (Order Flow) login are not rows in the
// Supabase "users" table, so the Supabase status checks must not apply to them.
const isMasterSession = () => !!localStorage.getItem("sainy_couture_auth_user_v3");

const RealtimeLogoutListener = () => {
  const navigate = useNavigate();

  // ✅ Ask notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") { Notification.requestPermission(); }
  }, []);

  // ✅ User auto-logout listener (for current user)
  useEffect(() => {
    let subscription;
    const username = localStorage.getItem("user-name");
    const userId = localStorage.getItem("user-id");
    if (!username || !userId || isMasterSession()) return;

    subscription = supabase
      .channel("user-status-watch")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen for all changes (including DELETE)
          schema: "public",
          table: "users",
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          const isDeleted = payload.eventType === "DELETE";
          const isInactive = payload.eventType === "UPDATE" && payload.new.status === "inactive";

          if (isDeleted || isInactive) {
            // Show Chrome notification to user
            if (Notification.permission === "granted") {
              new Notification(isDeleted ? "Account Deleted" : "Account Deactivated", {
                body: isDeleted
                  ? "Your account has been removed. You have been logged out."
                  : "Your account has been deactivated. You have been logged out.",
                icon: "/logo.png",
              });
            }

            localStorage.clear();
            window.location.href = "/order-to-delivery";
          }
        }
      )
      .subscribe();

    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, [navigate]);

  // ✅ Admin listener to see logout notifications
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") return;

    const adminSubscription = supabase
      .channel("admin-user-status-watch")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "users",
        },
        (payload) => {
          console.log("📡 Realtime event received:", payload); // 👈 Add this
          const updatedUser = payload.new;
          const previousUser = payload.old;

          if (previousUser?.status === "active" && updatedUser?.status === "inactive") {
            console.log("🚨 User changed from active → inactive:", updatedUser.user_name);
            if (Notification.permission === "granted") {
              new Notification("User Logged Out", {
                body: `User "${updatedUser.user_name}" has been logged out.`,
                icon: "/logo.png",
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(adminSubscription);
    };
  }, []);


  // ✅ Check user status on refresh
  useEffect(() => {
    const checkUserStatusOnLoad = async () => {
      const username = localStorage.getItem("user-name");
      if (!username || isMasterSession()) return;

      const { data } = await supabase
        .from("users")
        .select("status")
        .eq("user_name", username)
        .limit(1);

      const userDataResult = data && data.length > 0 ? data[0] : null;

      // If user doesn't exist (deleted) or is inactive, logout
      if (!userDataResult || userDataResult.status === "inactive") {
        localStorage.clear();
        window.location.href = "/order-to-delivery";
      }
    };

    checkUserStatusOnLoad();
  }, [navigate]);

  return null;
};

export default RealtimeLogoutListener;

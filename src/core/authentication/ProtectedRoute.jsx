import { useState, useEffect } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import * as Lucide from "lucide-react";
import supabase from '../../SupabaseClient';

const ProtectedRoute = ({ children, _allowedRoles = [] }) => {
    const location = useLocation();
    const path = location.pathname;
    
    const username = (localStorage.getItem("user-name") || "").toLowerCase();
    const role = (localStorage.getItem("role") || "").toLowerCase();
    const isSuperAdmin = localStorage.getItem("is-super-admin") === "true" || username === "admin";
    const canSelfAssign = localStorage.getItem("can_self_assign") === "true";

    const [allowedPages, setAllowedPages] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("allowed-pages") || "[]");
        } catch {
            return [];
        }
    });
    const [allowedSystems, setAllowedSystems] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("allowed-systems") || "[]");
        } catch {
            return [];
        }
    });
    const [isRevalidating, setIsRevalidating] = useState(false);

    useEffect(() => {
        const handlePermUpdate = () => {
            try {
                setAllowedPages(JSON.parse(localStorage.getItem("allowed-pages") || "[]"));
                setAllowedSystems(JSON.parse(localStorage.getItem("allowed-systems") || "[]"));
            } catch (e) {
                console.error("Error reading permissions:", e);
            }
        };

        window.addEventListener("permissions-updated", handlePermUpdate);
        window.addEventListener("storage", handlePermUpdate);
        return () => {
            window.removeEventListener("permissions-updated", handlePermUpdate);
            window.removeEventListener("storage", handlePermUpdate);
        };
    }, []);

    // Special Case: Allow 'user' role for assign-task and checklist if canSelfAssign is enabled
    const isLegacySelfAssignAllowed = 
        (path.startsWith("/checklist/assign-task") || path.startsWith("/checklist/checklist")) && 
        role === "user" && 
        canSelfAssign;

    // Check if the route is explicitly allowed in cached page permissions
    const isPageAllowed = allowedPages.some(route => {
        if (route.includes("/:")) {
            const cleanRoute = route.split("/:")[0];
            return path === cleanRoute || path.startsWith(cleanRoute + "/");
        }
        return path === route;
    }) || isLegacySelfAssignAllowed;

    // Determine system from path
    let currentSystem = "checklist-delegation";
    if (path.startsWith("/checklist/mis-")) {
        currentSystem = "mis-summary";
    } else if (path.startsWith("/checklist/hr-")) {
        currentSystem = "hr-fms";
    } else if (path.startsWith("/checklist/whatsapp-")) {
        currentSystem = "whatsapp-management";
    } else if (path.startsWith("/checklist/purchase")) {
        currentSystem = "purchase";
    } else if (path.startsWith("/checklist/inventory")) {
        currentSystem = "inventory";
    } else if (path.startsWith("/checklist/newpete")) {
        currentSystem = "newpete";
    } else if (path.startsWith("/checklist/greetings")) {
        currentSystem = "greetings";
    } else if (path.startsWith("/checklist/global-settings") || path.startsWith("/checklist/master")) {
        currentSystem = "global-settings";
    }

    const isSystemAllowed = allowedSystems.includes(currentSystem) || isLegacySelfAssignAllowed;

    const isBypass = isSuperAdmin || path === "/checklist" || path === "/checklist/notifications";

    // If locally blocked, attempt a fast live verify with DB in case permissions were updated
    useEffect(() => {
        if (!isBypass && username && (!isSystemAllowed || !isPageAllowed)) {
            let active = true;
            setIsRevalidating(true);
            const storedUser = localStorage.getItem("user-name");
            if (!storedUser) {
                setIsRevalidating(false);
                return;
            }

            supabase
                .from("users")
                .select("system_access, page_access, role")
                .eq("user_name", storedUser)
                .maybeSingle()
                .then(({ data: userProfile, error }) => {
                    if (!active || error || !userProfile) return;

                    let slugs = [];
                    if (userProfile.system_access === "all") {
                        slugs = ["checklist-delegation", "mis-summary", "whatsapp-management", "hr-fms", "purchase", "inventory", "newpete", "greetings"];
                    } else if (userProfile.system_access) {
                        slugs = userProfile.system_access.split(",").map(s => s.trim()).filter(Boolean);
                    }

                    const allPurchaseRoutes = [
                        "/checklist/purchase", "/checklist/purchase/dashboard", "/checklist/purchase/indent",
                        "/checklist/purchase/approval", "/checklist/purchase/pocreate", "/checklist/purchase/polist",
                        "/checklist/purchase/delivery", "/checklist/purchase/receiving",
                        "/checklist/purchase/payment-approval", "/checklist/purchase/payment"
                    ];
                    const allInventoryRoutes = [
                        "/checklist/inventory", "/checklist/inventory/dashboard", "/checklist/inventory/stock",
                        "/checklist/inventory/transactions", "/checklist/inventory/reorder", "/checklist/inventory/indent",
                        "/checklist/inventory/settings"
                    ];
                    const allNewPeteRoutes = [
                        "/checklist/newpete", "/checklist/newpete-add-case", "/checklist/newpete-expenses",
                        "/checklist/newpete-ledger", "/checklist/newpete-settings"
                    ];

                    let rts = [];
                    if (userProfile.page_access === "all") {
                        rts = [
                            "/checklist/admin", "/checklist/notifications", "/checklist/quick-task",
                            "/checklist/assign-task", "/checklist/checklist", "/checklist/maintenance",
                            "/checklist/repair", "/checklist/ea-task", "/checklist/calendar",
                            "/checklist/task", "/checklist/training-video", "/checklist/bulk-import",
                            "/checklist/holiday-list", "/checklist/working-day-calendar",
                            "/checklist/data", "/checklist/admin-data", "/checklist/delegation",
                            "/checklist/delegation-data", "/checklist/admin-approval",
                            "/checklist/mis-report", "/checklist/setting", "/checklist/global-settings",
                            "/checklist/mis-summary", "/checklist/mis-history", "/checklist/mis-kpi-kra",
                            "/checklist/whatsapp-history",
                            "/checklist/hr-dashboard", "/checklist/hr-indent", "/checklist/hr-find-enquiry",
                            "/checklist/hr-call-tracker", "/checklist/hr-after-joining-work", "/checklist/hr-leaving",
                            "/checklist/hr-after-leaving-work", "/checklist/hr-employee",
                            "/checklist/hr-leave-management", "/checklist/hr-attendance",
                            "/checklist/hr-attendancedaily", "/checklist/hr-report", "/checklist/hr-payroll",
                            "/checklist/hr-salary-config", "/checklist/hr-advance", "/checklist/hr-puttha", "/checklist/hr-misreport",
                            ...allPurchaseRoutes,
                            ...allInventoryRoutes,
                            ...allNewPeteRoutes,
                            "/checklist/greetings-birthdays", "/checklist/greetings-festival-scheduler"
                        ];
                    } else if (userProfile.page_access) {
                        rts = userProfile.page_access.split(",").map(p => p.trim()).filter(Boolean);
                        if (!rts.includes("/checklist")) rts.push("/checklist");
                        if (!rts.includes("/checklist/notifications")) rts.push("/checklist/notifications");
                    }

                    if (slugs.length > 0) {
                        localStorage.setItem("allowed-systems", JSON.stringify(slugs));
                        setAllowedSystems(slugs);
                    }
                    if (rts.length > 0) {
                        localStorage.setItem("allowed-pages", JSON.stringify(rts));
                        setAllowedPages(rts);
                    }
                    window.dispatchEvent(new Event("permissions-updated"));
                })
                .finally(() => {
                    if (active) setIsRevalidating(false);
                });

            return () => {
                active = false;
            };
        }
    }, [path, isSystemAllowed, isPageAllowed, isBypass, username]);

    if (!username) {
        return <Navigate to="/login" replace />;
    }

    // Super Admin has access to everything
    if (isSuperAdmin) {
        return children;
    }

    // If path is core home, allow access
    if (path === "/checklist" || path === "/checklist/notifications") {
        return children;
    }

    if (!isSystemAllowed || !isPageAllowed) {
        if (isRevalidating) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                    <p className="text-xs text-gray-500 font-semibold">Verifying permissions...</p>
                </div>
            );
        }

        console.warn(`Ã°Å¸â€ºâ€˜ Route Guard: Blocked access to ${path}. System: ${currentSystem}, PageAllowed: ${isPageAllowed}`);
        
        // Render a premium 403 - Access Denied page
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
                <div className="bg-white border border-red-100 rounded-3xl p-8 md:p-12 shadow-xl max-w-md w-full relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 opacity-5 text-red-500">
                        <Lucide.ShieldAlert size={160} />
                    </div>
                    
                    <div className="mx-auto w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mb-6 ring-4 ring-red-50/50">
                        <Lucide.Lock className="text-red-500" size={36} strokeWidth={2.5} />
                    </div>

                    <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">403 - Access Denied</h1>
                    <p className="text-sm text-gray-500 leading-relaxed mb-8">
                        Oops! You do not have permission to access this page. Please contact your system administrator to request system or page access.
                    </p>

                    <div className="flex flex-col gap-3">
                        <Link
                            to="/checklist"
                            className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all active:scale-95 text-xs uppercase tracking-wider"
                        >
                            Return to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;

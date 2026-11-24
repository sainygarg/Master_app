import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { ClipboardList, Wrench, Hammer, Users, ArrowUpRight, Plus } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import { LayoutGrid } from "lucide-react";

export default function AssignTask() {
  const navigate = useNavigate();

  // Access is governed by unified ProtectedRoute & AdminLayout RBAC

  const role = (localStorage.getItem("role") || "").toLowerCase();
  const _canSelfAssign = localStorage.getItem("can_self_assign") === "true";
  const designation = (localStorage.getItem("designation") || "").toLowerCase();
  const isMachineOperator = designation.includes("machin") || designation.includes("operat") || designation.includes("oprat");

  const allModules = [
    {
      id: "checklist",
      label: "Checklist Operations",
      subLabel: "Daily Routine Tasks",
      icon: ClipboardList,
      path: "/checklist/checklist",
      color: "text-[#5B172E]",
      bg: "bg-[#FAF5EE]",
      border: "hover:border-[#5B172E]/40",
      ring: "hover:ring-[#5B172E]/20"
    },
    {
      id: "delegation",
      label: "Delegation Tasks",
      subLabel: "Assign & Follow-up",
      icon: Users,
      path: "/checklist/assign-delegation",
      color: "text-[#5B172E]",
      bg: "bg-[#FAF5EE]",
      border: "hover:border-[#5B172E]/40",
      ring: "hover:ring-[#5B172E]/20"
    },
    {
      id: "maintenance",
      label: "Maintenance Schedule",
      subLabel: "Preventive Care",
      icon: Wrench,
      path: "/checklist/maintenance",
      color: "text-[#5B172E]",
      bg: "bg-[#FAF5EE]",
      border: "hover:border-[#5B172E]/40",
      ring: "hover:ring-[#5B172E]/20"
    },
    {
      id: "repair",
      label: "Repair Tickets",
      subLabel: "Issue Resolution",
      icon: Hammer,
      path: "/checklist/repair",
      color: "text-[#5B172E]",
      bg: "bg-[#FAF5EE]",
      border: "hover:border-[#5B172E]/40",
      ring: "hover:ring-[#5B172E]/20"
    },
    {
      id: "ea",
      label: "EA Tasks",
      subLabel: "Executive Assistant",
      icon: Users,
      path: "/checklist/ea-task",
      color: "text-[#5B172E]",
      bg: "bg-[#FAF5EE]",
      border: "hover:border-[#5B172E]/40",
      ring: "hover:ring-[#5B172E]/20"
    }
  ];

  // Hidden from the UI only (definitions, pages and routes are kept). Remove an id here to show the card again.
  const HIDDEN_MODULE_IDS = ["maintenance", "repair", "ea"];

  const modules = allModules.filter(mod => {
    if (HIDDEN_MODULE_IDS.includes(mod.id)) return false;
    if (role === "user") {
      // Users can only access checklist for self-assignment
      return mod.id === "checklist" || mod.id === "delegation";
    }
    if (role === "hod") {
      if (mod.id === "checklist" || mod.id === "delegation") return true;
      if (mod.id === "repair" && isMachineOperator) return true;
      return false;
    }
    return true;
  });

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">

        {/* System Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-6 border-b border-[#E8DFD3]">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-8 bg-[#5B172E] rounded-full hidden sm:block" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#431021] tracking-tight">
                Task <span className="text-[#5B172E]">Assignment</span>
              </h1>
              <p className="text-xs sm:text-sm font-medium text-stone-500 mt-1 flex items-center gap-2">
                <LayoutGrid size={14} className="text-[#C5A059]" />
                Select a module to create new tasks
              </p>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {modules.map((mod) => (
            <button
              key={mod.id}
              onClick={() => navigate(mod.path)}
              className={`
                        group relative flex flex-col p-6 bg-white border border-[#E8DFD3] rounded-2xl 
                        transition-all duration-200 text-left cursor-pointer
                        hover:shadow-md ${mod.border} hover:ring-2 ${mod.ring}
                    `}
            >
              <div className="flex justify-between items-start w-full mb-5">
                <div className={`p-2.5 rounded-xl border border-[#DECDB8] ${mod.bg}`}>
                  <mod.icon className={`w-6 h-6 ${mod.color}`} />
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                  <ArrowUpRight className="w-5 h-5 text-[#C5A059]" />
                </div>
              </div>

              <h3 className="text-base font-serif font-bold text-[#431021] group-hover:text-[#5B172E] transition-colors">
                {mod.label}
              </h3>
              <p className="text-xs text-stone-500 mt-1 mb-6">
                {mod.subLabel}
              </p>

              <div className="mt-auto pt-4 border-t border-[#E8DFD3] w-full flex justify-between items-center">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Module Action</span>
                <div className={`flex items-center gap-1.5 text-[11px] font-bold ${mod.color} bg-[#FAF5EE] border border-[#DECDB8] shadow-xs px-3 py-1.5 rounded-lg group-hover:bg-[#5B172E] group-hover:text-white transition-colors`}>
                  <Plus className="w-3.5 h-3.5" /> Initialize
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
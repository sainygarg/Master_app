"use client"
import { ClipboardCheck, Hammer, Wrench, Users } from 'lucide-react'
import { motion } from 'framer-motion';

export default function TaskManagementTabs({ activeTab, setActiveTab }) {
    const role = (localStorage.getItem("role") || "").toLowerCase();
    const designation = (localStorage.getItem("designation") || "").toLowerCase();
    const isMachineOperator = designation.includes("machin") || designation.includes("operat") || designation.includes("oprat");

    const allTabs = [
        { id: 'checklist', label: 'Checklist', icon: ClipboardCheck, color: 'text-[#802243]', activeColor: 'bg-[#5B172E]' },
        { id: 'maintenance', label: 'Maintenance', icon: Hammer, color: 'text-blue-600', activeColor: 'bg-[#5B172E]' },
        { id: 'repair', label: 'Repair', icon: Wrench, color: 'text-amber-600', activeColor: 'bg-[#5B172E]' },
        { id: 'ea', label: 'EA', icon: Users, color: 'text-emerald-600', activeColor: 'bg-[#5B172E]' },
    ];

    // Hidden from the UI only (code, pages and data are untouched). Remove an id from this list to show the tab again.
    const HIDDEN_TAB_IDS = ['maintenance', 'repair', 'ea'];

    const tabs = allTabs.filter(tab => {
        if (HIDDEN_TAB_IDS.includes(tab.id)) return false;
        if (role === "hod") {
            if (tab.id === "checklist") return true;
            if (tab.id === "repair" && isMachineOperator) return true;
            return false;
        }
        return true;
    });

    const getActiveColor = () => {
        return 'bg-[#5B172E]';
    };

    return (
        <div className="bg-white rounded-2xl p-1.5 border border-[#E8DFD3] shadow-xs">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-start">
                {/* Navigation Tabs */}
                <div className="w-full lg:w-auto overflow-hidden">
                    <div className="flex bg-[#FAF6F0] p-1 rounded-xl relative overflow-x-auto no-scrollbar max-w-max border border-[#E8DFD3]">
                        {tabs.map((tab) => {
                            const normalizedActive = activeTab.toLowerCase();
                            const normalizedId = tab.id.toLowerCase();
                            const isActive = normalizedActive === normalizedId || (normalizedActive === 'default' && normalizedId === 'checklist');
                            const Icon = tab.icon;

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        relative flex items-center justify-center gap-2.5 py-2 px-6 rounded-lg text-xs font-bold transition-all duration-300 whitespace-nowrap min-w-[100px] md:min-w-[120px] z-10
                                        ${isActive ? 'text-white' : 'text-stone-600 hover:text-[#5B172E]'}
                                    `}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTabPillGlobal"
                                            className={`absolute inset-0 rounded-lg shadow-sm z-[-1] ${getActiveColor(tab.id)}`}
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <Icon size={isActive ? 17 : 16} className={`${isActive ? 'text-white' : tab.color} transition-colors duration-300`} />
                                    <span className="relative">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

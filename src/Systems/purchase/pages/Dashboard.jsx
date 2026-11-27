import React, { useEffect, useState } from 'react';
import { BarChart3, ClipboardList, CheckCircle2, PackageCheck, RotateCcw } from 'lucide-react';
import { fetchIndents } from '../services/purchaseService';

export default function Dashboard() {
  const [indents, setIndents] = useState([]);

  useEffect(() => {
    fetchIndents().then(setIndents).catch(() => {});
  }, []);

  const cards = [
    { label: 'Total Indents', value: indents.length, icon: ClipboardList, tone: 'text-[#5B172E] bg-[#FAF5EE] border-[#DECDB8]' },
    { label: 'Pending Approval', value: indents.filter((i) => i.status === 'Pending Approval').length, icon: CheckCircle2, tone: 'text-amber-700 bg-amber-50 border-amber-200' },
    { label: 'Open POs', value: 0, icon: PackageCheck, tone: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    { label: 'Returns', value: 0, icon: RotateCcw, tone: 'text-rose-700 bg-rose-50 border-rose-200' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-5 border border-[#E8DFD3] shadow-xs flex items-center justify-between">
        <div>
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#431021] flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#9B783E]" />
            <span>Purchase Dashboard</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Procurement data report across Indent, Approval, PO, Receiving, QC, and Return stages.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className={`rounded-2xl p-5 border shadow-2xs bg-white`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">{c.label}</span>
                <div className={`p-2 rounded-xl border ${c.tone}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-black text-[#431021]">{c.value}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React from 'react';

// Shown while data is still being fetched, so empty-state messages
// ("No records found") never flash before the data arrives.
export const LoadingState = ({ label = 'Loading data…' }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
    <div className="w-8 h-8 rounded-full border-4 border-[#E8DFD3] border-t-[#5B172E] animate-spin" />
    <div className="text-xs font-semibold text-stone-500">{label}</div>
  </div>
);

// Table-row variant
export const LoadingRow = ({ colSpan = 6, label }) => (
  <tr>
    <td colSpan={colSpan} className="bg-white">
      <LoadingState label={label} />
    </td>
  </tr>
);

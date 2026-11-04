import React from 'react';

export default function MasterShell({ children }) {
  return (
    <div className="min-h-screen w-full flex flex-col bg-[#FAF6F0] text-stone-800 antialiased selection:bg-[#5B172E] selection:text-white">
      {children}
    </div>
  );
}

const fs = require('fs');

let file = fs.readFileSync('src/core/layout/MasterShell.jsx', 'utf8');

// 1. Order Flow Desktop button: toggle independently without closing checklist
const oldOrderFlowBtn = `                <button
                  type="button"
                  onClick={() => {
                    setOrderFlowOpen((prev) => {
                      const next = !prev;
                      if (next) setChecklistOpen(false);
                      return next;
                    });
                  }}
                  className={\`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all text-left select-none cursor-pointer \${
                    isOrderFlowActive
                      ? 'bg-[#F3ECE2] text-[#5B172E] font-bold border border-[#DECDB8]'
                      : 'text-stone-700 hover:bg-[#F3ECE2] hover:text-[#5B172E] font-medium'
                  }\`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Scissors className="w-4 h-4 text-[#C5A059] shrink-0" />
                    <span className="truncate">Order to Delivery</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {orders.length > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#FAF5EE] text-[#5B172E] border border-[#DECDB8]">
                        {orders.length}
                      </span>
                    )}
                    <span className="p-0.5 rounded text-stone-500 hover:text-stone-800 transition-transform">
                      {orderFlowOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </span>
                  </div>
                </button>`;

const newOrderFlowBtn = `                <button
                  type="button"
                  onClick={() => setOrderFlowOpen((prev) => !prev)}
                  className={\`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all text-left select-none cursor-pointer \${
                    isOrderFlowActive
                      ? 'bg-[#F3ECE2] text-[#5B172E] font-bold border border-[#DECDB8] shadow-2xs'
                      : 'text-stone-700 hover:bg-[#F3ECE2] hover:text-[#5B172E] font-medium'
                  }\`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={\`p-1.5 rounded-lg \${isOrderFlowActive ? 'bg-[#5B172E] text-white shadow-2xs' : 'bg-white text-[#9B783E] border border-[#E8DFD3]'}\`}>
                      <Scissors className="w-3.5 h-3.5 shrink-0" />
                    </div>
                    <span className="truncate font-semibold tracking-tight">Order to Delivery</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {orders.length > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#FAF5EE] text-[#5B172E] border border-[#DECDB8]">
                        {orders.length}
                      </span>
                    )}
                    <span className={\`p-1 rounded-md transition-colors \${orderFlowOpen ? 'bg-black/5 text-stone-800' : 'text-stone-400'}\`}>
                      {orderFlowOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </span>
                  </div>
                </button>`;

if (!file.includes(oldOrderFlowBtn)) {
  console.error('oldOrderFlowBtn not found');
} else {
  file = file.replace(oldOrderFlowBtn, newOrderFlowBtn);
}

// 2. Checklist Desktop button: toggle independently without closing orderFlow
const oldChecklistBtn = `                <button
                  type="button"
                  onClick={() => {
                    setChecklistOpen((prev) => {
                      const next = !prev;
                      if (next) setOrderFlowOpen(false);
                      return next;
                    });
                  }}
                  className={\`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all text-left select-none cursor-pointer \${
                    isChecklistActive
                      ? 'bg-[#F3ECE2] text-[#5B172E] font-bold border border-[#DECDB8]'
                      : 'text-stone-700 hover:bg-[#F3ECE2] hover:text-[#5B172E] font-medium'
                  }\`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ClipboardCheck className="w-4 h-4 text-[#C5A059] shrink-0" />
                    <span className="truncate">Checklist & Delegation</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {totalChecklistPending > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold text-white bg-[#E11D48]">
                        {totalChecklistPending}
                      </span>
                    )}
                    <span className="p-0.5 rounded text-stone-500 hover:text-stone-800 transition-transform">
                      {checklistOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </span>
                  </div>
                </button>`;

const newChecklistBtn = `                <button
                  type="button"
                  onClick={() => setChecklistOpen((prev) => !prev)}
                  className={\`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all text-left select-none cursor-pointer \${
                    isChecklistActive
                      ? 'bg-[#F3ECE2] text-[#5B172E] font-bold border border-[#DECDB8] shadow-2xs'
                      : 'text-stone-700 hover:bg-[#F3ECE2] hover:text-[#5B172E] font-medium'
                  }\`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={\`p-1.5 rounded-lg \${isChecklistActive ? 'bg-[#5B172E] text-white shadow-2xs' : 'bg-white text-[#9B783E] border border-[#E8DFD3]'}\`}>
                      <ClipboardCheck className="w-3.5 h-3.5 shrink-0" />
                    </div>
                    <span className="truncate font-semibold tracking-tight">Checklist & Delegation</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {totalChecklistPending > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold text-white bg-[#E11D48]">
                        {totalChecklistPending}
                      </span>
                    )}
                    <span className={\`p-1 rounded-md transition-colors \${checklistOpen ? 'bg-black/5 text-stone-800' : 'text-stone-400'}\`}>
                      {checklistOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </span>
                  </div>
                </button>`;

if (!file.includes(oldChecklistBtn)) {
  console.error('oldChecklistBtn not found');
} else {
  file = file.replace(oldChecklistBtn, newChecklistBtn);
}

// 3. Mobile toggles
const oldMobileOrderBtn = `                <button
                  type="button"
                  onClick={() => {
                    setOrderFlowOpen((prev) => {
                      const next = !prev;
                      if (next) setChecklistOpen(false);
                      return next;
                    });
                  }}
                  className={\`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all \${
                    isOrderFlowActive ? 'bg-[#F3ECE2] text-[#5B172E]' : 'text-stone-700 hover:bg-[#F3ECE2]'
                  }\`}
                >
                  <div className="flex items-center gap-2.5">
                    <Scissors className="w-4 h-4 text-[#C5A059]" />
                    <span>Order to Delivery</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {orders.length > 0 && (
                      <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-[#FAF5EE] text-[#5B172E]">
                        {orders.length}
                      </span>
                    )}
                    <span className="p-0.5 rounded text-stone-500">
                      {orderFlowOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </span>
                  </div>
                </button>`;

const newMobileOrderBtn = `                <button
                  type="button"
                  onClick={() => setOrderFlowOpen((prev) => !prev)}
                  className={\`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all \${
                    isOrderFlowActive ? 'bg-[#F3ECE2] text-[#5B172E]' : 'text-stone-700 hover:bg-[#F3ECE2]'
                  }\`}
                >
                  <div className="flex items-center gap-2.5">
                    <Scissors className="w-4 h-4 text-[#C5A059]" />
                    <span>Order to Delivery</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {orders.length > 0 && (
                      <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-[#FAF5EE] text-[#5B172E]">
                        {orders.length}
                      </span>
                    )}
                    <span className="p-0.5 rounded text-stone-500">
                      {orderFlowOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </span>
                  </div>
                </button>`;

if (!file.includes(oldMobileOrderBtn)) {
  console.error('oldMobileOrderBtn not found');
} else {
  file = file.replace(oldMobileOrderBtn, newMobileOrderBtn);
}

const oldMobileChecklistBtn = `                <button
                  type="button"
                  onClick={() => {
                    setChecklistOpen((prev) => {
                      const next = !prev;
                      if (next) setOrderFlowOpen(false);
                      return next;
                    });
                  }}
                  className={\`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all \${
                    isChecklistActive ? 'bg-[#F3ECE2] text-[#5B172E]' : 'text-stone-700 hover:bg-[#F3ECE2]'
                  }\`}
                >
                  <div className="flex items-center gap-2.5">
                    <ClipboardCheck className="w-4 h-4 text-[#C5A059]" />
                    <span>Checklist & Delegation</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {totalChecklistPending > 0 && (
                      <span className="text-[10px] px-2 py-0.2 rounded-full font-bold text-white bg-[#E11D48]">
                        {totalChecklistPending}
                      </span>
                    )}
                    <span className="p-0.5 rounded text-stone-500">
                      {checklistOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </span>
                  </div>
                </button>`;

const newMobileChecklistBtn = `                <button
                  type="button"
                  onClick={() => setChecklistOpen((prev) => !prev)}
                  className={\`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all \${
                    isChecklistActive ? 'bg-[#F3ECE2] text-[#5B172E]' : 'text-stone-700 hover:bg-[#F3ECE2]'
                  }\`}
                >
                  <div className="flex items-center gap-2.5">
                    <ClipboardCheck className="w-4 h-4 text-[#C5A059]" />
                    <span>Checklist & Delegation</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {totalChecklistPending > 0 && (
                      <span className="text-[10px] px-2 py-0.2 rounded-full font-bold text-white bg-[#E11D48]">
                        {totalChecklistPending}
                      </span>
                    )}
                    <span className="p-0.5 rounded text-stone-500">
                      {checklistOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </span>
                  </div>
                </button>`;

if (!file.includes(oldMobileChecklistBtn)) {
  console.error('oldMobileChecklistBtn not found');
} else {
  file = file.replace(oldMobileChecklistBtn, newMobileChecklistBtn);
}

// 4. Also enhance Master Setting button UI to match the luxury rounded card style
const oldMasterSettingBtn = `              <button
                type="button"
                onClick={() => { handleNavigate('/order-to-delivery?view=settings'); setOrderFlowOpen(false); setChecklistOpen(false); }}
                className={\`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer \${
                  isMasterSettingActive
                    ? 'bg-[#5B172E] text-white shadow-xs'
                    : 'text-stone-700 hover:bg-[#F3ECE2] hover:text-[#5B172E]'
                }\`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Settings className="w-4 h-4 text-[#C5A059] shrink-0" />
                  <span className="truncate">Master Setting</span>
                </div>
              </button>`;

const newMasterSettingBtn = `              <button
                type="button"
                onClick={() => handleNavigate('/order-to-delivery?view=settings')}
                className={\`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer select-none \${
                  isMasterSettingActive
                    ? 'bg-[#5B172E] text-white font-bold shadow-xs'
                    : 'text-stone-700 hover:bg-[#F3ECE2] hover:text-[#5B172E] font-medium'
                }\`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={\`p-1.5 rounded-lg \${isMasterSettingActive ? 'bg-white/20 text-white shadow-2xs' : 'bg-white text-[#9B783E] border border-[#E8DFD3]'}\`}>
                    <Settings className="w-3.5 h-3.5 shrink-0" />
                  </div>
                  <span className="truncate font-semibold tracking-tight">Master Setting</span>
                </div>
              </button>`;

if (!file.includes(oldMasterSettingBtn)) {
  console.error('oldMasterSettingBtn not found');
} else {
  file = file.replace(oldMasterSettingBtn, newMasterSettingBtn);
}

fs.writeFileSync('src/core/layout/MasterShell.jsx', file);
console.log('Successfully updated MasterShell navigation & UI');


import fs from 'fs';

let file = fs.readFileSync('src/core/layout/MasterShell.jsx', 'utf8');

// Modernize Order Flow subpages container
const oldOfContainer = `                {/* Order Flow Subpages: Dashboard, All Orders, and 10 Stages at the SAME HIERARCHY */}
                {orderFlowOpen && (
                  <div className="mt-1 ml-3 pl-2 border-l-2 border-[#E8DFD3] space-y-0.5">
                    
                    {/* 1. Dashboard */}
                    <button
                      type="button"
                      onClick={() => handleNavigate('/order-to-delivery?view=dashboard')}
                      className={\`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left cursor-pointer \${
                        isOrderFlow && currentViewParam === 'dashboard'
                          ? 'bg-[#5B172E] text-white font-bold shadow-2xs'
                          : 'text-stone-600 hover:bg-[#F3ECE2] hover:text-[#5B172E]'
                      }\`}
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-1">
                        <LayoutDashboard className={\`w-3.5 h-3.5 shrink-0 \${isOrderFlow && currentViewParam === 'dashboard' ? 'text-white' : 'text-stone-400'}\`} />
                        <span className="truncate text-[11px]">Dashboard</span>
                      </div>
                      {activeOrdersCount > 0 && (
                        <span className={\`text-[9px] px-1.5 py-0.2 rounded-full font-bold shrink-0 \${
                          isOrderFlow && currentViewParam === 'dashboard' ? 'bg-[#C5A059] text-white' : 'bg-[#FAF5EE] text-[#5B172E] border border-[#DECDB8]'
                        }\`}>
                          {activeOrdersCount}
                        </span>
                      )}
                    </button>

                    {/* 2. All Orders */}
                    <button
                      type="button"
                      onClick={() => handleNavigate('/order-to-delivery?view=orders')}
                      className={\`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left cursor-pointer \${
                        isOrderFlow && (currentViewParam === 'orders' || (!currentViewParam && location.pathname.startsWith('/order-to-delivery')))
                          ? 'bg-[#5B172E] text-white font-bold shadow-2xs'
                          : 'text-stone-600 hover:bg-[#F3ECE2] hover:text-[#5B172E]'
                      }\`}
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-1">
                        <ShoppingBag className={\`w-3.5 h-3.5 shrink-0 \${isOrderFlow && (currentViewParam === 'orders' || !currentViewParam) ? 'text-white' : 'text-stone-400'}\`} />
                        <span className="truncate text-[11px]">All Orders</span>
                      </div>
                      {orders.length > 0 && (
                        <span className={\`text-[9px] px-1.5 py-0.2 rounded-full font-bold shrink-0 \${
                          isOrderFlow && (currentViewParam === 'orders' || !currentViewParam) ? 'bg-white/20 text-white' : 'bg-[#FAF5EE] text-[#5B172E] border border-[#DECDB8]'
                        }\`}>
                          {orders.length}
                        </span>
                      )}
                    </button>

                    {/* 3 to 12. The 10 Stages (Same hierarchy as Dashboard and All Orders) */}
                    {STAGES.map((stage, idx) => {
                      const stageOrders = orders.filter((o) => o.currentStageId === stage.id);
                      const isStageActive = isOrderFlow && currentViewParam === 'stages' && currentStageParam === stage.id;
                      return (
                        <button
                          key={stage.id}
                          type="button"
                          onClick={() => handleNavigate(\`/order-to-delivery?view=stages&stage=\${stage.id}\`)}
                          className={\`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left cursor-pointer \${
                            isStageActive
                              ? 'bg-[#5B172E] text-white font-bold shadow-2xs'
                              : 'text-stone-600 hover:bg-[#F3ECE2] hover:text-[#5B172E]'
                          }\`}
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-1">
                            {(() => {
                              const StageIcon = STAGE_ICONS[stage.id] || Sparkles;
                              return (
                                <StageIcon className={\`w-3.5 h-3.5 shrink-0 \${
                                  isStageActive ? 'text-[#C5A059]' : 'text-stone-400 group-hover:text-[#5B172E]'
                                }\`} />
                              );
                            })()}
                            <span className="truncate text-[11px]">{stage.name}</span>
                          </div>
                          {stageOrders.length > 0 && (
                            <span className={\`text-[9px] px-1.5 py-0.2 rounded-full font-bold shrink-0 \${
                              isStageActive ? 'bg-[#C5A059] text-white' : 'bg-[#FAF5EE] text-[#5B172E] border border-[#DECDB8]'
                            }\`}>
                              {stageOrders.length}
                            </span>
                          )}
                        </button>
                      );
                    })}

                  </div>
                )}`;

const newOfContainer = `                {/* Order Flow Subpages: Dashboard, All Orders, and 10 Stages */}
                {orderFlowOpen && (
                  <div className="mt-1.5 ml-3 pl-2.5 border-l-2 border-[#DECDB8] space-y-1 py-0.5">
                    
                    {/* 1. Dashboard */}
                    <button
                      type="button"
                      onClick={() => handleNavigate('/order-to-delivery?view=dashboard')}
                      className={\`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all text-left cursor-pointer group \${
                        isOrderFlow && currentViewParam === 'dashboard'
                          ? 'bg-[#5B172E] text-white font-bold shadow-xs'
                          : 'text-stone-600 hover:bg-[#F3ECE2] hover:text-[#5B172E]'
                      }\`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-1">
                        <div className={\`p-1 rounded-md transition-colors \${isOrderFlow && currentViewParam === 'dashboard' ? 'bg-white/20 text-white' : 'bg-[#FAF5EE] text-stone-500 group-hover:text-[#5B172E]'}\`}>
                          <LayoutDashboard className="w-3 h-3 shrink-0" />
                        </div>
                        <span className="truncate text-[11px] font-medium">Dashboard</span>
                      </div>
                      {activeOrdersCount > 0 && (
                        <span className={\`text-[9px] px-1.5 py-0.2 rounded-full font-bold shrink-0 \${
                          isOrderFlow && currentViewParam === 'dashboard' ? 'bg-[#C5A059] text-white' : 'bg-[#FAF5EE] text-[#5B172E] border border-[#DECDB8]'
                        }\`}>
                          {activeOrdersCount}
                        </span>
                      )}
                    </button>

                    {/* 2. All Orders */}
                    <button
                      type="button"
                      onClick={() => handleNavigate('/order-to-delivery?view=orders')}
                      className={\`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all text-left cursor-pointer group \${
                        isOrderFlow && (currentViewParam === 'orders' || (!currentViewParam && location.pathname.startsWith('/order-to-delivery')))
                          ? 'bg-[#5B172E] text-white font-bold shadow-xs'
                          : 'text-stone-600 hover:bg-[#F3ECE2] hover:text-[#5B172E]'
                      }\`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-1">
                        <div className={\`p-1 rounded-md transition-colors \${isOrderFlow && (currentViewParam === 'orders' || !currentViewParam) ? 'bg-white/20 text-white' : 'bg-[#FAF5EE] text-stone-500 group-hover:text-[#5B172E]'}\`}>
                          <ShoppingBag className="w-3 h-3 shrink-0" />
                        </div>
                        <span className="truncate text-[11px] font-medium">All Orders</span>
                      </div>
                      {orders.length > 0 && (
                        <span className={\`text-[9px] px-1.5 py-0.2 rounded-full font-bold shrink-0 \${
                          isOrderFlow && (currentViewParam === 'orders' || !currentViewParam) ? 'bg-white/20 text-white' : 'bg-[#FAF5EE] text-[#5B172E] border border-[#DECDB8]'
                        }\`}>
                          {orders.length}
                        </span>
                      )}
                    </button>

                    {/* 3 to 12. The 10 Stages */}
                    {STAGES.map((stage) => {
                      const stageOrders = orders.filter((o) => o.currentStageId === stage.id);
                      const isStageActive = isOrderFlow && currentViewParam === 'stages' && currentStageParam === stage.id;
                      const StageIcon = STAGE_ICONS[stage.id] || Sparkles;
                      return (
                        <button
                          key={stage.id}
                          type="button"
                          onClick={() => handleNavigate(\`/order-to-delivery?view=stages&stage=\${stage.id}\`)}
                          className={\`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all text-left cursor-pointer group \${
                            isStageActive
                              ? 'bg-[#5B172E] text-white font-bold shadow-xs'
                              : 'text-stone-600 hover:bg-[#F3ECE2] hover:text-[#5B172E]'
                          }\`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-1">
                            <div className={\`p-1 rounded-md transition-colors \${isStageActive ? 'bg-white/20 text-white' : 'bg-[#FAF5EE] text-stone-500 group-hover:text-[#5B172E]'}\`}>
                              <StageIcon className="w-3 h-3 shrink-0" />
                            </div>
                            <span className="truncate text-[11px] font-medium">{stage.name}</span>
                          </div>
                          {stageOrders.length > 0 && (
                            <span className={\`text-[9px] px-1.5 py-0.2 rounded-full font-bold shrink-0 \${
                              isStageActive ? 'bg-[#C5A059] text-white' : 'bg-[#FAF5EE] text-[#5B172E] border border-[#DECDB8]'
                            }\`}>
                              {stageOrders.length}
                            </span>
                          )}
                        </button>
                      );
                    })}

                  </div>
                )}`;

if (file.includes(oldOfContainer)) {
  file = file.replace(oldOfContainer, newOfContainer);
  console.log('Updated Order Flow subpages container UI');
} else {
  console.error('oldOfContainer not found');
}

// Modernize Checklist subpages container
const oldChecklistContainer = `                {/* Checklist Subpages Dropdown */}
                {checklistOpen && (
                  <div className="mt-1 ml-3 pl-2 border-l-2 border-[#E8DFD3] space-y-0.5">
                    {checklistSubpages.map((sub) => {
                      const SubIcon = sub.icon;

                      // Expandable Holiday Submenu
                      if (sub.isSubmenu) {
                        const isAnyChildActive = sub.subItems.some((item) => location.pathname === item.href);
                        return (
                          <div key={sub.label} className="flex flex-col">
                            <button
                              type="button"
                              onClick={() => setHolidayOpen(!holidayOpen)}
                              className={\`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left cursor-pointer \${
                                isAnyChildActive
                                  ? 'bg-[#F3ECE2] text-[#5B172E] font-bold'
                                  : 'text-stone-600 hover:bg-[#F3ECE2] hover:text-[#5B172E]'
                              }\`}
                            >
                              <div className="flex items-center gap-2 min-w-0 pr-1">
                                {SubIcon && <SubIcon className="w-3.5 h-3.5 shrink-0 text-stone-400" />}
                                <span className="truncate text-[11px]">{sub.label}</span>
                              </div>
                              <span className="text-stone-400">
                                {holidayOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                              </span>
                            </button>

                            {holidayOpen && (
                              <div className="mt-0.5 ml-3 pl-2 border-l-2 border-[#E8DFD3] space-y-0.5">
                                {sub.subItems.map((item) => {
                                  const isChildActive = location.pathname === item.href;
                                  const ItemIcon = item.icon;
                                  return (
                                    <button
                                      key={item.href}
                                      type="button"
                                      onClick={() => handleNavigate(item.href)}
                                      className={\`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left cursor-pointer \${
                                        isChildActive
                                          ? 'bg-[#5B172E] text-white font-bold shadow-2xs'
                                          : 'text-stone-600 hover:bg-[#F3ECE2] hover:text-[#5B172E]'
                                      }\`}
                                    >
                                      <div className="flex items-center gap-2 min-w-0 pr-1">
                                        {ItemIcon && (
                                          <ItemIcon className={\`w-3 h-3 shrink-0 \${isChildActive ? 'text-white' : 'text-stone-400'}\`} />
                                        )}
                                        <span className="truncate text-[10px]">{item.label}</span>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      }

                      // Regular Checklist Item
                      const isSubActive = location.pathname === sub.href;
                      return (
                        <button
                          key={sub.href}
                          type="button"
                          onClick={() => handleNavigate(sub.href)}
                          className={\`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left cursor-pointer \${
                            isSubActive
                              ? 'bg-[#5B172E] text-white font-bold shadow-2xs'
                              : 'text-stone-600 hover:bg-[#F3ECE2] hover:text-[#5B172E]'
                          }\`}
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-1">
                            {SubIcon && (
                              <SubIcon className={\`w-3.5 h-3.5 shrink-0 \${isSubActive ? 'text-white' : 'text-stone-400'}\`} />
                            )}
                            <span className="truncate text-[11px]">{sub.label}</span>
                          </div>
                          {sub.badge && (
                            <span className={\`text-[9px] px-1.5 py-0.2 rounded-full font-bold shrink-0 \${
                              isSubActive ? 'bg-white/20 text-white' : 'bg-[#E11D48] text-white'
                            }\`}>
                              {sub.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}`;

const newChecklistContainer = `                {/* Checklist Subpages Dropdown */}
                {checklistOpen && (
                  <div className="mt-1.5 ml-3 pl-2.5 border-l-2 border-[#DECDB8] space-y-1 py-0.5">
                    {checklistSubpages.map((sub) => {
                      const SubIcon = sub.icon;

                      // Expandable Holiday Submenu
                      if (sub.isSubmenu) {
                        const isAnyChildActive = sub.subItems.some((item) => location.pathname === item.href);
                        return (
                          <div key={sub.label} className="flex flex-col">
                            <button
                              type="button"
                              onClick={() => setHolidayOpen(!holidayOpen)}
                              className={\`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all text-left cursor-pointer group \${
                                isAnyChildActive
                                  ? 'bg-[#F3ECE2] text-[#5B172E] font-bold'
                                  : 'text-stone-600 hover:bg-[#F3ECE2] hover:text-[#5B172E]'
                              }\`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 pr-1">
                                <div className="p-1 rounded-md bg-[#FAF5EE] text-stone-500 group-hover:text-[#5B172E]">
                                  {SubIcon && <SubIcon className="w-3 h-3 shrink-0" />}
                                </div>
                                <span className="truncate text-[11px] font-medium">{sub.label}</span>
                              </div>
                              <span className="text-stone-400">
                                {holidayOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                              </span>
                            </button>

                            {holidayOpen && (
                              <div className="mt-1 ml-3 pl-2 border-l-2 border-[#E8DFD3] space-y-0.5">
                                {sub.subItems.map((item) => {
                                  const isChildActive = location.pathname === item.href;
                                  const ItemIcon = item.icon;
                                  return (
                                    <button
                                      key={item.href}
                                      type="button"
                                      onClick={() => handleNavigate(item.href)}
                                      className={\`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all text-left cursor-pointer \${
                                        isChildActive
                                          ? 'bg-[#5B172E] text-white font-bold shadow-xs'
                                          : 'text-stone-600 hover:bg-[#F3ECE2] hover:text-[#5B172E]'
                                      }\`}
                                    >
                                      <div className="flex items-center gap-2 min-w-0 pr-1">
                                        {ItemIcon && (
                                          <ItemIcon className={\`w-3 h-3 shrink-0 \${isChildActive ? 'text-white' : 'text-stone-400'}\`} />
                                        )}
                                        <span className="truncate text-[10px]">{item.label}</span>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      }

                      // Regular Checklist Item
                      const isSubActive = location.pathname === sub.href;
                      return (
                        <button
                          key={sub.href}
                          type="button"
                          onClick={() => handleNavigate(sub.href)}
                          className={\`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all text-left cursor-pointer group \${
                            isSubActive
                              ? 'bg-[#5B172E] text-white font-bold shadow-xs'
                              : 'text-stone-600 hover:bg-[#F3ECE2] hover:text-[#5B172E]'
                          }\`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-1">
                            <div className={\`p-1 rounded-md transition-colors \${isSubActive ? 'bg-white/20 text-white' : 'bg-[#FAF5EE] text-stone-500 group-hover:text-[#5B172E]'}\`}>
                              {SubIcon && (
                                <SubIcon className="w-3 h-3 shrink-0" />
                              )}
                            </div>
                            <span className="truncate text-[11px] font-medium">{sub.label}</span>
                          </div>
                          {sub.badge && (
                            <span className={\`text-[9px] px-1.5 py-0.2 rounded-full font-bold shrink-0 \${
                              isSubActive ? 'bg-white/20 text-white' : 'bg-[#E11D48] text-white'
                            }\`}>
                              {sub.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}`;

if (file.includes(oldChecklistContainer)) {
  file = file.replace(oldChecklistContainer, newChecklistContainer);
  console.log('Updated Checklist subpages container UI');
} else {
  console.error('oldChecklistContainer not found');
}

fs.writeFileSync('src/core/layout/MasterShell.jsx', file);


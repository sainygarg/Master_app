import React, { useState } from 'react';
import { 
  Search, 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  Ruler, 
  ShoppingBag, 
  Eye, 
  PlusCircle, 
  ChevronRight,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { maskCustomerMobile } from '../utils/privacy';

export const ClientBookView = ({
  orders = [],
  currentUser,
  onOpenNewOrder,
  onViewOrderDetails,
  onOpenMeasurements
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState(null);

  // Group orders by client
  const clientsMap = {};
  orders.forEach((o) => {
    const key = o.mobile || o.clientName;
    if (!clientsMap[key]) {
      clientsMap[key] = {
        name: o.clientName,
        mobile: o.mobile,
        city: o.city,
        orders: []
      };
    }
    clientsMap[key].orders.push(o);
  });

  const clients = Object.values(clientsMap).filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.mobile.includes(searchTerm) ||
    c.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeClient = selectedClientId
    ? clients.find((c) => c.mobile === selectedClientId || c.name === selectedClientId)
    : clients[0];

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 border border-[#E8DFD3] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#431021]">
              Client & Design Book
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FAF5EE] text-[#9B783E] border border-[#DECDB8] font-bold">
              Digital Measurement Archives
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Browse complete client profiles, measurement history, and order journey from inception to delivery.
          </p>
        </div>

        <button
          onClick={onOpenNewOrder}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#5B172E] hover:bg-[#431021] shadow-xs transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Add Client / Order</span>
        </button>
      </div>

      {/* Main Grid: Left Client List, Right Client Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Client List (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-4 border border-[#E8DFD3] shadow-xs flex flex-col h-[700px]">
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search client name or phone..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
            />
          </div>

          <div className="overflow-y-auto flex-1 space-y-2 pr-1 scrollbar-thin">
            {clients.map((client) => {
              const isSelected = activeClient?.mobile === client.mobile;

              return (
                <div
                  key={client.mobile || client.name}
                  onClick={() => setSelectedClientId(client.mobile)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#FAF5EE] border-[#5B172E] shadow-2xs'
                      : 'bg-white border-[#EAE2D5] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-serif font-bold text-xs ${
                        isSelected ? 'bg-[#5B172E] text-white' : 'bg-[#F2ECE1] text-[#5B172E]'
                      }`}>
                        {client.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-semibold text-xs text-stone-900">
                          {client.name}
                        </h4>
                        <p className="text-[11px] text-stone-500 font-mono">
                          {maskCustomerMobile(client.mobile, currentUser)} • {client.city}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF2E6] text-[#9B783E] font-bold">
                      {client.orders.length} {client.orders.length === 1 ? 'order' : 'orders'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Client Profile & Orders (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-[#E8DFD3] shadow-xs space-y-6">
          {activeClient ? (
            <>
              {/* Profile Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E8DFD3] gap-3">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-full bg-[#5B172E] text-white flex items-center justify-center font-serif font-bold text-xl shadow-xs border-2 border-[#C5A059]/40">
                    {activeClient.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#431021]">
                      {activeClient.name}
                    </h3>
                    <p className="text-xs text-stone-500 flex items-center gap-2 mt-0.5 font-mono">
                      <span>{maskCustomerMobile(activeClient.mobile, currentUser)}</span>
                      <span>•</span>
                      <span>{activeClient.city}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#F5EBE1] text-[#5B172E] border border-[#DECDB8]">
                    Verified Client Profile
                  </span>
                </div>
              </div>

              {/* Client Orders History */}
              <div>
                <h4 className="font-serif font-bold text-base text-[#431021] mb-3 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#9B783E]" />
                  <span>Orders & Bespoke Commissions ({activeClient.orders.length})</span>
                </h4>

                <div className="space-y-3">
                  {activeClient.orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-[#FAF8F5] p-4 rounded-xl border border-[#DECDB8] flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#9B783E] transition-colors"
                    >
                      <div className="flex items-start gap-3.5">
                        {order.designImages?.[0] ? (
                          <img
                            src={order.designImages[0]}
                            alt={order.designName}
                            className="w-16 h-16 rounded-lg object-cover border border-[#DECDB8] shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-[#FAF5EE] text-[#9B783E] flex items-center justify-center font-serif font-bold border border-[#DECDB8] shrink-0">
                            SG
                          </div>
                        )}

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#5B172E]">{order.id}</span>
                            <span className="px-2 py-0.2 rounded bg-white border border-[#DECDB8] text-[10px] font-bold text-[#9B783E]">
                              {order.size}
                            </span>
                          </div>
                          <h5 className="font-serif font-bold text-stone-900 text-sm mt-0.5">
                            {order.designName}
                          </h5>
                          <p className="text-xs text-stone-500 mt-0.5">
                            Trial: {order.trialDate} • Delivery: {order.deliveryDate}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center">
                        <button
                          onClick={() => onOpenMeasurements(order)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-700 bg-white border border-[#DECDB8] hover:bg-stone-50 flex items-center gap-1 transition-colors"
                        >
                          <Ruler className="w-3.5 h-3.5 text-[#9B783E]" />
                          <span>Measurements</span>
                        </button>

                        <button
                          onClick={() => onViewOrderDetails(order)}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-[#5B172E] hover:bg-[#431021] flex items-center gap-1 shadow-2xs transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Sheet</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-stone-400">
              Select a client to view complete records
            </div>
          )}
        </div>

      </div>

    </div>
  );
};


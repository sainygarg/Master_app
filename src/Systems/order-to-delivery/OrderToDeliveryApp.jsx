import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './components/LoginPage';
import { DashboardView } from './components/DashboardView';
import { OrdersView } from './components/OrdersView';
import { StageDetailView } from './components/StageDetailView';
import { UserManagementView } from './components/UserManagementView';
import { UserFormModal } from './components/UserFormModal';
import { OrderFormModal } from './components/OrderFormModal';
import { OrderDetailDrawer } from './components/OrderDetailDrawer';
import { MeasurementsModal } from './components/MeasurementsModal';
import { STAGES } from './types/stages';
import { fetchOrders, saveOrder, insertOrder, removeOrder, generateNextOrderId } from './utils/storage';
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  generateNextUserId,
  canUserAccessPage,
  canUserAccessStage,
  isApexAdmin
} from './utils/userStorage';
import { 
  Sparkles, 
  Lock, 
  PanelLeft, 
  LayoutDashboard, 
  ShoppingBag, 
  Scissors, 
  Settings, 
  Menu,
  Database
} from 'lucide-react';

const AUTH_USER_KEY = 'sainy_couture_auth_user_v3';

export function App() {
  // Users State (Strictly Admin & User accounts)
  const [users, setUsers] = useState([]);

  const loadUsers = async () => {
    try {
      setUsers(await fetchUsers());
    } catch (e) {
      console.error('Failed to load users from database', e);
      showToast('Failed to load users from database: ' + e.message, 'error');
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedAuth = localStorage.getItem(AUTH_USER_KEY);
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        // ensure user exists in current users list
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return null; // start at Login page or null
  });

  // Orders State
  const [orders, setOrders] = useState([]);

  // Sidebar Hide / Unhide State (Defaults to hidden on phones for full width)
  const [isSidebarHidden, setIsSidebarHidden] = useState(() => typeof window !== 'undefined' && window.innerWidth < 1024);

  // Navigation is driven by the URL path:
  //   /order-to-delivery/dashboard | /orders | /stages/<stageId> | /settings
  const location = useLocation();
  const navigate = useNavigate();
  const VIEWS = ['dashboard', 'orders', 'stages', 'settings'];
  const pathSegs = location.pathname.split('/').filter(Boolean); // ['order-to-delivery', view, stageId]
  const currentView = VIEWS.includes(pathSegs[1]) ? pathSegs[1] : 'orders'; // default to Orders page
  const selectedStageId = STAGES.some((s) => s.id === pathSegs[2]) ? pathSegs[2] : STAGES[0].id;

  // Keeps the latest requested stage so setSelectedStageId(x); setCurrentView('stages') works in one tick
  const stageRef = useRef(selectedStageId);
  useEffect(() => { stageRef.current = selectedStageId; }, [selectedStageId]);

  const viewPath = (view, stageId) =>
    view === 'stages' ? `/order-to-delivery/stages/${stageId}` : `/order-to-delivery/${view}`;

  const setCurrentView = (view, options = {}) => {
    navigate(viewPath(view, stageRef.current), options);
  };
  const setSelectedStageId = (stageId) => {
    stageRef.current = stageId;
    if (currentView === 'stages') navigate(viewPath('stages', stageId));
  };

  // Old links (/order-to-delivery?view=stages&stage=<id>) and the bare /order-to-delivery redirect to a clean path
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const legacyView = params.get('view');
    if (VIEWS.includes(legacyView)) {
      navigate(viewPath(legacyView, params.get('stage') || STAGES[0].id), { replace: true });
    } else if (location.pathname.replace(/\/+$/, '') === '/order-to-delivery') {
      navigate('/order-to-delivery/orders', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search]);

  // If the current view is not permitted for this user, move them to one they can open
  useEffect(() => {
    if (!currentUser) return;
    const allowed = {
      dashboard: canUserAccessPage(currentUser, 'dashboard'),
      orders: canUserAccessPage(currentUser, 'orders'),
      stages: STAGES.some((s) => canUserAccessStage(currentUser, s.id)),
      settings: canUserAccessPage(currentUser, 'settings')
    };
    if (allowed[currentView]) return;
    const next = ['orders', 'dashboard', 'stages', 'settings'].find((v) => allowed[v]);
    if (next) setCurrentView(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, currentView]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewFormat, setViewFormat] = useState('table'); // 'table' | 'cards'

  // Modals & Drawers
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState(null);
  const [isDetailsReadOnly, setIsDetailsReadOnly] = useState(false);
  const [selectedOrderForMeasurements, setSelectedOrderForMeasurements] = useState(null);
  const [isMeasurementsReadOnly, setIsMeasurementsReadOnly] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);

  // Load orders from the database
  const loadOrders = async () => {
    try {
      setOrders(await fetchOrders());
    } catch (e) {
      console.error("Failed to load orders", e);
      showToast("Failed to load orders from database: " + e.message, "error");
    }
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist an order; on failure tell the user and resync from the DB
  const persistOrder = async (order) => {
    try {
      await saveOrder(order);
    } catch (e) {
      console.error("Failed to save order", e);
      showToast("Could not save order to database: " + e.message, "error");
      loadOrders();
    }
  };

  // Sync Auth User to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
  }, [currentUser]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Login Handler
  const handleLogin = (user) => {
    setCurrentUser(user);
    const view = isApexAdmin(user) ? 'dashboard' : 'orders';
    setCurrentView(view);
    // Cross-system credential bridge
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    localStorage.setItem('user-name', user.username || user.name); // must match users.user_name for task RBAC
    localStorage.setItem('user_name', user.username || user.name);
    localStorage.setItem('role', (user.role || 'user').toLowerCase());
    localStorage.setItem('can_self_assign', 'true');
    showToast(`Welcome back, ${user.name}! (${user.role} role)`, 'success');
    navigate('/checklist/admin', { replace: true }); // Checklist Dashboard is the default landing page
    try {
      window.dispatchEvent(new Event('unified-auth-changed'));
    } catch {}
  };

  // Logout Handler
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem('user-name');
    localStorage.removeItem('user_name');
    localStorage.removeItem('role');
    localStorage.removeItem('can_self_assign');
    showToast('Signed out successfully.', 'info');
    try {
      window.dispatchEvent(new Event('unified-auth-changed'));
    } catch {}
  };

  // =========================================================================
  // DATA ISOLATION PER ROLE (AS REQUESTED):
  // "ager main entry kar raha hu toh mere me wo entry show karega lekin dusre me nhi"
  // If User: ONLY see entries created by this user!
  // If Admin / Superadmin: see ALL entries across the system!
  // =========================================================================
  const scopedOrders = isApexAdmin(currentUser)
    ? orders
    : orders.filter((o) => o.createdByUserId === currentUser?.id || o.createdByUserId === currentUser?.username);

  // Filtered orders with search query
  const filteredOrders = scopedOrders.filter((order) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      order.id.toLowerCase().includes(q) ||
      order.clientName.toLowerCase().includes(q) ||
      order.mobile.includes(q) ||
      order.city.toLowerCase().includes(q) ||
      order.designName.toLowerCase().includes(q)
    );
  });

  const nextOrderId = generateNextOrderId(orders);
  const nextUserId = generateNextUserId(users);

  // Create Order Handler (Tags entry with currentUser.id)
  const handleCreateOrder = async (newOrder) => {
    let orderWithCreator = {
      ...newOrder,
      createdByUserId: currentUser.id,
      createdByName: currentUser.name
    };

    try {
      try {
        await insertOrder(orderWithCreator);
      } catch (e) {
        if (e.code !== '23505') throw e;
        // ID taken by another session: regenerate from the latest DB state and retry once
        const fresh = await fetchOrders();
        orderWithCreator = { ...orderWithCreator, id: generateNextOrderId(fresh) };
        await insertOrder(orderWithCreator);
      }
      setOrders((prev) => [orderWithCreator, ...prev]);
      newOrder = orderWithCreator;
    } catch (e) {
      console.error('Failed to create order', e);
      showToast('Could not save order to database: ' + e.message, 'error');
      return;
    }

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    showToast(`Order ${newOrder.id} created! Saved to your personal account.`, 'success');

    // Automatically navigate to Stage 1: Material Check
    setSelectedStageId(STAGES[0].id);
    setCurrentView('stages');
  };

  // Update stage fields
  const handleUpdateStageData = (orderId, stageId, fieldsData) => {
    const target = orders.find((o) => o.id === orderId);
    if (!target) return;
    const updated = {
      ...target,
      stageData: {
        ...target.stageData,
        [stageId]: {
          ...(target.stageData?.[stageId] || {}),
          ...fieldsData
        }
      }
    };
    setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    persistOrder(updated);
    showToast(`Data saved for Order ${orderId}.`, 'info');
  };

  // Advance Order to Next Stage
  const handleAdvanceStage = (orderId, currentStgId, stageFields = {}) => {
    const currentOrder = orders.find((o) => o.id === orderId);
    if (!currentOrder) return;

    const currentIndex = currentOrder.currentStageIndex;
    if (currentIndex >= STAGES.length - 1) {
      showToast(`Order ${orderId} is in final delivery stage.`, 'info');
      return;
    }

    const nextIndex = currentIndex + 1;
    const nextStage = STAGES[nextIndex];

    const updatedOrders = orders.map((order) => {
      if (order.id !== orderId) return order;

      const newHistoryEntry = {
        stageId: currentStgId,
        stageName: STAGES[currentIndex].name,
        timestamp: new Date().toISOString(),
        action: `Moved from ${STAGES[currentIndex].name} to ${nextStage.name}`,
        actor: currentUser?.name || 'Staff User',
        notes: stageFields.stageNotes || 'Stage parameters confirmed.'
      };

      return {
        ...order,
        currentStageIndex: nextIndex,
        currentStageId: nextStage.id,
        stageData: {
          ...order.stageData,
          [currentStgId]: {
            ...(order.stageData?.[currentStgId] || {}),
            ...stageFields
          }
        },
        history: [...(order.history || []), newHistoryEntry]
      };
    });

    setOrders(updatedOrders);
    persistOrder(updatedOrders.find((o) => o.id === orderId));

    if (selectedOrderForDetails && selectedOrderForDetails.id === orderId) {
      const updatedItem = updatedOrders.find((o) => o.id === orderId);
      setSelectedOrderForDetails(updatedItem);
    }

    if (canUserAccessStage(currentUser, nextStage.id)) {
      setSelectedStageId(nextStage.id);
    }

    showToast(`Order ${orderId} advanced to Stage ${nextIndex + 1}: ${nextStage.name}!`, 'success');
  };

  const handleAdvanceStageDirect = (order) => {
    handleAdvanceStage(order.id, order.currentStageId, {});
  };

  const handleSaveMeasurements = (orderId, newMeasurements) => {
    const target = orders.find((o) => o.id === orderId);
    if (target) {
      const updated = { ...target, measurements: newMeasurements };
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      persistOrder(updated);
    }

    if (selectedOrderForDetails && selectedOrderForDetails.id === orderId) {
      setSelectedOrderForDetails((prev) => ({
        ...prev,
        measurements: newMeasurements
      }));
    }

    showToast(`Measurements updated for ${orderId}.`, 'success');
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      await removeOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      showToast(`Order ${orderId} deleted.`, 'info');
    } catch (e) {
      showToast('Could not delete order from database: ' + e.message, 'error');
    }
  };

  // User Management
  // Returns true on success so the modal can close only after the DB confirms.
  const handleSaveUser = async (userData) => {
    try {
      if (editingUser) {
        const saved = await updateUser(userData);
        setUsers((prev) => prev.map((u) => (u.id === saved.id ? saved : u)));
        showToast(`User ${saved.name} updated!`, 'success');
      } else {
        // Re-read from DB so the generated ID can't collide with another session's insert
        const fresh = await fetchUsers();
        const saved = await createUser({ ...userData, id: generateNextUserId(fresh) });
        setUsers([...fresh, saved]);
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        showToast(`New ${saved.role} account created!`, 'success');
      }
      setEditingUser(null);
      return true;
    } catch (e) {
      console.error('Failed to save user', e);
      const msg = e.code === '23505' ? 'That username already exists.' : e.message;
      showToast('Could not save user to database: ' + msg, 'error');
      return false;
    }
  };

  const handleDeleteUser = async (userId) => {
    const userToDelete = users.find((u) => u.id === userId);
    if (!userToDelete) return;

    if (userToDelete.role === 'Admin' && users.filter((u) => u.role === 'Admin').length === 1) {
      showToast('Cannot delete the last remaining Admin.', 'error');
      return;
    }

    try {
      await deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      showToast(`User ${userToDelete.name} deleted.`, 'info');
    } catch (e) {
      showToast('Could not delete user from database: ' + e.message, 'error');
    }
  };

  // IF NOT AUTHENTICATED: RENDER LOGIN SCREEN (WITH HIDE/UNHIDE PASSWORD)
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const currentSelectedStage = STAGES.find((s) => s.id === selectedStageId) || STAGES[0];
  const hasStageAccess = canUserAccessStage(currentUser, selectedStageId);

  return (
    <div className={!window.__IS_MASTER_SYSTEM__ ? "min-h-screen bg-[#FAF6F0] flex text-stone-800" : "w-full text-stone-800"}>
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div className="bg-[#5B172E] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-[#C5A059]/40 text-xs sm:text-sm font-medium">
            <Sparkles className="w-4 h-4 text-[#C5A059] shrink-0" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Left Sidebar (rendered only in standalone mode; MasterShell renders persistent sidebar) */}
      {!window.__IS_MASTER_SYSTEM__ && (
        <Sidebar
          currentView={currentView}
          setCurrentView={setCurrentView}
          selectedStageId={selectedStageId}
          setSelectedStageId={setSelectedStageId}
          orders={scopedOrders}
          currentUser={currentUser}
          isSidebarHidden={isSidebarHidden}
          onToggleSidebar={() => setIsSidebarHidden(!isSidebarHidden)}
          onLogout={handleLogout}
        />
      )}

      {/* Main Content Area */}
      <div className={!window.__IS_MASTER_SYSTEM__ ? `flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        isSidebarHidden ? 'sm:pl-[72px] pl-0' : 'lg:pl-72 pl-0'
      }` : 'w-full'}>
        
        {/* Dynamic Page Views */}
        <div className={!window.__IS_MASTER_SYSTEM__ ? "flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 pb-24 lg:pb-8" : "w-full"}>
          
          {/* 1. Dashboard */}
          {currentView === 'dashboard' && canUserAccessPage(currentUser, 'dashboard') && (
            <DashboardView
              orders={filteredOrders}
              currentUser={currentUser}
              onSelectStage={(stageId) => {
                if (canUserAccessStage(currentUser, stageId)) {
                  setSelectedStageId(stageId);
                  setCurrentView('stages');
                } else {
                  showToast('Stage permission restricted.', 'error');
                }
              }}
              onViewOrderDetails={(order) => setSelectedOrderForDetails(order)}
              onOpenMeasurements={(order) => setSelectedOrderForMeasurements(order)}
              onAdvanceStageDirect={handleAdvanceStageDirect}
            />
          )}

          {/* 2. Orders Page (Table Format + EXCLUSIVE + Create New Order button) */}
          {currentView === 'orders' && canUserAccessPage(currentUser, 'orders') && (
            <OrdersView
              orders={filteredOrders}
              currentUser={currentUser}
              onOpenNewOrder={() => setIsOrderFormOpen(true)}
              onViewOrderDetails={(order) => setSelectedOrderForDetails(order)}
              onOpenMeasurements={(order) => setSelectedOrderForMeasurements(order)}
              onSelectStage={(stageId) => {
                if (canUserAccessStage(currentUser, stageId)) {
                  setSelectedStageId(stageId);
                  setCurrentView('stages');
                } else {
                  showToast('Stage permission restricted.', 'error');
                }
              }}
              onDeleteOrder={handleDeleteOrder}
            />
          )}

          {/* 3. Stage Workflows */}
          {currentView === 'stages' && (
            hasStageAccess ? (
              <StageDetailView
                orders={filteredOrders}
                selectedStageId={selectedStageId}
                currentUser={currentUser}
                onSelectStage={(stageId) => {
                  if (canUserAccessStage(currentUser, stageId)) {
                    setSelectedStageId(stageId);
                  } else {
                    showToast('Access not permitted for your role.', 'error');
                  }
                }}
                onUpdateStageData={handleUpdateStageData}
                onAdvanceStage={handleAdvanceStage}
                onViewOrderDetails={(order, readOnly = false) => {
                  setSelectedOrderForDetails(order);
                  setIsDetailsReadOnly(readOnly);
                }}
                onOpenMeasurements={(order, readOnly = false) => {
                  setSelectedOrderForMeasurements(order);
                  setIsMeasurementsReadOnly(readOnly);
                }}
              />
            ) : (
              <div className="bg-white rounded-2xl border border-[#DECDB8] p-12 text-center max-w-lg mx-auto shadow-xs">
                <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-7 h-7" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#431021]">
                  Stage Access Restricted
                </h3>
                <p className="text-xs text-stone-500 mt-1 mb-4">
                  Logged in as <strong>{currentUser?.name}</strong> ({currentUser?.role}). You do not have access to <strong>{currentSelectedStage.name}</strong>.
                </p>
              </div>
            )
          )}

          {/* 4. Master / Setting Page */}
          {currentView === 'settings' && (
            canUserAccessPage(currentUser, 'settings') ? (
              <UserManagementView
                users={users}
                activeUserId={currentUser?.id}
                currentUser={currentUser}
                onOpenAddUser={() => {
                  setEditingUser(null);
                  setIsUserModalOpen(true);
                }}
                onOpenEditUser={(user) => {
                  setEditingUser(user);
                  setIsUserModalOpen(true);
                }}
                onDeleteUser={handleDeleteUser}
              />
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-[#DECDB8] p-12 text-center">
                <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-7 h-7" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#431021]">
                  Master Access Restricted
                </h3>
                <p className="text-xs text-stone-500 mt-1 mb-4">
                  Logged in as <strong>{currentUser?.name}</strong> ({currentUser?.role}). You do not have permission to access the Master page.
                </p>
              </div>
            )
          )}

        </div>

        {/* Footer */}
        {!window.__IS_MASTER_SYSTEM__ && (
          <footer className="border-t border-[#E8DFD3] bg-white/60 py-5 text-center text-xs text-stone-500">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="font-serif font-bold text-stone-700 tracking-wider">
                SAINY GARG COUTURE • ORDER TO DELIVERY
              </div>
              <div className="text-[11px] text-stone-400">
                Logged in: <strong>{currentUser.name}</strong> ({currentUser.role}) • Isolated Storage Mode
              </div>
            </div>
          </footer>
        )}

      </div>

      {/* ========================================================= */}
      {/* 📱 MOBILE BOTTOM NAVIGATION BAR (FIXED FOR SMARTPHONES)  */}
      {/* ========================================================= */}
      {!window.__IS_MASTER_SYSTEM__ && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#E8DFD3] flex items-center justify-around py-2 px-1 lg:hidden shadow-lg select-none">
          
          {/* Dashboard */}
          {canUserAccessPage(currentUser, 'dashboard') && (
            <button
              type="button"
              onClick={() => setCurrentView('dashboard')}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
                currentView === 'dashboard'
                  ? 'text-[#5B172E] font-bold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-[10px]">Dashboard</span>
            </button>
          )}

          {/* Orders */}
          {canUserAccessPage(currentUser, 'orders') && (
            <button
              type="button"
              onClick={() => setCurrentView('orders')}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all relative ${
                currentView === 'orders'
                  ? 'text-[#5B172E] font-bold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {scopedOrders.length > 0 && (
                  <span className="absolute -top-1 -right-2 px-1 min-w-[14px] h-[14px] rounded-full bg-[#5B172E] text-white text-[8px] flex items-center justify-center font-bold">
                    {scopedOrders.length}
                  </span>
                )}
              </div>
              <span className="text-[10px]">Orders</span>
            </button>
          )}

          {/* Stages (1-10) */}
          <button
            type="button"
            onClick={() => setCurrentView('stages')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all relative ${
              currentView === 'stages'
                ? 'text-[#5B172E] font-bold scale-105'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <div className="relative">
              <Scissors className="w-5 h-5" />
              <span className="absolute -top-1 -right-2 px-1 min-w-[14px] h-[14px] rounded-full bg-[#9B783E] text-white text-[8px] flex items-center justify-center font-bold">
                10
              </span>
            </div>
            <span className="text-[10px]">Stages</span>
          </button>

          {/* Master */}
          {canUserAccessPage(currentUser, 'settings') && (
            <button
              type="button"
              onClick={() => setCurrentView('settings')}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
                currentView === 'settings'
                  ? 'text-[#5B172E] font-bold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Database className="w-5 h-5" />
              <span className="text-[10px]">Master</span>
            </button>
          )}

          {/* Menu (Toggles full drawer) */}
          <button
            type="button"
            onClick={() => setIsSidebarHidden(!isSidebarHidden)}
            className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-stone-500 hover:text-[#5B172E]"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px]">Menu</span>
          </button>

        </div>
      )}

      {/* Modals & Drawers */}
      <OrderFormModal
        isOpen={isOrderFormOpen}
        onClose={() => setIsOrderFormOpen(false)}
        onSubmitOrder={handleCreateOrder}
        nextOrderId={nextOrderId}
      />

      <UserFormModal
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setEditingUser(null);
        }}
        onSubmitUser={handleSaveUser}
        editingUser={editingUser}
        nextUserId={nextUserId}
      />

      <OrderDetailDrawer
        order={selectedOrderForDetails}
        isOpen={!!selectedOrderForDetails}
        onClose={() => {
          setSelectedOrderForDetails(null);
          setIsDetailsReadOnly(false);
        }}
        onAdvanceStage={handleAdvanceStage}
        onOpenMeasurements={(order, readOnly = false) => {
          setSelectedOrderForMeasurements(order);
          setIsMeasurementsReadOnly(readOnly);
        }}
        currentUser={currentUser}
        isReadOnly={isDetailsReadOnly}
      />

      <MeasurementsModal
        order={selectedOrderForMeasurements}
        isOpen={!!selectedOrderForMeasurements}
        onClose={() => {
          setSelectedOrderForMeasurements(null);
          setIsMeasurementsReadOnly(false);
        }}
        onSaveMeasurements={handleSaveMeasurements}
        currentUser={currentUser}
        isReadOnly={isMeasurementsReadOnly}
      />

    </div>
  );
}

export default App;

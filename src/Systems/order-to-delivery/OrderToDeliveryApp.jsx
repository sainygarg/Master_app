import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUnifiedAuth } from '../../core/auth/UnifiedAuthContext';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './components/LoginPage';
import { DashboardView } from './components/DashboardView';
import { OrdersView } from './components/OrdersView';
import { StageDetailView } from './components/StageDetailView';
import { MasterHubView } from './components/MasterHubView';
import { UserFormModal } from './components/UserFormModal';
import { OrderFormModal } from './components/OrderFormModal';
import { OrderDetailDrawer } from './components/OrderDetailDrawer';
import { MeasurementsModal } from './components/MeasurementsModal';
import { DesignSheetView } from './components/DesignSheetView';
import { STAGES, getNextStageIndex } from './types/stages';
import { fetchOrders, saveOrder, insertOrder, removeOrder, generateNextOrderId, getCachedOrders, syncOrdersCache } from './utils/orderService';
import {
  fetchUsers,
  fetchUserIds,
  createUser,
  updateUser,
  deleteUser,
  generateNextUserId,
  canUserAccessPage,
  canUserAccessStage,
  isApexAdmin,
  canModify
} from './utils/userAuthService';
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
  const [usersLoading, setUsersLoading] = useState(true);

  const loadUsers = async () => {
    try {
      setUsers(await fetchUsers());
    } catch (e) {
      console.error('Failed to load users from database', e);
      showToast('Failed to load users from database: ' + e.message, 'error');
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Authentication State directly connected to UnifiedAuthContext
  const { user: currentUser, login: setUnifiedLogin, logout: handleLogout } = useUnifiedAuth();

  // Orders State
  // Start from the cached copy (if any) so pages paint instantly; fresh data replaces it
  const [orders, setOrders] = useState(() => getCachedOrders() || []);
  const [ordersLoading, setOrdersLoading] = useState(() => getCachedOrders() === null);

  // Sidebar Hide / Unhide State (Defaults to hidden on phones for full width)
  const [isSidebarHidden, setIsSidebarHidden] = useState(() => typeof window !== 'undefined' && window.innerWidth < 1024);

  // Navigation is driven by the URL path:
  //   /order-to-delivery/dashboard | /orders | /design-sheet | /stages/<stageId> | /settings
  const location = useLocation();
  const navigate = useNavigate();
  const VIEWS = ['dashboard', 'orders', 'design-sheet', 'stages', 'settings'];
  const pathSegs = location.pathname.split('/').filter(Boolean); // ['order-to-delivery', view, stageId]
  const currentView = location.pathname === '/settings'
    ? 'settings'
    : (VIEWS.includes(pathSegs[1]) ? pathSegs[1] : 'orders'); // default to Orders page
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
      'design-sheet': canUserAccessPage(currentUser, 'orders'),
      stages: STAGES.some((s) => canUserAccessStage(currentUser, s.id)),
      settings: canUserAccessPage(currentUser, 'settings')
    };
    if (allowed[currentView]) return;
    const next = ['orders', 'dashboard', 'design-sheet', 'stages', 'settings'].find((v) => allowed[v]);
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
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the cache in step with local edits (create/update/advance/delete)
  // Debounced so rapid edits don't repeatedly serialize every order on the main thread
  useEffect(() => {
    if (ordersLoading) return;
    const t = setTimeout(() => syncOrdersCache(orders), 1500);
    return () => clearTimeout(t);
  }, [orders, ordersLoading]);

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

  // Pick up permission refreshes made by the master auth provider (keeps this app's copy from going stale)
  useEffect(() => {
    const onAuthChanged = () => {
      try {
        const raw = localStorage.getItem(AUTH_USER_KEY);
        if (!raw) return;
        const fresh = JSON.parse(raw);
        setCurrentUser((prev) => (prev && JSON.stringify(prev) !== JSON.stringify(fresh) ? fresh : prev));
      } catch { /* ignore */ }
    };
    window.addEventListener('unified-auth-changed', onAuthChanged);
    return () => window.removeEventListener('unified-auth-changed', onAuthChanged);
  }, []);

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
    setUnifiedLogin(user);
    const view = isApexAdmin(user) ? 'dashboard' : 'orders';
    setCurrentView(view);
    showToast(`Welcome back, ${user.name}! (${user.role} role)`, 'success');
    navigate('/dashboard', { replace: true });
  };

  // =========================================================================
  // DATA ISOLATION & TEAM DATA SCOPE:
  // - If Admin / Superadmin OR canAccessAllOrders is ON: see & manage ALL orders!
  // - If User (and canAccessAllOrders is OFF): strictly see ONLY orders created by this user!
  // =========================================================================
  const canAccessAll = isApexAdmin(currentUser) || Boolean(currentUser?.canAccessAllOrders);

  const scopedOrders = canAccessAll
    ? orders
    : orders.filter((o) => 
        o.createdByUserId === currentUser?.id || 
        o.createdByUserId === currentUser?.username ||
        (currentUser?.name && o.createdByName === currentUser.name)
      );

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

  // Create Order Handler (Supports single order or multiple orders array)
  const handleCreateOrder = async (orderOrOrders) => {
    const ordersToCreate = Array.isArray(orderOrOrders) ? orderOrOrders : [orderOrOrders];
    if (ordersToCreate.length === 0) return true;

    try {
      // 1. Fetch fresh list of orders to ensure strict auto-incrementing ID safety
      const fresh = await fetchOrders();
      let currentHighest = 1000;
      fresh.forEach((order) => {
        const match = order.id?.match(/SG-(\d+)/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > currentHighest) currentHighest = num;
        }
      });

      const insertedOrders = [];

      for (let i = 0; i < ordersToCreate.length; i++) {
        currentHighest += 1;
        const assignedId = `SG-${currentHighest}`;
        const orderItem = ordersToCreate[i];

        const orderWithCreator = {
          ...orderItem,
          id: assignedId,
          createdByUserId: currentUser.id,
          createdByName: currentUser.name
        };

        await insertOrder(orderWithCreator);
        insertedOrders.push(orderWithCreator);
      }

      setOrders((prev) => [...insertedOrders, ...prev]);

      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 }
      });

      if (insertedOrders.length === 1) {
        showToast(`Order ${insertedOrders[0].id} created! Saved to your personal account.`, 'success');
      } else {
        showToast(`Successfully created ${insertedOrders.length} orders (${insertedOrders[0].id} to ${insertedOrders[insertedOrders.length - 1].id})!`, 'success');
      }

      // Automatically navigate to Stage 1: Material Check
      setSelectedStageId(STAGES[0].id);
      setCurrentView('stages');
      return true;
    } catch (e) {
      console.error('Failed to create order(s)', e);
      showToast('Could not save order(s) to database: ' + (e.message || 'unknown error'), 'error');
      return false;
    }
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

    // MANDATORY GUARD: Order cannot move forward to next stage without successful fillup of Design Sheet
    if (!currentOrder.designSheet || currentOrder.designSheet.status !== 'Completed') {
      showToast(`Cannot advance order ${orderId}: Design Sheet must be completed and submitted first.`, 'error');
      return;
    }

    const currentIndex = currentOrder.currentStageIndex;

    // SPECIAL BRANCHING FOR ALTERATION STAGE:
    // If Status === 'No': Stop order here, do NOT advance to Final Delivery, move into Alteration History
    if (currentStgId === 'alteration' && stageFields.status === 'No') {
      const updatedOrders = orders.map((order) => {
        if (order.id !== orderId) return order;

        const newHistoryEntry = {
          stageId: 'alteration',
          stageName: 'Alteration',
          timestamp: new Date().toISOString(),
          action: 'Alteration Completed / Stopped (Status: No)',
          actor: currentUser?.name || 'Staff User',
          notes: stageFields.remarks || 'Order stopped at Alteration stage and moved to History.'
        };

        return {
          ...order,
          isAlterationStopped: true,
          stageData: {
            ...order.stageData,
            alteration: {
              ...(order.stageData?.alteration || {}),
              ...stageFields
            }
          },
          history: [...(order.history || []), newHistoryEntry]
        };
      });

      setOrders(updatedOrders);
      persistOrder(updatedOrders.find((o) => o.id === orderId));

      if (selectedOrderForDetails && selectedOrderForDetails.id === orderId) {
        setSelectedOrderForDetails(updatedOrders.find((o) => o.id === orderId));
      }

      showToast(`Order ${orderId} closed in Alteration (Status: No) and moved to History.`, 'info');
      return;
    }

    if (currentIndex >= STAGES.length - 1) {
      showToast(`Order ${orderId} is in final delivery stage.`, 'info');
      return;
    }

    const nextIndex = getNextStageIndex(currentOrder, currentIndex);
    const nextStage = STAGES[nextIndex];
    if (!nextStage) {
      showToast(`Order ${orderId} is in final delivery stage.`, 'info');
      return;
    }

    const updatedOrders = orders.map((order) => {
      if (order.id !== orderId) return order;

      const newHistoryEntry = {
        stageId: currentStgId,
        stageName: STAGES[currentIndex].name,
        timestamp: new Date().toISOString(),
        action: `Moved from ${STAGES[currentIndex].name} to ${nextStage.name}`,
        actor: currentUser?.name || 'Staff User',
        notes: stageFields.stageNotes || stageFields.remarks || (nextIndex > currentIndex + 1 ? 'Stage parameters confirmed. Stages skipped.' : 'Stage parameters confirmed.')
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

  const handleSaveDesignSheet = async (orderId, sheetData) => {
    const target = orders.find((o) => o.id === orderId);
    if (target) {
      const updated = {
        ...target,
        designSheet: sheetData,
        updatedAt: new Date().toISOString()
      };
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      await persistOrder(updated);

      if (selectedOrderForDetails && selectedOrderForDetails.id === orderId) {
        setSelectedOrderForDetails(updated);
      }
    }
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
        const ids = await fetchUserIds();
        const saved = await createUser({ ...userData, id: generateNextUserId(ids) });
        setUsers((prev) => [...prev.filter((u) => u.id !== saved.id), saved]);
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
              loading={ordersLoading}
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
              loading={ordersLoading}
              orders={filteredOrders}
              currentUser={currentUser}
              onOpenNewOrder={() => setIsOrderFormOpen(true)}
              onViewOrderDetails={(order) => setSelectedOrderForDetails(order)}
              onOpenMeasurements={(order) => setSelectedOrderForMeasurements(order)}
              onOpenDesignSheet={(order) => {
                setSelectedOrderForDetails(order);
                setCurrentView('design-sheet');
              }}
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

          {/* 2.5 Design Sheet Page (Workshop Job Card between All Orders and Material Check) */}
          {currentView === 'design-sheet' && canUserAccessPage(currentUser, 'orders') && (
            <DesignSheetView
              order={selectedOrderForDetails}
              orders={filteredOrders}
              currentUser={currentUser}
              onSelectOrder={(ord) => setSelectedOrderForDetails(ord)}
              onSaveDesignSheet={handleSaveDesignSheet}
              onViewOrderDetails={(ord) => setSelectedOrderForDetails(ord)}
              onBack={() => setCurrentView('orders')}
            />
          )}

          {/* 3. Stage Workflows */}
          {currentView === 'stages' && (
            hasStageAccess ? (
              <StageDetailView
                loading={ordersLoading}
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
              <MasterHubView
                usersLoading={usersLoading}
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
        readOnly={!isApexAdmin(currentUser) && !canModify(currentUser, 'settings')}
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

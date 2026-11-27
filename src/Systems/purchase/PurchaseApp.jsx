import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useUnifiedAuth } from '../../core/auth/UnifiedAuthContext';
import { canUserAccessPurchasePage } from '../order-to-delivery/utils/userAuthService';
import Dashboard from './pages/Dashboard';
import Indent from './pages/Indent';
import Approval from './pages/Approval';
import Vendor from './pages/Vendor';
import ThreePartyApproval from './pages/3-Party-approval';
import PO from './pages/PO';
import VendorFollowUp from './pages/Vendor-follow up';
import Receiving from './pages/Receiving';
import QualityCheck from './pages/Quality-check';
import ReturnPage from './pages/Return';

function PurchaseGuard({ path, children }) {
  const { user } = useUnifiedAuth();
  if (!canUserAccessPurchasePage(user, path)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default function PurchaseApp() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/purchase/dashboard" replace />} />
      <Route path="/dashboard" element={<PurchaseGuard path="/purchase/dashboard"><Dashboard /></PurchaseGuard>} />
      <Route path="/indent" element={<PurchaseGuard path="/purchase/indent"><Indent /></PurchaseGuard>} />
      <Route path="/approval" element={<PurchaseGuard path="/purchase/approval"><Approval /></PurchaseGuard>} />
      <Route path="/vendor-selection" element={<PurchaseGuard path="/purchase/vendor-selection"><Vendor /></PurchaseGuard>} />
      <Route path="/3-party-approval" element={<PurchaseGuard path="/purchase/3-party-approval"><ThreePartyApproval /></PurchaseGuard>} />
      <Route path="/po" element={<PurchaseGuard path="/purchase/po"><PO /></PurchaseGuard>} />
      <Route path="/vendor-follow-up" element={<PurchaseGuard path="/purchase/vendor-follow-up"><VendorFollowUp /></PurchaseGuard>} />
      <Route path="/receiving" element={<PurchaseGuard path="/purchase/receiving"><Receiving /></PurchaseGuard>} />
      <Route path="/quality-check" element={<PurchaseGuard path="/purchase/quality-check"><QualityCheck /></PurchaseGuard>} />
      <Route path="/return" element={<PurchaseGuard path="/purchase/return"><ReturnPage /></PurchaseGuard>} />
      <Route path="*" element={<Navigate to="/purchase/dashboard" replace />} />
    </Routes>
  );
}

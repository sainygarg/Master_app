import React from 'react';
import { Phone, Lock } from 'lucide-react';

/**
 * Returns either the customer's real mobile number (for Admin)
 * or a masked confidential placeholder (for User role).
 */
export const maskCustomerMobile = (mobile, currentUser) => {
  const isAdmin = currentUser?.role === 'Admin' || currentUser?.isAdmin;
  if (isAdmin) {
    return mobile || 'N/A';
  }
  // Masked for standard Users as requested:
  // "Users ko kisi bhi customers ke Mobile number show nhi karenge"
  return '+91 ••••• •••••';
};

export const isCustomerMobileVisible = (currentUser) => {
  return currentUser?.role === 'Admin' || currentUser?.isAdmin;
};

/**
 * Reusable Customer Phone Display Component
 */
export const CustomerPhoneDisplay = ({ mobile, currentUser, className = '' }) => {
  const isAdmin = currentUser?.role === 'Admin' || currentUser?.isAdmin;

  if (isAdmin) {
    return (
      <span className={`inline-flex items-center gap-1 ${className}`}>
        <Phone className="w-3 h-3 text-stone-400 shrink-0" />
        <span>{mobile || 'N/A'}</span>
      </span>
    );
  }

  return (
    <span 
      className={`inline-flex items-center gap-1 text-stone-400 font-mono text-[10px] select-none ${className}`}
      title="Customer mobile number is confidential and hidden for User accounts."
    >
      <Lock className="w-2.5 h-2.5 text-stone-400 shrink-0" />
      <span>+91 ••••• •••••</span>
    </span>
  );
};


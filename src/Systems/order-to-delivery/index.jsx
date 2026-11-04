import React from 'react';
import systemRegistry from '../../core/registry/systemRegistry';
import OrderToDeliveryApp from './OrderToDeliveryApp';

systemRegistry.register({
  id: 'order-to-delivery',
  name: 'Order to Delivery',
  shortName: 'Order Flow',
  description: '10-Stage Couture Garment Production Pipeline & Client Management',
  icon: 'Scissors',
  color: '#5B172E',
  accentColor: '#C5A059',
  defaultRoute: '/order-to-delivery',
  rootComponent: OrderToDeliveryApp,
  menuItems: [
    {
      label: 'Orders',
      href: '/order-to-delivery',
      viewKey: 'orders',
      icon: 'ShoppingBag',
      showFor: ['Admin', 'User'],
    },
    {
      label: 'Dashboard',
      href: '/order-to-delivery?view=dashboard',
      viewKey: 'dashboard',
      icon: 'LayoutDashboard',
      showFor: ['Admin', 'User'],
    },
    {
      label: 'Production Stages',
      href: '/order-to-delivery?view=stages',
      viewKey: 'stages',
      icon: 'Scissors',
      showFor: ['Admin', 'User'],
    },
    {
      label: 'Master Settings',
      href: '/order-to-delivery?view=settings',
      viewKey: 'settings',
      icon: 'Database',
      showFor: ['Admin'],
    },
  ],
});

export default OrderToDeliveryApp;


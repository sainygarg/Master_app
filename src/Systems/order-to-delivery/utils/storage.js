import { INITIAL_ORDERS } from '../data/initialOrders';

const STORAGE_KEY = 'sainy_couture_orders_v12';

// Clean out any stale/old legacy keys from user's browser localStorage
(() => {
  try {
    for (let i = 1; i <= 11; i++) {
      localStorage.removeItem(`sainy_couture_orders_v${i}`);
    }
  } catch {}
})();

export const getStoredOrders = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to parse orders from localStorage', error);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ORDERS));
    return INITIAL_ORDERS;
  }
};

export const saveOrdersToStorage = (orders) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch (error) {
    console.error('Failed to save orders to localStorage', error);
  }
};

export const generateNextOrderId = (orders) => {
  let highestNum = 1000;
  orders.forEach(order => {
    const match = order.id.match(/SG-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > highestNum) highestNum = num;
    }
  });
  const nextNum = highestNum + 1;
  return `SG-${nextNum}`;
};

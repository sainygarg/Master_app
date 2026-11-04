import { INITIAL_ORDERS } from '../data/initialOrders';

const STORAGE_KEY = 'sainy_couture_orders_v8'; // bumped to v8 for updated measurement parameters

export const getStoredOrders = () => {
  try {
    let data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      // Check if previous v7 exists to migrate
      const prevData = localStorage.getItem('sainy_couture_orders_v7');
      if (prevData) {
        data = prevData;
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ORDERS));
        return INITIAL_ORDERS;
      }
    }
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Migrate fullLength from lower to upper if present
      const migrated = parsed.map(o => {
        if (o.measurements?.lower?.fullLength && !o.measurements?.upper?.fullLength) {
          return {
            ...o,
            measurements: {
              ...o.measurements,
              upper: {
                ...o.measurements.upper,
                fullLength: o.measurements.lower.fullLength
              }
            }
          };
        }
        return o;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }
    return INITIAL_ORDERS;
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

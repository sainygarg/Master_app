import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchNotificationsApi, createNotificationApi, deleteNotificationApi, markAsReadApi } from "../api/notificationApi";

// Minimum gap between two server fetches (1 minute)
export const NOTIF_REFETCH_INTERVAL_MS = 60 * 1000;

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async ({ role, userId }, { rejectWithValue }) => {
    try {
      const data = await fetchNotificationsApi(role, userId);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  {
    // Skip the call when: no user id yet (read state can't be known), a fetch is
    // already running, or the last successful fetch was less than 1 minute ago.
    condition: ({ userId, force } = {}, { getState }) => {
      if (!userId) return false;
      const { loading, fetchedAt } = getState().notifications;
      if (loading) return false;
      if (!force && fetchedAt && Date.now() - fetchedAt < NOTIF_REFETCH_INTERVAL_MS) return false;
      return true;
    },
  }
);

export const markAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async ({ notificationId, userId }, { rejectWithValue }) => {
    try {
      await markAsReadApi(notificationId, userId);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createNotification = createAsyncThunk(
  "notifications/createNotification",
  async (notificationData, { rejectWithValue }) => {
    try {
      const data = await createNotificationApi(notificationData);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeNotification = createAsyncThunk(
  "notifications/deleteNotification",
  async (id, { rejectWithValue }) => {
    try {
      await deleteNotificationApi(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const NOTIF_CACHE_KEY = 'notificationsCache';

const getNotifCacheKey = () => {
  const user = (localStorage.getItem('user-name') || 'guest').toLowerCase();
  return `${NOTIF_CACHE_KEY}_${user}`;
};

// Cache shape: { list, fetchedAt }. Old cache (plain array) has no fetchedAt,
// so it is treated as "never fetched" and read state is not trusted.
const readNotifCache = () => {
  try {
    const key = getNotifCacheKey();
    const raw = localStorage.getItem(key) || sessionStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.list) && parsed.fetchedAt) {
        return { list: parsed.list, fetchedAt: parsed.fetchedAt };
      }
    }
  } catch {
    // Ignore storage errors
  }
  return { list: [], fetchedAt: null };
};

const writeNotifCache = (list, fetchedAt) => {
  try {
    const key = getNotifCacheKey();
    localStorage.setItem(key, JSON.stringify({ list, fetchedAt }));
  } catch {
    // Ignore storage errors
  }
};

const initialCache = readNotifCache();

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    list: initialCache.list,
    fetchedAt: initialCache.fetchedAt,
    // true only once read/unread info has come from a completed fetch
    loaded: !!initialCache.fetchedAt,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
        state.fetchedAt = Date.now();
        state.loaded = true;
        writeNotifCache(action.payload, state.fetchedAt);
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createNotification.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
        writeNotifCache(state.list, state.fetchedAt || Date.now());
      })
      .addCase(removeNotification.fulfilled, (state, action) => {
        state.list = state.list.filter((n) => n.id !== action.payload);
        writeNotifCache(state.list, state.fetchedAt || Date.now());
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const index = state.list.findIndex(n => n.id === action.payload);
        if (index !== -1) {
          state.list[index].isRead = true;
          writeNotifCache(state.list, state.fetchedAt || Date.now());
        }
      });
  },
});

export default notificationSlice.reducer;

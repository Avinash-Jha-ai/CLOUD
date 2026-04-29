import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../../services/firebase';
import { API_BASE_URL } from '../../configs/api';

// Retries up to 2 times — handles Render.com cold-start & campus network blips.
const fetchWithRetry = async (url, options = {}, retries = 2, delayMs = 2000) => {
  try {
    const response = await fetch(url, options);
    return response;
  } catch (err) {
    if (retries > 0) {
      console.warn(`[fetchWithRetry] Attempt failed (${err.message}), retrying in ${delayMs}ms... (${retries} left)`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
      return fetchWithRetry(url, options, retries - 1, delayMs);
    }
    throw new Error('Unable to reach server. Please check your connection and try again.');
  }
};


const callSocialLoginBackend = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/social-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to authenticate with backend');
  return data;
};

export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const backendData = await callSocialLoginBackend({
        email: user.email,
        fullname: user.displayName || 'Google User',
        avatar: user.photoURL,
        providerId: user.uid,
        provider: 'google'
      });

      return backendData.user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchWithRetry(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Check auth failed');
      return data.user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const upgradePlan = createAsyncThunk(
  'auth/upgradePlan',
  async (plan, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/upgrade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Upgrade failed');
      return data.user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const verifyPayment = createAsyncThunk(
  'auth/verifyPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payment/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Payment verification failed');
      return data.user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await signOut(auth);
      await fetch(`${API_BASE_URL}/api/auth/logout`, { method: 'GET', credentials: 'include' });
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  user: null,
  loading: false,
  error: null,
};

const handlePending = (state) => { state.loading = true; state.error = null; };
const handleRejected = (state, action) => { state.loading = false; state.error = action.payload; };

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Google Login
      .addCase(loginWithGoogle.pending, handlePending)
      .addCase(loginWithGoogle.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(loginWithGoogle.rejected, handleRejected)
      // Check Auth
      .addCase(checkAuth.pending, (state) => { state.loading = true; })
      .addCase(checkAuth.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(checkAuth.rejected, (state) => { state.loading = false; state.user = null; })
      // Upgrade Plan
      .addCase(upgradePlan.pending, handlePending)
      .addCase(upgradePlan.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(upgradePlan.rejected, handleRejected)
      // Verify Payment
      .addCase(verifyPayment.pending, handlePending)
      .addCase(verifyPayment.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(verifyPayment.rejected, handleRejected)
      // Logout
      .addCase(logoutUser.fulfilled, (state) => { state.user = null; });
  },
});

export const { setUser, clearError } = authSlice.actions;
export default authSlice.reducer;

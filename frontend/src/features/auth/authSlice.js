import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider, githubProvider } from '../../services/firebase';

const callSocialLoginBackend = async (userData) => {
  const response = await fetch('/api/auth/social-login', {
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

export const loginWithGithub = createAsyncThunk(
  'auth/loginWithGithub',
  async (_, { rejectWithValue }) => {
    try {
      const result = await signInWithPopup(auth, githubProvider);
      const user = result.user;
      
      const backendData = await callSocialLoginBackend({
        email: user.email || `${user.uid}@github.com`,
        fullname: user.displayName || 'Github User',
        avatar: user.photoURL,
        providerId: user.uid,
        provider: 'github'
      });

      return backendData.user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loginWithEmail = createAsyncThunk(
  'auth/loginWithEmail',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');
      return data.user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerWithEmail = createAsyncThunk(
  'auth/registerWithEmail',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        body: formData, // FormData directly
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Registration failed');
      return data.user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const sendOtp = createAsyncThunk(
  'auth/sendOtp',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/generateOtp', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to send OTP');
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Verification failed');
      return true; // true means verified
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/me', {
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
      const response = await fetch('/api/auth/upgrade', {
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
      const response = await fetch('/api/payment/verify-payment', {
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
      await fetch('/api/auth/logout', { method: 'GET', credentials: 'include' });
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
  otpSent: false,
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
      // Github Login
      .addCase(loginWithGithub.pending, handlePending)
      .addCase(loginWithGithub.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(loginWithGithub.rejected, handleRejected)
      // Email Login
      .addCase(loginWithEmail.pending, handlePending)
      .addCase(loginWithEmail.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(loginWithEmail.rejected, handleRejected)
      // Check Auth
      .addCase(checkAuth.pending, (state) => { state.loading = true; })
      .addCase(checkAuth.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(checkAuth.rejected, (state) => { state.loading = false; state.user = null; })
      // Register
      .addCase(registerWithEmail.pending, handlePending)
      .addCase(registerWithEmail.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(registerWithEmail.rejected, handleRejected)
      // Send OTP
      .addCase(sendOtp.pending, handlePending)
      .addCase(sendOtp.fulfilled, (state) => { state.loading = false; state.otpSent = true; })
      .addCase(sendOtp.rejected, handleRejected)
      // Verify OTP
      .addCase(verifyOtp.pending, handlePending)
      .addCase(verifyOtp.fulfilled, (state) => { 
        state.loading = false; 
        if (state.user) state.user.isVerified = true; 
      })
      .addCase(verifyOtp.rejected, handleRejected)
      // Upgrade Plan
      .addCase(upgradePlan.pending, handlePending)
      .addCase(upgradePlan.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(upgradePlan.rejected, handleRejected)
      // Verify Payment
      .addCase(verifyPayment.pending, handlePending)
      .addCase(verifyPayment.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(verifyPayment.rejected, handleRejected)
      // Logout
      .addCase(logoutUser.fulfilled, (state) => { state.user = null; state.otpSent = false; });
  },
});

export const { setUser, clearError } = authSlice.actions;
export default authSlice.reducer;

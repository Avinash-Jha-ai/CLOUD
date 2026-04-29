import { configureStore } from '@reduxjs/toolkit';
import themeReducer from '../features/theme/themeSlice';
import authReducer from '../features/auth/authSlice';
import driveReducer from '../features/drive/driveSlice';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    auth: authReducer,
    drive: driveReducer,
  },
});

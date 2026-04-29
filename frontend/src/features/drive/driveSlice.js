import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_BASE_URL } from '../../configs/api';


export const fetchFolderContent = createAsyncThunk(
  'drive/fetchFolderContent',
  async (folderId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/folder/${folderId || 'root'}`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch folder content');
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createFolder = createAsyncThunk(
  'drive/createFolder',
  async ({ name, color, parentId }, { rejectWithValue }) => {
    try {
      const url = parentId ? `${API_BASE_URL}/api/folder/${parentId}` : `${API_BASE_URL}/api/folder`; 
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color }),
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create folder');
      return data.folder;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const uploadFiles = createAsyncThunk(
  'drive/uploadFiles',
  async ({ files, customNames, folderId }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append('files', file));
      if (customNames) {
        formData.append('customNames', JSON.stringify(customNames));
      }
      
      const response = await fetch(`${API_BASE_URL}/api/file/upload/${folderId || 'root'}`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Upload failed');
      return data; // Return full data { files, storageUsed }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteFile = createAsyncThunk(
  'drive/deleteFile',
  async (fileId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/file/delete/${fileId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Delete failed');
      return data; // Return full data { fileId, storageUsed }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteFolder = createAsyncThunk(
  'drive/deleteFolder',
  async (folderId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/folder/${folderId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Delete failed');
      return folderId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  folders: [],
  files: [],
  currentFolder: null,
  isFetching: false,
  isUploading: false,
  error: null,
};

const driveSlice = createSlice({
  name: 'drive',
  initialState,
  reducers: {
    setCurrentFolder: (state, action) => {
      state.currentFolder = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFolderContent.pending, (state) => { state.isFetching = true; state.error = null; })
      .addCase(fetchFolderContent.fulfilled, (state, action) => {
        state.isFetching = false;
        state.folders = action.payload.folders;
        state.files = action.payload.files;
      })
      .addCase(fetchFolderContent.rejected, (state, action) => { state.isFetching = false; state.error = action.payload; })
      .addCase(uploadFiles.pending, (state) => { state.isUploading = true; })
      .addCase(uploadFiles.fulfilled, (state, action) => {
        state.isUploading = false;
        state.files.push(...action.payload.files);
      })
      .addCase(uploadFiles.rejected, (state, action) => { state.isUploading = false; state.error = action.payload; })
      .addCase(createFolder.fulfilled, (state, action) => {
        state.folders.push(action.payload);
      })
      .addCase(deleteFile.fulfilled, (state, action) => {
        state.files = state.files.filter(file => file._id !== action.payload.fileId);
      })
      .addCase(deleteFolder.fulfilled, (state, action) => {
        state.folders = state.folders.filter(folder => folder._id !== action.payload);
      });
  },
});

export const { setCurrentFolder } = driveSlice.actions;
export default driveSlice.reducer;

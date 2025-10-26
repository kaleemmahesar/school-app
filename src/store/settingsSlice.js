import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createAsyncThunkWithToast } from '../utils/asyncThunkUtils';
import { SCHOOL_CONFIG } from '../config/schoolConfig';

// Initial state for school settings - now using the configuration file
const initialState = {
  schoolInfo: {
    name: SCHOOL_CONFIG.name,
    logo: SCHOOL_CONFIG.logo,
    level: SCHOOL_CONFIG.level,
    fundingType: SCHOOL_CONFIG.fundingType,
    hasPG: SCHOOL_CONFIG.hasPG,
    hasNursery: SCHOOL_CONFIG.hasNursery,
    hasKG: SCHOOL_CONFIG.hasKG,
    theme: 'light', // 'light', 'dark', or 'system'
    sidebarCollapsed: false,
    dateFormat: 'DD/MM/YYYY',
    currency: 'PKR',
    levelDetails: {
      primary: { from: 1, to: 5 },
      middle: { from: 6, to: 8 },
      high: { from: 9, to: 10 }
    },
    gradingStructure: SCHOOL_CONFIG.gradingStructure
  },
  loading: false,
  error: null,
};

// Async thunks for API calls (mock implementation)
export const updateSchoolInfo = createAsyncThunk(
  'settings/updateSchoolInfo',
  async (schoolData, { rejectWithValue }) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real app, this would be an API call
      // const response = await api.put('/school/settings', schoolData);
      // return response.data;
      
      return schoolData;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update school information');
    }
  }
);

export const fetchSchoolInfo = createAsyncThunk(
  'settings/fetchSchoolInfo',
  async (_, { rejectWithValue }) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real app, this would be an API call
      // const response = await api.get('/school/settings');
      // return response.data;
      
      // Return data from the configuration file
      return {
        name: SCHOOL_CONFIG.name,
        logo: SCHOOL_CONFIG.logo,
        level: SCHOOL_CONFIG.level,
        fundingType: SCHOOL_CONFIG.fundingType,
        hasPG: SCHOOL_CONFIG.hasPG,
        hasNursery: SCHOOL_CONFIG.hasNursery,
        hasKG: SCHOOL_CONFIG.hasKG,
        theme: 'light',
        sidebarCollapsed: false,
        dateFormat: 'DD/MM/YYYY',
        currency: 'PKR',
        levelDetails: {
          primary: { from: 1, to: 5 },
          middle: { from: 6, to: 8 },
          high: { from: 9, to: 10 }
        },
        gradingStructure: SCHOOL_CONFIG.gradingStructure
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch school information');
    }
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetSettings: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch school info
      .addCase(fetchSchoolInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSchoolInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.schoolInfo = action.payload;
      })
      .addCase(fetchSchoolInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update school info
      .addCase(updateSchoolInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSchoolInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.schoolInfo = action.payload;
      })
      .addCase(updateSchoolInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, resetSettings } = settingsSlice.actions;
export default settingsSlice.reducer;
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_BASE_URL } from '../utils/apiConfig';

// Async thunks for API calls
export const fetchIncome = createAsyncThunk(
  'income/fetchIncome',
  async () => {
    const response = await fetch(`${API_BASE_URL}/income`);
    if (!response.ok) {
      throw new Error('Failed to fetch income data');
    }
    return await response.json();
  }
);

const initialState = {
  canteenIncome: [],
  sponsorshipIncome: [],
  loading: false,
  error: null,
};

const incomeSlice = createSlice({
  name: 'income',
  initialState,
  reducers: {
    addCanteenIncome: (state, action) => {
      const newItem = {
        ...action.payload,
        id: `c${Date.now()}`
      };
      state.canteenIncome.push(newItem);
    },
    addSponsorshipIncome: (state, action) => {
      const newItem = {
        ...action.payload,
        id: `s${Date.now()}`
      };
      state.sponsorshipIncome.push(newItem);
    },
    updateCanteenIncome: (state, action) => {
      const index = state.canteenIncome.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.canteenIncome[index] = action.payload;
      }
    },
    updateSponsorshipIncome: (state, action) => {
      const index = state.sponsorshipIncome.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.sponsorshipIncome[index] = action.payload;
      }
    },
    deleteCanteenIncome: (state, action) => {
      state.canteenIncome = state.canteenIncome.filter(item => item.id !== action.payload);
    },
    deleteSponsorshipIncome: (state, action) => {
      state.sponsorshipIncome = state.sponsorshipIncome.filter(item => item.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIncome.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIncome.fulfilled, (state, action) => {
        state.loading = false;
        state.canteenIncome = action.payload.canteenIncome || [];
        state.sponsorshipIncome = action.payload.sponsorshipIncome || [];
      })
      .addCase(fetchIncome.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { 
  addCanteenIncome, 
  addSponsorshipIncome, 
  updateCanteenIncome, 
  updateSponsorshipIncome, 
  deleteCanteenIncome, 
  deleteSponsorshipIncome 
} = incomeSlice.actions;

export default incomeSlice.reducer;
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  canteenIncome: [],
  sponsorshipIncome: []
};

const incomeSlice = createSlice({
  name: 'income',
  initialState,
  reducers: {
    addCanteenIncome: (state, action) => {
      state.canteenIncome.push({
        ...action.payload,
        id: `c${Date.now()}`
      });
    },
    addSponsorshipIncome: (state, action) => {
      state.sponsorshipIncome.push({
        ...action.payload,
        id: `s${Date.now()}`
      });
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
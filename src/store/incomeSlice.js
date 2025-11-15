import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  canteenIncome: [
    // October 2025 canteen income
    {
      id: 'c0',
      date: '2025-10-05',
      amount: 1200,
      description: 'Weekly canteen sales'
    },
    {
      id: 'c01',
      date: '2025-10-12',
      amount: 1400,
      description: 'Weekly canteen sales'
    },
    {
      id: 'c02',
      date: '2025-10-19',
      amount: 1300,
      description: 'Weekly canteen sales'
    },
    {
      id: 'c03',
      date: '2025-10-26',
      amount: 1500,
      description: 'Weekly canteen sales'
    },
    // November 2025 canteen income
    {
      id: 'c1',
      date: '2025-11-05',
      amount: 1500,
      description: 'Weekly canteen sales'
    },
    {
      id: 'c2',
      date: '2025-11-12',
      amount: 1800,
      description: 'Weekly canteen sales'
    },
    {
      id: 'c3',
      date: '2025-11-19',
      amount: 1600,
      description: 'Weekly canteen sales'
    },
    {
      id: 'c4',
      date: '2025-11-26',
      amount: 1700,
      description: 'Weekly canteen sales'
    }
  ],
  sponsorshipIncome: [
    // October 2025 sponsorship income
    {
      id: 's0',
      date: '2025-10-15',
      amount: 4000,
      description: 'Uniform sponsorship from local store',
      sponsor: 'XYZ Uniforms'
    },
    // November 2025 sponsorship income
    {
      id: 's1',
      date: '2025-11-10',
      amount: 5000,
      description: 'Book sponsorship from local publisher',
      sponsor: 'ABC Publishers'
    },
    {
      id: 's2',
      date: '2025-11-20',
      amount: 3000,
      description: 'Sports equipment sponsorship',
      sponsor: 'XYZ Sports Store'
    }
  ]
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
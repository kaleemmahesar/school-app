import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  subsidies: [
    {
      id: 1,
      quarter: 'Q1',
      year: 2025,
      amount: 350000,
      ngoName: 'Education for All Foundation',
      receivedDate: '2024-01-15',
      expectedDate: '',
      status: 'received',
      description: 'Quarterly education subsidy for operational costs'
    },
    {
      id: 2,
      quarter: 'Q2',
      year: 2025,
      amount: 350000,
      ngoName: 'Education for All Foundation',
      receivedDate: '2024-04-10',
      expectedDate: '',
      status: 'received',
      description: 'Quarterly education subsidy for operational costs'
    },
    {
      id: 3,
      quarter: 'Q3',
      year: 2025,
      amount: 350000,
      ngoName: 'Education for All Foundation',
      receivedDate: '',
      expectedDate: '2024-07-15',
      status: 'expected',
      description: 'Quarterly education subsidy for operational costs'
    },
    {
      id: 4,
      quarter: 'Q4',
      year: 2025,
      amount: 350000,
      ngoName: 'Education for All Foundation',
      receivedDate: '',
      expectedDate: '2024-10-15',
      status: 'expected',
      description: 'Quarterly education subsidy for operational costs'
    }
  ]
};

const subsidiesSlice = createSlice({
  name: 'subsidies',
  initialState,
  reducers: {
    addSubsidy: (state, action) => {
      state.subsidies.push({
        ...action.payload,
        id: state.subsidies.length + 1
      });
    },
    updateSubsidy: (state, action) => {
      const index = state.subsidies.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.subsidies[index] = action.payload;
      }
    }
  }
});

export const { addSubsidy, updateSubsidy } = subsidiesSlice.actions;
export default subsidiesSlice.reducer;
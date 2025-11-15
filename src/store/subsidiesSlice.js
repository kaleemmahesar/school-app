import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_BASE_URL } from '../utils/apiConfig';

// Async thunks for API calls
export const fetchSubsidies = createAsyncThunk(
  'subsidies/fetchSubsidies',
  async () => {
    const response = await fetch(`${API_BASE_URL}/subsidies`);
    if (!response.ok) {
      throw new Error('Failed to fetch subsidies');
    }
    return await response.json();
  }
);

const initialState = {
  subsidies: [],
  loading: false,
  error: null,
};

const subsidiesSlice = createSlice({
  name: 'subsidies',
  initialState,
  reducers: {
    addSubsidy: (state, action) => {
      const newSubsidy = {
        ...action.payload,
        id: state.subsidies.length + 1
      };
      state.subsidies.push(newSubsidy);
    },
    updateSubsidy: (state, action) => {
      const index = state.subsidies.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.subsidies[index] = action.payload;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubsidies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubsidies.fulfilled, (state, action) => {
        state.loading = false;
        state.subsidies = action.payload;
      })
      .addCase(fetchSubsidies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { addSubsidy, updateSubsidy } = subsidiesSlice.actions;
export default subsidiesSlice.reducer;
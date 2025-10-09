import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Mock data for expenses
const mockExpenses = [
  {
    id: '1',
    description: 'Stationery purchase',
    amount: 500,
    date: '2023-09-15',
    category: 'Stationary',
  },
  {
    id: '2',
    description: 'Electricity bill',
    amount: 1200,
    date: '2023-09-20',
    category: 'Utilities',
  },
  {
    id: '3',
    description: 'Staff salary',
    amount: 15000,
    date: '2023-09-25',
    category: 'Salary',
  },
];

const initialState = {
  expenses: mockExpenses,
  categories: ['Stationary', 'Utilities', 'Salary', 'Maintenance'],
  loading: false,
  error: null,
};

// Async thunks for mock API calls
export const fetchExpenses = createAsyncThunk('expenses/fetchExpenses', async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockExpenses;
});

export const addExpense = createAsyncThunk('expenses/addExpense', async (expenseData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  const newExpense = {
    id: Date.now().toString(),
    ...expenseData,
  };
  return newExpense;
});

export const updateExpense = createAsyncThunk('expenses/updateExpense', async (expenseData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return expenseData;
});

export const deleteExpense = createAsyncThunk('expenses/deleteExpense', async (expenseId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return expenseId;
});

const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    addCategory: (state, action) => {
      if (!state.categories.includes(action.payload)) {
        state.categories.push(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addExpense.fulfilled, (state, action) => {
        state.expenses.push(action.payload);
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        const index = state.expenses.findIndex(expense => expense.id === action.payload.id);
        if (index !== -1) {
          state.expenses[index] = action.payload;
        }
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.expenses = state.expenses.filter(expense => expense.id !== action.payload);
      });
  },
});

export const { addCategory } = expensesSlice.actions;
export default expensesSlice.reducer;
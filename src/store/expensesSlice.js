import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { createAsyncThunkWithToast, createAddThunk, createUpdateThunk, createDeleteThunk } from '../utils/asyncThunkUtils';
import { API_BASE_URL } from '../utils/apiConfig';

// Mock data for expenses
const mockExpenses = [
  {
    id: '1',
    description: 'Stationery purchase',
    amount: 500,
    date: '2025-10-15',
    category: 'Stationary',
  },
  {
    id: '2',
    description: 'Electricity bill',
    amount: 1200,
    date: '2025-10-20',
    category: 'Utilities',
  },
  {
    id: '3',
    description: 'Staff salary',
    amount: 15000,
    date: '2025-10-25',
    category: 'Salary',
  },
  {
    id: '4',
    description: 'Library books',
    amount: 3000,
    date: '2025-10-10',
    category: 'Stationary',
  },
  {
    id: '5',
    description: 'Water bill',
    amount: 800,
    date: '2025-10-18',
    category: 'Utilities',
  },
  {
    id: '6',
    description: 'Computer maintenance',
    amount: 2500,
    date: '2025-10-22',
    category: 'Maintenance',
  },
  {
    id: '7',
    description: 'Sports equipment',
    amount: 1500,
    date: '2025-10-05',
    category: 'Stationary',
  },
  {
    id: '8',
    description: 'Internet bill',
    amount: 2000,
    date: '2025-10-28',
    category: 'Utilities',
  },
  {
    id: '9',
    description: 'Classroom furniture',
    amount: 5000,
    date: '2025-10-12',
    category: 'Maintenance',
  },
  {
    id: '10',
    description: 'Science lab supplies',
    amount: 4000,
    date: '2025-10-30',
    category: 'Stationary',
  },
  // November 2023 expenses
  {
    id: '11',
    description: 'Monthly electricity bill',
    amount: 1500,
    date: '2025-11-05',
    category: 'Utilities',
  },
  {
    id: '12',
    description: 'Internet and phone bills',
    amount: 2200,
    date: '2025-11-10',
    category: 'Utilities',
  },
  {
    id: '13',
    description: 'Office supplies purchase',
    amount: 800,
    date: '2025-11-15',
    category: 'Stationary',
  },
  {
    id: '14',
    description: 'Maintenance and repairs',
    amount: 3500,
    date: '2025-11-20',
    category: 'Maintenance',
  },
  {
    id: '15',
    description: 'Canteen inventory',
    amount: 2800,
    date: '2025-11-25',
    category: 'Stationary',
  }
];

const initialState = {
  expenses: mockExpenses,
  categories: ['Stationary', 'Utilities', 'Salary', 'Maintenance'],
  loading: false,
  error: null,
};

// Async thunks for mock API calls
export const fetchExpenses = createAsyncThunkWithToast(
  'expenses/fetchExpenses',
  async () => {
    return mockExpenses;
  },
  {
    delay: 500
  }
);

export const addExpense = createAddThunk(
  'expenses/addExpense',
  async (expenseData) => {
    const newExpense = {
      id: Date.now().toString(),
      ...expenseData,
    };
    return newExpense;
  },
  {
    successMessage: 'Expense added successfully',
    errorMessage: 'Failed to add expense',
    delay: 500
  }
);

export const updateExpense = createUpdateThunk(
  'expenses/updateExpense',
  async (expenseData) => {
    return expenseData;
  },
  {
    successMessage: 'Expense updated successfully',
    errorMessage: 'Failed to update expense',
    delay: 500
  }
);

export const deleteExpense = createDeleteThunk(
  'expenses/deleteExpense',
  async (expenseId) => {
    return expenseId;
  },
  {
    successMessage: 'Expense deleted successfully',
    errorMessage: 'Failed to delete expense',
    delay: 500
  }
);

// Add category thunk
export const addCategory = createAsyncThunkWithToast(
  'expenses/addCategory',
  async (categoryName) => {
    return categoryName;
  },
  {
    successMessage: 'Category added successfully',
    errorMessage: 'Failed to add category',
    delay: 500
  }
);

const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {},
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
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        const categoryName = action.payload;
        // Only add category if it doesn't already exist
        if (!state.categories.includes(categoryName)) {
          state.categories.push(categoryName);
        }
      });
  },
});

export default expensesSlice.reducer;
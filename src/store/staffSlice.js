import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Mock data for staff with enhanced salary management
const mockStaff = [
  {
    id: '1',
    firstName: 'Michael',
    lastName: 'Johnson',
    email: 'michael.j@school.com',
    phone: '111-222-3333',
    position: 'Math Teacher',
    salary: 45000,
    allowances: [
      { name: 'Housing Allowance', amount: 5000 },
      { name: 'Transport Allowance', amount: 2000 }
    ],
    dateOfJoining: '2020-08-15',
    attendance: [], // Will store attendance records
    salaryHistory: [
      {
        id: 'sal-1-001',
        month: 'September 2023',
        baseSalary: 45000,
        allowances: 7000,
        deductions: 0,
        netSalary: 52000,
        status: 'paid',
        paymentDate: '2023-09-30'
      }
    ]
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Williams',
    email: 'sarah.w@school.com',
    phone: '444-555-6666',
    position: 'English Teacher',
    salary: 42000,
    allowances: [
      { name: 'Housing Allowance', amount: 5000 },
      { name: 'Transport Allowance', amount: 2000 }
    ],
    dateOfJoining: '2019-06-10',
    attendance: [],
    salaryHistory: [
      {
        id: 'sal-2-001',
        month: 'September 2023',
        baseSalary: 42000,
        allowances: 7000,
        deductions: 0,
        netSalary: 49000,
        status: 'paid',
        paymentDate: '2023-09-30'
      }
    ]
  },
];

const initialState = {
  staff: mockStaff,
  loading: false,
  error: null,
};

// Async thunks for mock API calls
export const fetchStaff = createAsyncThunk('staff/fetchStaff', async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockStaff;
});

export const addStaff = createAsyncThunk('staff/addStaff', async (staffData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  const newStaff = {
    id: Date.now().toString(),
    ...staffData,
  };
  return newStaff;
});

export const updateStaff = createAsyncThunk('staff/updateStaff', async (staffData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return staffData;
});

export const deleteStaff = createAsyncThunk('staff/deleteStaff', async (staffId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return staffId;
});

const staffSlice = createSlice({
  name: 'staff',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStaff.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStaff.fulfilled, (state, action) => {
        state.loading = false;
        state.staff = action.payload;
      })
      .addCase(fetchStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addStaff.fulfilled, (state, action) => {
        state.staff.push(action.payload);
      })
      .addCase(updateStaff.fulfilled, (state, action) => {
        const index = state.staff.findIndex(staff => staff.id === action.payload.id);
        if (index !== -1) {
          state.staff[index] = action.payload;
        }
      })
      .addCase(deleteStaff.fulfilled, (state, action) => {
        state.staff = state.staff.filter(staff => staff.id !== action.payload);
      });
  },
});

export default staffSlice.reducer;
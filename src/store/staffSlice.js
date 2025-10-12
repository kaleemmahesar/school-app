import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { createAsyncThunkWithToast } from '../utils/asyncThunkUtils';
import { API_BASE_URL } from '../utils/apiConfig';

// Mock data for staff with enhanced salary management
const mockStaff = [
  {
    id: '1',
    firstName: 'Ahmed',
    lastName: 'Khan',
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
    firstName: 'Fatima',
    lastName: 'Ahmed',
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
  {
    id: '3',
    firstName: 'Bilal',
    lastName: 'Malik',
    phone: '777-888-9999',
    position: 'Science Teacher',
    salary: 44000,
    allowances: [
      { name: 'Housing Allowance', amount: 5000 },
      { name: 'Transport Allowance', amount: 2000 }
    ],
    dateOfJoining: '2021-01-20',
    attendance: [],
    salaryHistory: [
      {
        id: 'sal-3-001',
        month: 'September 2023',
        baseSalary: 44000,
        allowances: 7000,
        deductions: 0,
        netSalary: 51000,
        status: 'paid',
        paymentDate: '2023-09-30'
      }
    ]
  },
  {
    id: '4',
    firstName: 'Ayesha',
    lastName: 'Raza',
    phone: '222-333-4444',
    position: 'Accountant',
    salary: 35000,
    allowances: [
      { name: 'Housing Allowance', amount: 4000 },
      { name: 'Transport Allowance', amount: 1500 }
    ],
    dateOfJoining: '2018-03-12',
    attendance: [],
    salaryHistory: [
      {
        id: 'sal-4-001',
        month: 'September 2023',
        baseSalary: 35000,
        allowances: 5500,
        deductions: 0,
        netSalary: 40500,
        status: 'paid',
        paymentDate: '2023-09-30'
      }
    ]
  },
  {
    id: '5',
    firstName: 'Omar',
    lastName: 'Sheikh',
    phone: '555-666-7777',
    position: 'Librarian',
    salary: 30000,
    allowances: [
      { name: 'Housing Allowance', amount: 3000 },
      { name: 'Transport Allowance', amount: 1000 }
    ],
    dateOfJoining: '2020-11-05',
    attendance: [],
    salaryHistory: [
      {
        id: 'sal-5-001',
        month: 'September 2023',
        baseSalary: 30000,
        allowances: 4000,
        deductions: 0,
        netSalary: 34000,
        status: 'paid',
        paymentDate: '2023-09-30'
      }
    ]
  },
  {
    id: '6',
    firstName: 'Zainab',
    lastName: 'Hussain',
    phone: '888-999-0000',
    position: 'Counselor',
    salary: 32000,
    allowances: [
      { name: 'Housing Allowance', amount: 3500 },
      { name: 'Transport Allowance', amount: 1200 }
    ],
    dateOfJoining: '2019-07-18',
    attendance: [],
    salaryHistory: [
      {
        id: 'sal-6-001',
        month: 'September 2023',
        baseSalary: 32000,
        allowances: 4700,
        deductions: 0,
        netSalary: 36700,
        status: 'paid',
        paymentDate: '2023-09-30'
      }
    ]
  },
  {
    id: '7',
    firstName: 'Hassan',
    lastName: 'Qureshi',
    phone: '333-444-5555',
    position: 'Principal',
    salary: 60000,
    allowances: [
      { name: 'Housing Allowance', amount: 8000 },
      { name: 'Transport Allowance', amount: 3000 }
    ],
    dateOfJoining: '2017-05-22',
    attendance: [],
    salaryHistory: [
      {
        id: 'sal-7-001',
        month: 'September 2023',
        baseSalary: 60000,
        allowances: 11000,
        deductions: 0,
        netSalary: 71000,
        status: 'paid',
        paymentDate: '2023-09-30'
      }
    ]
  },
  {
    id: '8',
    firstName: 'Mariam',
    lastName: 'Butt',
    phone: '666-777-8888',
    position: 'Lab Assistant',
    salary: 25000,
    allowances: [
      { name: 'Housing Allowance', amount: 2500 },
      { name: 'Transport Allowance', amount: 800 }
    ],
    dateOfJoining: '2021-09-10',
    attendance: [],
    salaryHistory: [
      {
        id: 'sal-8-001',
        month: 'September 2023',
        baseSalary: 25000,
        allowances: 3300,
        deductions: 0,
        netSalary: 28300,
        status: 'paid',
        paymentDate: '2023-09-30'
      }
    ]
  },
  {
    id: '9',
    firstName: 'Saad',
    lastName: 'Mirza',
    phone: '555-444-3333',
    position: 'Security Guard',
    salary: 20000,
    allowances: [
      { name: 'Housing Allowance', amount: 1500 },
      { name: 'Transport Allowance', amount: 500 }
    ],
    dateOfJoining: '2022-01-15',
    attendance: [],
    salaryHistory: [
      {
        id: 'sal-9-001',
        month: 'September 2023',
        baseSalary: 20000,
        allowances: 2000,
        deductions: 0,
        netSalary: 22000,
        status: 'paid',
        paymentDate: '2023-09-30'
      }
    ]
  },
  {
    id: '10',
    firstName: 'Sana',
    lastName: 'Javed',
    phone: '666-555-4444',
    position: 'Receptionist',
    salary: 22000,
    allowances: [
      { name: 'Housing Allowance', amount: 1500 },
      { name: 'Transport Allowance', amount: 500 }
    ],
    dateOfJoining: '2021-03-10',
    attendance: [],
    salaryHistory: [
      {
        id: 'sal-10-001',
        month: 'September 2023',
        baseSalary: 22000,
        allowances: 2000,
        deductions: 0,
        netSalary: 24000,
        status: 'paid',
        paymentDate: '2023-09-30'
      }
    ]
  },
  {
    id: '11',
    firstName: 'Ali',
    lastName: 'Rizvi',
    phone: '777-666-5555',
    position: 'Maintenance Staff',
    salary: 18000,
    allowances: [
      { name: 'Housing Allowance', amount: 1000 },
      { name: 'Transport Allowance', amount: 300 }
    ],
    dateOfJoining: '2020-05-20',
    attendance: [],
    salaryHistory: [
      {
        id: 'sal-11-001',
        month: 'September 2023',
        baseSalary: 18000,
        allowances: 1300,
        deductions: 0,
        netSalary: 19300,
        status: 'paid',
        paymentDate: '2023-09-30'
      }
    ]
  },
  {
    id: '12',
    firstName: 'Hina',
    lastName: 'Abbasi',
    phone: '888-777-6666',
    position: 'Cleaner',
    salary: 15000,
    allowances: [
      { name: 'Housing Allowance', amount: 800 },
      { name: 'Transport Allowance', amount: 200 }
    ],
    dateOfJoining: '2019-11-08',
    attendance: [],
    salaryHistory: [
      {
        id: 'sal-12-001',
        month: 'September 2023',
        baseSalary: 15000,
        allowances: 1000,
        deductions: 0,
        netSalary: 16000,
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
export const fetchStaff = createAsyncThunk('staff/fetchStaff', async (_, { rejectWithValue }) => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockStaff;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const addStaff = createAsyncThunk('staff/addStaff', async (staffData, { rejectWithValue }) => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    const newStaff = {
      id: Date.now().toString(),
      ...staffData,
    };
    toast.success('Staff member added successfully');
    return newStaff;
  } catch (error) {
    toast.error('Failed to add staff member');
    return rejectWithValue(error.message);
  }
});

export const updateStaff = createAsyncThunk('staff/updateStaff', async (staffData, { rejectWithValue }) => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    toast.success('Staff member updated successfully');
    return staffData;
  } catch (error) {
    toast.error('Failed to update staff member');
    return rejectWithValue(error.message);
  }
});

export const deleteStaff = createAsyncThunk('staff/deleteStaff', async (staffId, { rejectWithValue }) => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    toast.success('Staff member deleted successfully');
    return staffId;
  } catch (error) {
    toast.error('Failed to delete staff member');
    return rejectWithValue(error.message);
  }
});

// New thunk for adding an advance to staff
export const addStaffAdvance = createAsyncThunk('staff/addStaffAdvance', async ({ staffId, advanceAmount, reason }, { rejectWithValue }) => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    toast.success('Advance added successfully');
    return { staffId, advanceAmount, reason };
  } catch (error) {
    toast.error('Failed to add advance');
    return rejectWithValue(error.message);
  }
});

// New thunk for paying staff salary
export const payStaffSalary = createAsyncThunk('staff/payStaffSalary', async ({ staffId, month, paymentMethod }, { rejectWithValue }) => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    toast.success('Salary paid successfully');
    return { staffId, month, paymentMethod };
  } catch (error) {
    toast.error('Failed to pay salary');
    return rejectWithValue(error.message);
  }
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
      })
      .addCase(addStaffAdvance.fulfilled, (state, action) => {
        const { staffId, advanceAmount, reason } = action.payload;
        const staffMember = state.staff.find(staff => staff.id === staffId);
        if (staffMember) {
          // Add advance to salary history
          const newAdvance = {
            id: `advance-${staffId}-${Date.now()}`,
            month: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            baseSalary: 0,
            allowances: 0,
            deductions: parseFloat(advanceAmount),
            netSalary: -parseFloat(advanceAmount),
            status: 'advance',
            paymentDate: new Date().toISOString().split('T')[0],
            reason: reason || 'Advance taken'
          };
          
          if (!staffMember.salaryHistory) {
            staffMember.salaryHistory = [];
          }
          staffMember.salaryHistory.push(newAdvance);
        }
      })
      .addCase(payStaffSalary.fulfilled, (state, action) => {
        const { staffId, month, paymentMethod } = action.payload;
        const staffMember = state.staff.find(staff => staff.id === staffId);
        if (staffMember) {
          // Find existing salary record for this month or create a new one
          let salaryRecord = staffMember.salaryHistory.find(record => 
            record.month === month && record.status !== 'advance');
          
          if (salaryRecord) {
            // Update existing record
            salaryRecord.status = 'paid';
            salaryRecord.paymentDate = new Date().toISOString().split('T')[0];
            salaryRecord.paymentMethod = paymentMethod;
          } else {
            // Create new salary record
            const totalAllowances = (staffMember.allowances || []).reduce((sum, allowance) => sum + parseFloat(allowance.amount || 0), 0);
            const baseSalary = parseFloat(staffMember.salary || 0);
            const netSalary = baseSalary + totalAllowances;
            
            const newSalaryRecord = {
              id: `sal-${staffId}-${Date.now()}`,
              month: month,
              baseSalary: baseSalary,
              allowances: totalAllowances,
              deductions: 0,
              netSalary: netSalary,
              status: 'paid',
              paymentDate: new Date().toISOString().split('T')[0],
              paymentMethod: paymentMethod
            };
            
            if (!staffMember.salaryHistory) {
              staffMember.salaryHistory = [];
            }
            staffMember.salaryHistory.push(newSalaryRecord);
          }
        }
      });
  },
});

export default staffSlice.reducer;
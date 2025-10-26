import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { addStaffAttendanceRecord, getStaffAttendanceByDate } from '../utils/staffAttendanceApi';

// Mock data for staff with enhanced salary management
// Set all staff to have joined last month (September/October 2025) for 1-2 months of work
// All salaries capped at maximum 30,000
const mockStaff = [
  {
    id: '1',
    firstName: 'Ahmed',
    lastName: 'Khan',
    phone: '111-222-3333',
    position: 'Math Teacher',
    salary: 25000,
    allowances: [
      { name: 'Housing Allowance', amount: 3000 },
      { name: 'Transport Allowance', amount: 1000 }
    ],
    dateOfJoining: '2025-09-15', // 1 month ago
    attendance: [],
    salaryHistory: [
      {
        id: 'sal-1-001',
        month: 'September 2023',
        baseSalary: 25000,
        allowances: 4000,
        deductions: 0,
        netSalary: 29000,
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
    salary: 24000,
    allowances: [
      { name: 'Housing Allowance', amount: 3000 },
      { name: 'Transport Allowance', amount: 1000 }
    ],
    dateOfJoining: '2025-08-10', // 2 months ago
    attendance: [],
    salaryHistory: [
      {
        id: 'sal-2-001',
        month: 'September 2023',
        baseSalary: 24000,
        allowances: 4000,
        deductions: 0,
        netSalary: 28000,
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
    salary: 26000,
    allowances: [
      { name: 'Housing Allowance', amount: 2500 },
      { name: 'Transport Allowance', amount: 1000 }
    ],
    dateOfJoining: '2025-09-20', // 1 month ago
    attendance: [],
    salaryHistory: [
      {
        id: 'sal-3-001',
        month: 'September 2023',
        baseSalary: 26000,
        allowances: 3500,
        deductions: 0,
        netSalary: 29500,
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
    salary: 22000,
    allowances: [
      { name: 'Housing Allowance', amount: 2500 },
      { name: 'Transport Allowance', amount: 800 }
    ],
    dateOfJoining: '2025-08-12', // 2 months ago
    attendance: [],
    salaryHistory: [
      {
        id: 'sal-4-001',
        month: 'September 2023',
        baseSalary: 22000,
        allowances: 3300,
        deductions: 0,
        netSalary: 25300,
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
    salary: 20000,
    allowances: [
      { name: 'Housing Allowance', amount: 2000 },
      { name: 'Transport Allowance', amount: 500 }
    ],
    dateOfJoining: '2025-09-05', // 1 month ago
    attendance: [],
    salaryHistory: [
      {
        id: 'sal-5-001',
        month: 'September 2023',
        baseSalary: 20000,
        allowances: 2500,
        deductions: 0,
        netSalary: 22500,
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
    salary: 21000,
    allowances: [
      { name: 'Housing Allowance', amount: 2500 },
      { name: 'Transport Allowance', amount: 600 }
    ],
    dateOfJoining: '2025-08-18', // 2 months ago
    attendance: [],
    salaryHistory: [
      {
        id: 'sal-6-001',
        month: 'September 2023',
        baseSalary: 21000,
        allowances: 3100,
        deductions: 0,
        netSalary: 24100,
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
    salary: 30000,
    allowances: [
      { name: 'Housing Allowance', amount: 3000 },
      { name: 'Transport Allowance', amount: 1000 }
    ],
    dateOfJoining: '2025-09-22', // 1 month ago
    attendance: [],
    salaryHistory: [
      {
        id: 'sal-7-001',
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
    id: '8',
    firstName: 'Mariam',
    lastName: 'Butt',
    phone: '666-777-8888',
    position: 'Lab Assistant',
    salary: 18000,
    allowances: [
      { name: 'Housing Allowance', amount: 1500 },
      { name: 'Transport Allowance', amount: 500 }
    ],
    dateOfJoining: '2025-08-10', // 2 months ago
    attendance: [],
    salaryHistory: [
      {
        id: 'sal-8-001',
        month: 'September 2023',
        baseSalary: 18000,
        allowances: 2000,
        deductions: 0,
        netSalary: 20000,
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
    salary: 15000,
    allowances: [
      { name: 'Housing Allowance', amount: 1000 },
      { name: 'Transport Allowance', amount: 300 }
    ],
    dateOfJoining: '2025-09-15', // 1 month ago
    attendance: [],
    salaryHistory: [
      {
        id: 'sal-9-001',
        month: 'September 2023',
        baseSalary: 15000,
        allowances: 1300,
        deductions: 0,
        netSalary: 16300,
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
    salary: 16000,
    allowances: [
      { name: 'Housing Allowance', amount: 1200 },
      { name: 'Transport Allowance', amount: 300 }
    ],
    dateOfJoining: '2025-08-10', // 2 months ago
    attendance: [],
    salaryHistory: [
      {
        id: 'sal-10-001',
        month: 'September 2023',
        baseSalary: 16000,
        allowances: 1500,
        deductions: 0,
        netSalary: 17500,
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
    salary: 14000,
    allowances: [
      { name: 'Housing Allowance', amount: 800 },
      { name: 'Transport Allowance', amount: 200 }
    ],
    dateOfJoining: '2025-09-20', // 1 month ago
    attendance: [],
    salaryHistory: [
      {
        id: 'sal-11-001',
        month: 'September 2023',
        baseSalary: 14000,
        allowances: 1000,
        deductions: 0,
        netSalary: 15000,
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
    salary: 12000,
    allowances: [
      { name: 'Housing Allowance', amount: 500 },
      { name: 'Transport Allowance', amount: 100 }
    ],
    dateOfJoining: '2025-08-08', // 2 months ago
    attendance: [],
    salaryHistory: [
      {
        id: 'sal-12-001',
        month: 'September 2023',
        baseSalary: 12000,
        allowances: 600,
        deductions: 0,
        netSalary: 12600,
        status: 'paid',
        paymentDate: '2023-09-30'
      }
    ]
  },
];

const initialState = {
  staff: mockStaff,
  attendanceRecords: [], // Add attendance records to state
  loading: false,
  error: null,
};

// Async thunks
export const fetchStaff = createAsyncThunk('staff/fetchStaff', async () => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  return mockStaff;
});

// Fetch staff attendance by date
export const fetchStaffAttendanceByDate = createAsyncThunk('staff/fetchStaffAttendanceByDate', async (date) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  const records = await getStaffAttendanceByDate(date);
  return records;
});

export const addStaff = createAsyncThunk('staff/addStaff', async (newStaff) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    ...newStaff,
    id: `${Date.now()}`, // Use timestamp for unique ID
    salaryHistory: [],
    attendance: []
  };
});

export const updateStaff = createAsyncThunk('staff/updateStaff', async (updatedStaff) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  return updatedStaff;
});

export const deleteStaff = createAsyncThunk('staff/deleteStaff', async (staffId) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  return staffId;
});

export const addStaffAdvance = createAsyncThunk('staff/addStaffAdvance', async ({ staffId, advanceAmount, reason }) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  return { staffId, advanceAmount, reason };
});

export const payStaffSalary = createAsyncThunk('staff/payStaffSalary', async ({ staffId, month, paymentMethod }) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  return { staffId, month, paymentMethod };
});

export const addStaffAttendance = createAsyncThunk('staff/addStaffAttendance', async ({ date, records }) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  // Also save to the mock API
  await addStaffAttendanceRecord({ date, records });
  return { date, records };
});

const staffSlice = createSlice({
  name: 'staff',
  initialState,
  reducers: {
    // Add any synchronous reducers here if needed
  },
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
      .addCase(fetchStaffAttendanceByDate.fulfilled, (state, action) => {
        state.attendanceRecords = action.payload;
      })
      .addCase(addStaff.fulfilled, (state, action) => {
        // Add new staff at the beginning of the array so they appear first
        state.staff.unshift(action.payload);
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
      })
      .addCase(addStaffAttendance.fulfilled, (state, action) => {
        const { date, records } = action.payload;
        
        // Update attendance for each staff member
        records.forEach(record => {
          const staffMember = state.staff.find(staff => staff.id === record.staffId);
          if (staffMember) {
            // Check if attendance record for this date already exists
            const existingIndex = staffMember.attendance.findIndex(att => att.date === date);
            
            if (existingIndex !== -1) {
              // Update existing attendance record
              staffMember.attendance[existingIndex] = {
                ...staffMember.attendance[existingIndex],
                status: record.status
              };
            } else {
              // Add new attendance record
              staffMember.attendance.push({
                date,
                status: record.status
              });
            }
          }
        });
        
        // Also update the attendanceRecords in state
        const existingRecordIndex = state.attendanceRecords.findIndex(record => record.date === date);
        if (existingRecordIndex !== -1) {
          state.attendanceRecords[existingRecordIndex] = { date, records };
        } else {
          state.attendanceRecords.push({ date, records });
        }
      });
  },
});

export default staffSlice.reducer;
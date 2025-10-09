import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Mock data for students with enhanced fees structure and family relationships
const mockStudents = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '123-456-7890',
    dateOfBirth: '2005-05-15',
    admissionDate: '2023-09-01',
    class: 'Class 10',
    section: 'A',
    monthlyFees: 4000,
    admissionFees: 5000,
    feesPaid: 8000,
    totalFees: 9000,
    familyId: 'family-1', // Family identifier for tracing family relationships
    relationship: 'brother',
    parentId: null,
    feesHistory: [
      { 
        id: 'challan-1-0',
        month: 'Admission Fees',
        amount: 5000,
        paid: true,
        date: '2023-09-01',
        dueDate: '2023-09-01',
        status: 'paid',
        type: 'admission'
      },
      { 
        id: 'challan-1-1', 
        month: 'September 2023', 
        amount: 4000, 
        paid: true, 
        date: '2023-09-15',
        dueDate: '2023-09-10',
        status: 'paid',
        type: 'monthly'
      },
      { 
        id: 'challan-1-2', 
        month: 'October 2023', 
        amount: 4000, 
        paid: false, 
        date: null,
        dueDate: '2023-10-10',
        status: 'pending',
        type: 'monthly'
      },
    ]
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@example.com',
    phone: '098-765-4321',
    dateOfBirth: '2006-08-22',
    admissionDate: '2023-09-01',
    class: 'Class 9',
    section: 'B',
    monthlyFees: 3500,
    admissionFees: 5000,
    feesPaid: 8500,
    totalFees: 8500,
    familyId: 'family-1', // Same family as John Doe
    relationship: 'sister',
    parentId: '1', // Sister of John Doe
    feesHistory: [
      { 
        id: 'challan-2-0',
        month: 'Admission Fees',
        amount: 5000,
        paid: true,
        date: '2023-09-01',
        dueDate: '2023-09-01',
        status: 'paid',
        type: 'admission'
      },
      { 
        id: 'challan-2-1', 
        month: 'September 2023', 
        amount: 3500, 
        paid: true, 
        date: '2023-09-20',
        dueDate: '2023-09-10',
        status: 'paid',
        type: 'monthly'
      },
    ]
  },
  {
    id: '12',
    firstName: 'James',
    lastName: 'Bond',
    email: 'jane.doe@example.com',
    phone: '098-765-4321',
    dateOfBirth: '2006-08-22',
    admissionDate: '2023-09-01',
    class: 'Class 9',
    section: 'B',
    monthlyFees: 3500,
    admissionFees: 5000,
    feesPaid: 8500,
    totalFees: 8500,
    familyId: 'family-1', // Same family as John Doe
    relationship: 'sister',
    parentId: '1', // Sister of John Doe
    feesHistory: [
      { 
        id: 'challan-2-0',
        month: 'Admission Fees',
        amount: 5000,
        paid: true,
        date: '2023-09-01',
        dueDate: '2023-09-01',
        status: 'paid',
        type: 'admission'
      },
      { 
        id: 'challan-2-1', 
        month: 'September 2023', 
        amount: 3500, 
        paid: true, 
        date: '2023-09-20',
        dueDate: '2023-09-10',
        status: 'paid',
        type: 'monthly'
      },
    ]
  },
  {
    id: '3',
    firstName: 'Michael',
    lastName: 'Johnson',
    email: 'michael.johnson@example.com',
    phone: '555-123-4567',
    dateOfBirth: '2007-03-10',
    admissionDate: '2023-09-15',
    class: 'Class 8',
    section: 'A',
    monthlyFees: 3000,
    admissionFees: 4500,
    feesPaid: 4500,
    totalFees: 7500,
    familyId: 'family-2',
    relationship: 'brother',
    parentId: null,
    feesHistory: [
      { 
        id: 'challan-3-0',
        month: 'Admission Fees',
        amount: 4500,
        paid: true,
        date: '2023-09-15',
        dueDate: '2023-09-15',
        status: 'paid',
        type: 'admission'
      },
      { 
        id: 'challan-3-1', 
        month: 'September 2023', 
        amount: 3000, 
        paid: false, 
        date: null,
        dueDate: '2023-10-10',
        status: 'pending',
        type: 'monthly'
      },
    ]
  },
  {
    id: '4',
    firstName: 'Emily',
    lastName: 'Williams',
    email: 'emily.williams@example.com',
    phone: '444-987-6543',
    dateOfBirth: '2005-12-05',
    admissionDate: '2023-09-20',
    class: 'Class 10',
    section: 'B',
    monthlyFees: 4000,
    admissionFees: 5000,
    feesPaid: 5000,
    totalFees: 9000,
    familyId: 'family-3',
    relationship: 'cousin',
    parentId: null,
    feesHistory: [
      { 
        id: 'challan-4-0',
        month: 'Admission Fees',
        amount: 5000,
        paid: true,
        date: '2023-09-20',
        dueDate: '2023-09-20',
        status: 'paid',
        type: 'admission'
      },
      { 
        id: 'challan-4-1', 
        month: 'September 2023', 
        amount: 4000, 
        paid: false, 
        date: null,
        dueDate: '2023-10-10',
        status: 'pending',
        type: 'monthly'
      },
      { 
        id: 'challan-4-2', 
        month: 'October 2023', 
        amount: 4000, 
        paid: false, 
        date: null,
        dueDate: '2023-11-10',
        status: 'pending',
        type: 'monthly'
      },
    ]
  },
  {
    id: '5',
    firstName: 'David',
    lastName: 'Brown',
    email: 'david.brown@example.com',
    phone: '333-456-7890',
    dateOfBirth: '2006-07-18',
    admissionDate: '2023-10-01',
    class: 'Class 9',
    section: 'A',
    monthlyFees: 3500,
    admissionFees: 5000,
    feesPaid: 0,
    totalFees: 8500,
    familyId: 'family-4',
    relationship: 'brother',
    parentId: null,
    feesHistory: [
      { 
        id: 'challan-5-0',
        month: 'Admission Fees',
        amount: 5000,
        paid: false,
        date: null,
        dueDate: '2023-10-01',
        status: 'pending',
        type: 'admission'
      },
      { 
        id: 'challan-5-1', 
        month: 'October 2023', 
        amount: 3500, 
        paid: false, 
        date: null,
        dueDate: '2023-11-10',
        status: 'pending',
        type: 'monthly'
      },
    ]
  },
  {
    id: '6',
    firstName: 'Sarah',
    lastName: 'Davis',
    email: 'sarah.davis@example.com',
    phone: '222-345-6789',
    dateOfBirth: '2007-01-25',
    admissionDate: '2023-10-05',
    class: 'Class 8',
    section: 'B',
    monthlyFees: 3000,
    admissionFees: 4500,
    feesPaid: 7500,
    totalFees: 7500,
    familyId: 'family-5',
    relationship: 'sister',
    parentId: null,
    feesHistory: [
      { 
        id: 'challan-6-0',
        month: 'Admission Fees',
        amount: 4500,
        paid: true,
        date: '2023-10-05',
        dueDate: '2023-10-05',
        status: 'paid',
        type: 'admission'
      },
      { 
        id: 'challan-6-1', 
        month: 'October 2023', 
        amount: 3000, 
        paid: true, 
        date: '2023-10-15',
        dueDate: '2023-11-10',
        status: 'paid',
        type: 'monthly'
      },
    ]
  },
];

const initialState = {
  students: mockStudents,
  loading: false,
  error: null,
};

// Async thunks for mock API calls
export const fetchStudents = createAsyncThunk('students/fetchStudents', async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockStudents;
});

export const addStudent = createAsyncThunk('students/addStudent', async (studentData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Create fees history with admission fees
  const feesHistory = [];
  
  // Add admission fees record if admission fees are specified
  if (studentData.admissionFees && parseFloat(studentData.admissionFees) > 0) {
    feesHistory.push({
      id: `challan-${Date.now()}-0`,
      month: 'Admission Fees',
      amount: parseFloat(studentData.admissionFees),
      paid: studentData.feesPaid && parseFloat(studentData.feesPaid) >= parseFloat(studentData.admissionFees),
      date: studentData.admissionDate || new Date().toISOString().split('T')[0],
      dueDate: studentData.admissionDate || new Date().toISOString().split('T')[0],
      status: studentData.feesPaid && parseFloat(studentData.feesPaid) >= parseFloat(studentData.admissionFees) ? 'paid' : 'pending',
      type: 'admission'
    });
  }
  
  // Generate a family ID if not provided (for new families)
  const familyId = studentData.familyId || `family-${Date.now()}`;
  
  const newStudent = {
    id: Date.now().toString(),
    ...studentData,
    familyId,
    feesHistory,
  };
  
  return newStudent;
});

export const updateStudent = createAsyncThunk('students/updateStudent', async (studentData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return studentData;
});

export const deleteStudent = createAsyncThunk('students/deleteStudent', async (studentId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return studentId;
});

// New thunk for paying fees
export const payFees = createAsyncThunk('students/payFees', async ({ studentId, amount, month, paymentMethod, paymentDate }) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return { studentId, amount, month, paymentMethod, paymentDate };
});

// New thunk for generating challans
export const generateChallan = createAsyncThunk('students/generateChallan', async (challanData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return challanData;
});

// New thunk for bulk generating challans
export const bulkGenerateChallans = createAsyncThunk('students/bulkGenerateChallans', async ({ studentIds, challanTemplate }) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { studentIds, challanTemplate };
});

// New thunk for bulk updating challan statuses
export const bulkUpdateChallanStatuses = createAsyncThunk('students/bulkUpdateChallanStatuses', async ({ challanUpdates }) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { challanUpdates };
});

const studentsSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.students = action.payload;
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addStudent.fulfilled, (state, action) => {
        state.students.push(action.payload);
      })
      .addCase(updateStudent.fulfilled, (state, action) => {
        const index = state.students.findIndex(student => student.id === action.payload.id);
        if (index !== -1) {
          state.students[index] = action.payload;
        }
      })
      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.students = state.students.filter(student => student.id !== action.payload);
      })
      .addCase(payFees.fulfilled, (state, action) => {
        const { studentId, amount, month, paymentMethod, paymentDate } = action.payload;
        const student = state.students.find(s => s.id === studentId);
        if (student) {
          student.feesPaid = (parseFloat(student.feesPaid) || 0) + parseFloat(amount || 0);
          // First try to find by ID (for specific challan updates)
          let feeRecord = student.feesHistory.find(f => f.id === month);
          // If not found, try to find by month (for backward compatibility)
          if (!feeRecord) {
            feeRecord = student.feesHistory.find(f => f.month === month);
          }
          if (feeRecord) {
            feeRecord.paid = true;
            feeRecord.status = 'paid';
            feeRecord.date = paymentDate || new Date().toISOString().split('T')[0];
            feeRecord.paymentMethod = paymentMethod || 'cash'; // Default to cash if not provided
          }
        }
      })
      .addCase(generateChallan.fulfilled, (state, action) => {
        const { studentId, month, amount, dueDate, description } = action.payload;
        const student = state.students.find(s => s.id === studentId);
        if (student) {
          // Convert month format from YYYY-MM to Month YYYY
          const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];
          const [year, monthIndex] = (month || '2023-01').split('-');
          const monthName = monthNames[parseInt(monthIndex) - 1] || 'Unknown';
          const formattedMonth = `${monthName} ${year}`;
          
          const newChallan = {
            id: `challan-${studentId}-${Date.now()}`,
            month: formattedMonth,
            amount: amount || student.monthlyFees || 0,
            dueDate: dueDate || new Date().toISOString().split('T')[0],
            description: description || '',
            paid: false,
            date: null,
            status: 'pending',
            type: 'monthly'
          };
          if (!student.feesHistory) {
            student.feesHistory = [];
          }
          student.feesHistory.push(newChallan);
        }
      })
      .addCase(bulkGenerateChallans.fulfilled, (state, action) => {
        const { studentIds, challanTemplate } = action.payload;
        const { month, amount, dueDate, description } = challanTemplate || {};
        
        // Convert month format from YYYY-MM to Month YYYY
        const monthNames = ["January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"];
        
        // Default to current month if not provided
        const monthToUse = month || new Date().toISOString().slice(0, 7);
        const [year, monthIndex] = monthToUse.split('-');
        const monthName = monthNames[parseInt(monthIndex) - 1] || 'Unknown';
        const formattedMonth = `${monthName} ${year}`;
        
        // Generate challans for each student
        studentIds.forEach(studentId => {
          const student = state.students.find(s => s.id === studentId);
          if (student) {
            const newChallan = {
              id: `challan-${studentId}-${Date.now()}`,
              month: formattedMonth,
              amount: student.monthlyFees || amount || 0,
              dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default to 7 days from now
              description: description || '',
              paid: false,
              date: null,
              status: 'pending',
              type: 'monthly'
            };
            if (!student.feesHistory) {
              student.feesHistory = [];
            }
            student.feesHistory.push(newChallan);
          }
        });
      })
      .addCase(bulkUpdateChallanStatuses.fulfilled, (state, action) => {
        const { challanUpdates } = action.payload;
        
        // Update each challan status
        challanUpdates.forEach(update => {
          const { studentId, challanId, paymentMethod, paymentDate } = update || {};
          if (!studentId || !challanId) return; // Skip if required data is missing
          
          const student = state.students.find(s => s.id === studentId);
          if (student) {
            const feeRecord = student.feesHistory.find(f => f.id === challanId);
            if (feeRecord) {
              feeRecord.paid = true;
              feeRecord.status = 'paid';
              feeRecord.date = paymentDate || new Date().toISOString().split('T')[0];
              feeRecord.paymentMethod = paymentMethod || 'cash'; // Default to cash if not provided
              
              // Update total fees paid
              student.feesPaid = (parseFloat(student.feesPaid) || 0) + parseFloat(feeRecord.amount || 0);
            }
          }
        });
      });
  },
});

export default studentsSlice.reducer;
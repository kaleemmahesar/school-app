import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { createAsyncThunkWithToast, createAddThunk, createUpdateThunk, createDeleteThunk } from '../utils/asyncThunkUtils';

/**
 * Mock data for students with enhanced fees structure and family relationships
 */
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
        dueDate: '2023-10-10',
        status: 'paid',
        type: 'monthly'
      },
      { 
        id: 'challan-1-2', 
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
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phone: '098-765-4321',
    dateOfBirth: '2006-08-22',
    admissionDate: '2023-09-05',
    class: 'Class 9',
    section: 'B',
    monthlyFees: 3500,
    admissionFees: 4500,
    feesPaid: 4500,
    totalFees: 8000,
    familyId: 'family-1',
    relationship: 'sister',
    parentId: '1',
    feesHistory: [
      { 
        id: 'challan-2-0',
        month: 'Admission Fees',
        amount: 4500,
        paid: true,
        date: '2023-09-05',
        dueDate: '2023-09-05',
        status: 'paid',
        type: 'admission'
      },
      { 
        id: 'challan-2-1', 
        month: 'September 2023', 
        amount: 3500, 
        paid: false, 
        date: null,
        dueDate: '2023-10-10',
        status: 'pending',
        type: 'monthly'
      },
      { 
        id: 'challan-2-2', 
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
    id: '3',
    firstName: 'Robert',
    lastName: 'Johnson',
    email: 'robert.johnson@example.com',
    phone: '555-123-4567',
    dateOfBirth: '2007-03-10',
    admissionDate: '2023-08-20',
    class: 'Class 8',
    section: 'A',
    monthlyFees: 3000,
    admissionFees: 4000,
    feesPaid: 7000,
    totalFees: 7000,
    familyId: 'family-2',
    relationship: 'self',
    parentId: null,
    feesHistory: [
      { 
        id: 'challan-3-0',
        month: 'Admission Fees',
        amount: 4000,
        paid: true,
        date: '2023-08-20',
        dueDate: '2023-08-20',
        status: 'paid',
        type: 'admission'
      },
      { 
        id: 'challan-3-1', 
        month: 'August 2023', 
        amount: 3000, 
        paid: true, 
        date: '2023-08-25',
        dueDate: '2023-09-10',
        status: 'paid',
        type: 'monthly'
      },
      { 
        id: 'challan-3-2', 
        month: 'September 2023', 
        amount: 3000, 
        paid: true, 
        date: '2023-09-12',
        dueDate: '2023-10-10',
        status: 'paid',
        type: 'monthly'
      },
      { 
        id: 'challan-3-3', 
        month: 'October 2023', 
        amount: 3000, 
        paid: false, 
        date: null,
        dueDate: '2023-11-10',
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
    admissionDate: '2023-09-10',
    class: 'Class 10',
    section: 'B',
    monthlyFees: 4000,
    admissionFees: 5000,
    feesPaid: 5000,
    totalFees: 9000,
    familyId: 'family-3',
    relationship: 'self',
    parentId: null,
    feesHistory: [
      { 
        id: 'challan-4-0',
        month: 'Admission Fees',
        amount: 5000,
        paid: true,
        date: '2023-09-10',
        dueDate: '2023-09-10',
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
    firstName: 'Michael',
    lastName: 'Brown',
    email: 'michael.brown@example.com',
    phone: '333-555-7777',
    dateOfBirth: '2006-07-18',
    admissionDate: '2023-08-15',
    class: 'Class 9',
    section: 'A',
    monthlyFees: 3500,
    admissionFees: 4500,
    feesPaid: 8000,
    totalFees: 8000,
    familyId: 'family-4',
    relationship: 'self',
    parentId: null,
    feesHistory: [
      { 
        id: 'challan-5-0',
        month: 'Admission Fees',
        amount: 4500,
        paid: true,
        date: '2023-08-15',
        dueDate: '2023-08-15',
        status: 'paid',
        type: 'admission'
      },
      { 
        id: 'challan-5-1', 
        month: 'August 2023', 
        amount: 3500, 
        paid: true, 
        date: '2023-08-20',
        dueDate: '2023-09-10',
        status: 'paid',
        type: 'monthly'
      },
      { 
        id: 'challan-5-2', 
        month: 'September 2023', 
        amount: 3500, 
        paid: true, 
        date: '2023-09-18',
        dueDate: '2023-10-10',
        status: 'paid',
        type: 'monthly'
      },
      { 
        id: 'challan-5-3', 
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
  {
    id: '7',
    firstName: 'David',
    lastName: 'Miller',
    email: 'david.miller@example.com',
    phone: '111-222-3333',
    dateOfBirth: '2005-04-30',
    admissionDate: '2023-08-01',
    class: 'Class 10',
    section: 'A',
    monthlyFees: 4000,
    admissionFees: 5000,
    feesPaid: 9000,
    totalFees: 9000,
    familyId: 'family-6',
    relationship: 'self',
    parentId: null,
    feesHistory: [
      { 
        id: 'challan-7-0',
        month: 'Admission Fees',
        amount: 5000,
        paid: true,
        date: '2023-08-01',
        dueDate: '2023-08-01',
        status: 'paid',
        type: 'admission'
      },
      { 
        id: 'challan-7-1', 
        month: 'August 2023', 
        amount: 4000, 
        paid: true, 
        date: '2023-08-08',
        dueDate: '2023-09-10',
        status: 'paid',
        type: 'monthly'
      },
      { 
        id: 'challan-7-2', 
        month: 'September 2023', 
        amount: 4000, 
        paid: true, 
        date: '2023-09-12',
        dueDate: '2023-10-10',
        status: 'paid',
        type: 'monthly'
      },
      { 
        id: 'challan-7-3', 
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
    id: '8',
    firstName: 'Lisa',
    lastName: 'Wilson',
    email: 'lisa.wilson@example.com',
    phone: '666-777-8888',
    dateOfBirth: '2006-11-12',
    admissionDate: '2023-09-20',
    class: 'Class 9',
    section: 'B',
    monthlyFees: 3500,
    admissionFees: 4500,
    feesPaid: 4500,
    totalFees: 8000,
    familyId: 'family-7',
    relationship: 'self',
    parentId: null,
    feesHistory: [
      { 
        id: 'challan-8-0',
        month: 'Admission Fees',
        amount: 4500,
        paid: true,
        date: '2023-09-20',
        dueDate: '2023-09-20',
        status: 'paid',
        type: 'admission'
      },
      { 
        id: 'challan-8-1', 
        month: 'September 2023', 
        amount: 3500, 
        paid: false, 
        date: null,
        dueDate: '2023-10-10',
        status: 'pending',
        type: 'monthly'
      },
      { 
        id: 'challan-8-2', 
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
];

/**
 * Initial state for the students slice
 */
const initialState = {
  students: mockStudents,
  loading: false,
  error: null,
};

/**
 * Async thunk to fetch students from the server
 * @returns {Promise<Array>} Promise that resolves to an array of students
 */
export const fetchStudents = createAsyncThunkWithToast(
  'students/fetchStudents',
  async () => {
    return mockStudents;
  },
  {
    delay: 500
  }
);

/**
 * Async thunk to add a new student
 * @param {Object} studentData - The student data to add
 * @returns {Promise<Object>} Promise that resolves to the new student object
 */
export const addStudent = createAddThunk(
  'students/addStudent',
  async (studentData) => {
    // Calculate totalFees if not provided
    let totalFees = parseFloat(studentData.totalFees) || 0;
    const monthlyFees = parseFloat(studentData.monthlyFees) || 0;
    const admissionFees = parseFloat(studentData.admissionFees) || 0;
    const feesPaid = parseFloat(studentData.feesPaid) || 0;
    
    // If totalFees is not provided or is 0, calculate it from monthly and admission fees
    if (totalFees <= 0) {
      totalFees = monthlyFees + admissionFees;
    }
    
    // Create fees history with admission fees
    const feesHistory = [];
    
    // Add admission fees record if admission fees are specified
    if (admissionFees > 0) {
      feesHistory.push({
        id: `challan-${Date.now()}-0`,
        month: 'Admission Fees',
        amount: admissionFees,
        paid: feesPaid >= admissionFees,
        date: studentData.dateOfAdmission || new Date().toISOString().split('T')[0],
        dueDate: studentData.dateOfAdmission || new Date().toISOString().split('T')[0],
        status: feesPaid >= admissionFees ? 'paid' : 'pending',
        type: 'admission'
      });
    }
    
    // Generate a family ID if not provided (for new families)
    const familyId = studentData.familyId || `family-${Date.now()}`;
    
    const newStudent = {
      id: Date.now().toString(),
      ...studentData,
      monthlyFees,
      admissionFees,
      feesPaid,
      totalFees,
      familyId,
      feesHistory,
    };
    
    console.log('New student object:', newStudent);
    return newStudent;
  },
  {
    successMessage: 'Student added successfully',
    errorMessage: 'Failed to add student',
    delay: 500
  }
);

/**
 * Async thunk to update an existing student
 * @param {Object} studentData - The updated student data
 * @returns {Promise<Object>} Promise that resolves to the updated student object
 */
export const updateStudent = createUpdateThunk(
  'students/updateStudent',
  async (studentData) => {
    return studentData;
  },
  {
    successMessage: 'Student updated successfully',
    errorMessage: 'Failed to update student',
    delay: 500
  }
);

/**
 * Async thunk to delete a student
 * @param {string} studentId - The ID of the student to delete
 * @returns {Promise<string>} Promise that resolves to the deleted student ID
 */
export const deleteStudent = createDeleteThunk(
  'students/deleteStudent',
  async (studentId) => {
    return studentId;
  },
  {
    successMessage: 'Student deleted successfully',
    errorMessage: 'Failed to delete student',
    delay: 500
  }
);

/**
 * Async thunk to pay student fees
 * @param {Object} paymentData - The payment data
 * @param {string} paymentData.studentId - The student ID
 * @param {number} paymentData.amount - The amount paid
 * @param {string} paymentData.month - The month for which fees are paid
 * @param {string} paymentData.paymentMethod - The payment method
 * @param {string} paymentData.paymentDate - The payment date
 * @returns {Promise<Object>} Promise that resolves to the payment data
 */
export const payFees = createAsyncThunkWithToast(
  'students/payFees',
  async ({ studentId, amount, month, paymentMethod, paymentDate }) => {
    return { studentId, amount, month, paymentMethod, paymentDate };
  },
  {
    successMessage: 'Fees paid successfully',
    errorMessage: 'Failed to pay fees',
    delay: 500
  }
);

/**
 * Async thunk to generate a challan for a student
 * @param {Object} challanData - The challan data
 * @returns {Promise<Object>} Promise that resolves to the challan data
 */
export const generateChallan = createAsyncThunkWithToast(
  'students/generateChallan',
  async (challanData) => {
    return challanData;
  },
  {
    successMessage: 'Challan generated successfully',
    errorMessage: 'Failed to generate challan',
    delay: 500
  }
);

/**
 * Async thunk to bulk generate challans for multiple students
 * @param {Object} bulkData - The bulk challan data
 * @param {Array<string>} bulkData.studentIds - Array of student IDs
 * @param {Object} bulkData.challanTemplate - The challan template
 * @returns {Promise<Object>} Promise that resolves to the bulk challan data
 */
export const bulkGenerateChallans = createAsyncThunkWithToast(
  'students/bulkGenerateChallans',
  async ({ studentIds, challanTemplate }) => {
    return { studentIds, challanTemplate };
  },
  {
    successMessage: 'Challans generated successfully',
    errorMessage: 'Failed to generate challans',
    delay: 1000
  }
);

/**
 * Async thunk to bulk update challan statuses
 * @param {Object} updateData - The update data
 * @param {Array<Object>} updateData.challanUpdates - Array of challan updates
 * @returns {Promise<Object>} Promise that resolves to the update data
 */
export const bulkUpdateChallanStatuses = createAsyncThunkWithToast(
  'students/bulkUpdateChallanStatuses',
  async ({ challanUpdates }) => {
    return { challanUpdates };
  },
  {
    successMessage: 'Challan statuses updated successfully',
    errorMessage: 'Failed to update challan statuses',
    delay: 1000
  }
);

/**
 * Redux slice for managing students state
 */
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
        console.log('Adding student to state:', action.payload);
        state.students.push(action.payload);
        console.log('Students array after adding:', state.students);
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
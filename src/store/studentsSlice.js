import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { createAsyncThunkWithToast, createAddThunk, createUpdateThunk, createDeleteThunk } from '../utils/asyncThunkUtils';
import { API_BASE_URL } from '../utils/apiConfig';

/**
 * Initial state for the students slice
 */
const initialState = {
  students: [],
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
    const response = await fetch(`${API_BASE_URL}/students`);
    if (!response.ok) {
      throw new Error('Failed to fetch students');
    }
    return await response.json();
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
    let feesPaid = parseFloat(studentData.feesPaid) || 0;
    
    // If totalFees is not provided or is 0, calculate it from monthly and admission fees
    if (totalFees <= 0) {
      totalFees = monthlyFees + admissionFees;
    }
    
    // Add admission fees to feesPaid since they are paid at admission
    feesPaid += admissionFees;
    
    // Create fees history with admission fees
    const feesHistory = [];
    
    // Add admission fees record if admission fees are specified
    if (admissionFees > 0) {
      feesHistory.push({
        id: `challan-${Date.now()}-0`,
        month: 'Admission Fees',
        amount: admissionFees,
        paid: true,
        date: studentData.dateOfAdmission || new Date().toISOString().split('T')[0],
        dueDate: studentData.dateOfAdmission || new Date().toISOString().split('T')[0],
        status: 'paid',
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
      status: 'studying'
    };
    
    // Send the new student to the API
    const response = await fetch(`${API_BASE_URL}/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newStudent),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add student');
    }
    
    return await response.json();
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
    const response = await fetch(`${API_BASE_URL}/students/${studentData.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(studentData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update student');
    }
    
    return await response.json();
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
    const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete student');
    }
    
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
  async ({ challanId, paymentMethod, paymentDate }) => {
    return { challanId, paymentMethod, paymentDate };
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
 * Async thunk to mark a student as left
 * @param {Object} studentData - The student data with leaving information
 * @returns {Promise<Object>} Promise that resolves to the updated student object
 */
export const markStudentAsLeft = createAsyncThunkWithToast(
  'students/markStudentAsLeft',
  async (studentData) => {
    return studentData;
  },
  {
    successMessage: 'Student marked as left successfully',
    errorMessage: 'Failed to mark student as left',
    delay: 500
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
        const { challanId, paymentMethod, paymentDate } = action.payload;
        // Find the student who has this challan
        const student = state.students.find(s => 
          s.feesHistory && s.feesHistory.some(f => f.id === challanId)
        );
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
      })
      .addCase(generateChallan.fulfilled, (state, action) => {
        const { studentId, month, amount, dueDate, description } = action.payload;
        const student = state.students.find(s => s.id === studentId);
        if (student) {
          // Convert month format from YYYY-MM to Month YYYY
          const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];
          const [year, monthIndex] = (month || '2025-01').split('-');
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
        const { month, dueDate, description } = challanTemplate || {};
        
        // Convert month format from YYYY-MM to Month YYYY
        const monthNames = ["January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"];
        
        // Default to current month if not provided
        const monthToUse = month || new Date().toISOString().slice(0, 7);
        const [year, monthIndex] = monthToUse.split('-');
        const monthName = monthNames[parseInt(monthIndex) - 1] || 'Unknown';
        const formattedMonth = `${monthName} ${year}`;
        
        // Array to store generated challans for return
        const generatedChallans = [];
        
        // Generate challans for each student
        studentIds.forEach(studentId => {
          const student = state.students.find(s => s.id === studentId);
          if (student) {
            const newChallan = {
              id: `challan-${studentId}-${Date.now()}`,
              month: formattedMonth,
              amount: student.monthlyFees || 0,
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
            
            // Add to generated challans array
            generatedChallans.push({
              ...newChallan,
              studentId: student.id
            });
          }
        });
        
        // Add generated challans to the action payload for use in components
        action.payload.generatedChallans = generatedChallans;
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
      })
      .addCase(markStudentAsLeft.fulfilled, (state, action) => {
        const index = state.students.findIndex(student => student.id === action.payload.id);
        if (index !== -1) {
          state.students[index] = action.payload;
        }
      });
  },
});

export default studentsSlice.reducer;
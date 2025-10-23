import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { createAsyncThunkWithToast } from '../utils/asyncThunkUtils';
import { API_BASE_URL } from '../utils/apiConfig';

// Mock data for student marks
const mockMarks = [
  {
    id: '1',
    studentId: '1',
    studentName: 'John Doe',
    class: 'Class 10',
    section: 'A',
    examType: 'Midterm',
    year: '2025',
    marks: [
      { subjectId: '10math', subjectName: 'Mathematics', marksObtained: 85, totalMarks: 100, grade: 'A' },
      { subjectId: '10eng', subjectName: 'English', marksObtained: 78, totalMarks: 100, grade: 'B+' },
      { subjectId: '10sci', subjectName: 'Science', marksObtained: 92, totalMarks: 100, grade: 'A+' },
      { subjectId: '10hist', subjectName: 'History', marksObtained: 88, totalMarks: 100, grade: 'A' }
    ],
    totalObtained: 343,
    totalMarks: 400,
    percentage: 85.75,
    overallGrade: 'A'
  },
  {
    id: '2',
    studentId: '2',
    studentName: 'Jane Smith',
    class: 'Class 9',
    section: 'B',
    examType: 'Midterm',
    year: '2025',
    marks: [
      { subjectId: '9math', subjectName: 'Mathematics', marksObtained: 76, totalMarks: 100, grade: 'B+' },
      { subjectId: '9eng', subjectName: 'English', marksObtained: 82, totalMarks: 100, grade: 'A-' },
      { subjectId: '9sci', subjectName: 'Science', marksObtained: 89, totalMarks: 100, grade: 'A' },
      { subjectId: '9geo', subjectName: 'Geography', marksObtained: 77, totalMarks: 100, grade: 'B+' }
    ],
    totalObtained: 324,
    totalMarks: 400,
    percentage: 81.0,
    overallGrade: 'B+'
  },
  {
    id: '3',
    studentId: '21',
    studentName: 'Sara Ali',
    class: 'Class 10',
    section: 'A',
    examType: 'Midterm',
    year: '2025',
    marks: [
      { subjectId: '10math', subjectName: 'Mathematics', marksObtained: 88, totalMarks: 100, grade: 'A' },
      { subjectId: '10eng', subjectName: 'English', marksObtained: 82, totalMarks: 100, grade: 'A-' },
      { subjectId: '10sci', subjectName: 'Science', marksObtained: 90, totalMarks: 100, grade: 'A+' },
      { subjectId: '10hist', subjectName: 'History', marksObtained: 85, totalMarks: 100, grade: 'A' }
    ],
    totalObtained: 345,
    totalMarks: 400,
    percentage: 86.25,
    overallGrade: 'A'
  },
  {
    id: '4',
    studentId: '22',
    studentName: 'Hamza Rizvi',
    class: 'Class 9',
    section: 'B',
    examType: 'Midterm',
    year: '2025',
    marks: [
      { subjectId: '9math', subjectName: 'Mathematics', marksObtained: 78, totalMarks: 100, grade: 'B+' },
      { subjectId: '9eng', subjectName: 'English', marksObtained: 84, totalMarks: 100, grade: 'A-' },
      { subjectId: '9sci', subjectName: 'Science', marksObtained: 87, totalMarks: 100, grade: 'A' },
      { subjectId: '9geo', subjectName: 'Geography', marksObtained: 80, totalMarks: 100, grade: 'B+' }
    ],
    totalObtained: 329,
    totalMarks: 400,
    percentage: 82.25,
    overallGrade: 'B+'
  },
  {
    id: '5',
    studentId: '23',
    studentName: 'Zara Khan',
    class: 'Class 8',
    section: 'A',
    examType: 'Midterm',
    year: '2025',
    marks: [
      { subjectId: '8math', subjectName: 'Mathematics', marksObtained: 85, totalMarks: 100, grade: 'A' },
      { subjectId: '8eng', subjectName: 'English', marksObtained: 79, totalMarks: 100, grade: 'B+' },
      { subjectId: '8sci', subjectName: 'Science', marksObtained: 88, totalMarks: 100, grade: 'A' },
      { subjectId: '8hist', subjectName: 'History', marksObtained: 83, totalMarks: 100, grade: 'B+' }
    ],
    totalObtained: 335,
    totalMarks: 400,
    percentage: 83.75,
    overallGrade: 'B+'
  }
];

const initialState = {
  marks: mockMarks,
  loading: false,
  error: null,
};

// Async thunks for mock API calls
export const fetchMarks = createAsyncThunk('marks/fetchMarks', async (_, { rejectWithValue }) => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockMarks;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const addMarks = createAsyncThunk('marks/addMarks', async (marksData, { rejectWithValue }) => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    const newMarks = {
      id: Date.now().toString(),
      ...marksData,
    };
    toast.success('Marksheet added successfully');
    return newMarks;
  } catch (error) {
    toast.error('Failed to add marksheet');
    return rejectWithValue(error.message);
  }
});

export const updateMarks = createAsyncThunk('marks/updateMarks', async (marksData, { rejectWithValue }) => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    toast.success('Marksheet updated successfully');
    return marksData;
  } catch (error) {
    toast.error('Failed to update marksheet');
    return rejectWithValue(error.message);
  }
});

export const deleteMarks = createAsyncThunk('marks/deleteMarks', async (marksId, { rejectWithValue }) => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    toast.success('Marksheet deleted successfully');
    return marksId;
  } catch (error) {
    toast.error('Failed to delete marksheet');
    return rejectWithValue(error.message);
  }
});

const marksSlice = createSlice({
  name: 'marks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMarks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMarks.fulfilled, (state, action) => {
        state.loading = false;
        state.marks = action.payload;
      })
      .addCase(fetchMarks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addMarks.fulfilled, (state, action) => {
        state.marks.push(action.payload);
      })
      .addCase(updateMarks.fulfilled, (state, action) => {
        const index = state.marks.findIndex(m => m.id === action.payload.id);
        if (index !== -1) {
          state.marks[index] = action.payload;
        }
      })
      .addCase(deleteMarks.fulfilled, (state, action) => {
        state.marks = state.marks.filter(m => m.id !== action.payload);
      });
  },
});

export default marksSlice.reducer;
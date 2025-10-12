import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { createAsyncThunkWithToast } from '../utils/asyncThunkUtils';
import { API_BASE_URL } from '../utils/apiConfig';

// Mock data for examinations
const mockExams = [
  {
    id: '1',
    name: 'Midterm Examination',
    class: 'Class 10',
    section: 'A',
    examType: 'Midterm',
    startDate: '2023-10-15',
    endDate: '2023-10-20',
    subjects: [
      { id: '10math', name: 'Mathematics', date: '2023-10-15', time: '09:00', duration: 180 },
      { id: '10eng', name: 'English', date: '2023-10-16', time: '09:00', duration: 180 },
      { id: '10sci', name: 'Science', date: '2023-10-17', time: '09:00', duration: 180 },
      { id: '10hist', name: 'History', date: '2023-10-18', time: '09:00', duration: 180 }
    ],
    maxMarks: 100,
    status: 'scheduled'
  },
  {
    id: '2',
    name: 'Final Examination',
    class: 'Class 9',
    section: 'B',
    examType: 'Final',
    startDate: '2023-12-01',
    endDate: '2023-12-10',
    subjects: [
      { id: '9math', name: 'Mathematics', date: '2023-12-01', time: '09:00', duration: 180 },
      { id: '9eng', name: 'English', date: '2023-12-02', time: '09:00', duration: 180 },
      { id: '9sci', name: 'Science', date: '2023-12-03', time: '09:00', duration: 180 },
      { id: '9geo', name: 'Geography', date: '2023-12-04', time: '09:00', duration: 180 }
    ],
    maxMarks: 100,
    status: 'scheduled'
  }
];

const initialState = {
  exams: mockExams,
  loading: false,
  error: null,
};

// Async thunks for mock API calls
export const fetchExams = createAsyncThunk('exams/fetchExams', async (_, { rejectWithValue }) => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockExams;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const addExam = createAsyncThunk('exams/addExam', async (examData, { rejectWithValue }) => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    const newExam = {
      id: Date.now().toString(),
      ...examData,
    };
    toast.success('Examination added successfully');
    return newExam;
  } catch (error) {
    toast.error('Failed to add examination');
    return rejectWithValue(error.message);
  }
});

export const updateExam = createAsyncThunk('exams/updateExam', async (examData, { rejectWithValue }) => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    toast.success('Examination updated successfully');
    return examData;
  } catch (error) {
    toast.error('Failed to update examination');
    return rejectWithValue(error.message);
  }
});

export const deleteExam = createAsyncThunk('exams/deleteExam', async (examId, { rejectWithValue }) => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    toast.success('Examination deleted successfully');
    return examId;
  } catch (error) {
    toast.error('Failed to delete examination');
    return rejectWithValue(error.message);
  }
});

const examsSlice = createSlice({
  name: 'exams',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExams.fulfilled, (state, action) => {
        state.loading = false;
        state.exams = action.payload;
      })
      .addCase(fetchExams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addExam.fulfilled, (state, action) => {
        state.exams.push(action.payload);
      })
      .addCase(updateExam.fulfilled, (state, action) => {
        const index = state.exams.findIndex(e => e.id === action.payload.id);
        if (index !== -1) {
          state.exams[index] = action.payload;
        }
      })
      .addCase(deleteExam.fulfilled, (state, action) => {
        state.exams = state.exams.filter(e => e.id !== action.payload);
      });
  },
});

export default examsSlice.reducer;
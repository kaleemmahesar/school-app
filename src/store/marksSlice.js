import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Mock data for student marks
const mockMarks = [
  {
    id: '1',
    studentId: '1',
    studentName: 'John Doe',
    class: 'Class 10',
    section: 'A',
    examType: 'Midterm',
    year: '2023',
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
    year: '2023',
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
  }
];

const initialState = {
  marks: mockMarks,
  loading: false,
  error: null,
};

// Async thunks for mock API calls
export const fetchMarks = createAsyncThunk('marks/fetchMarks', async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockMarks;
});

export const addMarks = createAsyncThunk('marks/addMarks', async (marksData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  const newMarks = {
    id: Date.now().toString(),
    ...marksData,
  };
  return newMarks;
});

export const updateMarks = createAsyncThunk('marks/updateMarks', async (marksData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return marksData;
});

export const deleteMarks = createAsyncThunk('marks/deleteMarks', async (marksId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return marksId;
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
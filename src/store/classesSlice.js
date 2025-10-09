import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Mock data for classes with monthly fees and subjects
const mockClasses = [
  {
    id: '1',
    name: 'Class 10',
    monthlyFees: 4000,
    subjects: [
      { id: '10math', name: 'Mathematics', teacher: 'Mr. Johnson' },
      { id: '10eng', name: 'English', teacher: 'Ms. Smith' },
      { id: '10sci', name: 'Science', teacher: 'Dr. Brown' },
      { id: '10hist', name: 'History', teacher: 'Mr. Davis' }
    ],
    sections: [
      { id: '10A', name: 'A', studentCount: 30 },
      { id: '10B', name: 'B', studentCount: 28 },
    ],
    totalStudents: 58,
  },
  {
    id: '2',
    name: 'Class 9',
    monthlyFees: 3500,
    subjects: [
      { id: '9math', name: 'Mathematics', teacher: 'Mr. Wilson' },
      { id: '9eng', name: 'English', teacher: 'Ms. Taylor' },
      { id: '9sci', name: 'Science', teacher: 'Dr. Miller' },
      { id: '9geo', name: 'Geography', teacher: 'Mr. Moore' }
    ],
    sections: [
      { id: '9A', name: 'A', studentCount: 32 },
      { id: '9B', name: 'B', studentCount: 29 },
    ],
    totalStudents: 61,
  },
];

const initialState = {
  classes: mockClasses,
  loading: false,
  error: null,
};

// Async thunks for mock API calls
export const fetchClasses = createAsyncThunk('classes/fetchClasses', async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockClasses;
});

export const addClass = createAsyncThunk('classes/addClass', async (classData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  const newClass = {
    id: Date.now().toString(),
    subjects: [], // Initialize with empty subjects array
    ...classData,
  };
  return newClass;
});

export const updateClass = createAsyncThunk('classes/updateClass', async (classData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return classData;
});

export const deleteClass = createAsyncThunk('classes/deleteClass', async (classId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return classId;
});

// New thunk for updating class fees
export const updateClassFees = createAsyncThunk('classes/updateClassFees', async ({ classId, monthlyFees }) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return { classId, monthlyFees };
});

// New thunk for adding a subject to a class
export const addSubjectToClass = createAsyncThunk('classes/addSubjectToClass', async ({ classId, subject }) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return { classId, subject };
});

// New thunk for removing a subject from a class
export const removeSubjectFromClass = createAsyncThunk('classes/removeSubjectFromClass', async ({ classId, subjectId }) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return { classId, subjectId };
});

const classesSlice = createSlice({
  name: 'classes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchClasses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClasses.fulfilled, (state, action) => {
        state.loading = false;
        state.classes = action.payload;
      })
      .addCase(fetchClasses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addClass.fulfilled, (state, action) => {
        state.classes.push(action.payload);
      })
      .addCase(updateClass.fulfilled, (state, action) => {
        const index = state.classes.findIndex(cls => cls.id === action.payload.id);
        if (index !== -1) {
          state.classes[index] = action.payload;
        }
      })
      .addCase(deleteClass.fulfilled, (state, action) => {
        state.classes = state.classes.filter(cls => cls.id !== action.payload);
      })
      .addCase(updateClassFees.fulfilled, (state, action) => {
        const { classId, monthlyFees } = action.payload;
        const classItem = state.classes.find(cls => cls.id === classId);
        if (classItem) {
          classItem.monthlyFees = monthlyFees;
        }
      })
      .addCase(addSubjectToClass.fulfilled, (state, action) => {
        const { classId, subject } = action.payload;
        const classItem = state.classes.find(cls => cls.id === classId);
        if (classItem) {
          if (!classItem.subjects) {
            classItem.subjects = [];
          }
          classItem.subjects.push(subject);
        }
      })
      .addCase(removeSubjectFromClass.fulfilled, (state, action) => {
        const { classId, subjectId } = action.payload;
        const classItem = state.classes.find(cls => cls.id === classId);
        if (classItem && classItem.subjects) {
          classItem.subjects = classItem.subjects.filter(sub => sub.id !== subjectId);
        }
      });
  },
});

export default classesSlice.reducer;
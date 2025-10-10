import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { createAsyncThunkWithToast, createAddThunk, createUpdateThunk, createDeleteThunk } from '../utils/asyncThunkUtils';

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
  {
    id: '3',
    name: 'Class 8',
    monthlyFees: 3000,
    subjects: [
      { id: '8math', name: 'Mathematics', teacher: 'Mrs. Anderson' },
      { id: '8eng', name: 'English', teacher: 'Mr. Thomas' },
      { id: '8sci', name: 'Science', teacher: 'Dr. Jackson' },
      { id: '8hist', name: 'History', teacher: 'Ms. White' }
    ],
    sections: [
      { id: '8A', name: 'A', studentCount: 25 },
      { id: '8B', name: 'B', studentCount: 27 },
    ],
    totalStudents: 52,
  },
  {
    id: '4',
    name: 'Class 7',
    monthlyFees: 2500,
    subjects: [
      { id: '7math', name: 'Mathematics', teacher: 'Mr. Clark' },
      { id: '7eng', name: 'English', teacher: 'Ms. Lewis' },
      { id: '7sci', name: 'Science', teacher: 'Dr. Walker' },
      { id: '7geo', name: 'Geography', teacher: 'Mr. Hall' }
    ],
    sections: [
      { id: '7A', name: 'A', studentCount: 28 },
      { id: '7B', name: 'B', studentCount: 26 },
    ],
    totalStudents: 54,
  },
  {
    id: '5',
    name: 'Class 6',
    monthlyFees: 2000,
    subjects: [
      { id: '6math', name: 'Mathematics', teacher: 'Mrs. Young' },
      { id: '6eng', name: 'English', teacher: 'Mr. King' },
      { id: '6sci', name: 'Science', teacher: 'Dr. Wright' },
      { id: '6hist', name: 'History', teacher: 'Ms. Scott' }
    ],
    sections: [
      { id: '6A', name: 'A', studentCount: 30 },
      { id: '6B', name: 'B', studentCount: 29 },
    ],
    totalStudents: 59,
  },
];

const initialState = {
  classes: mockClasses,
  loading: false,
  error: null,
};

// Async thunks for mock API calls
export const fetchClasses = createAsyncThunkWithToast(
  'classes/fetchClasses',
  async () => {
    return mockClasses;
  },
  {
    delay: 500
  }
);

export const addClass = createAddThunk(
  'classes/addClass',
  async (classData) => {
    const newClass = {
      id: Date.now().toString(),
      subjects: [], // Initialize with empty subjects array
      sections: [], // Initialize with empty sections array
      ...classData,
    };
    return newClass;
  },
  {
    successMessage: 'Class added successfully',
    errorMessage: 'Failed to add class',
    delay: 500
  }
);

export const updateClass = createUpdateThunk(
  'classes/updateClass',
  async (classData) => {
    const updatedClass = {
      subjects: [], // Ensure subjects array exists
      ...classData,
    };
    return updatedClass;
  },
  {
    successMessage: 'Class updated successfully',
    errorMessage: 'Failed to update class',
    delay: 500
  }
);

export const deleteClass = createDeleteThunk(
  'classes/deleteClass',
  async (classId) => {
    return classId;
  },
  {
    successMessage: 'Class deleted successfully',
    errorMessage: 'Failed to delete class',
    delay: 500
  }
);

// New thunk for updating class fees
export const updateClassFees = createAsyncThunkWithToast(
  'classes/updateClassFees',
  async ({ classId, monthlyFees }) => {
    return { classId, monthlyFees };
  },
  {
    successMessage: 'Class fees updated successfully',
    errorMessage: 'Failed to update class fees',
    delay: 500
  }
);

// New thunk for adding a subject to a class
export const addSubjectToClass = createAsyncThunkWithToast(
  'classes/addSubjectToClass',
  async ({ classId, subject }) => {
    return { classId, subject };
  },
  {
    successMessage: 'Subject added successfully',
    errorMessage: 'Failed to add subject',
    delay: 500
  }
);

// New thunk for removing a subject from a class
export const removeSubjectFromClass = createAsyncThunkWithToast(
  'classes/removeSubjectFromClass',
  async ({ classId, subjectId }) => {
    return { classId, subjectId };
  },
  {
    successMessage: 'Subject removed successfully',
    errorMessage: 'Failed to remove subject',
    delay: 500
  }
);

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
        const index = state.classes.findIndex(classItem => classItem.id === action.payload.id);
        if (index !== -1) {
          state.classes[index] = action.payload;
        }
      })
      .addCase(deleteClass.fulfilled, (state, action) => {
        state.classes = state.classes.filter(classItem => classItem.id !== action.payload);
      })
      .addCase(updateClassFees.fulfilled, (state, action) => {
        const { classId, monthlyFees } = action.payload;
        const classItem = state.classes.find(c => c.id === classId);
        if (classItem) {
          classItem.monthlyFees = monthlyFees;
        }
      })
      .addCase(addSubjectToClass.fulfilled, (state, action) => {
        const { classId, subject } = action.payload;
        const classItem = state.classes.find(c => c.id === classId);
        if (classItem) {
          if (!classItem.subjects) {
            classItem.subjects = [];
          }
          classItem.subjects.push(subject);
        }
      })
      .addCase(removeSubjectFromClass.fulfilled, (state, action) => {
        const { classId, subjectId } = action.payload;
        const classItem = state.classes.find(c => c.id === classId);
        if (classItem && classItem.subjects) {
          classItem.subjects = classItem.subjects.filter(subject => subject.id !== subjectId);
        }
      });
  },
});

export default classesSlice.reducer;
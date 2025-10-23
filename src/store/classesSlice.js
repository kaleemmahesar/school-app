import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { createAsyncThunkWithToast, createAddThunk, createUpdateThunk, createDeleteThunk } from '../utils/asyncThunkUtils';
import { API_BASE_URL } from '../utils/apiConfig';

// Mock data for classes with monthly fees and subjects
const mockClasses = [
  {
    id: '1',
    name: 'Class 10',
    monthlyFees: 4000,
    subjects: [
      { id: '10math', name: 'Mathematics', teacherId: '1', teacherName: 'Ahmed Khan' },
      { id: '10eng', name: 'English', teacherId: '2', teacherName: 'Fatima Ahmed' },
      { id: '10sci', name: 'Science', teacherId: '3', teacherName: 'Bilal Malik' },
      { id: '10hist', name: 'History', teacherId: '4', teacherName: 'Ayesha Raza' }
    ],
    sections: [
      { id: '10A', name: 'A' },
      { id: '10B', name: 'B' },
    ]
  },
  {
    id: '2',
    name: 'Class 9',
    monthlyFees: 3500,
    subjects: [
      { id: '9math', name: 'Mathematics', teacherId: '1', teacherName: 'Ahmed Khan' },
      { id: '9eng', name: 'English', teacherId: '2', teacherName: 'Fatima Ahmed' },
      { id: '9sci', name: 'Science', teacherId: '3', teacherName: 'Bilal Malik' },
      { id: '9geo', name: 'Geography', teacherId: '4', teacherName: 'Ayesha Raza' }
    ],
    sections: [
      { id: '9A', name: 'A' },
      { id: '9B', name: 'B' },
    ]
  },
  {
    id: '3',
    name: 'Class 8',
    monthlyFees: 3000,
    subjects: [
      { id: '8math', name: 'Mathematics', teacherId: '1', teacherName: 'Ahmed Khan' },
      { id: '8eng', name: 'English', teacherId: '2', teacherName: 'Fatima Ahmed' },
      { id: '8sci', name: 'Science', teacherId: '3', teacherName: 'Bilal Malik' },
      { id: '8hist', name: 'History', teacherId: '4', teacherName: 'Ayesha Raza' }
    ],
    sections: [
      { id: '8A', name: 'A' },
      { id: '8B', name: 'B' },
    ]
  },
  {
    id: '4',
    name: 'Class 7',
    monthlyFees: 2500,
    subjects: [
      { id: '7math', name: 'Mathematics', teacherId: '1', teacherName: 'Ahmed Khan' },
      { id: '7eng', name: 'English', teacherId: '2', teacherName: 'Fatima Ahmed' },
      { id: '7sci', name: 'Science', teacherId: '3', teacherName: 'Bilal Malik' },
      { id: '7geo', name: 'Geography', teacherId: '4', teacherName: 'Ayesha Raza' }
    ],
    sections: [
      { id: '7A', name: 'A' },
      { id: '7B', name: 'B' },
    ]
  },
  {
    id: '5',
    name: 'Class 6',
    monthlyFees: 2000,
    subjects: [
      { id: '6math', name: 'Mathematics', teacherId: '1', teacherName: 'Ahmed Khan' },
      { id: '6eng', name: 'English', teacherId: '2', teacherName: 'Fatima Ahmed' },
      { id: '6sci', name: 'Science', teacherId: '3', teacherName: 'Bilal Malik' },
      { id: '6hist', name: 'History', teacherId: '4', teacherName: 'Ayesha Raza' }
    ],
    sections: [
      { id: '6A', name: 'A' },
      { id: '6B', name: 'B' },
    ]
  },
  {
    id: '6',
    name: 'Class 5',
    monthlyFees: 1500,
    subjects: [
      { id: '5math', name: 'Mathematics', teacherId: '1', teacherName: 'Ahmed Khan' },
      { id: '5eng', name: 'English', teacherId: '2', teacherName: 'Fatima Ahmed' },
      { id: '5sci', name: 'Science', teacherId: '3', teacherName: 'Bilal Malik' },
      { id: '5hist', name: 'History', teacherId: '4', teacherName: 'Ayesha Raza' }
    ],
    sections: [
      { id: '5A', name: 'A' },
      { id: '5B', name: 'B' },
    ]
  },
  {
    id: '7',
    name: 'Class 4',
    monthlyFees: 1200,
    subjects: [
      { id: '4math', name: 'Mathematics', teacherId: '1', teacherName: 'Ahmed Khan' },
      { id: '4eng', name: 'English', teacherId: '2', teacherName: 'Fatima Ahmed' },
      { id: '4sci', name: 'Science', teacherId: '3', teacherName: 'Bilal Malik' },
      { id: '4hist', name: 'History', teacherId: '4', teacherName: 'Ayesha Raza' }
    ],
    sections: [
      { id: '4A', name: 'A' },
      { id: '4B', name: 'B' },
    ]
  },
  {
    id: '8',
    name: 'Class 3',
    monthlyFees: 1000,
    subjects: [
      { id: '3math', name: 'Mathematics', teacherId: '1', teacherName: 'Ahmed Khan' },
      { id: '3eng', name: 'English', teacherId: '2', teacherName: 'Fatima Ahmed' },
      { id: '3sci', name: 'Science', teacherId: '3', teacherName: 'Bilal Malik' },
      { id: '3hist', name: 'History', teacherId: '4', teacherName: 'Ayesha Raza' }
    ],
    sections: [
      { id: '3A', name: 'A' },
      { id: '3B', name: 'B' },
    ]
  },
  {
    id: '9',
    name: 'Class 2',
    monthlyFees: 800,
    subjects: [
      { id: '2math', name: 'Mathematics', teacherId: '1', teacherName: 'Ahmed Khan' },
      { id: '2eng', name: 'English', teacherId: '2', teacherName: 'Fatima Ahmed' },
      { id: '2sci', name: 'Science', teacherId: '3', teacherName: 'Bilal Malik' },
      { id: '2hist', name: 'History', teacherId: '4', teacherName: 'Ayesha Raza' }
    ],
    sections: [
      { id: '2A', name: 'A' },
      { id: '2B', name: 'B' },
    ]
  },
  {
    id: '10',
    name: 'Class 1',
    monthlyFees: 600,
    subjects: [
      { id: '1math', name: 'Mathematics', teacherId: '1', teacherName: 'Ahmed Khan' },
      { id: '1eng', name: 'English', teacherId: '2', teacherName: 'Fatima Ahmed' },
      { id: '1sci', name: 'Science', teacherId: '3', teacherName: 'Bilal Malik' },
      { id: '1hist', name: 'History', teacherId: '4', teacherName: 'Ayesha Raza' }
    ],
    sections: [
      { id: '1A', name: 'A' },
      { id: '1B', name: 'B' },
    ]
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
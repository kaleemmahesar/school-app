import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { createAsyncThunkWithToast, createAddThunk, createUpdateThunk, createDeleteThunk } from '../utils/asyncThunkUtils';
import { API_BASE_URL } from '../utils/apiConfig';

const initialState = {
  classes: [],
  loading: false,
  error: null,
};

// Async thunks for API calls
export const fetchClasses = createAsyncThunkWithToast(
  'classes/fetchClasses',
  async () => {
    const response = await fetch(`${API_BASE_URL}/classes`);
    if (!response.ok) {
      throw new Error('Failed to fetch classes');
    }
    return await response.json();
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
    
    const response = await fetch(`${API_BASE_URL}/classes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newClass),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add class');
    }
    
    return await response.json();
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
    
    const response = await fetch(`${API_BASE_URL}/classes/${classData.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedClass),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update class');
    }
    
    return await response.json();
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
    const response = await fetch(`${API_BASE_URL}/classes/${classId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete class');
    }
    
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
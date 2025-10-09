import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Mock data for users
const mockUsers = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@school.com',
    role: 'Administrator',
    permissions: ['all'],
    lastLogin: '2023-10-05T14:30:00Z',
    loginHistory: [
      { id: 'login-1', timestamp: '2023-10-05T14:30:00Z', status: 'success', ip: '192.168.1.100' },
      { id: 'login-2', timestamp: '2023-10-04T09:15:00Z', status: 'success', ip: '192.168.1.100' },
      { id: 'login-3', timestamp: '2023-10-03T16:45:00Z', status: 'failed', ip: '192.168.1.101' }
    ]
  },
  {
    id: '2',
    username: 'accountant',
    email: 'accountant@school.com',
    role: 'Accountant',
    permissions: ['fees', 'expenses', 'reports'],
    lastLogin: '2023-10-05T10:20:00Z',
    loginHistory: [
      { id: 'login-4', timestamp: '2023-10-05T10:20:00Z', status: 'success', ip: '192.168.1.102' },
      { id: 'login-5', timestamp: '2023-10-04T11:30:00Z', status: 'success', ip: '192.168.1.102' }
    ]
  },
  {
    id: '3',
    username: 'teacher',
    email: 'teacher@school.com',
    role: 'Teacher',
    permissions: ['students', 'attendance', 'marksheets'],
    lastLogin: '2023-10-05T08:45:00Z',
    loginHistory: [
      { id: 'login-6', timestamp: '2023-10-05T08:45:00Z', status: 'success', ip: '192.168.1.103' },
      { id: 'login-7', timestamp: '2023-10-04T07:50:00Z', status: 'success', ip: '192.168.1.103' }
    ]
  }
];

const initialState = {
  users: mockUsers,
  currentUser: null,
  loading: false,
  error: null,
};

// Async thunks for mock API calls
export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockUsers;
});

export const addUser = createAsyncThunk('users/addUser', async (userData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  const newUser = {
    id: Date.now().toString(),
    ...userData,
    loginHistory: []
  };
  return newUser;
});

export const updateUser = createAsyncThunk('users/updateUser', async (userData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return userData;
});

export const deleteUser = createAsyncThunk('users/deleteUser', async (userId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return userId;
});

export const loginUser = createAsyncThunk('users/loginUser', async ({ username, password }) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real implementation, this would validate credentials
  // For demo purposes, we'll just find the user by username
  const user = mockUsers.find(u => u.username === username);
  
  if (user) {
    // Add a new login record
    const loginRecord = {
      id: `login-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: 'success',
      ip: '192.168.1.104' // Mock IP
    };
    
    return {
      ...user,
      lastLogin: new Date().toISOString(),
      loginHistory: [loginRecord, ...user.loginHistory.slice(0, 9)] // Keep only last 10 records
    };
  }
  
  throw new Error('Invalid credentials');
});

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    logoutUser: (state) => {
      state.currentUser = null;
    },
    addLoginRecord: (state, action) => {
      const { userId, record } = action.payload;
      const user = state.users.find(u => u.id === userId);
      if (user) {
        user.loginHistory = [record, ...user.loginHistory.slice(0, 9)];
        user.lastLogin = record.timestamp;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.users.push(action.payload);
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(user => user.id !== action.payload);
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.currentUser = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.error.message;
      });
  },
});

export const { logoutUser, addLoginRecord } = usersSlice.actions;
export default usersSlice.reducer;
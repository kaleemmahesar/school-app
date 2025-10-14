import { configureStore } from '@reduxjs/toolkit';
import studentsReducer from './studentsSlice';
import expensesReducer from './expensesSlice';
import staffReducer from './staffSlice';
import classesReducer from './classesSlice';
import marksReducer from './marksSlice';
import usersReducer from './usersSlice';
import settingsReducer from './settingsSlice';
import examsReducer from './examsSlice';
import subsidiesReducer from './subsidiesSlice';

export const store = configureStore({
  reducer: {
    students: studentsReducer,
    expenses: expensesReducer,
    staff: staffReducer,
    classes: classesReducer,
    marks: marksReducer,
    users: usersReducer,
    settings: settingsReducer,
    exams: examsReducer,
    subsidies: subsidiesReducer,
  },
});

export default store;
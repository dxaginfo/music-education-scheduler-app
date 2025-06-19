import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import lessonReducer from './slices/lessonSlice';
import notificationReducer from './slices/notificationSlice';
import userReducer from './slices/userSlice';
import teacherReducer from './slices/teacherSlice';
import studentReducer from './slices/studentSlice';
import scheduleReducer from './slices/scheduleSlice';
import messageReducer from './slices/messageSlice';
import paymentReducer from './slices/paymentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    lesson: lessonReducer,
    notification: notificationReducer,
    user: userReducer,
    teacher: teacherReducer,
    student: studentReducer,
    schedule: scheduleReducer,
    message: messageReducer,
    payment: paymentReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths in the state
        ignoredActions: ['auth/loginSuccess', 'auth/registerSuccess', 'auth/checkAuthSuccess'],
        ignoredPaths: ['auth.user'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
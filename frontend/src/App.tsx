import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, CircularProgress } from '@mui/material';

// Layout components
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Dashboard pages
import DashboardPage from './pages/dashboard/DashboardPage';

// Teacher pages
import TeacherAvailabilityPage from './pages/teacher/TeacherAvailabilityPage';
import TeacherLessonsPage from './pages/teacher/TeacherLessonsPage';
import TeacherStudentsPage from './pages/teacher/TeacherStudentsPage';
import TeacherPackagesPage from './pages/teacher/TeacherPackagesPage';

// Student pages
import StudentLessonsPage from './pages/student/StudentLessonsPage';
import StudentTeachersPage from './pages/student/StudentTeachersPage';
import StudentAssignmentsPage from './pages/student/StudentAssignmentsPage';
import StudentBookingsPage from './pages/student/StudentBookingsPage';

// Admin pages
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminRoomsPage from './pages/admin/AdminRoomsPage';
import AdminInstrumentsPage from './pages/admin/AdminInstrumentsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';

// Shared pages
import ProfilePage from './pages/shared/ProfilePage';
import NotificationsPage from './pages/shared/NotificationsPage';
import PaymentsPage from './pages/shared/PaymentsPage';
import MessagesPage from './pages/shared/MessagesPage';
import NotFoundPage from './pages/shared/NotFoundPage';

// Redux actions
import { checkAuth } from './store/slices/authSlice';
import { RootState } from './store';

const App: React.FC = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);
  
  useEffect(() => {
    dispatch(checkAuth() as any);
  }, [dispatch]);
  
  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" />} />
        <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPasswordPage /> : <Navigate to="/dashboard" />} />
      </Route>
      
      {/* Protected routes */}
      <Route element={<MainLayout />}>
        {/* Dashboard */}
        <Route path="/dashboard" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />} />
        
        {/* Teacher routes */}
        <Route path="/teacher/availability" element={isAuthenticated && user?.role === 'TEACHER' ? <TeacherAvailabilityPage /> : <Navigate to="/dashboard" />} />
        <Route path="/teacher/lessons" element={isAuthenticated && user?.role === 'TEACHER' ? <TeacherLessonsPage /> : <Navigate to="/dashboard" />} />
        <Route path="/teacher/students" element={isAuthenticated && user?.role === 'TEACHER' ? <TeacherStudentsPage /> : <Navigate to="/dashboard" />} />
        <Route path="/teacher/packages" element={isAuthenticated && user?.role === 'TEACHER' ? <TeacherPackagesPage /> : <Navigate to="/dashboard" />} />
        
        {/* Student routes */}
        <Route path="/student/lessons" element={isAuthenticated && user?.role === 'STUDENT' ? <StudentLessonsPage /> : <Navigate to="/dashboard" />} />
        <Route path="/student/teachers" element={isAuthenticated && user?.role === 'STUDENT' ? <StudentTeachersPage /> : <Navigate to="/dashboard" />} />
        <Route path="/student/assignments" element={isAuthenticated && user?.role === 'STUDENT' ? <StudentAssignmentsPage /> : <Navigate to="/dashboard" />} />
        <Route path="/student/bookings" element={isAuthenticated && user?.role === 'STUDENT' ? <StudentBookingsPage /> : <Navigate to="/dashboard" />} />
        
        {/* Admin routes */}
        <Route path="/admin/users" element={isAuthenticated && user?.role === 'ADMIN' ? <AdminUsersPage /> : <Navigate to="/dashboard" />} />
        <Route path="/admin/rooms" element={isAuthenticated && user?.role === 'ADMIN' ? <AdminRoomsPage /> : <Navigate to="/dashboard" />} />
        <Route path="/admin/instruments" element={isAuthenticated && user?.role === 'ADMIN' ? <AdminInstrumentsPage /> : <Navigate to="/dashboard" />} />
        <Route path="/admin/reports" element={isAuthenticated && user?.role === 'ADMIN' ? <AdminReportsPage /> : <Navigate to="/dashboard" />} />
        
        {/* Shared routes */}
        <Route path="/profile" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/notifications" element={isAuthenticated ? <NotificationsPage /> : <Navigate to="/login" />} />
        <Route path="/payments" element={isAuthenticated ? <PaymentsPage /> : <Navigate to="/login" />} />
        <Route path="/messages" element={isAuthenticated ? <MessagesPage /> : <Navigate to="/login" />} />
        
        {/* Redirect from root to dashboard if authenticated, otherwise to login */}
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Route>
      
      {/* Not found page */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
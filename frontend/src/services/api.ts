import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Handle 401 Unauthorized errors (token expired or invalid)
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        
        // Only redirect to login if we're not already on a login-related page
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/login') && 
            !currentPath.includes('/register') && 
            !currentPath.includes('/forgot-password')) {
          window.location.href = '/login';
        }
      }
      
      // Handle 403 Forbidden errors
      if (error.response.status === 403) {
        console.error('Access forbidden:', error.response.data);
      }
      
      // Handle 500 Server errors
      if (error.response.status >= 500) {
        console.error('Server error:', error.response.data);
      }
    } else if (error.request) {
      // Network error
      console.error('Network error - no response received:', error.request);
    } else {
      // Something else happened while setting up the request
      console.error('Error setting up request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authApi = {
  register: (userData: any) => api.post('/auth/register', userData),
  login: (credentials: any) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  changePassword: (passwordData: any) => api.put('/auth/change-password', passwordData),
};

// User endpoints
export const userApi = {
  getUser: (id: string) => api.get(`/users/${id}`),
  updateUser: (id: string, userData: any) => api.put(`/users/${id}`, userData),
  getUsers: (params: any) => api.get('/users', { params }),
};

// Teacher endpoints
export const teacherApi = {
  getTeacherProfile: (id: string) => api.get(`/teachers/${id}`),
  updateTeacherProfile: (id: string, data: any) => api.put(`/teachers/${id}`, data),
  getAvailability: (id: string) => api.get(`/teachers/${id}/availability`),
  updateAvailability: (id: string, data: any) => api.put(`/teachers/${id}/availability`, data),
  getLessons: (id: string, params: any) => api.get(`/teachers/${id}/lessons`, { params }),
  getStudents: (id: string) => api.get(`/teachers/${id}/students`),
};

// Student endpoints
export const studentApi = {
  getStudentProfile: (id: string) => api.get(`/students/${id}`),
  updateStudentProfile: (id: string, data: any) => api.put(`/students/${id}`, data),
  getLessons: (id: string, params: any) => api.get(`/students/${id}/lessons`, { params }),
  getAssignments: (id: string, params: any) => api.get(`/students/${id}/assignments`, { params }),
  updateAssignment: (id: string, assignmentId: string, data: any) => 
    api.put(`/students/${id}/assignments/${assignmentId}`, data),
};

// Lesson endpoints
export const lessonApi = {
  getLessons: (params: any) => api.get('/lessons', { params }),
  getLesson: (id: string) => api.get(`/lessons/${id}`),
  createLesson: (data: any) => api.post('/lessons', data),
  updateLesson: (id: string, data: any) => api.put(`/lessons/${id}`, data),
  cancelLesson: (id: string) => api.put(`/lessons/${id}/cancel`),
  addAssignment: (id: string, data: any) => api.post(`/lessons/${id}/assignments`, data),
};

// Room endpoints
export const roomApi = {
  getRooms: () => api.get('/rooms'),
  getRoom: (id: string) => api.get(`/rooms/${id}`),
  createRoom: (data: any) => api.post('/rooms', data),
  updateRoom: (id: string, data: any) => api.put(`/rooms/${id}`, data),
  deleteRoom: (id: string) => api.delete(`/rooms/${id}`),
};

// Instrument endpoints
export const instrumentApi = {
  getInstruments: (params: any) => api.get('/instruments', { params }),
  getInstrument: (id: string) => api.get(`/instruments/${id}`),
  createInstrument: (data: any) => api.post('/instruments', data),
  updateInstrument: (id: string, data: any) => api.put(`/instruments/${id}`, data),
  deleteInstrument: (id: string) => api.delete(`/instruments/${id}`),
  checkoutInstrument: (id: string, data: any) => api.post(`/instruments/${id}/checkout`, data),
  returnInstrument: (id: string) => api.post(`/instruments/${id}/return`),
};

// Payment endpoints
export const paymentApi = {
  getPayments: (params: any) => api.get('/payments', { params }),
  getPayment: (id: string) => api.get(`/payments/${id}`),
  createPayment: (data: any) => api.post('/payments', data),
  processPayment: (id: string) => api.post(`/payments/${id}/process`),
};

// Package endpoints
export const packageApi = {
  getPackages: () => api.get('/packages'),
  getPackage: (id: string) => api.get(`/packages/${id}`),
  createPackage: (data: any) => api.post('/packages', data),
  updatePackage: (id: string, data: any) => api.put(`/packages/${id}`, data),
  deletePackage: (id: string) => api.delete(`/packages/${id}`),
  purchasePackage: (id: string, data: any) => api.post(`/packages/${id}/purchase`, data),
};

// Notification endpoints
export const notificationApi = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

// Message endpoints
export const messageApi = {
  getMessages: (params: any) => api.get('/messages', { params }),
  sendMessage: (data: any) => api.post('/messages', data),
  markAsRead: (id: string) => api.put(`/messages/${id}/read`),
};

export default api;
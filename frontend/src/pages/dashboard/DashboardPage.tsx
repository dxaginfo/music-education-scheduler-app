import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  EventNote as EventNoteIcon,
  Notifications as NotificationsIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  MusicNote as MusicNoteIcon,
  ArrowForward as ArrowForwardIcon,
  CalendarToday as CalendarTodayIcon,
  School as SchoolIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';

import { RootState } from '../../store';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Mock data - in a real app, this would come from an API
  const [upcomingLessons, setUpcomingLessons] = useState([
    {
      id: '1',
      title: 'Piano Lesson',
      date: '2025-06-20T15:00:00',
      duration: 60,
      teacher: 'John Smith',
      status: 'scheduled',
      location: 'Room 101',
    },
    {
      id: '2',
      title: 'Guitar Lesson',
      date: '2025-06-22T10:30:00',
      duration: 45,
      teacher: 'Sarah Johnson',
      status: 'scheduled',
      location: 'Room 203',
    },
  ]);
  
  const [recentNotifications, setRecentNotifications] = useState([
    {
      id: '1',
      message: 'Your lesson on June 18 was rescheduled',
      time: '2 hours ago',
      isRead: false,
      type: 'warning',
    },
    {
      id: '2',
      message: 'New assignment added: Scale practice',
      time: '1 day ago',
      isRead: true,
      type: 'info',
    },
    {
      id: '3',
      message: 'Payment for June lessons received',
      time: '2 days ago',
      isRead: true,
      type: 'success',
    },
  ]);
  
  // Teacher-specific mock data
  const [teacherStudents, setTeacherStudents] = useState([
    {
      id: '1',
      name: 'Alex Johnson',
      instrument: 'Piano',
      nextLesson: '2025-06-20T15:00:00',
    },
    {
      id: '2',
      name: 'Emily Williams',
      instrument: 'Violin',
      nextLesson: '2025-06-21T16:30:00',
    },
    {
      id: '3',
      name: 'Michael Brown',
      instrument: 'Guitar',
      nextLesson: '2025-06-22T10:30:00',
    },
  ]);
  
  // Student-specific mock data
  const [studentAssignments, setStudentAssignments] = useState([
    {
      id: '1',
      title: 'C Major Scale Practice',
      dueDate: '2025-06-25',
      status: 'in-progress',
      teacher: 'John Smith',
    },
    {
      id: '2',
      title: 'Mozart Sonata - First Movement',
      dueDate: '2025-06-30',
      status: 'not-started',
      teacher: 'John Smith',
    },
  ]);
  
  // Admin-specific mock data
  const [adminStats, setAdminStats] = useState({
    totalUsers: 120,
    activeTeachers: 15,
    activeStudents: 95,
    lessonsToday: 28,
  });
  
  // Format date function
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Function to navigate to upcoming lesson detail
  const handleViewLesson = (lessonId: string) => {
    if (user?.role === 'TEACHER') {
      navigate(`/teacher/lessons/${lessonId}`);
    } else if (user?.role === 'STUDENT' || user?.role === 'PARENT') {
      navigate(`/student/lessons/${lessonId}`);
    }
  };
  
  // Function to navigate to role-specific section
  const handleNavigateToSection = (section: string) => {
    if (user?.role === 'TEACHER') {
      navigate(`/teacher/${section}`);
    } else if (user?.role === 'STUDENT' || user?.role === 'PARENT') {
      navigate(`/student/${section}`);
    } else if (user?.role === 'ADMIN') {
      navigate(`/admin/${section}`);
    }
  };
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.firstName}!
      </Typography>
      
      <Grid container spacing={3}>
        {/* Upcoming Lessons */}
        <Grid item xs={12} md={6} lg={7}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              height: '100%',
              borderRadius: 2,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography variant="h6" component="h2">
                Upcoming Lessons
              </Typography>
              <Button
                endIcon={<ArrowForwardIcon />}
                onClick={() => handleNavigateToSection('lessons')}
              >
                View all
              </Button>
            </Box>
            
            {upcomingLessons.length > 0 ? (
              <List>
                {upcomingLessons.map((lesson) => (
                  <React.Fragment key={lesson.id}>
                    <ListItem
                      secondaryAction={
                        <IconButton edge="end" onClick={() => handleViewLesson(lesson.id)}>
                          <ArrowForwardIcon />
                        </IconButton>
                      }
                    >
                      <ListItemIcon>
                        <EventNoteIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={lesson.title}
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {formatDate(lesson.date)}
                            </Typography>
                            {' — '}
                            {user?.role === 'TEACHER'
                              ? `${lesson.duration} mins • ${
                                  upcomingLessons.find((l) => l.id === lesson.id)?.teacher
                                }`
                              : `${lesson.duration} mins • with ${lesson.teacher}`}
                            {' • '}
                            {lesson.location}
                          </>
                        }
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <CalendarTodayIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography color="text.secondary">
                  No upcoming lessons scheduled
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={() => user?.role === 'TEACHER' 
                    ? navigate('/teacher/availability') 
                    : navigate('/student/bookings')}
                >
                  {user?.role === 'TEACHER' ? 'Set Availability' : 'Book a Lesson'}
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Notifications */}
        <Grid item xs={12} md={6} lg={5}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              height: '100%',
              borderRadius: 2,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography variant="h6" component="h2">
                Recent Notifications
              </Typography>
              <Button
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/notifications')}
              >
                View all
              </Button>
            </Box>
            
            <List>
              {recentNotifications.map((notification) => (
                <React.Fragment key={notification.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemIcon>
                      {notification.type === 'warning' && (
                        <WarningIcon color="warning" />
                      )}
                      {notification.type === 'info' && (
                        <NotificationsIcon color="info" />
                      )}
                      {notification.type === 'success' && (
                        <CheckCircleIcon color="success" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography
                            component="span"
                            variant="body1"
                            color="text.primary"
                            sx={{ fontWeight: notification.isRead ? 400 : 600 }}
                          >
                            {notification.message}
                          </Typography>
                          {!notification.isRead && (
                            <Chip
                              label="New"
                              size="small"
                              color="primary"
                              sx={{ ml: 1, height: 20 }}
                            />
                          )}
                        </Box>
                      }
                      secondary={notification.time}
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
        
        {/* Role-specific content */}
        {user?.role === 'TEACHER' && (
          <>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  height: '100%',
                  borderRadius: 2,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" component="h2">
                    My Students
                  </Typography>
                  <Button
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate('/teacher/students')}
                  >
                    View all
                  </Button>
                </Box>
                
                <List>
                  {teacherStudents.map((student) => (
                    <React.Fragment key={student.id}>
                      <ListItem>
                        <ListItemIcon>
                          <PeopleIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={student.name}
                          secondary={
                            <>
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.primary"
                              >
                                {student.instrument}
                              </Typography>
                              {' — Next lesson: '}
                              {formatDate(student.nextLesson)}
                            </>
                          }
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  height: '100%',
                  borderRadius: 2,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" component="h2">
                    Quick Actions
                  </Typography>
                </Box>
                
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                  }}
                >
                  <Button
                    variant="outlined"
                    startIcon={<CalendarTodayIcon />}
                    onClick={() => navigate('/teacher/availability')}
                    fullWidth
                  >
                    Update Availability
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<AssignmentIcon />}
                    onClick={() => navigate('/teacher/lessons')}
                    fullWidth
                  >
                    Create Assignments
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<MusicNoteIcon />}
                    onClick={() => navigate('/teacher/packages')}
                    fullWidth
                  >
                    Manage Lesson Packages
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </>
        )}
        
        {(user?.role === 'STUDENT' || user?.role === 'PARENT') && (
          <>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  height: '100%',
                  borderRadius: 2,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" component="h2">
                    My Assignments
                  </Typography>
                  <Button
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate('/student/assignments')}
                  >
                    View all
                  </Button>
                </Box>
                
                <List>
                  {studentAssignments.map((assignment) => (
                    <React.Fragment key={assignment.id}>
                      <ListItem>
                        <ListItemIcon>
                          <AssignmentIcon 
                            color={assignment.status === 'not-started' ? 'warning' : 'info'} 
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={assignment.title}
                          secondary={
                            <>
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.primary"
                              >
                                Due: {new Date(assignment.dueDate).toLocaleDateString()}
                              </Typography>
                              {' — '}
                              {assignment.status === 'not-started'
                                ? 'Not started'
                                : 'In progress'}
                              {' • '}
                              {assignment.teacher}
                            </>
                          }
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  height: '100%',
                  borderRadius: 2,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" component="h2">
                    Quick Actions
                  </Typography>
                </Box>
                
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                  }}
                >
                  <Button
                    variant="outlined"
                    startIcon={<CalendarTodayIcon />}
                    onClick={() => navigate('/student/bookings')}
                    fullWidth
                  >
                    Book a Lesson
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<SchoolIcon />}
                    onClick={() => navigate('/student/teachers')}
                    fullWidth
                  >
                    Find Teachers
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<AssignmentIcon />}
                    onClick={() => navigate('/student/assignments')}
                    fullWidth
                  >
                    View Assignments
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </>
        )}
        
        {user?.role === 'ADMIN' && (
          <>
            <Grid item xs={12}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Total Users
                      </Typography>
                      <Typography variant="h4" component="div">
                        {adminStats.totalUsers}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Active Teachers
                      </Typography>
                      <Typography variant="h4" component="div">
                        {adminStats.activeTeachers}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Active Students
                      </Typography>
                      <Typography variant="h4" component="div">
                        {adminStats.activeStudents}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Lessons Today
                      </Typography>
                      <Typography variant="h4" component="div">
                        {adminStats.lessonsToday}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
            
            <Grid item xs={12}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  height: '100%',
                  borderRadius: 2,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" component="h2">
                    Administrative Tools
                  </Typography>
                </Box>
                
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
                    gap: 2,
                  }}
                >
                  <Button
                    variant="outlined"
                    startIcon={<PeopleIcon />}
                    onClick={() => navigate('/admin/users')}
                  >
                    Manage Users
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<MeetingRoomIcon />}
                    onClick={() => navigate('/admin/rooms')}
                  >
                    Manage Rooms
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<MusicNoteIcon />}
                    onClick={() => navigate('/admin/instruments')}
                  >
                    Manage Instruments
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<BarChartIcon />}
                    onClick={() => navigate('/admin/reports')}
                  >
                    View Reports
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
};

export default DashboardPage;
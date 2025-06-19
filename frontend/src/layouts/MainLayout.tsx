import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Badge,
  Avatar,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  CalendarMonth as CalendarIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Message as MessageIcon,
  MusicNote as MusicNoteIcon,
  Payment as PaymentIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  Home as HomeIcon,
  Event as EventIcon,
  Assignment as AssignmentIcon,
  LibraryMusic as LibraryMusicIcon,
  MeetingRoom as MeetingRoomIcon,
  AssignmentInd as AssignmentIndIcon,
  Book as BookIcon,
  SupervisorAccount as SupervisorAccountIcon,
  DeveloperBoard as DeveloperBoardIcon,
  SupportAgent as SupportAgentIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';

import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';

// Drawer width
const drawerWidth = 240;

const MainLayout: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Get user from Redux store
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Get notification count from Redux store
  const { unreadCount } = useSelector((state: RootState) => state.notification);
  
  // Get message count from Redux store
  const { unreadCount: unreadMessageCount } = useSelector((state: RootState) => state.message);
  
  // State for drawer open in mobile view
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // State for profile menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  // Handle profile menu open
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Handle profile menu close
  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Handle navigation
  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    dispatch(logout() as any);
    navigate('/login');
  };
  
  // Handle drawer toggle
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  // Get the current page title
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/profile') return 'Profile';
    if (path === '/notifications') return 'Notifications';
    if (path === '/messages') return 'Messages';
    if (path === '/payments') return 'Payments';
    
    // Teacher pages
    if (path === '/teacher/availability') return 'Availability';
    if (path === '/teacher/lessons') return 'Lessons';
    if (path === '/teacher/students') return 'Students';
    if (path === '/teacher/packages') return 'Lesson Packages';
    
    // Student pages
    if (path === '/student/lessons') return 'Lessons';
    if (path === '/student/teachers') return 'Teachers';
    if (path === '/student/assignments') return 'Assignments';
    if (path === '/student/bookings') return 'Book Lessons';
    
    // Admin pages
    if (path === '/admin/users') return 'Users';
    if (path === '/admin/rooms') return 'Rooms';
    if (path === '/admin/instruments') return 'Instruments';
    if (path === '/admin/reports') return 'Reports';
    
    return 'Music Education Scheduler';
  };
  
  // Define menu items based on user role
  const getMenuItems = () => {
    const commonItems = [
      {
        text: 'Dashboard',
        icon: <DashboardIcon />,
        path: '/dashboard',
      },
    ];
    
    const teacherItems = [
      {
        text: 'My Availability',
        icon: <CalendarIcon />,
        path: '/teacher/availability',
      },
      {
        text: 'My Lessons',
        icon: <EventIcon />,
        path: '/teacher/lessons',
      },
      {
        text: 'My Students',
        icon: <PeopleIcon />,
        path: '/teacher/students',
      },
      {
        text: 'Lesson Packages',
        icon: <LibraryMusicIcon />,
        path: '/teacher/packages',
      },
    ];
    
    const studentItems = [
      {
        text: 'My Lessons',
        icon: <EventIcon />,
        path: '/student/lessons',
      },
      {
        text: 'Find Teachers',
        icon: <SchoolIcon />,
        path: '/student/teachers',
      },
      {
        text: 'My Assignments',
        icon: <AssignmentIcon />,
        path: '/student/assignments',
      },
      {
        text: 'Book Lessons',
        icon: <CalendarIcon />,
        path: '/student/bookings',
      },
    ];
    
    const adminItems = [
      {
        text: 'Users',
        icon: <SupervisorAccountIcon />,
        path: '/admin/users',
      },
      {
        text: 'Rooms',
        icon: <MeetingRoomIcon />,
        path: '/admin/rooms',
      },
      {
        text: 'Instruments',
        icon: <MusicNoteIcon />,
        path: '/admin/instruments',
      },
      {
        text: 'Reports',
        icon: <BarChartIcon />,
        path: '/admin/reports',
      },
    ];
    
    const personalItems = [
      {
        text: 'Messages',
        icon: (
          <Badge badgeContent={unreadMessageCount} color="error">
            <MessageIcon />
          </Badge>
        ),
        path: '/messages',
      },
      {
        text: 'Payments',
        icon: <PaymentIcon />,
        path: '/payments',
      },
    ];
    
    let roleBasedItems: Array<{ text: string; icon: JSX.Element; path: string }> = [];
    
    if (user?.role === 'TEACHER') {
      roleBasedItems = teacherItems;
    } else if (user?.role === 'STUDENT') {
      roleBasedItems = studentItems;
    } else if (user?.role === 'PARENT') {
      roleBasedItems = studentItems; // For now, parents see student items
    } else if (user?.role === 'ADMIN') {
      roleBasedItems = adminItems;
    }
    
    return [...commonItems, ...roleBasedItems, ...personalItems];
  };
  
  // Define drawer content
  const drawer = (
    <div>
      <Toolbar sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <MusicNoteIcon sx={{ color: 'primary.main', mr: 1, fontSize: 32 }} />
          <Typography variant="h6" noWrap component="div" color="primary.main">
            Music Scheduler
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List>
        {getMenuItems().map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );
  
  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          boxShadow: 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {getPageTitle()}
          </Typography>
          
          {/* Notifications icon */}
          <Tooltip title="Notifications">
            <IconButton
              size="large"
              color="inherit"
              onClick={() => navigate('/notifications')}
            >
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          {/* Profile menu */}
          <Tooltip title="Account">
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar
                sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}
                alt={user?.firstName}
              >
                {user?.firstName ? user.firstName[0] : 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
          >
            <MenuItem onClick={() => {
              handleProfileMenuClose();
              navigate('/profile');
            }}>
              <ListItemIcon>
                <AccountCircleIcon fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem onClick={() => {
              handleProfileMenuClose();
              handleLogout();
            }}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      {/* Drawer for navigation */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="navigation menu"
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Toolbar /> {/* Spacer to push content below the AppBar */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
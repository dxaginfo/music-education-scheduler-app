import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Snackbar,
  IconButton,
  Tooltip,
  Switch,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ContentCopy as ContentCopyIcon,
  Save as SaveIcon,
  Info as InfoIcon,
  WatchLater as WatchLaterIcon,
  CalendarMonth as CalendarMonthIcon,
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format, parse, addMinutes, isAfter, isBefore } from 'date-fns';

import { RootState } from '../../store';
import { teacherApi } from '../../services/api';

interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  recurring: boolean;
  date?: string;
}

interface AvailabilityDay {
  day: string;
  slots: TimeSlot[];
}

const weekDays = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

const TeacherAvailabilityPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  
  // State for availability data
  const [availabilityData, setAvailabilityData] = useState<AvailabilityDay[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  
  // State for tab selection
  const [tabValue, setTabValue] = useState(0);
  
  // State for time slot dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  
  // State for new/edited time slot
  const [slotType, setSlotType] = useState<'recurring' | 'single'>('recurring');
  const [selectedDay, setSelectedDay] = useState<string>('monday');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(new Date());
  const [endTime, setEndTime] = useState<Date | null>(new Date());
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  
  // Fetch teacher availability
  const fetchAvailability = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await teacherApi.getAvailability(user.id);
      setAvailabilityData(response.data.availability);
      
      // Transform availability data into calendar events
      const events = transformAvailabilityToEvents(response.data.availability);
      setCalendarEvents(events);
    } catch (err: any) {
      console.error('Error fetching availability:', err);
      setError(err.response?.data?.message || 'Failed to load availability data');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);
  
  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);
  
  // Transform availability data to calendar events
  const transformAvailabilityToEvents = (availability: AvailabilityDay[]) => {
    const events: any[] = [];
    
    availability.forEach((dayData) => {
      dayData.slots.forEach((slot) => {
        if (slot.recurring) {
          // For recurring slots, create events for the next 4 weeks
          for (let i = 0; i < 4; i++) {
            const date = new Date();
            date.setDate(date.getDate() + ((i * 7) + getDayIndex(slot.day) - date.getDay()));
            
            if (date.getDay() === getDayIndex(slot.day)) {
              const eventStart = combineDateAndTime(date, slot.startTime);
              const eventEnd = combineDateAndTime(date, slot.endTime);
              
              events.push({
                id: `${slot.id}-${i}`,
                title: 'Available',
                start: eventStart,
                end: eventEnd,
                backgroundColor: theme.palette.success.main,
                borderColor: theme.palette.success.dark,
                textColor: theme.palette.common.white,
                extendedProps: {
                  slotId: slot.id,
                  recurring: true,
                  day: slot.day,
                },
              });
            }
          }
        } else if (slot.date) {
          // For one-time slots
          const eventStart = combineDateAndTime(new Date(slot.date), slot.startTime);
          const eventEnd = combineDateAndTime(new Date(slot.date), slot.endTime);
          
          events.push({
            id: slot.id,
            title: 'Available',
            start: eventStart,
            end: eventEnd,
            backgroundColor: theme.palette.info.main,
            borderColor: theme.palette.info.dark,
            textColor: theme.palette.common.white,
            extendedProps: {
              slotId: slot.id,
              recurring: false,
            },
          });
        }
      });
    });
    
    return events;
  };
  
  // Helper function to get day index (0 = Sunday, 1 = Monday, etc.)
  const getDayIndex = (day: string) => {
    const dayMap: Record<string, number> = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };
    
    return dayMap[day.toLowerCase()] || 0;
  };
  
  // Helper function to combine date and time
  const combineDateAndTime = (date: Date, timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    return result;
  };
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Open dialog for adding a new time slot
  const handleAddSlot = () => {
    setIsEditing(false);
    setSelectedSlot(null);
    setSelectedSlotId(null);
    setSlotType('recurring');
    setSelectedDay('monday');
    setSelectedDate(new Date());
    
    // Set default time values (e.g., next hour, one hour duration)
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
    setStartTime(nextHour);
    
    const defaultEndTime = new Date(nextHour);
    defaultEndTime.setHours(defaultEndTime.getHours() + 1, 0, 0, 0);
    setEndTime(defaultEndTime);
    
    setDialogOpen(true);
  };
  
  // Open dialog for editing an existing time slot
  const handleEditSlot = (slot: TimeSlot) => {
    setIsEditing(true);
    setSelectedSlot(slot);
    setSelectedSlotId(slot.id);
    setSlotType(slot.recurring ? 'recurring' : 'single');
    
    if (slot.recurring) {
      setSelectedDay(slot.day);
      setSelectedDate(null);
    } else if (slot.date) {
      setSelectedDate(new Date(slot.date));
    }
    
    // Parse time strings to Date objects for the pickers
    const today = new Date();
    const parsedStartTime = parse(slot.startTime, 'HH:mm', today);
    const parsedEndTime = parse(slot.endTime, 'HH:mm', today);
    
    setStartTime(parsedStartTime);
    setEndTime(parsedEndTime);
    
    setDialogOpen(true);
  };
  
  // Handle dialog close
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  
  // Handle slot type change (recurring or single)
  const handleSlotTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSlotType(event.target.value as 'recurring' | 'single');
  };
  
  // Handle day selection change
  const handleDayChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDay(event.target.value);
  };
  
  // Validate time slot
  const validateTimeSlot = () => {
    if (!startTime || !endTime) {
      return 'Start and end times are required';
    }
    
    if (slotType === 'single' && !selectedDate) {
      return 'Date is required for one-time availability';
    }
    
    if (isAfter(startTime, endTime) || startTime.getTime() === endTime.getTime()) {
      return 'End time must be after start time';
    }
    
    // Check for minimum slot duration (e.g., 15 minutes)
    const minimumDuration = 15; // minutes
    const durationInMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
    if (durationInMinutes < minimumDuration) {
      return `Time slot must be at least ${minimumDuration} minutes long`;
    }
    
    return null;
  };
  
  // Save the time slot
  const handleSaveSlot = async () => {
    const validationError = validateTimeSlot();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    if (!user?.id || !startTime || !endTime) return;
    
    const formattedStartTime = format(startTime, 'HH:mm');
    const formattedEndTime = format(endTime, 'HH:mm');
    
    const newSlot: TimeSlot = {
      id: selectedSlotId || `slot-${Date.now()}`,
      day: slotType === 'recurring' ? selectedDay : '',
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      recurring: slotType === 'recurring',
      date: slotType === 'single' && selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined,
    };
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Clone current availability data
      const updatedAvailability = [...availabilityData];
      
      if (isEditing && selectedSlot) {
        // Update existing slot
        if (selectedSlot.recurring !== newSlot.recurring) {
          // If slot type changed, remove old and add new
          const dayIndex = updatedAvailability.findIndex(day => day.day === selectedSlot.day);
          if (dayIndex !== -1) {
            const slotIndex = updatedAvailability[dayIndex].slots.findIndex(s => s.id === selectedSlot.id);
            if (slotIndex !== -1) {
              updatedAvailability[dayIndex].slots.splice(slotIndex, 1);
            }
          }
          
          // Add to new day
          if (newSlot.recurring) {
            const targetDayIndex = updatedAvailability.findIndex(day => day.day === newSlot.day);
            if (targetDayIndex !== -1) {
              updatedAvailability[targetDayIndex].slots.push(newSlot);
            } else {
              updatedAvailability.push({
                day: newSlot.day,
                slots: [newSlot],
              });
            }
          } else {
            // For one-time slots, use a special "oneTime" category
            const oneTimeDayIndex = updatedAvailability.findIndex(day => day.day === 'oneTime');
            if (oneTimeDayIndex !== -1) {
              updatedAvailability[oneTimeDayIndex].slots.push(newSlot);
            } else {
              updatedAvailability.push({
                day: 'oneTime',
                slots: [newSlot],
              });
            }
          }
        } else {
          // Same slot type, just update properties
          if (newSlot.recurring) {
            const oldDayIndex = updatedAvailability.findIndex(day => day.day === selectedSlot.day);
            const newDayIndex = updatedAvailability.findIndex(day => day.day === newSlot.day);
            
            if (oldDayIndex !== -1 && newDayIndex !== -1 && oldDayIndex !== newDayIndex) {
              // Day changed, remove from old and add to new
              const slotIndex = updatedAvailability[oldDayIndex].slots.findIndex(s => s.id === selectedSlot.id);
              if (slotIndex !== -1) {
                updatedAvailability[oldDayIndex].slots.splice(slotIndex, 1);
                updatedAvailability[newDayIndex].slots.push(newSlot);
              }
            } else if (oldDayIndex !== -1) {
              // Same day, update slot
              const slotIndex = updatedAvailability[oldDayIndex].slots.findIndex(s => s.id === selectedSlot.id);
              if (slotIndex !== -1) {
                updatedAvailability[oldDayIndex].slots[slotIndex] = newSlot;
              }
            }
          } else {
            // One-time slot update
            const oneTimeDayIndex = updatedAvailability.findIndex(day => day.day === 'oneTime');
            if (oneTimeDayIndex !== -1) {
              const slotIndex = updatedAvailability[oneTimeDayIndex].slots.findIndex(s => s.id === selectedSlot.id);
              if (slotIndex !== -1) {
                updatedAvailability[oneTimeDayIndex].slots[slotIndex] = newSlot;
              }
            }
          }
        }
      } else {
        // Add new slot
        if (newSlot.recurring) {
          const dayIndex = updatedAvailability.findIndex(day => day.day === newSlot.day);
          if (dayIndex !== -1) {
            updatedAvailability[dayIndex].slots.push(newSlot);
          } else {
            updatedAvailability.push({
              day: newSlot.day,
              slots: [newSlot],
            });
          }
        } else {
          // For one-time slots, use a special "oneTime" category
          const oneTimeDayIndex = updatedAvailability.findIndex(day => day.day === 'oneTime');
          if (oneTimeDayIndex !== -1) {
            updatedAvailability[oneTimeDayIndex].slots.push(newSlot);
          } else {
            updatedAvailability.push({
              day: 'oneTime',
              slots: [newSlot],
            });
          }
        }
      }
      
      // Save updated availability to the server
      await teacherApi.updateAvailability(user.id, { availability: updatedAvailability });
      
      // Update local state
      setAvailabilityData(updatedAvailability);
      
      // Update calendar events
      const events = transformAvailabilityToEvents(updatedAvailability);
      setCalendarEvents(events);
      
      setSaveSuccess('Availability updated successfully');
      setDialogOpen(false);
    } catch (err: any) {
      console.error('Error updating availability:', err);
      setError(err.response?.data?.message || 'Failed to update availability');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete a time slot
  const handleDeleteSlot = async (slot: TimeSlot) => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Clone current availability data
      const updatedAvailability = [...availabilityData];
      
      // Find and remove the slot
      const dayIndex = updatedAvailability.findIndex(day => 
        day.day === slot.day || (slot.date && day.day === 'oneTime')
      );
      
      if (dayIndex !== -1) {
        const slotIndex = updatedAvailability[dayIndex].slots.findIndex(s => s.id === slot.id);
        if (slotIndex !== -1) {
          updatedAvailability[dayIndex].slots.splice(slotIndex, 1);
          
          // If no slots left for this day, remove the day
          if (updatedAvailability[dayIndex].slots.length === 0) {
            updatedAvailability.splice(dayIndex, 1);
          }
          
          // Save updated availability to the server
          await teacherApi.updateAvailability(user.id, { availability: updatedAvailability });
          
          // Update local state
          setAvailabilityData(updatedAvailability);
          
          // Update calendar events
          const events = transformAvailabilityToEvents(updatedAvailability);
          setCalendarEvents(events);
          
          setSaveSuccess('Time slot deleted successfully');
        }
      }
    } catch (err: any) {
      console.error('Error deleting time slot:', err);
      setError(err.response?.data?.message || 'Failed to delete time slot');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle calendar date click
  const handleDateClick = (info: any) => {
    // When clicking on a date in the calendar, open dialog to add availability
    setIsEditing(false);
    setSelectedSlot(null);
    setSelectedSlotId(null);
    setSlotType('single');
    
    const clickedDate = new Date(info.date);
    setSelectedDate(clickedDate);
    
    // Set default start time to the clicked time, rounded to nearest 15 minutes
    const minutes = Math.ceil(clickedDate.getMinutes() / 15) * 15;
    const roundedTime = new Date(clickedDate);
    roundedTime.setMinutes(minutes, 0, 0);
    setStartTime(roundedTime);
    
    // Set default end time to 1 hour after start time
    const defaultEndTime = new Date(roundedTime);
    defaultEndTime.setHours(defaultEndTime.getHours() + 1);
    setEndTime(defaultEndTime);
    
    setDialogOpen(true);
  };
  
  // Handle calendar event click
  const handleEventClick = (info: any) => {
    const { extendedProps } = info.event;
    const { slotId, recurring, day } = extendedProps;
    
    // Find the slot by ID
    let selectedSlot: TimeSlot | null = null;
    
    availabilityData.forEach((dayData) => {
      dayData.slots.forEach((slot) => {
        if (slot.id === slotId) {
          selectedSlot = slot;
        }
      });
    });
    
    if (selectedSlot) {
      handleEditSlot(selectedSlot);
    }
  };
  
  // Clear success message after a delay
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => {
        setSaveSuccess(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);
  
  // Render time slots for each day
  const renderDaySlots = (day: string) => {
    const dayData = availabilityData.find(d => d.day === day);
    
    if (!dayData || dayData.slots.length === 0) {
      return (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography color="text.secondary">No availability set</Typography>
        </Box>
      );
    }
    
    return (
      <Box sx={{ p: 1 }}>
        {dayData.slots.map((slot) => (
          <Box
            key={slot.id}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 1,
              mb: 1,
              bgcolor: 'background.paper',
              borderRadius: 1,
              boxShadow: 1,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessTimeIcon sx={{ color: 'primary.main', mr: 1 }} />
              <Typography>{`${slot.startTime} - ${slot.endTime}`}</Typography>
            </Box>
            <Box>
              <Tooltip title="Edit">
                <IconButton size="small" onClick={() => handleEditSlot(slot)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton size="small" onClick={() => handleDeleteSlot(slot)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        ))}
      </Box>
    );
  };
  
  // Render one-time slots
  const renderOneTimeSlots = () => {
    const oneTimeData = availabilityData.find(d => d.day === 'oneTime');
    
    if (!oneTimeData || oneTimeData.slots.length === 0) {
      return (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography color="text.secondary">No one-time availability set</Typography>
        </Box>
      );
    }
    
    // Group slots by date
    const slotsByDate: Record<string, TimeSlot[]> = {};
    
    oneTimeData.slots.forEach((slot) => {
      if (slot.date) {
        if (!slotsByDate[slot.date]) {
          slotsByDate[slot.date] = [];
        }
        slotsByDate[slot.date].push(slot);
      }
    });
    
    return (
      <Box sx={{ p: 1 }}>
        {Object.entries(slotsByDate).map(([date, slots]) => (
          <Box key={date} sx={{ mb: 2 }}>
            <Typography
              variant="subtitle2"
              sx={{
                bgcolor: 'primary.light',
                color: 'primary.contrastText',
                p: 1,
                borderRadius: '4px 4px 0 0',
              }}
            >
              {new Date(date).toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Typography>
            {slots.map((slot) => (
              <Box
                key={slot.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 1,
                  mb: 1,
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  boxShadow: 1,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccessTimeIcon sx={{ color: 'info.main', mr: 1 }} />
                  <Typography>{`${slot.startTime} - ${slot.endTime}`}</Typography>
                </Box>
                <Box>
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => handleEditSlot(slot)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" onClick={() => handleDeleteSlot(slot)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    );
  };
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Manage Your Availability
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Snackbar
        open={!!saveSuccess}
        autoHideDuration={3000}
        message={saveSuccess}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="availability tabs"
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons={isMobile ? 'auto' : undefined}
        >
          <Tab
            icon={<CalendarMonthIcon />}
            iconPosition="start"
            label="Calendar View"
            id="tab-0"
            aria-controls="tabpanel-0"
          />
          <Tab
            icon={<WatchLaterIcon />}
            iconPosition="start"
            label="Weekly Schedule"
            id="tab-1"
            aria-controls="tabpanel-1"
          />
        </Tabs>
      </Box>
      
      <Box
        role="tabpanel"
        hidden={tabValue !== 0}
        id="tabpanel-0"
        aria-labelledby="tab-0"
      >
        {tabValue === 0 && (
          <Paper elevation={2} sx={{ p: 2 }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Calendar View</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddSlot}
                disabled={isLoading}
              >
                Add Availability
              </Button>
            </Box>
            
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box>
                <FullCalendar
                  plugins={[timeGridPlugin, interactionPlugin]}
                  initialView="timeGridWeek"
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'timeGridWeek,timeGridDay',
                  }}
                  events={calendarEvents}
                  eventClick={handleEventClick}
                  dateClick={handleDateClick}
                  allDaySlot={false}
                  slotMinTime="07:00:00"
                  slotMaxTime="22:00:00"
                  height="auto"
                  aspectRatio={isMobile ? 0.8 : 1.35}
                />
              </Box>
            )}
          </Paper>
        )}
      </Box>
      
      <Box
        role="tabpanel"
        hidden={tabValue !== 1}
        id="tabpanel-1"
        aria-labelledby="tab-1"
      >
        {tabValue === 1 && (
          <Paper elevation={2} sx={{ p: 2 }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Weekly Schedule</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddSlot}
                disabled={isLoading}
              >
                Add Availability
              </Button>
            </Box>
            
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12} md={7}>
                  <Typography variant="h6" gutterBottom>
                    Recurring Weekly Availability
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    {weekDays.map((day) => (
                      <Box key={day.value} sx={{ mb: 2 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            p: 1,
                            borderRadius: '4px 4px 0 0',
                          }}
                        >
                          {day.label}
                        </Typography>
                        {renderDaySlots(day.value)}
                      </Box>
                    ))}
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={5}>
                  <Typography variant="h6" gutterBottom>
                    One-Time Availability
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    {renderOneTimeSlots()}
                  </Box>
                </Grid>
              </Grid>
            )}
          </Paper>
        )}
      </Box>
      
      {/* Time Slot Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isEditing ? 'Edit Availability' : 'Add Availability'}
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <FormLabel component="legend">Availability Type</FormLabel>
              <RadioGroup
                row
                name="slot-type"
                value={slotType}
                onChange={handleSlotTypeChange}
              >
                <FormControlLabel
                  value="recurring"
                  control={<Radio />}
                  label="Weekly recurring"
                />
                <FormControlLabel
                  value="single"
                  control={<Radio />}
                  label="One-time only"
                />
              </RadioGroup>
            </FormControl>
            
            {slotType === 'recurring' ? (
              <FormControl fullWidth sx={{ mb: 3 }}>
                <FormLabel>Day of Week</FormLabel>
                <RadioGroup
                  row
                  name="day-select"
                  value={selectedDay}
                  onChange={handleDayChange}
                >
                  {weekDays.map((day) => (
                    <FormControlLabel
                      key={day.value}
                      value={day.value}
                      control={<Radio />}
                      label={day.label.substring(0, 3)}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            ) : (
              <Box sx={{ mb: 3 }}>
                <FormLabel>Date</FormLabel>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    value={selectedDate}
                    onChange={(newDate) => setSelectedDate(newDate)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        margin: 'normal',
                      },
                    }}
                    disablePast
                  />
                </LocalizationProvider>
              </Box>
            )}
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <FormLabel>Start Time</FormLabel>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <TimePicker
                    value={startTime}
                    onChange={(newTime) => setStartTime(newTime)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        margin: 'normal',
                      },
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormLabel>End Time</FormLabel>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <TimePicker
                    value={endTime}
                    onChange={(newTime) => setEndTime(newTime)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        margin: 'normal',
                      },
                    }}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSaveSlot}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeacherAvailabilityPage;
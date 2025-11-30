import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { attendanceService } from '../../services/attendanceService';

const initialState = {
  todayStatus: null,
  history: [],
  summary: null,
  loading: false,
  error: null
};

// Async thunks
export const checkIn = createAsyncThunk(
  'attendance/checkIn',
  async (_, { rejectWithValue }) => {
    try {
      const response = await attendanceService.checkIn();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Check-in failed');
    }
  }
);

export const checkOut = createAsyncThunk(
  'attendance/checkOut',
  async (_, { rejectWithValue }) => {
    try {
      const response = await attendanceService.checkOut();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Check-out failed');
    }
  }
);

export const getTodayStatus = createAsyncThunk(
  'attendance/getTodayStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await attendanceService.getToday();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get today status');
    }
  }
);

export const getMyHistory = createAsyncThunk(
  'attendance/getMyHistory',
  async ({ month, year }, { rejectWithValue }) => {
    try {
      const response = await attendanceService.getMyHistory(month, year);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get history');
    }
  }
);

export const getMySummary = createAsyncThunk(
  'attendance/getMySummary',
  async ({ month, year }, { rejectWithValue }) => {
    try {
      const response = await attendanceService.getMySummary(month, year);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get summary');
    }
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Check In
      .addCase(checkIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkIn.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.todayStatus = {
          checkedIn: true,
          checkedOut: false,
          checkInTime: action.payload.checkInTime,
          status: action.payload.status
        };
      })
      .addCase(checkIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Check Out
      .addCase(checkOut.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkOut.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.todayStatus = {
          checkedIn: true,
          checkedOut: true,
          checkInTime: action.payload.checkInTime,
          checkOutTime: action.payload.checkOutTime,
          totalHours: action.payload.totalHours,
          status: action.payload.status
        };
      })
      .addCase(checkOut.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Today Status
      .addCase(getTodayStatus.fulfilled, (state, action) => {
        state.todayStatus = action.payload;
      })
      // Get My History
      .addCase(getMyHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMyHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload;
      })
      .addCase(getMyHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get My Summary
      .addCase(getMySummary.fulfilled, (state, action) => {
        state.summary = action.payload;
      });
  }
});

export const { clearError } = attendanceSlice.actions;
export default attendanceSlice.reducer;


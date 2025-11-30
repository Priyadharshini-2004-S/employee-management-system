import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { getMyHistory, getMySummary } from '../../store/slices/attendanceSlice';
import { FiCalendar, FiList, FiCheckCircle, FiXCircle, FiAlertCircle, FiClock } from 'react-icons/fi';
import LoadingSpinner from '../../components/LoadingSpinner';
import { format } from 'date-fns';

const AttendanceHistory = () => {
  const dispatch = useDispatch();
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('calendar');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const { history, summary, loading } = useSelector((state) => state.attendance);

  useEffect(() => {
    const month = selectedMonth.getMonth() + 1;
    const year = selectedMonth.getFullYear();
    dispatch(getMyHistory({ month, year }));
    dispatch(getMySummary({ month, year }));
  }, [dispatch, selectedMonth]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-500';
      case 'late':
        return 'bg-yellow-500';
      case 'absent':
        return 'bg-red-500';
      case 'half-day':
        return 'bg-orange-500';
      default:
        return 'bg-gray-300';
    }
  };

  const tileClassName = ({ date }) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const attendance = history?.find(att => {
      const attDate = format(new Date(att.date), 'yyyy-MM-dd');
      return attDate === dateStr;
    });
    
    if (attendance) {
      return getStatusColor(attendance.status);
    }
    return null;
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const getAttendanceForDate = (date) => {
    if (!date || !history) return null;
    const dateStr = format(date, 'yyyy-MM-dd');
    return history.find(att => {
      const attDate = format(new Date(att.date), 'yyyy-MM-dd');
      return attDate === dateStr;
    });
  };

  const handleMonthChange = (date) => {
    setSelectedMonth(date);
    setSelectedDate(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Attendance History</h1>
        <p className="text-gray-600 mt-1">View your attendance records by month</p>
      </div>

      {/* Month Selector and View Toggle */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <FiCalendar className="text-blue-600 text-xl" />
            <label className="text-sm font-medium text-gray-700">Month:</label>
            <input
              type="month"
              value={format(selectedMonth, 'yyyy-MM')}
              onChange={(e) => {
                const [year, month] = e.target.value.split('-');
                handleMonthChange(new Date(year, month - 1));
              }}
              className="input-field"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                viewMode === 'calendar' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FiCalendar />
              <span>Calendar</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                viewMode === 'table' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FiList />
              <span>Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card bg-green-50 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Present</p>
                <p className="text-2xl font-bold text-green-600">{summary.present}</p>
              </div>
              <FiCheckCircle className="text-3xl text-green-500" />
            </div>
          </div>
          <div className="card bg-red-50 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Absent</p>
                <p className="text-2xl font-bold text-red-600">{summary.absent}</p>
              </div>
              <FiXCircle className="text-3xl text-red-500" />
            </div>
          </div>
          <div className="card bg-yellow-50 border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Late</p>
                <p className="text-2xl font-bold text-yellow-600">{summary.late}</p>
              </div>
              <FiAlertCircle className="text-3xl text-yellow-500" />
            </div>
          </div>
          <div className="card bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold text-blue-600">{summary.totalHours || 0}</p>
              </div>
              <FiClock className="text-3xl text-blue-500" />
            </div>
          </div>
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="card">
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              <div className="flex justify-center mb-6">
                <Calendar
                  onChange={handleDateClick}
                  value={selectedDate}
                  tileClassName={tileClassName}
                  className="w-full max-w-md"
                />
              </div>
              
              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-4 mt-6">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                  <span className="text-sm">Present</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                  <span className="text-sm">Late</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                  <span className="text-sm">Absent</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-orange-500 rounded mr-2"></div>
                  <span className="text-sm">Half Day</span>
                </div>
              </div>

              {/* Selected Date Details */}
              {selectedDate && (
                <div className="mt-6 card bg-gray-50">
                  <h3 className="font-semibold mb-3 text-lg">
                    {format(selectedDate, 'MMMM dd, yyyy')}
                  </h3>
                  {getAttendanceForDate(selectedDate) ? (
                    <div className="space-y-2 text-sm">
                      <p>
                        Status: <span className="font-semibold">{getAttendanceForDate(selectedDate).status}</span>
                      </p>
                      {getAttendanceForDate(selectedDate).checkInTime && (
                        <p className="flex items-center">
                          <FiClock className="mr-2" />
                          Check In: {format(new Date(getAttendanceForDate(selectedDate).checkInTime), 'hh:mm a')}
                        </p>
                      )}
                      {getAttendanceForDate(selectedDate).checkOutTime && (
                        <p className="flex items-center">
                          <FiClock className="mr-2" />
                          Check Out: {format(new Date(getAttendanceForDate(selectedDate).checkOutTime), 'hh:mm a')}
                        </p>
                      )}
                      {getAttendanceForDate(selectedDate).totalHours && (
                        <p>
                          Total Hours: {getAttendanceForDate(selectedDate).totalHours} hrs
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">No attendance record for this date</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Check In</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Check Out</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Hours</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <LoadingSpinner />
                    </td>
                  </tr>
                ) : history && history.length > 0 ? (
                  history.map((attendance, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {format(new Date(attendance.date), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {attendance.checkInTime ? format(new Date(attendance.checkInTime), 'hh:mm a') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {attendance.checkOutTime ? format(new Date(attendance.checkOutTime), 'hh:mm a') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          attendance.status === 'present' ? 'bg-green-100 text-green-800' :
                          attendance.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                          attendance.status === 'absent' ? 'bg-red-100 text-red-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {attendance.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {attendance.totalHours || 0} hrs
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      No attendance records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceHistory;

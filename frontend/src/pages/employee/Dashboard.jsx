import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getEmployeeDashboard } from '../../store/slices/dashboardSlice';
import { getTodayStatus, checkIn, checkOut } from '../../store/slices/attendanceSlice';
import { toast } from 'react-toastify';
import { 
  FiCheckCircle, 
  FiXCircle, 
  FiClock, 
  FiCalendar,
  FiTrendingUp,
  FiAlertCircle
} from 'react-icons/fi';
import StatsCard from '../../components/StatsCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { format } from 'date-fns';

const EmployeeDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { employeeDashboard, loading, error } = useSelector((state) => state.dashboard);
  const { todayStatus, loading: attendanceLoading } = useSelector((state) => state.attendance);

  useEffect(() => {
    dispatch(getEmployeeDashboard());
    dispatch(getTodayStatus());
  }, [dispatch]);

  const handleCheckIn = () => {
    dispatch(checkIn()).then((result) => {
      if (result.type.includes('fulfilled')) {
        toast.success('Checked in successfully!');
        dispatch(getTodayStatus());
        dispatch(getEmployeeDashboard());
      } else {
        toast.error(result.payload || 'Failed to check in');
      }
    });
  };

  const handleCheckOut = () => {
    dispatch(checkOut()).then((result) => {
      if (result.type.includes('fulfilled')) {
        toast.success('Checked out successfully!');
        dispatch(getTodayStatus());
        dispatch(getEmployeeDashboard());
      } else {
        toast.error(result.payload || 'Failed to check out');
      }
    });
  };

  if (loading && !employeeDashboard) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your attendance overview.</p>
        </div>
      </div>

      {/* Today's Status Card */}
      <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
              <FiCalendar className="mr-2 text-blue-600" />
              Today's Status
            </h2>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                {todayStatus?.checkedIn ? (
                  <FiCheckCircle className="text-green-500 text-xl" />
                ) : (
                  <FiXCircle className="text-red-500 text-xl" />
                )}
                <span className={`font-semibold text-lg ${
                  todayStatus?.status === 'present' ? 'text-green-600' : 
                  todayStatus?.status === 'late' ? 'text-yellow-600' : 
                  'text-red-600'
                }`}>
                  {todayStatus?.checkedIn ? (todayStatus?.checkedOut ? 'Checked Out' : 'Checked In') : 'Not Checked In'}
                </span>
              </div>
              {todayStatus?.checkInTime && (
                <p className="text-sm text-gray-600 flex items-center">
                  <FiClock className="mr-1" />
                  Check In: {format(new Date(todayStatus.checkInTime), 'hh:mm a')}
                </p>
              )}
              {todayStatus?.checkOutTime && (
                <p className="text-sm text-gray-600 flex items-center">
                  <FiClock className="mr-1" />
                  Check Out: {format(new Date(todayStatus.checkOutTime), 'hh:mm a')}
                </p>
              )}
            </div>
          </div>
          <div className="flex space-x-3">
            {!todayStatus?.checkedIn && (
              <button
                onClick={handleCheckIn}
                disabled={attendanceLoading}
                className="btn-success flex items-center space-x-2"
              >
                {attendanceLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <FiCheckCircle />
                    <span>Check In</span>
                  </>
                )}
              </button>
            )}
            {todayStatus?.checkedIn && !todayStatus?.checkedOut && (
              <button
                onClick={handleCheckOut}
                disabled={attendanceLoading}
                className="btn-danger flex items-center space-x-2"
              >
                {attendanceLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <FiXCircle />
                    <span>Check Out</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Summary Cards */}
      {employeeDashboard?.monthlySummary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Present Days"
            value={employeeDashboard.monthlySummary.present}
            subtitle="This month"
            color="green"
            icon={<FiCheckCircle className="w-6 h-6" />}
          />
          <StatsCard
            title="Absent Days"
            value={employeeDashboard.monthlySummary.absent}
            subtitle="This month"
            color="red"
            icon={<FiXCircle className="w-6 h-6" />}
          />
          <StatsCard
            title="Late Days"
            value={employeeDashboard.monthlySummary.late}
            subtitle="This month"
            color="yellow"
            icon={<FiAlertCircle className="w-6 h-6" />}
          />
          <StatsCard
            title="Total Hours"
            value={employeeDashboard.monthlySummary.totalHours}
            subtitle="This month"
            color="blue"
            icon={<FiClock className="w-6 h-6" />}
          />
        </div>
      )}

      {/* Recent Attendance */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <FiTrendingUp className="mr-2 text-blue-600" />
            Recent Attendance (Last 7 Days)
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Check In</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Check Out</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Hours</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employeeDashboard?.recentAttendance?.length > 0 ? (
                employeeDashboard.recentAttendance.map((attendance, index) => (
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
                    No recent attendance records
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;

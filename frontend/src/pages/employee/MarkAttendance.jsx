import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkIn, checkOut, getTodayStatus } from '../../store/slices/attendanceSlice';
import { toast } from 'react-toastify';
import { FiClock, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import LoadingSpinner from '../../components/LoadingSpinner';
import { format } from 'date-fns';

const MarkAttendance = () => {
  const dispatch = useDispatch();
  const [currentTime, setCurrentTime] = useState(new Date());
  const { todayStatus, loading, error } = useSelector((state) => state.attendance);

  useEffect(() => {
    dispatch(getTodayStatus());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, [dispatch]);

  const handleCheckIn = () => {
    dispatch(checkIn()).then((result) => {
      if (result.type.includes('fulfilled')) {
        toast.success('Checked in successfully!');
        dispatch(getTodayStatus());
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
      } else {
        toast.error(result.payload || 'Failed to check out');
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'late':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'absent':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mark Attendance</h1>
        <p className="text-gray-600 mt-1">Record your check-in and check-out times</p>
      </div>

      {/* Current Time Display */}
      <div className="card bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4">
            <FiClock className="text-4xl" />
          </div>
          <p className="text-gray-200 mb-2 text-sm font-medium">Current Time</p>
          <p className="text-5xl font-bold mb-2">{format(currentTime, 'hh:mm:ss a')}</p>
          <p className="text-lg text-gray-200">{format(currentTime, 'EEEE, MMMM dd, yyyy')}</p>
        </div>
      </div>

      {/* Today's Status */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FiAlertCircle className="mr-2 text-blue-600" />
          Today's Status
        </h2>
        <div className={`p-4 rounded-lg border-2 ${getStatusColor(todayStatus?.status || 'absent')}`}>
          <div className="space-y-2">
            <p className="font-semibold text-lg">
              Status: <span className="uppercase">{todayStatus?.status || 'NOT CHECKED IN'}</span>
            </p>
            {todayStatus?.checkInTime && (
              <p className="text-sm flex items-center">
                <FiCheckCircle className="mr-2" />
                Check In Time: <span className="font-semibold ml-1">
                  {format(new Date(todayStatus.checkInTime), 'hh:mm a')}
                </span>
              </p>
            )}
            {todayStatus?.checkOutTime && (
              <p className="text-sm flex items-center">
                <FiXCircle className="mr-2" />
                Check Out Time: <span className="font-semibold ml-1">
                  {format(new Date(todayStatus.checkOutTime), 'hh:mm a')}
                </span>
              </p>
            )}
            {todayStatus?.totalHours && (
              <p className="text-sm flex items-center">
                <FiClock className="mr-2" />
                Total Hours: <span className="font-semibold ml-1">{todayStatus.totalHours} hrs</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
        {!todayStatus?.checkedIn && (
          <button
            onClick={handleCheckIn}
            disabled={loading}
            className="btn-success text-xl px-12 py-6 flex items-center space-x-3"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <FiCheckCircle className="text-2xl" />
                <span>Check In</span>
              </>
            )}
          </button>
        )}
        
        {todayStatus?.checkedIn && !todayStatus?.checkedOut && (
          <button
            onClick={handleCheckOut}
            disabled={loading}
            className="btn-danger text-xl px-12 py-6 flex items-center space-x-3"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <FiXCircle className="text-2xl" />
                <span>Check Out</span>
              </>
            )}
          </button>
        )}

        {todayStatus?.checkedOut && (
          <div className="card bg-gray-50 text-center">
            <FiCheckCircle className="text-4xl text-green-500 mx-auto mb-2" />
            <p className="text-gray-700 text-lg font-semibold">You have already checked out for today.</p>
            <p className="text-gray-500 text-sm mt-1">Thank you for your work today!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkAttendance;

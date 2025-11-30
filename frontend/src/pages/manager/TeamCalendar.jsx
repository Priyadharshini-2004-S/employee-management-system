import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { attendanceService } from '../../services/attendanceService';
import { toast } from 'react-toastify';
import { FiCalendar, FiUsers, FiBriefcase, FiClock, FiCheckCircle } from 'react-icons/fi';
import LoadingSpinner from '../../components/LoadingSpinner';
import { format } from 'date-fns';

const TeamCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employees, setEmployees] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');

  useEffect(() => {
    fetchAttendance();
    fetchEmployees();
  }, [selectedEmployee, selectedDepartment]);

  const fetchEmployees = async () => {
    try {
      const data = await attendanceService.getAllAttendance({});
      const uniqueEmployees = Array.from(
        new Map(data.map(item => [item.userId?._id, item.userId])).values()
      ).filter(Boolean);
      setEmployees(uniqueEmployees);
    } catch (err) {
      toast.error('Failed to fetch employees');
    }
  };

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (selectedEmployee) filters.employeeId = selectedEmployee;
      const data = await attendanceService.getAllAttendance(filters);
      setAttendance(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  };

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
    const dayAttendance = attendance.filter(att => {
      const attDate = format(new Date(att.date), 'yyyy-MM-dd');
      if (attDate !== dateStr) return false;
      if (selectedEmployee && att.userId?.employeeId !== selectedEmployee) return false;
      if (selectedDepartment && att.userId?.department !== selectedDepartment) return false;
      return true;
    });

    if (dayAttendance.length === 0) return null;
    
    const statuses = dayAttendance.map(a => a.status);
    if (statuses.every(s => s === 'present')) return 'bg-green-500';
    if (statuses.some(s => s === 'late')) return 'bg-yellow-500';
    if (statuses.some(s => s === 'absent')) return 'bg-red-500';
    return 'bg-gray-300';
  };

  const getAttendanceForDate = (date) => {
    if (!date) return [];
    const dateStr = format(date, 'yyyy-MM-dd');
    return attendance.filter(att => {
      const attDate = format(new Date(att.date), 'yyyy-MM-dd');
      return attDate === dateStr;
    });
  };

  const uniqueDepartments = [...new Set(employees.map(emp => emp.department))].filter(Boolean);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Team Calendar View</h1>
        <p className="text-gray-600 mt-1">View team attendance in calendar format</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center mb-4">
          <FiUsers className="text-blue-600 text-xl mr-2" />
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Employee</label>
            <div className="relative">
              <FiUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="input-field pl-10"
              >
                <option value="">All Employees</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp.employeeId}>
                    {emp.name} ({emp.employeeId})
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Department</label>
            <div className="relative">
              <FiBriefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="input-field pl-10"
              >
                <option value="">All Departments</option>
                {uniqueDepartments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="card">
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <Calendar
                onChange={setSelectedDate}
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
          </>
        )}
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FiCalendar className="mr-2 text-blue-600" />
            Attendance for {format(selectedDate, 'MMMM dd, yyyy')}
          </h2>
          {getAttendanceForDate(selectedDate).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Employee ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Check In</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Check Out</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Hours</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getAttendanceForDate(selectedDate).map((att, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {att.userId?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {att.userId?.employeeId || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {att.userId?.department || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {att.checkInTime ? format(new Date(att.checkInTime), 'hh:mm a') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {att.checkOutTime ? format(new Date(att.checkOutTime), 'hh:mm a') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          att.status === 'present' ? 'bg-green-100 text-green-800' :
                          att.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                          att.status === 'absent' ? 'bg-red-100 text-red-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {att.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {att.totalHours || 0} hrs
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No attendance records for this date</p>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamCalendar;

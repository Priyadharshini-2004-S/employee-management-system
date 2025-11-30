import { useState, useEffect } from 'react';
import { attendanceService } from '../../services/attendanceService';
import { toast } from 'react-toastify';
import { FiFilter, FiRefreshCw, FiSearch, FiUsers, FiCalendar, FiCheckCircle } from 'react-icons/fi';
import LoadingSpinner from '../../components/LoadingSpinner';
import { format } from 'date-fns';

const AllAttendance = () => {
  const [filters, setFilters] = useState({
    employeeId: '',
    startDate: '',
    endDate: '',
    status: ''
  });
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetchAttendance();
    fetchEmployees();
  }, []);

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
      const data = await attendanceService.getAllAttendance(filters);
      setAttendance(data);
      if (data.length === 0) {
        toast.info('No attendance records found with the selected filters');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    fetchAttendance();
  };

  const handleResetFilters = () => {
    setFilters({
      employeeId: '',
      startDate: '',
      endDate: '',
      status: ''
    });
    setTimeout(() => fetchAttendance(), 100);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">All Employees Attendance</h1>
        <p className="text-gray-600 mt-1">View and filter attendance records for all employees</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center mb-4">
          <FiFilter className="text-blue-600 text-xl mr-2" />
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>
        <form onSubmit={handleApplyFilters} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
            <div className="relative">
              <FiUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                name="employeeId"
                value={filters.employeeId}
                onChange={handleFilterChange}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="input-field pl-10"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="input-field pl-10"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="input-field"
            >
              <option value="">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="half-day">Half Day</option>
            </select>
          </div>
          
          <div className="md:col-span-4 flex space-x-4">
            <button
              type="submit"
              className="btn-primary flex items-center space-x-2"
            >
              <FiSearch />
              <span>Apply Filters</span>
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="flex items-center space-x-2 px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all"
            >
              <FiRefreshCw />
              <span>Reset</span>
            </button>
          </div>
        </form>
      </div>

      {/* Attendance Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
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
                {attendance.length > 0 ? (
                  attendance.map((att, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {format(new Date(att.date), 'MMM dd, yyyy')}
                      </td>
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
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                      No attendance records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllAttendance;

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getManagerDashboard } from '../../store/slices/dashboardSlice';
import { toast } from 'react-toastify';
import { 
  FiUsers, 
  FiCheckCircle, 
  FiXCircle, 
  FiAlertCircle,
  FiTrendingUp,
  FiBarChart2
} from 'react-icons/fi';
import StatsCard from '../../components/StatsCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const ManagerDashboard = () => {
  const dispatch = useDispatch();
  const { managerDashboard, loading, error } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(getManagerDashboard());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  if (loading && !managerDashboard) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of team attendance and statistics</p>
      </div>

      {/* Stats Cards */}
      {managerDashboard && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatsCard
            title="Total Employees"
            value={managerDashboard.totalEmployees}
            color="blue"
            icon={<FiUsers className="w-6 h-6" />}
          />
          <StatsCard
            title="Present Today"
            value={managerDashboard.todayAttendance.present}
            subtitle="Checked in"
            color="green"
            icon={<FiCheckCircle className="w-6 h-6" />}
          />
          <StatsCard
            title="Absent Today"
            value={managerDashboard.todayAttendance.absent}
            subtitle="Not checked in"
            color="red"
            icon={<FiXCircle className="w-6 h-6" />}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend Chart */}
        {managerDashboard?.weeklyTrend && (
          <div className="card">
            <div className="flex items-center mb-4">
              <FiTrendingUp className="text-blue-600 text-xl mr-2" />
              <h2 className="text-xl font-semibold">Weekly Attendance Trend</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={managerDashboard.weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Line type="monotone" dataKey="present" stroke="#10b981" strokeWidth={2} name="Present" />
                <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} name="Absent" />
                <Line type="monotone" dataKey="late" stroke="#f59e0b" strokeWidth={2} name="Late" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Department-wise Chart */}
        {managerDashboard?.departmentWise && managerDashboard.departmentWise.length > 0 && (
          <div className="card">
            <div className="flex items-center mb-4">
              <FiBarChart2 className="text-blue-600 text-xl mr-2" />
              <h2 className="text-xl font-semibold">Department-wise Attendance</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={managerDashboard.departmentWise}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="department" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Bar dataKey="present" fill="#10b981" name="Present" radius={[8, 8, 0, 0]} />
                <Bar dataKey="absent" fill="#ef4444" name="Absent" radius={[8, 8, 0, 0]} />
                <Bar dataKey="late" fill="#f59e0b" name="Late" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Late Arrivals Today */}
      {managerDashboard?.lateArrivals && managerDashboard.lateArrivals.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <FiAlertCircle className="mr-2 text-yellow-600" />
              Late Arrivals Today
            </h2>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
              {managerDashboard.lateArrivals.length}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Employee ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Check In Time</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {managerDashboard.lateArrivals.map((employee, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {employee.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.employeeId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.checkInTime ? format(new Date(employee.checkInTime), 'hh:mm a') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Absent Employees Today */}
      {managerDashboard?.absentEmployees && managerDashboard.absentEmployees.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <FiXCircle className="mr-2 text-red-600" />
              Absent Employees Today
            </h2>
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
              {managerDashboard.absentEmployees.length}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Employee ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Department</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {managerDashboard.absentEmployees.map((employee, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {employee.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.employeeId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.department}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;

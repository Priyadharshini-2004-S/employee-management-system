import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import RoleRoute from './components/RoleRoute';
import Layout from './components/Layout';

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';

// Employee pages
import EmployeeDashboard from './pages/employee/Dashboard';
import MarkAttendance from './pages/employee/MarkAttendance';
import AttendanceHistory from './pages/employee/AttendanceHistory';
import Profile from './pages/employee/Profile';

// Manager pages
import ManagerDashboard from './pages/manager/Dashboard';
import AllAttendance from './pages/manager/AllAttendance';
import TeamCalendar from './pages/manager/TeamCalendar';
import Reports from './pages/manager/Reports';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route
        path="/employee/*"
        element={
          <PrivateRoute>
            <RoleRoute allowedRoles={['employee']}>
              <Layout>
                <Routes>
                  <Route path="dashboard" element={<EmployeeDashboard />} />
                  <Route path="mark-attendance" element={<MarkAttendance />} />
                  <Route path="attendance-history" element={<AttendanceHistory />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="*" element={<Navigate to="/employee/dashboard" />} />
                </Routes>
              </Layout>
            </RoleRoute>
          </PrivateRoute>
        }
      />
      
      <Route
        path="/manager/*"
        element={
          <PrivateRoute>
            <RoleRoute allowedRoles={['manager']}>
              <Layout>
                <Routes>
                  <Route path="dashboard" element={<ManagerDashboard />} />
                  <Route path="all-attendance" element={<AllAttendance />} />
                  <Route path="team-calendar" element={<TeamCalendar />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="*" element={<Navigate to="/manager/dashboard" />} />
                </Routes>
              </Layout>
            </RoleRoute>
          </PrivateRoute>
        }
      />
      
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;


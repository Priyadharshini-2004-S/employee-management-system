import { useSelector } from 'react-redux';
import { FiUser, FiMail, FiBriefcase, FiHash, FiCalendar } from 'react-icons/fi';
import { format } from 'date-fns';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <div>Loading...</div>;
  }

  const profileItems = [
    { icon: FiUser, label: 'Full Name', value: user.name },
    { icon: FiMail, label: 'Email', value: user.email },
    { icon: FiHash, label: 'Employee ID', value: user.employeeId },
    { icon: FiBriefcase, label: 'Department', value: user.department },
    { icon: FiCalendar, label: 'Member Since', value: user.createdAt ? format(new Date(user.createdAt), 'MMMM dd, yyyy') : 'N/A' }
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">View and manage your profile information</p>
      </div>
      
      <div className="card">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white text-4xl font-bold mb-4 shadow-lg">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
          <p className="text-gray-600 mt-1">{user.email}</p>
          <span className="inline-block mt-3 px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
            {user.role}
          </span>
        </div>

        <div className="space-y-4">
          {profileItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Icon className="text-blue-600 text-xl" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{item.label}</p>
                  <p className="text-lg font-semibold text-gray-900">{item.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Profile;

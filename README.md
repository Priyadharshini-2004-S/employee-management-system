Name-S.Priyadharshini,
College name-Hindusthan Institute of Technology,
Contact number-6374225135


# Employee Attendance System

A full-stack employee attendance tracking system built with React, Redux Toolkit, Node.js, Express, and MongoDB.

## Features

### Employee Features

- Register/Login
- Mark attendance (Check In / Check Out)
- View attendance history (calendar or table view)
- View monthly summary (Present/Absent/Late days)
- Dashboard with personal stats

### Manager Features

- Login
- View all employees attendance
- Filter by employee, date, status
- View team attendance summary
- Export attendance reports (CSV)
- Dashboard with team stats and charts
- Team calendar view

## Tech Stack

- **Frontend**: React + Redux Toolkit + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Authentication**: JWT

## Project Structure

```
employee_management/
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Redux store and slices
│   │   ├── services/      # API service layer
│   │   └── App.jsx
│   └── package.json
├── backend/           # Node.js backend API
│   ├── src/
│   │   ├── models/       # MongoDB models
│   │   ├── routes/       # API routes
│   │   ├── controllers/  # Route controllers
│   │   ├── middleware/   # Auth and role middleware
│   │   ├── utils/        # Utility functions
│   │   └── server.js
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/employee_attendance
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

4. Start the backend server:

```bash
npm run dev
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the frontend directory (optional):

```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:

```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Creating a Manager Account

Since the registration endpoint only creates employee accounts, you need to create a manager account manually. There are two ways to do this:

### Method 1: Using the Script (Recommended)

1. Navigate to the backend directory:

```bash
cd backend
```

2. Run the create manager script with default values:

```bash
npm run create-manager
```

This will create a manager with:

- Email: `manager@example.com`
- Password: `manager123`
- Name: `Manager`
- Department: `Management`
- Employee ID: `MGR001`

3. Or specify custom values:

```bash
node src/scripts/createManager.js "John Doe" "john@example.com" "password123" "IT" "MGR001"
```

Arguments: `[name] [email] [password] [department] [employeeId]`

### Method 2: Using MongoDB Directly

You can also create a manager account directly in MongoDB:

```javascript
// In MongoDB shell or Compass
db.users.insertOne({
  name: "Manager Name",
  email: "manager@example.com",
  password: "$2a$10$...", // bcrypt hashed password
  role: "manager",
  employeeId: "MGR001",
  department: "Management",
  createdAt: new Date(),
});
```

**Note:** If using MongoDB directly, you'll need to hash the password using bcrypt. The script handles this automatically.

### Login as Manager

After creating a manager account, you can login using:

- The email and password you specified
- The login page will automatically detect the role and redirect to the manager dashboard

## API Endpoints

### Auth

- `POST /api/auth/register` - Employee registration
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Attendance (Employee)

- `POST /api/attendance/checkin` - Check in
- `POST /api/attendance/checkout` - Check out
- `GET /api/attendance/my-history` - Get attendance history
- `GET /api/attendance/my-summary` - Get monthly summary
- `GET /api/attendance/today` - Get today's status

### Attendance (Manager)

- `GET /api/attendance/all` - Get all employees attendance
- `GET /api/attendance/employee/:id` - Get specific employee attendance
- `GET /api/attendance/summary` - Get team summary
- `GET /api/attendance/export` - Export CSV
- `GET /api/attendance/today-status` - Get today's status for all employees

### Dashboard

- `GET /api/dashboard/employee` - Employee dashboard stats
- `GET /api/dashboard/manager` - Manager dashboard stats

## Database Schema

### Users

- id
- name
- email
- password (hashed)
- role (employee/manager)
- employeeId (unique)
- department
- createdAt

### Attendance

- id
- userId
- date
- checkInTime
- checkOutTime
- status (present/absent/late/half-day)
- totalHours
- createdAt

## Usage

1. **Register as Employee**: Navigate to `/register` and create an account
2. **Login**: Use your credentials to login
3. **Mark Attendance**: Employees can check in/out from the dashboard or mark attendance page
4. **View History**: Employees can view their attendance history in calendar or table format
5. **Manager Access**: Managers can view all employees, generate reports, and export data

## Notes

- Default check-in time is 9:00 AM. Checking in after this time marks attendance as "late"
- Employees must check in before checking out
- Duplicate check-ins on the same day are prevented
- Managers can filter and export attendance data for reporting

## License

ISC
<img width="1802" height="964" alt="Screenshot 2025-11-30 174722" src="https://github.com/user-attachments/assets/25fb9730-57a5-467f-a27f-11317724322a" />
<img width="1794" height="915" alt="Screenshot 2025-11-30 174817" src="https://github.com/user-attachments/assets/4c5a928d-9061-4fe2-ae8c-d604431d36f7" />



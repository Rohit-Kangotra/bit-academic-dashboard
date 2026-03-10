<<<<<<< HEAD
# BIT Unified Academic Management Dashboard

A centralized academic ERP and learning management platform designed to unify multiple institutional portals into a single intelligent dashboard for students, faculty, and administrators.

## Features

- **Student Dashboard**: Real-time aggregated statistics from CGPA, Attendance, Reward Points, and Placement Pipeline
- **Faculty Dashboard**: Centralized mentor metrics spanning mentees' GPAs, syllabus coverage, and teaching schedules
- **Mentor Analytics**: In-depth individual student tracking for quick and actionable mentorship
- **Leave Request Workflow**: Dynamic, real-time approval process chaining student applications to their assigned Faculty Mentor
- **Course LMS**: Interactive lesson plans parsing topics, hours, and video lectures dynamically
- **Attendance Tracking**: Visual monitoring and progress updates natively within the platform
- **Placement Pipeline**: Automated integration of active campus drives and individual application lifecycles
- **Reward Points System**: Comprehensive and real-time computation of unified academic point credits

## Technology Stack

### Frontend
- **React 18** + **Vite**
- **TypeScript**
- **TailwindCSS** + **Shadcn UI**

### Backend
- **Node.js** + **Express**
- **PostgreSQL**
- RESTful JSON API Architecture

## Project Structure

```text
/
├── client/          # Vite React Front-End Application
├── server/          # Express Node.js Backend API
├── database/        # PostgreSQL initialization and schema files
└── docs/            # Application Documentation
```

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/Rohit-Kangotra/bit-academic-dashboard.git
cd bit-academic-dashboard
```

### 2. Configure Environment Variables

Create `.env` files based on the structural `.env.example` provided.

```bash
# In the `server` directory
cp .env.example .env
```
Ensure your Postgres Database matches the credentials specified in your `.env`.

### 3. Install Dependencies

You'll need to install dependencies for both the client and the server independently.

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 4. Run the Application

Start the backend server alongside the Vite frontend application. Look for their respective local addresses.

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

Your centralized academic ERP and learning management dashboard should now be running locally.
=======
# bit-academic-dashboard
>>>>>>> 145d47f5c3f921b5d9fa035422fb41198047d07c

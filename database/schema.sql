-- Drop existing tables to recreate schema from scratch
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS placement_applications CASCADE;
DROP TABLE IF EXISTS placements CASCADE;
DROP TABLE IF EXISTS placement_drives CASCADE;
DROP TABLE IF EXISTS leave_requests CASCADE;
DROP TABLE IF EXISTS activity_submissions CASCADE;
DROP TABLE IF EXISTS activity_points CASCADE;
DROP TABLE IF EXISTS class_schedule CASCADE;
DROP TABLE IF EXISTS syllabus_tracking CASCADE;
DROP TABLE IF EXISTS resumes CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS course_lessons CASCADE;
DROP TABLE IF EXISTS learning_activity CASCADE;
DROP TABLE IF EXISTS course_progress CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS faculty CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

-- Create Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'faculty', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Courses Table
CREATE TABLE courses (
    course_code VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    credits INTEGER DEFAULT 3,
    category VARCHAR(50) DEFAULT 'Core'
);

-- Create Course Lessons Table
CREATE TABLE course_lessons (
    id SERIAL PRIMARY KEY,
    course_code VARCHAR(100) REFERENCES courses(course_code) ON DELETE CASCADE,
    unit_no VARCHAR(20),
    topic VARCHAR(255) NOT NULL,
    material_link VARCHAR(500),
    video_link VARCHAR(500),
    hours_required INTEGER DEFAULT 1
);

-- Create Course Progress Table
CREATE TABLE course_progress (
    id SERIAL PRIMARY KEY,
    student_roll_no VARCHAR(50) NOT NULL,
    course_code VARCHAR(100) REFERENCES courses(course_code) ON DELETE CASCADE,
    lesson_id INTEGER REFERENCES course_lessons(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    score NUMERIC(5,2),
    completed_at TIMESTAMP,
    UNIQUE(student_roll_no, course_code, lesson_id)
);

-- Create Students Table
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    roll_no VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    mentor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    mentor_name VARCHAR(255),
    year VARCHAR(20),
    semester INTEGER DEFAULT 1,
    batch VARCHAR(20),
    course_code VARCHAR(100),
    reward_points INTEGER DEFAULT 0,
    redeemed_points INTEGER DEFAULT 0,
    balance_points INTEGER DEFAULT 0,
    cgpa NUMERIC(4, 2) DEFAULT 0.00,
    backlogs INTEGER DEFAULT 0
);

-- Create Faculty Table
CREATE TABLE faculty (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    faculty_id VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    salary NUMERIC(15, 2)
);

-- Create Attendance Table
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    roll_no VARCHAR(50) NOT NULL,
    course_code VARCHAR(50) NOT NULL,
    hour INTEGER NOT NULL,
    status VARCHAR(20) CHECK (status IN ('PRESENT', 'ABSENT', 'LATE'))
);

-- Create Placement Drives Table
CREATE TABLE placement_drives (
    id SERIAL PRIMARY KEY,
    company VARCHAR(255) NOT NULL,
    job_role VARCHAR(255) NOT NULL,
    package VARCHAR(100),
    eligibility_cgpa NUMERIC(4, 2),
    eligible_departments TEXT[],
    application_deadline DATE,
    interview_date DATE,
    location VARCHAR(255),
    mode VARCHAR(50)
);

-- Create Placement Applications Table
CREATE TABLE placement_applications (
    id SERIAL PRIMARY KEY,
    roll_no VARCHAR(50) NOT NULL,
    company VARCHAR(255) NOT NULL,
    resume_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Applied' CHECK (status IN ('Applied', 'Shortlisted', 'Round 1', 'Round 2', 'Final Interview', 'Selected', 'Rejected')),
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Leave Requests Table
CREATE TABLE leave_requests (
    id SERIAL PRIMARY KEY,
    student_roll_no VARCHAR(50) NOT NULL,
    mentor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    leave_type VARCHAR(100) NOT NULL,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected'))
);

-- Create Class Schedule Table
CREATE TABLE class_schedule (
    id SERIAL PRIMARY KEY,
    course_code VARCHAR(50) NOT NULL,
    faculty_name VARCHAR(255),
    day_of_week VARCHAR(20),
    start_time TIME,
    end_time TIME,
    room_number VARCHAR(50)
);

-- Create Activity Submissions Table
CREATE TABLE activity_submissions (
    id SERIAL PRIMARY KEY,
    roll_no VARCHAR(50) NOT NULL,
    activity_type VARCHAR(100) NOT NULL,
    description TEXT,
    proof_url VARCHAR(500),
    points_requested INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    submitted_date DATE DEFAULT CURRENT_DATE
);

-- Create Syllabus Tracking Table
CREATE TABLE syllabus_tracking (
    id SERIAL PRIMARY KEY,
    course_code VARCHAR(50) NOT NULL,
    faculty_id VARCHAR(50),
    total_units INTEGER NOT NULL DEFAULT 5,
    completed_units INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Learning Activity Table
CREATE TABLE learning_activity (
    id SERIAL PRIMARY KEY,
    roll_no VARCHAR(50) NOT NULL,
    course_code VARCHAR(100) NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    activity_time TIMESTAMP DEFAULT NOW()
);

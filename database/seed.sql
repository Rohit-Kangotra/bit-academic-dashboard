-- Insert Admin
INSERT INTO users (name, email, role) VALUES ('Admin User', 'admin@bitsathy.ac.in', 'admin');

-- Insert Departments
INSERT INTO departments (name, code) VALUES ('Computer Science', 'CSE');
INSERT INTO departments (name, code) VALUES ('Information Technology', 'IT');

-- Insert Faculty
INSERT INTO users (name, email, role) VALUES ('Dr. Faculty One', 'faculty1@bitsathy.ac.in', 'faculty');
INSERT INTO faculty (user_id, employee_id, department_id, designation) VALUES (2, 'FAC001', 1, 'Professor');

-- Insert Student
INSERT INTO users (name, email, role) VALUES ('Student One', 'student1@bitsathy.ac.in', 'student');
INSERT INTO students (user_id, roll_number, department_id, semester, batch_year, cgpa) 
VALUES (3, '737621CS001', 1, 6, 2021, 8.5);

-- Insert Course
INSERT INTO courses (course_code, course_name, credits, department_id) VALUES ('CS8601', 'Artificial Intelligence', 3, 1);

-- Insert Placement Drive
INSERT INTO placements (company_name, job_description, eligibility_criteria, min_cgpa, interview_date, interview_mode, location) 
VALUES ('Google', 'Software Engineer', 'B.Tech CSE/IT', 8.0, '2026-05-15', 'online', 'Remote');

-- Insert Class Schedule
INSERT INTO class_schedule (course_id, faculty_id, semester, day_of_week, start_time, end_time, room_number)
VALUES (1, 2, 6, 'Monday', '09:00:00', '10:00:00', 'Lab 1');

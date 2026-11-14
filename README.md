# CAMPUS-CONNECT

## Overview

A comprehensive web application for managing academic departments, including courses, materials, and user management with different roles (students, lecturers, and admins).

The CAMPUS-CONNECT System is designed to streamline educational operations by providing a platform for course management, student enrollment, learning materials distribution, and administrative tasks. The application features role-based access controls, real-time updates, and a responsive user interface.

## Live Applications

- Live URL: <https://department-ms.vercel.app/>
  

## Core Features

- Authentication & Authorization
- User registration and login
- JWT-based authentication
- Role-based access control (Student, Lecturer, Admin)
- Password hashing with bcrypt

## Course Management

- Create, view, update, and delete courses
- Course enrollment for students
- Course assignment for lecturers
- Course details with enrolled students

## Learning Materials

- Upload and manage course materials
- Download materials
- Organize materials by course
- User Management
- User profiles with role information
- Update user details
- View enrolled/teaching courses

## Security Fix: Authentication on User Updates

I found a bug in my backend auth: the user update route (PUT /api/users/:id) wasn't protected, so profile updates didn't require a valid login. I fixed it by requiring a valid JWT on the route, letting users update only their own name and email, restricting role changes to admins, whitelisting the fields that can be updated, and making sure the password hash is never returned in API responses. I also added tests covering each of these rules.

## Technology Stack

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- Axios for API requests
- React Toastify for notifications

### Backend

- Express.js
- TypeScript
- MongoDB with Mongoose
- JWT for authentication
- Multer for file uploads
- CORS for cross-origin requests

## Screenshots

|                                                        |                                                   |
| :----------------------------------------------------: | :-----------------------------------------------: |
|   ![Landing Page](https://i.imgur.com/wdoVJFC.jpeg)    |  ![Login Page](https://i.imgur.com/AKhT6oN.jpeg)  |
|   ![Register Page](https://i.imgur.com/ZOpo4pU.jpeg)   |  ![Dashboard](https://i.imgur.com/d3IZkBU.jpeg)   |
| ![Course Management](https://i.imgur.com/AuH7OyJ.jpeg) | ![User Profile](https://i.imgur.com/lSh6g33.jpeg) |

## Future Development Roadmap

### Enhanced Admin Controls

- Comprehensive user management system
- Bulk actions for courses and users
- Analytics dashboard for administrators
- User activity monitoring
- System-wide announcements

### Academic Structure

- Integration of academic levels (100L, 200L, etc.)
- Semester/session-based course organization
- Prerequisite course relationships
- Academic calendar integration
- Course credit system

### Technical Improvements

- Improved landing page with feature highlights
- Swagger documentation for the API
- Social authentication (Google, Facebook)
- WebSocket integration for real-time notifications
- Mobile application development
- API rate limiting and caching

### Student Experience

- Class scheduling and timetable generation
- Calendar integration
- Exam and assignment submission portals
- Grade management system
- Student performance analytics
- Discussion forums for courses

### Lecturer Features

- Attendance tracking
- Grading tools
- Automated notification system for upcoming classes
- Integration with video conferencing for virtual classes
- Course material version control
- Assignment creation and management



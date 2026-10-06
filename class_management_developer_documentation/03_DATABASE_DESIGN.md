# 03 — Database Design

## Core entities

```text
User
 ├── StudentProfile
 └── LecturerProfile

Course
 └── Class

Class
 ├── ClassEnrollment
 ├── ClassTimetable
 ├── Resource
 ├── Assignment
 ├── Quiz
 ├── Attendance
 ├── Announcement
 ├── DiscussionThread
 └── ChatRoom

Assignment
 └── AssignmentSubmission

Quiz
 └── QuizQuestion
      └── QuizAttempt

User
 └── Notification

ChatRoom
 └── ChatRoomMember
      └── ChatMessage
```

## Suggested tables

### users
- id
- email
- password_hash
- role
- is_active
- created_at
- updated_at

### student_profiles
- id
- user_id
- registration_number
- first_name
- last_name

### lecturer_profiles
- id
- user_id
- staff_number
- first_name
- last_name

### courses
- id
- code
- name
- description

### classes
- id
- course_id
- lecturer_id
- semester
- academic_year
- status

### class_enrollments
- id
- class_id
- student_id
- enrolled_at
- status

### assignments
- id
- class_id
- title
- description
- due_at
- max_score
- created_by
- created_at

### assignment_submissions
- id
- assignment_id
- student_id
- content/file_reference
- submitted_at
- score
- feedback

### quizzes
- id
- class_id
- title
- duration_minutes
- created_by

### attendance
- id
- class_id
- student_id
- date
- status
- recorded_by

### announcements
- id
- class_id
- author_id
- title
- content
- created_at

### chat_rooms
- id
- class_id
- name
- room_type
- created_by
- created_at

### chat_room_members
- id
- room_id
- user_id
- joined_at

### chat_messages
- id
- room_id
- sender_id
- content
- created_at
- edited_at

### notifications
- id
- user_id
- type
- title
- message
- related_entity_type
- related_entity_id
- is_read
- created_at

## Important relationships

```text
User 1 ─── N Notification
User 1 ─── N ChatMessage
Class 1 ─── N Assignment
Class 1 ─── N Quiz
Class 1 ─── N Announcement
Class 1 ─── N ChatRoom
ChatRoom 1 ─── N ChatMessage
ChatRoom N ─── N User
Class N ─── N Student
```

Use foreign keys and database constraints to enforce relationships.

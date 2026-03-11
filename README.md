# Smart Study Planner API

## Base URL
http://localhost:3000/api

---

## Auth

### Register
POST /auth/register

Body:
{
  "email": "test@gmail.com",
  "password": "123456"
}

Response:
{
  "message": "User created successfully"
}

---

### Login
POST /auth/login

Body:
{
  "email": "test@gmail.com",
  "password": "123456"
}

Response:
{
  "token": "jwt_token"
}

---

## Tasks

### Get all tasks
GET /tasks

Query params:
- status
- priority
- search
- sort
- page
- limit

Example:
GET /tasks?status=todo&priority=high&page=1&limit=10

---

### Create task
POST /tasks

Body:
{
  "title": "Study MERN",
  "priority": "high",
  "status": "todo"
}

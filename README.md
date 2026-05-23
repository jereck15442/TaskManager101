# Task Manager Backend API

A RESTful backend API built with **Node.js**, **Express.js**, and **MongoDB** for the Task Manager system. This backend covers all features across Tier 1, Tier 2, and Tier 3 of the project requirements.

---

## 📋 Features Covered

| Tier | Feature | Endpoint |
|------|---------|----------|
| 1 | Add Task | `POST /api/tasks` |
| 1 | Delete Task | `DELETE /api/tasks/:id` |
| 1 | Complete Task (Toggle) | `PATCH /api/tasks/:id/toggle` |
| 1 | Task List Rendering | `GET /api/tasks` |
| 2 | Task Editing | `PUT /api/tasks/:id` |
| 2 | Task Categories | `POST /api/categories` |
| 2 | Filter by Category | `GET /api/tasks?category=<id>` |
| 2 | Search/Filter | `GET /api/tasks?search=<text>` |
| 2 | Task Counter | `GET /api/tasks/stats` |
| 3 | Timer State (Start/Pause/Reset) | `PATCH /api/tasks/:id/timer` |
| 3 | Fetch Categories from API | `GET /api/categories` |

---

## 🛠 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (via Mongoose)
- **Deployment:** Render

---

## 🚀 Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/task-manager-backend.git
cd task-manager-backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env
```

Edit `.env` and fill in your MongoDB password:
```
PORT=3000
MONGODB_URI=mongodb+srv://jamesdayo655_db_user:<db_password>@cluster0.1fld4qx.mongodb.net/taskmanager?appName=Cluster0
NODE_ENV=development
```

### 4. Start the server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

---

## 📡 API Endpoints

### Base URL
```
http://localhost:3000
```

---

### Health Check

#### `GET /api/health`
Returns server status.

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "uptime": 123.45
}
```

---

### Tasks

#### `GET /api/tasks`
Get all tasks. Supports filtering and search.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `completed` | boolean | Filter by completion (`true` / `false`) |
| `category` | string | Filter by category ID |
| `search` | string | Search tasks by title (case-insensitive) |

**Sample Request:**
```
GET /api/tasks?search=homework&completed=false
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "stats": {
    "total": 10,
    "completed": 3,
    "pending": 7
  },
  "data": [...]
}
```

---

#### `GET /api/tasks/stats`
Get task statistics including per-category breakdown.

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 10,
    "completed": 3,
    "pending": 7,
    "activeTimers": 1,
    "byCategory": [
      { "category": "Work", "color": "#007bff", "count": 4, "completed": 1 }
    ]
  }
}
```

---

#### `GET /api/tasks/:id`
Get a single task by ID.

---

#### `POST /api/tasks`
Create a new task.

**Request Body:**
```json
{
  "title": "Finish SIA project",
  "description": "Complete the backend integration",
  "category": "64abc123...",
  "timerDuration": 3600
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "_id": "64xyz...",
    "title": "Finish SIA project",
    "description": "Complete the backend integration",
    "completed": false,
    "category": { "_id": "...", "name": "Work", "color": "#007bff" },
    "timerDuration": 3600,
    "timerRemaining": 3600,
    "timerActive": false,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

#### `PUT /api/tasks/:id`
Update a task (title, description, category, timer fields).

**Request Body:** (all fields optional)
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "category": "64abc123..."
}
```

---

#### `PATCH /api/tasks/:id/toggle`
Toggle a task's completed status.

**Response:**
```json
{
  "success": true,
  "data": { "completed": true, ... }
}
```

---

#### `PATCH /api/tasks/:id/timer`
Control the task countdown timer.

**Request Body:**
```json
{
  "action": "start"
}
```

| `action` | Description |
|----------|-------------|
| `start` | Marks timer as active |
| `pause` | Pauses timer, saves `timerRemaining` |
| `reset` | Stops timer, resets remaining to `timerDuration` |

**Pause with remaining time:**
```json
{
  "action": "pause",
  "timerRemaining": 1800
}
```

**Reset with new duration:**
```json
{
  "action": "reset",
  "timerDuration": 7200
}
```

---

#### `DELETE /api/tasks/:id`
Delete a single task.

---

#### `DELETE /api/tasks`
Delete **all completed** tasks (bulk cleanup).

**Response:**
```json
{
  "success": true,
  "message": "3 completed task(s) deleted",
  "deletedCount": 3
}
```

---

### Categories

#### `GET /api/categories`
Get all categories (sorted alphabetically).

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    { "_id": "...", "name": "Personal", "color": "#28a745", "description": "Personal tasks" },
    { "_id": "...", "name": "Work", "color": "#007bff", "description": "Work-related tasks" }
  ]
}
```

---

#### `POST /api/categories`
Create a new category.

**Request Body:**
```json
{
  "name": "Work",
  "color": "#007bff",
  "description": "Work-related tasks"
}
```

---

#### `PUT /api/categories/:id`
Update a category.

---

#### `DELETE /api/categories/:id`
Delete a category.

---

## ⚠️ Error Responses

All errors follow a consistent format:
```json
{
  "success": false,
  "message": "Task not found"
}
```

| Status | Meaning |
|--------|---------|
| `400` | Bad request / validation error |
| `404` | Resource not found |
| `409` | Conflict (duplicate name) |
| `500` | Internal server error |

---

## 🌐 Deployment on Render

1. Push this repository to GitHub.
2. Go to [render.com](https://render.com) → **New Web Service**.
3. Connect your GitHub repo.
4. Set the following:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add environment variables:
   - `MONGODB_URI` — your full MongoDB connection string
   - `NODE_ENV` — `production`
6. Deploy.

---

## 📁 Project Structure

```
task-manager-backend/
├── config/
│   └── db.js               # MongoDB connection
├── src/
│   ├── controllers/
│   │   ├── taskController.js
│   │   └── categoryController.js
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── Task.js
│   │   └── Category.js
│   ├── routes/
│   │   ├── taskRoutes.js
│   │   └── categoryRoutes.js
│   └── index.js            # App entry point
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

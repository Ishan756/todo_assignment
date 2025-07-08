here's the video link for the project ->
https://drive.google.com/file/d/1BWnW_MHSuy8ZFCyyvo__ke7pkwbUUW5c/view?usp=sharing
A full-stack collaborative task management system inspired by Trello/Kanban boards. Users can:

Register and log in securely

Create, assign, update, and delete tasks

Collaborate in real-time using socket.io

View recent activity logs

⚙️ Tech Stack

Frontend

React

TypeScript

Vite

Tailwind CSS

Context API

Socket.IO client

Backend

Node.js

Express.js

MongoDB + Mongoose

JWT (Authentication)

Socket.IO

🛠️ Setup and Installation

Prerequisites

Node.js & npm installed

MongoDB URI (local or cloud)

git clone <your_repo_url>
npm install
npm run dev

App will be running at:

Frontend: http://localhost:5173

Backend API: http://localhost:3001

✨ Features & Usage Guide

🔐 Authentication

Register and log in to get a JWT token

Token is stored in localStorage and passed with requests

📋 Task Management

Tasks can be created with title, description, priority

Tasks are draggable between columns (Todo, In Progress, Done)

Tasks can be assigned to users

🧠 Smart Assign

Automatically assigns the task to the user with the least pending (Todo or In Progress) tasks on that board.

⚔️ Conflict Handling

If two users try to edit the same task at once:

The server compares the lastModified timestamp

If the database version is newer, update is rejected with a 409 Conflict

The user is shown the latest task from the server for resolution

🧾 Activity Logs

Logs are stored and viewable per board for actions like create/update/delete

💡 Smart Assign Logic

When a user hits "Smart Assign" on a task:

All users are fetched

For each user, count how many pending (Todo/In Progress) tasks they have

The user with the fewest such tasks is chosen

The task is assigned to that user

🛡️ Conflict Handling Logic

Each task has a lastModified timestamp:

When user A and B both open task X

A edits and saves first, updating lastModified

When B saves, the server compares their lastModified with DB

If DB is newer, server returns 409 and latest task version

User B can re-review and retry with the latest data

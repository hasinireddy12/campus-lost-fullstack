# Campus Lost & Found — React + Spring Boot + MySQL

A beginner-friendly full-stack starter project:
- Frontend: React + Vite
- Backend: Java 21 + Spring Boot + Spring Web + Spring Data JPA
- Database: MySQL
- Features: login/sign-up screen, add lost/found items, list/search items, mark items as claimed, edit and delete records

## 1. Requirements
Install Java 21, Maven (or use an IDE with Maven support), Node.js, and MySQL.

## 2. Create the database
Open MySQL Workbench or the MySQL command line and run:

```sql
CREATE DATABASE campus_lost;
```

Set your MySQL password in the `DB_PASSWORD` environment variable before starting the backend. The default database URL and username are configured in `backend/src/main/resources/application.properties`; override them with `DB_URL` and `DB_USERNAME` if needed. Do not commit database credentials.

## 3. Start the backend
In a terminal:

```bash
cd backend
mvn spring-boot:run
```

On Windows PowerShell, set the password in the same terminal before starting:

```powershell
$env:DB_PASSWORD = "your-mysql-password"
mvn spring-boot:run
```

Backend URL: `http://localhost:8080`

## 4. Start the frontend
Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL Vite prints (usually `http://localhost:5173`).

## API endpoints
- `GET /api/items` — list all items
- `GET /api/items/{id}` — get one item
- `POST /api/items` — create an item
- `PUT /api/items/{id}` — update an item
- `DELETE /api/items/{id}` — delete an item

## Notes
This is a learning starter, not a production-ready deployment. It does not include user accounts, password storage, image uploads, email notifications, or role-based access. Do not store real passwords in item records. Add authentication and validation before deploying publicly.


## Demo login and sign-up
When the frontend opens, users see a login/sign-up screen first. Sign-up stores an account in MySQL with a BCrypt password hash. Login checks the saved account. The starter uses a simple sessionStorage flag to keep the UI signed in; it is **not production authentication** and does not secure API endpoints. For a real deployment, add Spring Security, server-side sessions or JWT, authorization, rate limiting, and account recovery.

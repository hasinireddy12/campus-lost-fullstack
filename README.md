# Campus Lost & Found — React + Spring Boot + MySQL

A beginner-friendly full-stack project:
- Frontend: React + Vite
- Backend: Java 21 + Spring Boot + Spring Web + Spring Data JPA
- Database: MySQL
- Features: login/sign-up screen, add lost/found items, list/search items, mark items as claimed, edit and delete records

## 1. Requirements
Install Java 21, Maven (or use an IDE with Maven support), Node.js, and MySQL for local development.

## 2. Create the database
Open MySQL Workbench or the MySQL command line and run:

```sql
CREATE DATABASE campus_lost;
```

Set your MySQL password in the `DB_PASSWORD` environment variable before starting the backend. The default database connection uses localhost and the `campus_lost` database; override it with `DB_JDBC_URL`, or set `DB_HOST`, `DB_PORT`, `DB_NAME`, and `DB_PROTOCOL` individually. Set `DB_USERNAME` as needed. Do not commit database credentials.

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

## 5. Deploy to Render and Vercel
The repository includes a Render Blueprint (`render.yaml`) for the Spring Boot API and PostgreSQL database, plus Vercel SPA routing configuration (`frontend/vercel.json`). The backend builds its JDBC URL from Render database properties; local MySQL settings remain the defaults.

1. In Render, create a new Blueprint from this GitHub repository and apply `render.yaml`. The API is built from `backend/Dockerfile`.
2. After the API is deployed, copy its public `onrender.com` URL.
3. In Vercel, import this same GitHub repository and set the project Root Directory to `frontend`.
4. Add the Vercel environment variable `VITE_API_BASE_URL` with the Render API URL (for example, `https://campus-lost-api.onrender.com`), without a trailing slash, and deploy.
5. Set Render's `APP_CORS_ORIGINS` environment variable to the exact Vercel site origin (for example, `https://your-project.vercel.app`). Include `http://localhost:5173` as well if you still need local frontend development. Redeploy the Render API after changing it.

The Render Blueprint uses free plans. Render's free PostgreSQL databases expire after 30 days and are not suitable for long-term storage. Before storing important data, upgrade the database to a paid plan and configure backups in Render.

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

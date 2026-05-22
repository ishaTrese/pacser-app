# Pacser (Civil Service Exam Reviewer)

Welcome to the Pacser Monorepo! This repository contains both the Laravel backend and the React Vite frontend, perfectly synced together.

## Prerequisites
Before you start, make sure your computer has the following installed:
1. **PHP 8.2+** and **Composer** (for the backend)
2. **Node.js** and **npm** (for the frontend)
3. **SQLite** (or you can just let Laravel handle the database file automatically)

---

## How to Run the Project Locally

Because this is a "Monorepo", you will need **two separate terminal windows** open—one for the backend and one for the frontend.

### Terminal 1: Running the Backend (Laravel)
1. Open a terminal and navigate into the backend folder:
   ```bash
   cd pacser-backend
   ```
2. Install the PHP dependencies:
   ```bash
   composer install
   ```
3. Copy the `.env` file (if you haven't already):
   ```bash
   cp .env.example .env
   ```
4. Generate your application key:
   ```bash
   php artisan key:generate
   ```
5. Migrate and seed the database (this creates the tables and loads the CSE test questions):
   ```bash
   php artisan migrate:fresh --seed
   ```
6. Start the local server:
   ```bash
   php artisan serve
   ```
   *Note: This will start the server at `http://127.0.0.1:8000`. Leave this terminal running!*

---

### Terminal 2: Running the Frontend (React Vite)
1. Open a **new** terminal window and navigate into the frontend folder:
   ```bash
   cd pacser-frontend
   ```
2. Install the JavaScript dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and go to `http://localhost:5173` to see the app!

---

## Troubleshooting
* **Infinite Loading Screen?** If the frontend gets stuck loading forever, ensure you are running `php artisan serve` in the backend terminal. The frontend specifically looks for `http://127.0.0.1:8000/api`.
* **Database Errors?** If you get a "No such table" error, make sure you ran `php artisan migrate --seed` inside the `pacser-backend` folder to build the database.

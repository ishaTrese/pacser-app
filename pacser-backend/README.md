# PACSER Backend

This repository contains the backend API for the PACSER project, built with [Laravel](https://laravel.com/).

## 🚀 Getting Started

These instructions will guide you through setting up the project on your local machine for development and testing.

### Prerequisites

Make sure you have the following installed on your machine:
* **PHP** (v8.2 or higher recommended) - [Download here](https://www.php.net/downloads)
* **Composer** (Dependency Manager for PHP) - [Download here](https://getcomposer.org/)
* **Database** (MySQL, PostgreSQL, or SQLite)
* **Git** - [Download here](https://git-scm.com/)

Verify your installations by running:
```bash
php -v
composer -v
```

### Installation & Setup

1. **Clone the repository**
   Open your terminal and run:
   ```bash
   git clone <repository_url>
   ```
   *(Make sure to replace `<repository_url>` with the actual Git repository link.)*

2. **Navigate into the project directory**
   ```bash
   cd pacser-backend
   ```

3. **Install dependencies**
   Run Composer to install all required PHP packages:
   ```bash
   composer install
   ```

4. **Environment Configuration**
   Laravel requires an environment file for its configurations. Create one by copying the example file:
   ```bash
   cp .env.example .env
   ```
   *(On Windows Command Prompt, use `copy .env.example .env` instead)*

5. **Generate Application Key**
   Run the following command to generate the unique application key:
   ```bash
   php artisan key:generate
   ```

6. **Database Setup**
   * Create a new empty database for the project using your preferred database manager (e.g., MySQL).
   * Open the `.env` file and update the database configuration to match your local setup:
     ```env
     DB_CONNECTION=mysql
     DB_HOST=127.0.0.1
     DB_PORT=3306
     DB_DATABASE=pacser_database_name
     DB_USERNAME=root
     DB_PASSWORD=your_password
     ```
   * Run the migrations to create the necessary tables:
     ```bash
     php artisan migrate
     ```
     *(If you have seeders to populate initial data, you can run `php artisan migrate --seed`)*

### Running the Application

To start the local development server, run:
```bash
php artisan serve
```

You should see output indicating the server has started:
```text
  INFO  Server running on [http://127.0.0.1:8000].
```
You can now access the backend API locally at `http://localhost:8000`.

## 🛠 Useful Artisan Commands

Here are some common commands you will use during development:

### Clear Application Cache
If you encounter caching issues, you can clear them with:
```bash
php artisan optimize:clear
```

### Create a Controller
```bash
php artisan make:controller ControllerName
```

### Create a Model with a Migration
```bash
php artisan make:model ModelName -m
```

### Run Tests
If tests are configured in `phpunit.xml`:
```bash
php artisan test
```

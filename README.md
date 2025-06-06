# Milktea-System

A complete Point of Sale (POS) system for milk tea shops with inventory and ingredient tracking functionality.

## Features

- User authentication and role-based access control
- Product management with categories
- Order processing and sales tracking
- Ingredient inventory management
- Sales reporting and analytics
- Real-time stock monitoring

## Installation Requirements

- XAMPP (Apache, MySQL, PHP)
- Node.js and npm
- Composer

## Setup Instructions

### Database Setup

1. Start XAMPP and ensure Apache and MySQL services are running
2. Open phpMyAdmin (http://localhost/phpmyadmin)
3. Create a new database named `milkteadb`
4. Import the database structure and data:
   - **Note:** Migration doesn't work properly, so just import `milkteadb.sql` in XAMPP directly

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
composer install

# Start the backend server
php spark serve
```

The backend API will be available at http://localhost:8080

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend application will be available at http://localhost:5173

## System Architecture

- Frontend: React with TypeScript
- Backend: CodeIgniter 4 PHP framework
- Database: MySQL

## Ingredient Tracking System

The system includes a comprehensive ingredient tracking feature that:
- Monitors ingredient stock levels
- Automatically deducts ingredients when orders are placed
- Provides visual indicators for low stock ingredients
- Supports ingredient restocking

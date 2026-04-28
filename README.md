# LIVORA — Smart Apartment Society Management System

LIVORA is a modern, full-stack web application designed to streamline residential society operations. From resident management and visitor logs to maintenance requests and financial tracking, Livora provides a unified interface for both administrators and residents.

## 🚀 Technology Stack

### Frontend
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS v3 (Premium Glassmorphism Design)
- **State Management:** TanStack Query (React Query)
- **Icons:** Lucide React
- **Routing:** React Router v6
- **HTTP Client:** Axios

### Backend
- **Runtime:** Node.js
- **Framework:** Express 5
- **Database:** MySQL 8.0 (Relational with ACID compliance)
- **ORM/Query:** mysql2 (Parameterized raw queries)
- **Authentication:** JWT + bcrypt

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- MySQL 8.0

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd livora
   ```

2. **Setup Backend:**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=NewPass123!
   DB_NAME=society_management
   JWT_SECRET=your_secret_key
   ```

3. **Setup Database:**
   Import the schema into your MySQL instance:
   ```bash
   mysql -u root -p < src/db/schema.sql
   ```

4. **Setup Frontend:**
   ```bash
   cd ../client
   npm install
   ```

### Running the Application

**Start Backend Server:**
```bash
cd server
npm run dev
```

**Start Frontend Development Server:**
```bash
cd client
npm run dev
```

## 🏗️ Project Structure

```
livora/
  client/             # React frontend
    src/
      components/     # Reusable UI components (MainLayout, Sidebar, etc.)
      pages/          # Route-level components (Dashboard, Societies, etc.)
      services/       # API services (Axios instance)
  server/             # Express backend
    src/
      controllers/    # Business logic
      routes/         # API endpoints
      db/             # Connection pool and schema
      middleware/     # Auth and error handlers
```

## 🔐 Security Features
- **SQL Injection Prevention:** Parameterized queries using `mysql2`.
- **Authentication:** Stateless JWT-based auth.
- **Data Integrity:** Relational constraints and ACID transactions for financial operations.
- **Password Safety:** Hashing with bcrypt (salt rounds: 12).

## 📄 License
This project is private and intended for society management use.

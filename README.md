# Ticket Management System - Frontend

This is the frontend for the Help & Support Ticket Management System, built with React and Tailwind CSS. It provides a sleek, responsive, and intuitive interface for both standard users and administrators to interact with support tickets.

## Features
- **Role-Based UI:** Automatic routing and conditional UI elements based on whether the logged-in user is a standard user or an Admin.
- **Secure Authentication:** Communicates securely with the backend using HttpOnly JWT cookies.
- **Modern Design:** Utilizes Tailwind CSS for a premium dark-mode aesthetic with smooth micro-animations.
- **Advanced Filtering:** Built-in table filtering, searching, and pagination controls.

## Prerequisites
- Node.js (v16 or higher)
- npm or yarn

## Local Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/Favasabdulnassr/Ticket-Management-Frontend.git
   ```

2. **Navigate to the frontend folder**
   ```bash
   cd Ticket-Management-Frontend
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Configure API URL (if necessary)**
   By default, the application is configured to point to a local backend running at `http://localhost:8000/api/v1`. 
   If your backend is hosted elsewhere, update the `API_BASE_URL` in `src/services/api.js`.

5. **Run the Development Server**
   ```bash
   npm run dev
   ```

6. **Open the Application**
   Open your browser and navigate to the URL provided in the terminal (usually `http://localhost:5173`).

## Usage Flow
1. Open the app and navigate to the **Sign Up** page to create a standard user account.
2. Sign in with the newly created account to create and view your own support tickets.
3. Sign out, and log in with the **Superuser (Admin)** account you created via the Django backend to view all tickets across the system, assign them, and resolve them.

# 🐟 Fisher Shop Employee Management System

A modern, comprehensive workforce management platform designed specifically for fish shops, seafood markets, and fishing vessel staff. This application helps shop managers schedule shifts, track employee attendance, assign specialized daily duties (like food safety and temperature control), and monitor workforce analytics in real-time.

---

## 📁 Project Structure

The project is organized with a React and Vite application in the `Employee_Management` subdirectory:

* **[Employee_Management/](Employee_Management/)** - The main React client application directory.
  * **[src/App.jsx](Employee_Management/src/App.jsx)** - Main React component and application view routing.
  * **[src/index.css](Employee_Management/src/index.css)** - Global styling variables, custom CSS variables, layout utilities, and typography.
  * **[src/App.css](Employee_Management/src/App.css)** - Component-specific modern responsive styling.
  * **[src/main.jsx](Employee_Management/src/main.jsx)** - Application mount entry point.

---

## 🚀 Planned Features & Modules

### 1. 📋 Employee Roster Directory
* Manage fishmongers, sales associates, logistics drivers, and cleaning personnel profiles.
* Track employee job classifications (e.g., *Seafood Handler, Lead Cashier, Fish Cutter, Delivery Driver*).
* Record contact info, emergency contacts, certifications (e.g., *Food Safety License, Heavy Vehicle License*), and hourly pay rates.

### 2. 🕒 Shift Scheduling & Attendance Log
* Simple scheduler to organize morning, mid-day, and evening shifts.
* Real-time check-in and check-out logs with status indicators (*On Shift, Off Duty, On Leave, Late*).
* Visual calendar tracking upcoming weekly schedules.

### 3. 🧼 Specialized Daily Duties & Safety Tasks
* Duty list tailored for a fishery/seafood retail store:
  * **Freezer Temperature Log**: Record and verify cold storage is at or below -18°C.
  * **Ice Display Replenishment**: Monitor fresh fish displays to ensure enough ice cover.
  * **Cutting Board Sanitation**: Log hourly disinfection cycles of processing counters.
  * **Stock Verification**: Check expiration dates and freshness grades of daily incoming catch.
* Task completion tracker with visual notifications for overdue checks.

### 4. 📊 Dashboard Metrics & Analytics
* High-level indicators showing:
  * **Staffing Levels**: Active staff currently clocked-in vs. total staff.
  * **Task Completion Rate**: Percentage of daily sanitation and temperature checks finished.
  * **Labor Hours**: Total scheduled hours vs. worked hours.

---

## 🛠️ Getting Started & Installation

### Prerequisites
* [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
* npm (v9.0.0 or higher)

### Setup & Run
1. Navigate into the application subdirectory:
   ```bash
   cd Employee_Management
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the local development server:
   ```bash
   npm run dev
   ```

4. Open the link provided by Vite (usually `http://localhost:5173`) in your browser to view the application.

---

## 🎨 Tech Stack & Styling Choices
* **Core**: React 19, JavaScript (ES6+), Vite 8
* **Styling**: Vanilla CSS utilizing modern design tokens (Variables, Flexbox, CSS Grid, Glassmorphic overlay cards, Outfit & Inter Google Fonts)
* **Icons**: Inline SVGs or FontAwesome CDN for clean, vector-based iconography

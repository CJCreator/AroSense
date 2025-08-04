# AroSense: Your Family's Digital Health Hub

AroSense is a comprehensive, all-in-one health management application designed to empower individuals and families to take control of their well-being. It provides a centralized platform to track medical information, manage wellness goals, and monitor developmental milestones for every member of the family.

## ✨ Core Features

AroSense is packed with features to cover all aspects of your family's health journey:

-   **👨‍👩‍👧‍👦 Family Profile Management:** Create and manage detailed health profiles for each family member, including yourself, children, spouse, and parents.
-   **🚨 Emergency Hub:** A centralized and quickly accessible screen with critical information like blood type, allergies, medical conditions, and emergency contacts. Includes a scannable QR code for first responders.
-   **🗂️ Secure Document Storage:** Upload, categorize, and manage all your important medical documents, such as lab reports, insurance cards, and referral letters.
-   **💊 Prescription Tracking:** Keep a digital log of all medications for each family member, including dosage, frequency, and prescribing doctor.
-   **❤️ Wellness Tools:** A suite of trackers to monitor your health:
    -   **Vitals:** Log blood pressure, heart rate, blood glucose, and more.
    -   **Weight & BMI:** Track weight over time and monitor BMI.
    -   **Activity:** Log various physical activities, from walking to gym workouts.
    -   **Hydration, Sleep & Mood:** Monitor daily water intake, sleep patterns, and emotional well-being.
-   **👶 Baby Care Module:** A dedicated section for infants and toddlers (up to 5 years):
    -   **Daily Logs:** Track feedings, diaper changes, and sleep.
    -   **Growth Charts:** Record weight, height, and head circumference.
    -   **Milestone Tracker:** Follow and log key developmental milestones.
    -   **Vaccination Schedule:** Keep track of all immunizations.
    -   **Nutrition Guide:** Log solid food introductions and monitor reactions.
-   **♀️ Women's Wellness Hub:**
    -   **Period Tracker:** A smart calendar to log menstrual cycles and predict fertile windows.
    -   **Symptom & Mood Diary:** Log physical and emotional symptoms throughout the month.
    -   **Screening Reminders:** Set reminders for important check-ups like Pap smears and mammograms.
-   **🤰 Pregnancy Journey:** A dedicated module to track pregnancy week-by-week, log symptoms, monitor vitals, count kicks, and manage prenatal appointments.
-   **⭐ Wellness Rewards:** A gamification system that awards points and badges for consistently logging health data, encouraging user engagement and healthy habits.
-   **🔐 Secure Authentication:** User accounts are securely managed with Supabase Auth, including registration and login.

## 🛠️ Tech Stack

This application is built with a modern, robust, and scalable tech stack:

-   **Frontend:**
    -   **Framework:** [React](https://react.dev/) (with TypeScript)
    -   **Build Tool:** [Vite](https://vitejs.dev/)
    -   **Routing:** [React Router](https://reactrouter.com/)
    -   **State Management:** React Hooks (`useState`, `useEffect`, `useContext`)
-   **Backend & Database:**
    -   **Platform:** [Supabase](https://supabase.com/)
    -   **Database:** Supabase (PostgreSQL)
    -   **Authentication:** Supabase Auth
-   **Styling:**
    -   **CSS Framework:** [Tailwind CSS](https://tailwindcss.com/)
-   **Icons:**
    -   A combination of custom SVG icon components and [Lucide React](https://lucide.dev/guide/packages/lucide-react).

## 🚀 Getting Started

Follow these instructions to get the project running on your local machine for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or newer recommended)
-   A code editor like [VS Code](https://code.visualstudio.com/)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd AroSense
    ```

2.  **Install NPM packages:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    -   Create a new file named `.env` in the root of the project.
    -   Copy the contents of `.env.example` into your new `.env` file.
    -   The example file is pre-filled with the project's development Supabase keys. You can use these for initial setup or replace them with your own Supabase project keys.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  Open your browser and navigate to `http://localhost:5173` (or the port specified in your terminal) to see the application running.

## 📂 Project Structure

The codebase is organized into a clear and maintainable structure:

```
/
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable React components (Layout, Sidebar, Modals, etc.)
│   ├── contexts/       # React Context providers (e.g., AuthContext)
│   ├── integrations/   # Third-party service integrations (e.g., Supabase client)
│   ├── pages/          # Top-level page components for each route
│   ├── services/       # Data logic functions (interacting with Supabase)
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions (date formatting, gamification logic)
│   ├── App.tsx         # Main application component with routing setup
│   └── index.tsx       # Application entry point
├── .env.example        # Example environment variables file
├── README.md           # This file
└── package.json        # Project dependencies and scripts
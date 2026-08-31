# Finlay PharmaVigilance - Frontend

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-4.4.0-646CFF)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-3178C6)](https://www.typescriptlang.org/)

## 📋 Overview

This is the frontend application for the **Finlay PharmaVigilance** platform, a pharmacovigilance system for adverse event reporting and case management. Built with **React** and **Vite**, it provides a modern, responsive user interface for healthcare professionals, patients, and administrators.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/) (v9 or later)
- [Git](https://git-scm.com/)

---

### 1. Clone the Repository

```bash
git clone https://github.com/JabelResendiz/Finlay_Pharmacovigilance_Platform.git
cd Finlay_Pharmacovigilance_Platform/frontend
```


### 2. Configure Environment Variables

Create a `.env` file in the root of the `frontend/` directory with the following variables:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:5137/api
VITE_API_TIMEOUT=30000

# reCAPTCHA (for bot protection)
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here

# FriendlyCaptcha (alternative bot protection)
VITE_FRIENDLYCAPTCHA_SITE_KEY=your_friendlycaptcha_site_key_here
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in the terminal).
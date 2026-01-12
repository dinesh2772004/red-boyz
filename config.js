// src/config.js
export const API_URL = import.meta.env.PROD
  ? "https://red-boyz-app.onrender.com"  // your Render URL
  : "http://localhost:5000";            // local dev

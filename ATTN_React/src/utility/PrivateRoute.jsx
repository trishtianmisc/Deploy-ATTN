// src/utility/PrivateRoute.jsx
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  // Allow access if either an access token exists or a user object was stored
  const accessToken = localStorage.getItem("access");
  const storedUser = localStorage.getItem("user");

  if (!accessToken && !storedUser) {
    // Not logged in, redirect to login
    return <Navigate to="/" replace />;
  }

  // Logged in, allow access
  return children;
}

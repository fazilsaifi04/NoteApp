import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../api/api"; 

const PrivateRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("/auth/me");
        console.log("Authenticated user:", res.data.user);
        setIsAuthenticated(true);
      } catch (err) {
        console.error("Auth verification failed:", err);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) return <div>Loading...</div>;

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;

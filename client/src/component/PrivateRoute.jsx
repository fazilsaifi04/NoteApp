import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import instance from "../api/api";

const PrivateRoute = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await instance.get("/auth/me");
        setAuthenticated(true);
      } catch (err) {
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) return <div>Loading...</div>;
  return authenticated ? children : <Navigate to="/signup" />;
};


export default PrivateRoute;

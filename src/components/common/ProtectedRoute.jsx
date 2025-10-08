import React from "react";
import { Navigate } from "react-router-dom";
import { validateToken } from "../../utils/tokenUtils";
import { loginSuccess } from "../../redux/slices/authSlice";
import { useDispatch } from "react-redux";

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("authToken");
    const dispatch = useDispatch()

    // Validate token
    const userData = token ? validateToken(token) : null;
    dispatch(loginSuccess(userData));

    if (!userData) {
        localStorage.removeItem("authToken");
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;

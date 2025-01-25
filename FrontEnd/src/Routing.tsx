import React from "react";
import { Router, Routes, Route } from "react-router-dom";
import { SignUp } from "./pages/SignUp/SignUp";
import { Login } from "./pages/login/Login";
import { Home } from "./Home";
import { Layout } from "./Layout";
import { Dashboard } from "./pages/UserLanding/Dashboard";
import { SubmitComplaint } from "./pages/UserLanding/SubmitComplaint";

function Routing() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="submit-complaint" element={<SubmitComplaint />} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Route>
    </Routes>
  );
}

export default Routing;

import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router";
import { Button } from "./components/ui/button";
import Login from "./pages/seller/Login";
import Register from "./pages/seller/Register";
import VerifyEmail from "./pages/common/VerifyEmail";
import ForgotPassword from "./pages/common/ForgotPassword";
import ResetPassword from "./pages/common/ResetPassword";
import AppContainer from "./pages/common/AppContainer";
import Profile from "./pages/common/Profile";
import Settings from "./pages/common/Settings";
import { setNavigate } from "./lib/navigation";
// import './App.css'

function App() {
  const navigate = useNavigate();
  setNavigate(navigate);

  return (
    <Routes>
      <Route path="/dashboard" element={<AppContainer />}>
        <Route index element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/email/verify/:code" element={<VerifyEmail />} />
      <Route path="/password/forgot" element={<ForgotPassword />} />
      <Route path="/password/reset" element={<ResetPassword />} />
    </Routes>
  );
}

function Home() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-red-500">Home</h1>
      <Button>Click me</Button>
    </div>
  );
}

export default App;

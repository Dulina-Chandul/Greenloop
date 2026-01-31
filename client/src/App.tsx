import { useState } from "react";
import { Routes, Route } from "react-router";
import { Button } from "./components/ui/button";
// import './App.css'

function App() {
  return (
    <Routes>
      <Route index element={<Home />} />
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

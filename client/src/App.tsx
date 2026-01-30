import { useState } from "react";
import { Routes, Route } from "react-router";
// import './App.css'

function App() {
  return (
    <Routes>
      <Route index element={<Home />} />
    </Routes>
  );
}

function Home() {
  return <h1>Home</h1>;
}

export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthHome from './pages/AuthHome';
import Tasks from './pages/Tasks';
import Cases from './pages/Cases';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<AuthHome />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/cases" element={<Cases />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App; 
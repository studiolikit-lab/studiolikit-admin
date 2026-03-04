import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import './App.css';

function App() {
  return (
    <Router basename="/studiolikit-admin/">
      <AdminLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<UploadPage />} />
        </Routes>
      </AdminLayout>
    </Router>
  );
}

export default App;

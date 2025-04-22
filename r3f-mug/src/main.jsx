import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './components/App.jsx'; // Update the path to point to the components directory
import DesignLibrary from './components/DesignLibrary.jsx'; // Update the path and extension
import './style.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/library" element={<DesignLibrary />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
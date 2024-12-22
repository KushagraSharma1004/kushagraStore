import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter
import App from './App.jsx';
import UserInterface from './UserInterface.jsx';
import { Routes, Route } from 'react-router-dom';

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="/kushagraStore/" element={<App />} />
          <Route path="/kushagraStore/UserInterface" element={<UserInterface />} />
        </Routes>
      </BrowserRouter>
  </StrictMode>
);

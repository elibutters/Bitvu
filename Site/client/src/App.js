import React from 'react'
import {Routes, Route} from 'react-router-dom'
import { BrowserRouter } from 'react-router-dom';
import './styles/App.css'

import Home from './pages/Home'
import DashBoard from './pages/DashBoard'
import { DashboardProvider } from './contexts/DashboardContext';

function App() {
  return (
    <DashboardProvider>
      <BrowserRouter>
        <Routes>
              <Route path="/" element={<Home/>}/>
              <Route path="/dashboard" element={<DashBoard/>}/>
        </Routes>
      </BrowserRouter>
    </DashboardProvider>
  );
}

export default App
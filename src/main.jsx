import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { RaceProvider } from './context/RaceContext'
import './index.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RaceProvider>
      <App />
    </RaceProvider>
  </React.StrictMode>
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from "./context/ThemeContext.jsx";   // <-- ADD THIS

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>                     {/* <-- WRAP HERE */}
      <App />
    </ThemeProvider>
  </StrictMode>,
)

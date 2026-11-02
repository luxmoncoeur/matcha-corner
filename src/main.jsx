import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@plop-ui/fonts/fonts.css'
import '@plop-ui/react/styles.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

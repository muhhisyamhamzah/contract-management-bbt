import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import PenyediaData from './components/PenyediaData.tsx'
import PenyediaToast from './components/Toast.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <PenyediaData>
        <PenyediaToast>
          <App />
        </PenyediaToast>
      </PenyediaData>
    </BrowserRouter>
  </StrictMode>,
)

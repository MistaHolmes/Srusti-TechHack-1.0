import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import './index.css'
import App from './App.tsx'
import Routing from './Routing.tsx';

createRoot(document.getElementById('root')!).render(

  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>


)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
//import './bases/01-ejecucionyTiposPrimitivos/01-ejecucionyTiposPrimitivos-Problema1.ts';
//import './bases/01-ejecucionyTiposPrimitivos/01-ejecucionyTiposPrimitivos-Problema2.ts'
import './bases/02-OperadoresyCoerción/02-OperadoresyCoerción.ts'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

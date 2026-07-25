import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import Board from './screens/Board'
import Home from './screens/Home'
import Play from './screens/Play'

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/play/:code', element: <Play /> },
  { path: '/board/:code', element: <Board /> },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)

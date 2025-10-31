import { StrictMode } from 'react'
import { FHEProvider } from './context/FHEContext'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Dashboard from './pages/Dashboard.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { PrivyProvider } from '@privy-io/react-auth';


const myRouter = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
  {
    path: '*',
    element: <div>404 Not Found</div>,
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID || ''}
      config={{
        appearance: {
          theme: 'light',
          accentColor: '#EAB308', 
        },
        loginMethods: ['wallet'],
      }}
    >
      <FHEProvider>
        <RouterProvider router={myRouter} />
      </FHEProvider>
    </PrivyProvider>
  </StrictMode>
)

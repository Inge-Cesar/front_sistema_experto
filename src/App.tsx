import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Personnel } from './pages/Personnel';
import { Swaps } from './pages/Swaps';
import { Finance } from './pages/Finance';
import { Audit } from './pages/Audit';
import { Settings } from './pages/Settings';
import { Shifts } from './pages/shifts';
import { Permissions } from './pages/Permissions';
import { Profile } from './pages/Profile';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('access_token'));

  return (
    <BrowserRouter>
      {!isAuthenticated ? (
        <Login onLoginSuccess={() => setIsAuthenticated(true)} />
      ) : (
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/shifts" element={<Shifts />} />
            <Route path="/personnel" element={<Personnel />} />
            <Route path="/swaps" element={<Swaps />} />
            <Route path="/permissions" element={<Permissions />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/audit" element={<Audit />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      )}
    </BrowserRouter>
  );
}

export default App;

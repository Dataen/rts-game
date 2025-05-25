
import { Navigate, Route, Routes } from 'react-router';
import { AuthHandler } from './auth/AuthHandler';
import { ProtectedRoute } from './auth/ProtectedRoute';
import Layout from './Layout';
import Bot from './pages/Bot';
import BotCode from './pages/BotCode';
import Bots from './pages/Bots';
import Home from './pages/Home';
import Login from './pages/Login';
import Match from './pages/Match';
import Matches from './pages/Matches';
import NotFound from './pages/NotFound';
import User from './pages/User';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<AuthHandler />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/matches/:id" element={<Match />} />
          <Route path="/bots" element={<Bots />} />
          <Route path="/bots/:id" element={<Bot />} />
          <Route path="/bots/:id/code" element={<BotCode />} />
          <Route path="/user/:id" element={<User />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App

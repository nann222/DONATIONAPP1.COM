import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
// Import store correctly - only one import statement
import store from './store';
import setAuthToken from './utils/setAuthToken';
import { loadUser } from './actions/auth';

// Import components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import PrivateRoute from './components/routing/PrivateRoute';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Alert from './components/layout/Alert';
import AdminDashboard from './components/dashboard/AdminDashboard';
import DonorDashboard from './components/dashboard/DonorDashboard';
import RecipientDashboard from './components/dashboard/RecipientDashboard';
import Analytics from './components/analytics/Analytics';
import DonationForm from './components/donations/DonationForm';
import RequestForm from './components/requests/RequestForm';
import DonationTracking from './components/tracking/DonationTracking';
import FeedbackForm from './components/feedback/FeedbackForm';
import LogisticsManagement from './components/logistics/LogisticsManagement';
import NotificationManagement from './components/notifications/NotificationManagement';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Check for token and load user
if (localStorage.token) {
  setAuthToken(localStorage.token);
}

function App() {
  useEffect(() => {
    store.dispatch(loadUser());
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <div className="App">
            <Navbar />
            <Alert />
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/admin/dashboard"
                element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/donor/dashboard"
                element={
                  <PrivateRoute allowedRoles={['donor']}>
                    <DonorDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/recipient/dashboard"
                element={
                  <PrivateRoute allowedRoles={['recipient']}>
                    <RecipientDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <Analytics />
                  </PrivateRoute>
                }
              />
              <Route
                path="/donation/new"
                element={
                  <PrivateRoute allowedRoles={['donor']}>
                    <DonationForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/request/new"
                element={
                  <PrivateRoute allowedRoles={['recipient']}>
                    <RequestForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/tracking/:id"
                element={
                  <PrivateRoute>
                    <DonationTracking />
                  </PrivateRoute>
                }
              />
              <Route
                path="/feedback"
                element={
                  <PrivateRoute>
                    <FeedbackForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/logistics"
                element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <LogisticsManagement />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/logistics"
                element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <LogisticsManagement />
                  </PrivateRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <PrivateRoute allowedRoles={['admin', 'donor', 'recipient']}>
                    <NotificationManagement />
                  </PrivateRoute>
                }
              />
            </Routes>
            <Footer />
          </div>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
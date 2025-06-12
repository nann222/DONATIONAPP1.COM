import React, { useEffect } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
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
import NotificationManagement from './components/notifications/NotificationManagement'; // Add this import

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
            <Switch>
              <Route exact path="/" component={Login} />
              <Route exact path="/register" component={Register} />
              <PrivateRoute exact path="/admin/dashboard" component={AdminDashboard} allowedRoles={['admin']} />
              <PrivateRoute exact path="/donor/dashboard" component={DonorDashboard} allowedRoles={['donor']} />
              <PrivateRoute exact path="/recipient/dashboard" component={RecipientDashboard} allowedRoles={['recipient']} />
              <PrivateRoute exact path="/analytics" component={Analytics} allowedRoles={['admin']} />
              <PrivateRoute exact path="/donation/new" component={DonationForm} allowedRoles={['donor']} />
              <PrivateRoute exact path="/request/new" component={RequestForm} allowedRoles={['recipient']} />
              <PrivateRoute exact path="/tracking/:id" component={DonationTracking} />
              <PrivateRoute exact path="/feedback" component={FeedbackForm} />
              <PrivateRoute exact path="/logistics" component={LogisticsManagement} allowedRoles={['admin']} />
              <PrivateRoute exact path="/admin/logistics" component={LogisticsManagement} allowedRoles={['admin']} />
              <PrivateRoute exact path="/notifications" component={NotificationManagement} allowedRoles={['admin', 'donor', 'recipient']} /> {/* Add this route */}
            </Switch>
            <Footer />
          </div>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
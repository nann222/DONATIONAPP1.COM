import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Box,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import axios from 'axios';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [donationsOverTime, setDonationsOverTime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [summaryRes, donationsRes] = await Promise.all([
        axios.get('/api/analytics/summary'),
        axios.get('/api/analytics/donations')
      ]);
      
      setAnalyticsData(summaryRes.data);
      setDonationsOverTime(donationsRes.data);
      setError('');
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  // Prepare chart data
  const donationStatusData = {
    labels: analyticsData?.donationsByStatus?.map(item => item._id) || [],
    datasets: [
      {
        label: 'Donations by Status',
        data: analyticsData?.donationsByStatus?.map(item => item.count) || [],
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(75, 192, 192, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const itemTypeData = {
    labels: analyticsData?.itemsByType?.map(item => item._id) || [],
    datasets: [
      {
        label: 'Items by Type',
        data: analyticsData?.itemsByType?.map(item => item.count) || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)'
        ]
      }
    ]
  };

  const donationsTimeData = {
    labels: donationsOverTime?.map(item => item._id) || [],
    datasets: [
      {
        label: 'Donations Over Time',
        data: donationsOverTime?.map(item => item.count) || [],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1
      }
    ]
  };

  const userRoleData = {
    labels: analyticsData?.usersByRole?.map(item => item._id) || [],
    datasets: [
      {
        label: 'Users by Role',
        data: analyticsData?.usersByRole?.map(item => item.count) || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 205, 86, 0.8)'
        ]
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: isMobile ? 'bottom' : 'top'
      },
      title: {
        display: true
      }
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 2, px: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant={isMobile ? "h5" : "h4"} gutterBottom>
          Analytics Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Comprehensive insights into donation activities and user engagement
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={{ xs: 1, sm: 2, md: 3 }} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Total Donations
              </Typography>
              <Typography variant={isMobile ? "h4" : "h3"}>
                {analyticsData?.totalDonations || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
              <Typography variant="h6" color="secondary" gutterBottom>
                Total Items
              </Typography>
              <Typography variant={isMobile ? "h4" : "h3"}>
                {analyticsData?.totalItems || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
              <Typography variant="h6" color="success.main" gutterBottom>
                Avg Rating
              </Typography>
              <Typography variant={isMobile ? "h4" : "h3"}>
                {analyticsData?.averageRating ? analyticsData.averageRating.toFixed(1) : 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
              <Typography variant="h6" color="warning.main" gutterBottom>
                Total Users
              </Typography>
              <Typography variant={isMobile ? "h4" : "h3"}>
                {analyticsData?.usersByRole?.reduce((sum, role) => sum + role.count, 0) || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {/* Donations Over Time */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2, height: { xs: 300, md: 400 } }}>
            <Typography variant="h6" gutterBottom>
              Donations Over Time
            </Typography>
            <Box sx={{ height: 'calc(100% - 40px)' }}>
              <Line data={donationsTimeData} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>

        {/* Donation Status */}
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 2, height: { xs: 300, md: 400 } }}>
            <Typography variant="h6" gutterBottom>
              Donations by Status
            </Typography>
            <Box sx={{ height: 'calc(100% - 40px)' }}>
              <Pie data={donationStatusData} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>

        {/* Items by Type */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: { xs: 300, md: 400 } }}>
            <Typography variant="h6" gutterBottom>
              Items by Type
            </Typography>
            <Box sx={{ height: 'calc(100% - 40px)' }}>
              <Bar data={itemTypeData} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>

        {/* Users by Role */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: { xs: 300, md: 400 } }}>
            <Typography variant="h6" gutterBottom>
              Users by Role
            </Typography>
            <Box sx={{ height: 'calc(100% - 40px)' }}>
              <Pie data={userRoleData} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Additional Statistics */}
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Key Insights
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Most Common Item Type:
                </Typography>
                <Typography variant="h6">
                  {analyticsData?.itemsByType?.length > 0 
                    ? analyticsData.itemsByType.reduce((prev, current) => 
                        (prev.count > current.count) ? prev : current
                      )._id
                    : 'N/A'
                  }
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Most Common Status:
                </Typography>
                <Typography variant="h6">
                  {analyticsData?.donationsByStatus?.length > 0
                    ? analyticsData.donationsByStatus.reduce((prev, current) => 
                        (prev.count > current.count) ? prev : current
                      )._id
                    : 'N/A'
                  }
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Platform Health:
                </Typography>
                <Typography variant="h6" color="success.main">
                  {analyticsData?.averageRating >= 4 ? 'Excellent' : 
                   analyticsData?.averageRating >= 3 ? 'Good' : 
                   analyticsData?.averageRating >= 2 ? 'Fair' : 'Needs Improvement'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Analytics;
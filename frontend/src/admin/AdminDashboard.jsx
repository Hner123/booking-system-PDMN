import React, { useState, useEffect, useMemo } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import Sidebar from './Sidebar';
import './AdminPages.css';
import { toast } from 'react-toastify';
import { CSVLink } from 'react-csv';

// Centralized Mock Data
const fetchMockData = () => {
  return {
    roomData: { Palawan: 30, Boracay: 20, 'Palawan and Boracay': 50 },
    stats: { total: 100, approved: 60, rejected: 20, pending: 20 },
    trends: [
      { date: '2024-09-01', count: 10 },
      { date: '2024-09-02', count: 15 },
      { date: '2024-09-03', count: 5 },
      { date: '2024-09-04', count: 20 },
    ],
    additional: {
      mostFrequentDepartment: 'HR',
      mostFrequentEmployee: 'John Doe',
      mostBookedTime: '10:00 AM',
      mostBookedRoom: 'Boracay',
    },
    departments: { HR: 40, Sales: 30, IT: 20, Finance: 10 },
    users: { total: 500, active: 350, notRegistered: 150 },
  };
};

// Custom Hook for Dashboard Data
const useDashboardData = () => {
  const [roomUsage, setRoomUsage] = useState({});
  const [bookingStats, setBookingStats] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
  });
  const [bookingTrends, setBookingTrends] = useState([]);
  const [additionalStats, setAdditionalStats] = useState({});
  const [departmentStats, setDepartmentStats] = useState({});
  const [usersStats, setUsersStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = () => {
      try {
        const mockData = fetchMockData();
        setRoomUsage(mockData.roomData);
        setBookingStats(mockData.stats);
        setBookingTrends(mockData.trends);
        setAdditionalStats(mockData.additional);
        setDepartmentStats(mockData.departments);
        setUsersStats(mockData.users);
      } catch (error) {
        setError('Error loading data.');
        toast.error('Error loading data.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return {
    roomUsage,
    bookingStats,
    bookingTrends,
    additionalStats,
    departmentStats,
    usersStats,
    loading,
    error,
  };
};

// Enhanced Chart Options
const chartOptions = {
  responsive: true,
  plugins: {
    tooltip: {
      enabled: true,
      callbacks: {
        label: function (context) {
          return `${context.dataset.label}: ${context.raw}`;
        },
      },
    },
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        font: {
          size: 14,
        },
        usePointStyle: true,
      },
      onClick: (e, legendItem, legend) => {
        const index = legendItem.datasetIndex;
        const chart = legend.chart;
        const dataset = chart.getDatasetMeta(index);
        dataset.hidden = !dataset.hidden;
        chart.update();
      },
    },
  },
  animation: {
    duration: 1000,
    easing: 'easeInOutQuart',
  },
  scales: {
    x: {
      ticks: {
        autoSkip: true,
        maxRotation: 0,
        minRotation: 0,
      },
    },
    y: {
      beginAtZero: true,
    },
  },
};

// Main Dashboard Component
const Dashboard = ({ sidebarOpen }) => {
  const {
    roomUsage,
    bookingStats,
    bookingTrends,
    additionalStats,
    departmentStats,
    usersStats,
    loading,
    error,
  } = useDashboardData();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [layout, setLayout] = useState({
    roomUsage: true,
    bookingTrends: true,
    departmentStats: true,
    bookingStats: true,
    usersData: true,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('dateAsc');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState('roomUsage');

  const handleDateChange = (e) => {
    if (e.target.name === 'startDate') setStartDate(e.target.value);
    if (e.target.name === 'endDate') setEndDate(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const handleDropdownToggle = () => {
    setDropdownOpen(prev => !prev);
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setLayout(prev => ({ ...prev, [name]: checked }));
  };

  const handleLayoutChange = (e) => {
    const layoutOption = e.target.value;
    setSelectedLayout(layoutOption);
    setLayout({
      roomUsage: layoutOption === 'roomUsage',
      bookingTrends: layoutOption === 'bookingTrends',
      departmentStats: layoutOption === 'departmentStats',
      bookingStats: layoutOption === 'bookingStats',
      usersData: layoutOption === 'usersData',
    });
  };

  const filterDataByDate = (data) => {
    return data.filter((item) => {
      const date = new Date(item.date);
      return date >= new Date(startDate) && date <= new Date(endDate);
    });
  };

  const sortData = (data) => {
    switch (sortOption) {
      case 'dateAsc':
        return [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
      case 'dateDesc':
        return [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
      case 'countAsc':
        return [...data].sort((a, b) => a.count - b.count);
      case 'countDesc':
        return [...data].sort((a, b) => b.count - a.count);
      default:
        return data;
    }
  };

  const filteredTrends = filterDataByDate(bookingTrends);
  const sortedTrends = sortData(filteredTrends);

  const roomUsageData = useMemo(() => ({
    labels: ['Palawan', 'Boracay', 'Palawan and Boracay'],
    datasets: [
      {
        label: 'Room Usage',
        data: [roomUsage['Palawan'] || 0, roomUsage['Boracay'] || 0, roomUsage['Palawan and Boracay'] || 0],
        backgroundColor: ['#42a5f5', '#66bb6a', '#ff7043'],
        hoverBackgroundColor: ['#2196f3', '#43a047', '#f4511e'],
      },
    ],
  }), [roomUsage]);

  const bookingTrendsData = useMemo(() => ({
    labels: sortedTrends.map((trend) => trend.date),
    datasets: [
      {
        label: 'Number of Bookings',
        data: sortedTrends.map((trend) => trend.count),
        borderColor: '#3e95cd',
        backgroundColor: 'rgba(62, 149, 205, 0.5)',
        fill: true,
        tension: 0.3,
      },
    ],
  }), [sortedTrends]);

  const bookingStatsData = useMemo(() => ({
    labels: ['Approved', 'Rejected', 'Pending'],
    datasets: [
      {
        data: [bookingStats.approved, bookingStats.rejected, bookingStats.pending],
        backgroundColor: ['#555', '#888', '#bbb'],
        hoverOffset: 4,
      },
    ],
  }), [bookingStats]);

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };
  
  const departmentStatsData = useMemo(() => ({
    labels: ['Departments'], // Single label for the x-axis
    datasets: Object.keys(departmentStats).map((department, index) => ({
      label: department, // Each department name becomes its own label
      data: [departmentStats[department]], // Data for each department
      backgroundColor: ['#ff7043', '#42a5f5', '#66bb6a', '#ffa726', '#8e44ad', '#2ecc71'][index % 6], // Use a color for each department
    })),
  }), [departmentStats]);
  
  
  const usersData = useMemo(() => ({
    labels: ['Users'], // Single label for the x-axis
    datasets: [
      {
        label: 'Active Users', // First category label
        data: [usersStats.active], // Data for Active Users
        backgroundColor: '#4caf50', // Color for Active Users
      },
      {
        label: 'Not Registered', // Second category label
        data: [usersStats.notRegistered], // Data for Not Registered Users
        backgroundColor: '#f44336', // Color for Not Registered Users
      },
    ],
  }), [usersStats]);
  

  const handleApproveAll = () => {
    toast.success('All users approved');
  };

  const handleRejectAll = () => {
    toast.error('All users rejected');
  };

  const handleChartClick = (event, elements) => {
    if (elements.length && sortedTrends.length) {
      const { index } = elements[0];
      const label = sortedTrends[index].date;
      const count = sortedTrends[index].count;
      toast.info(`Date: ${label}, Count: ${count}`);
    }
  };

  if (loading) return <div className="loading-message">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className={`admin-dashboard ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <Sidebar sidebarOpen={sidebarOpen} />
      <div className="admin-dashboard-content">
        <h1 className="dashboard-title">Booking System Analytics</h1>

        <StatsOverview bookingStats={bookingStats} usersStats={usersStats} />
        <AdditionalStats additionalStats={additionalStats} />

        {/* Date Filter */}
        <div className="date-filters">
          <input
            type="date"
            name="startDate"
            value={startDate}
            onChange={handleDateChange}
            className="date-filter-input"
          />
          <input
            type="date"
            name="endDate"
            value={endDate}
            onChange={handleDateChange}
            className="date-filter-input"
          />
        </div>

        {/* Layout Dropdown with Checkboxes */}
        <div className="db-layout-controls">
          <button onClick={handleDropdownToggle} className="db-dropdown-toggle">
            Select Layout
          </button>
          {dropdownOpen && (
            <div className="db-dropdown-menu">
              <label>
                <input
                  type="checkbox"
                  name="roomUsage"
                  checked={layout.roomUsage}
                  onChange={handleCheckboxChange}
                />
                Room Usage Overview
              </label>
              <label>
                <input
                  type="checkbox"
                  name="bookingTrends"
                  checked={layout.bookingTrends}
                  onChange={handleCheckboxChange}
                />
                Booking Trends Over Time
              </label>
              <label>
                <input
                  type="checkbox"
                  name="departmentStats"
                  checked={layout.departmentStats}
                  onChange={handleCheckboxChange}
                />
                Department Statistics
              </label>
              <label>
                <input
                  type="checkbox"
                  name="bookingStats"
                  checked={layout.bookingStats}
                  onChange={handleCheckboxChange}
                />
                Booking Status Distribution
              </label>
              <label>
                <input
                  type="checkbox"
                  name="usersData"
                  checked={layout.usersData}
                  onChange={handleCheckboxChange}
                />
                User Statistics
              </label>
            </div>
          )}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search Trends"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        {/* Chart Containers */}
        <div className='flex-container'>
          <div className="charts-container">
            {layout.roomUsage && (
              <ChartContainer
                title="Room Usage Overview"
                chart={<Pie data={roomUsageData} options={chartOptions} />}
              />
            )}
            {layout.bookingTrends && (
              <ChartContainer
                title="Booking Trends Over Time"
                chart={<Line data={bookingTrendsData} options={{ ...chartOptions, onClick: handleChartClick }} />}
              />
            )}
          </div>
          <div className="charts-container">
            {layout.departmentStats && (
              <ChartContainer
                title="Department Statistics"
                chart={<Bar data={departmentStatsData} options={chartOptions} />}
              />
            )}
            {layout.bookingStats && (
              <ChartContainer
                title="Booking Status Distribution"
                chart={<Pie data={bookingStatsData} options={chartOptions} />}
              />
            )}
          </div>
          <div className="charts-container">
            {layout.usersData && (
              <ChartContainer
                title="User Statistics"
                chart={<Bar data={usersData} options={chartOptions} />}
              />
            )}
          </div>
        </div>

        {/* Export Data Button */}
        {layout.bookingTrends && (
          <CSVLink
            data={bookingTrends}
            filename={'booking_trends.csv'}
            className="export-button"
            target="_blank"
          >
            Export Booking Trends Data
          </CSVLink>
        )}
      </div>
    </div>
  );
};

// StatsOverview Component
const StatsOverview = ({ bookingStats, usersStats }) => (
  <div className="stats-overview">
    {['Total', 'Approved', 'Rejected', 'Pending'].map((type) => (
      <div key={type} className="stat-item">
        <h2>{type} Bookings</h2>
        <p>{bookingStats[type.toLowerCase()]}</p>
      </div>
    ))}
    <div className="stat-item">
      <h2>Registered Users</h2>
      <p>{usersStats.total}</p>
    </div>
    <div className="stat-item">
      <h2>Active Users</h2>
      <p>{usersStats.active}</p>
    </div>
  </div>
);

// AdditionalStats Component
const AdditionalStats = ({ additionalStats }) => (
  <div className="additional-stats">
    {Object.entries(additionalStats).map(([key, value]) => (
      <div key={key} className="stat-item">
        <h2>{formatStatTitle(key)}</h2>
        <p>{value}</p>
      </div>
    ))}
  </div>
);

// ChartContainer Component
const ChartContainer = ({ title, chart }) => (
  <div className="chart-container">
    <h2 className="chart-title">{title}</h2>
    {chart}
  </div>
);

// Utility Function
const formatStatTitle = (title) => title.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());

export default Dashboard;

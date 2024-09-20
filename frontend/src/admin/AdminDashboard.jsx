import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Bar, Line, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import Sidebar from './Sidebar';
import './AdminPages.css';
import { toast } from 'react-toastify';
import { CSVLink } from 'react-csv';
import WithAuthAdmin from '../auth/WithAuthAdmin';

const useDashboardData = () => {
  const [roomUsage, setRoomUsage] = useState({
    Palawan: 0,
    Boracay: 0,
    'Palawan and Boracay': 0
  });
  const [bookingStats, setBookingStats] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
  });
  const [bookingTrends, setBookingTrends] = useState([]);
  const [additionalStats, setAdditionalStats] = useState({
    mostFrequentDepartment: '',
    mostFrequentEmployee: '',
    mostBookedTime: '',
    mostBookedRoom: '',
  });
  const [departmentStats, setDepartmentStats] = useState({});
  const [usersStats, setUsersStats] = useState({
    total: 0,
    active: 0,
    notRegistered: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const response = await axios.get(`https://booking-system-ge1i.onrender.com/api/book/`, { headers });

        if (response.status === 200) {
          setRoomUsage({
            Palawan: response.data.filter(item => item.roomName === "Palawan").length,
            Boracay: response.data.filter(item => item.roomName === "Boracay").length,
            'Palawan and Boracay': response.data.filter(item => item.roomName === "Palawan and Boracay").length
          })

          setBookingStats({
            total: response.data.length,
            approved: response.data.filter(item => item.approval.status === "Approved").length,
            rejected: response.data.filter(item => item.approval.status === "Rejected").length,
            pending: response.data.filter(item => item.approval.status === "Pending" && item.title !== "").length,
          });

          const currentYear = new Date().getFullYear();
          const currentMonth = new Date().getMonth();

          const approvedBookings = response.data.filter(item => {
            const bookingDate = new Date(item.scheduleDate);
            return item.approval.status === "Approved" &&
              bookingDate.getFullYear() === currentYear &&
              bookingDate.getMonth() === currentMonth;
          });

          const bookingsByDate = approvedBookings.reduce((acc, item) => {
            const bookingDate = new Date(item.scheduleDate).toISOString().split('T')[0];

            const existingDate = acc.find(entry => entry.date === bookingDate);
            if (existingDate) {
              existingDate.count += 1;
              // existingDate.data.push(item);
            } else {
              acc.push({ date: bookingDate, count: 1 });
            }

            return acc;
          }, []);

          const bookingsByDepartment = approvedBookings.reduce((acc, item) => {
            const department = item.user?.department;

            if (department) {
              const existingDepartment = acc.find(entry => entry.department === department);

              if (existingDepartment) {
                existingDepartment.count += 1;
                // existingDepartment.data.push(item);
              } else {
                acc.push({ department, count: 1 }); // Initialize with data array
              }
            }

            return acc;
          }, []);

          setBookingTrends(bookingsByDate);
          setDepartmentStats(bookingsByDepartment);

          const stats = approvedBookings.reduce((acc, item) => {
            const username = item.user?.userName;
            const department = item.user?.department;
            const room = item.roomName;
            const time = new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            if (username) {
              acc.employees[username] = (acc.employees[username] || 0) + 1;
              acc.employeeNames[username] = `${item.user.firstName} ${item.user.surName}`;
            }

            if (department) {
              acc.departments[department] = (acc.departments[department] || 0) + 1;
            }

            if (room) {
              acc.rooms[room] = (acc.rooms[room] || 0) + 1;
            }

            if (time) {
              acc.times[time] = (acc.times[time] || 0) + 1;
            }

            return acc;
          }, { employees: {}, employeeNames: {}, departments: {}, rooms: {}, times: {} });

          const getMostFrequent = (data) => {
            return Object.keys(data).reduce((mostFrequent, currentKey) => (
              (data[mostFrequent] > data[currentKey] ? mostFrequent : currentKey)
            ), '');
          };

          const mostFrequentEmployeeKey = getMostFrequent(stats.employees);
          const mostFrequentDepartmentKey = getMostFrequent(stats.departments);
          const mostBookedRoomKey = getMostFrequent(stats.rooms);
          const mostBookedTimeKey = getMostFrequent(stats.times);

          const fullName = stats.employeeNames[mostFrequentEmployeeKey] || 'N/A';

          setAdditionalStats(prevStats => ({
            ...prevStats,
            mostFrequentEmployee: fullName,
            mostFrequentDepartment: mostFrequentDepartmentKey || 'N/A',
            mostBookedRoom: mostBookedRoomKey || 'N/A',
            mostBookedTime: mostBookedTimeKey || 'N/A',
          }));

          // console.log(response.data);
          // console.log(response.data.filter(item => item.approval.status === "Pending" && item.title !== "").length)
          // console.log(response.data.length);
          // console.log(additionalStats)
          // console.log(bookingTrends)
          // console.log(departmentStats)
        } else {
          console.error("Response status is not OK");
        }
      } catch (error) {
        console.error("Error fetching booking data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const response = await axios.get(`https://booking-system-ge1i.onrender.com/api/user/`, { headers });

        if (response.status === 200) {
          setUsersStats({
            total: response.data.length,
            active: response.data.filter(item => item.resetPass === true).length,
            notRegistered: response.data.filter(item => item.resetPass === false).length
          })
        } else {
          console.error("Response status is not OK");
        }
      } catch (error) {
        console.error("Error fetching booking data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
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

  const bookingTrendsData = useMemo(() => {
    const sortedBookingTrends = [...bookingTrends].sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
      labels: sortedBookingTrends.map((trend) => trend.date),
      datasets: [
        {
          label: 'Number of Bookings',
          data: sortedBookingTrends.map((trend) => trend.count),
          borderColor: '#3e95cd',
          backgroundColor: 'rgba(62, 149, 205, 0.5)',
          fill: true,
          tension: 0.3,
        },
      ],
    };
  }, [bookingTrends]);

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

  const departmentColorMap = {
    "Philippine Dragon Media Network": '#C0392B',
    "GDS Capital": '#E74C3C',
    "GDS Travel Agency": '#F39C12',
    "FEILONG Legal": '#D4AC0D',
    "STARLIGHT": '#F7DC6F',
    "Dragon AI": '#E59866',
    "SuperNova": '#2874A6',
    "ClearPath": '#1E8449',
  };

  const departmentStatsData = useMemo(() => {
    if (!Array.isArray(departmentStats)) {
      return { labels: [], datasets: [] };
    }

    const sortedDepartmentStats = [...departmentStats].sort((a, b) => b.count - a.count);

    return {
      labels: sortedDepartmentStats.map(({ department }) => department),
      datasets: [{
        label: 'Department Bookings',
        data: sortedDepartmentStats.map(({ count }) => count),
        backgroundColor: sortedDepartmentStats.map(({ department }) => departmentColorMap[department] || '#000000'),
      }],
    };
  }, [departmentStats]);

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
    if (elements.length && bookingTrends.length) {
      const { index } = elements[0];
      const label = bookingTrends[index].date;
      const count = bookingTrends[index].count;
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

const StatsOverview = ({ bookingStats, usersStats }) => (
  <div className="stats-overview">
    {['Total', 'Approved', 'Rejected', 'Pending'].map((type) => (
      <div key={type} className="stat-item">
        <h2>{type} Bookings</h2>
        <p>{bookingStats[type.toLowerCase()]}</p>
      </div>
    ))}
    <div className="stat-item">
      <h2>All Users</h2>
      <p>{usersStats.total}</p>
    </div>
    <div className="stat-item">
      <h2>Registered Users</h2>
      <p>{usersStats.active}</p>
    </div>
    <div className="stat-item">
      <h2>Not Registered Users</h2>
      <p>{usersStats.notRegistered}</p>
    </div>
  </div>
);

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

export default WithAuthAdmin(Dashboard);

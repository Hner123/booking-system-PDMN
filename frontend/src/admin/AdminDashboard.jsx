import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Bar, Line, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import Sidebar from './Sidebar';
import './AdminPages.css';
import { toast } from 'react-toastify';
import WithAuthAdmin from '../auth/WithAuthAdmin'

const API = import.meta.env.VITE_REACT_APP_API;

const useDashboardData = (selectedFile, currentMonth) => {
  const [pastStats, setPastStats] = useState([]);
  const [roomUsage, setRoomUsage] = useState({
    Palawan: 0,
    Boracay: 0,
    'Palawan and Boracay': 0,
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
    notRegistered: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJsonFiles = async () => {
      try {
        const response = await axios.get(`${API}/api/stats/getList`);
        setPastStats(response.data.jsonFiles);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchJsonFiles();
  }, []);

  useEffect(() => {
    if (selectedFile && selectedFile !== "reset") {
      const fetchData = async () => {
        try {
          const response = await axios.post(`${API}/api/stats/get`, { url: selectedFile });
          console.log(response.data[0])
          setRoomUsage({
            Palawan: response.data[0].usage.palawan,
            Boracay: response.data[0].usage.boracay,
            'Palawan and Boracay': response.data[0].usage.both,
          });
          setBookingStats({
            total: response.data[0].status.total,
            approved: response.data[0].status.approved,
            rejected: response.data[0].status.rejected,
            pending: response.data[0].status.pending,
          });
          setBookingTrends(response.data[0].date);
          setAdditionalStats({
            mostFrequentDepartment: response.data[0].additional.mostFrequentDepartment,
            mostFrequentEmployee: response.data[0].additional.mostFrequentEmployee,
            mostBookedTime: response.data[0].additional.mostBookedTime,
            mostBookedRoom: response.data[0].additional.mostBookedRoom,
          });
          setDepartmentStats(response.data[0].dept);
          setUsersStats({
            total: response.data[0].userStat.total,
            active: response.data[0].userStat.active,
            notRegistered: response.data[0].userStat.notRegistered
          });
        } catch (err) {
          console.error("Error fetching booking data:", err);
        }
      };

      fetchData();
    } else {
      fetchBookings();
    }
  }, [selectedFile]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const response = await axios.get(`${API}/api/book/`, { headers });

      const date = new Date();
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const reservations = response.data.filter((reservation) => {
        const scheduleDate = new Date(reservation.scheduleDate);
        return scheduleDate >= startOfMonth && scheduleDate <= endOfMonth;
      });

      setRoomUsage({
        Palawan: reservations.filter(item => item.roomName === "Palawan").length,
        Boracay: reservations.filter(item => item.roomName === "Boracay").length,
        'Palawan and Boracay': reservations.filter(item => item.roomName === "Palawan and Boracay").length,
      });

      setBookingStats({
        total: reservations.length,
        approved: reservations.filter(item => item.approval.status === "Approved").length,
        rejected: reservations.filter(item => item.approval.status === "Declined").length,
        pending: reservations.filter(item => item.approval.status === "Pending" && item.title !== "").length,
      });

      const approvedBookings = reservations.filter(item => {
        const bookingDate = new Date(item.scheduleDate);
        return item.approval.status === "Approved" && bookingDate.getMonth() === date.getMonth() && bookingDate.getFullYear() === date.getFullYear();
      });

      const bookingsByDate = approvedBookings.reduce((acc, item) => {
        const bookingDate = new Date(item.scheduleDate).toISOString().split('T')[0];
        const existingDate = acc.find(entry => entry.date === bookingDate);
        if (existingDate) {
          existingDate.count += 1;
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
          } else {
            acc.push({ department, count: 1 });
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

    } catch (error) {
      console.error("Error fetching booking data:", error);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const response = await axios.get(`${API}/api/user/`, { headers });

        if (response.status === 200) {
          setUsersStats({
            total: response.data.length,
            active: response.data.filter(item => item.resetPass === true).length,
            notRegistered: response.data.filter(item => item.resetPass === false).length,
          });
        } else {
          console.error("Response status is not OK");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUser();
  }, []);

  return {
    pastStats,
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

const chartOptions = {
  responsive: true,
  plugins: {
    tooltip: {
      enabled: true,
      callbacks: {
        label: function (context) {
          const date = context.dataset.label || ''; // Access the label (date) for the tooltip
          const count = context.raw; // Get the count value for the tooltip
          return `Date: ${date}, Bookings: ${count}`;
        },
      },
    },
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        font: {
          size: 16,  // Increased font size for readability
        },
        color: '#333', // Dark color for better contrast
        usePointStyle: true,
        padding: 20, // More space between labels
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
    duration: 1200,
    easing: 'easeInOutQuart',
  },
  scales: {
    x: {
      title: {
        display: true,
        text: '', // X-axis label
      },
      ticks: {
        color: '#555', // Label color for the X-axis
        font: {
          size: 14,  // Slightly larger font size for ticks
        },
        autoSkip: true,
        maxRotation: 0,
        minRotation: 0,
      },
    },
    y: {
      title: {
        display: true,
        text: 'Number of Bookings', // Y-axis label
      },
      ticks: {
        color: '#555',  // Label color for the Y-axis
        font: {
          size: 14,  // Larger font size for ticks
        },
      },
      beginAtZero: true,
    },
  },
};

// Main Dashboard Component
const Dashboard = ({ sidebarOpen }) => {
  const [selectedFile, setSelectedFile] = useState('');
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric'});
  const {
    pastStats,
    roomUsage,
    bookingStats,
    bookingTrends,
    additionalStats,
    departmentStats,
    usersStats,
    loading,
    error,
  } = useDashboardData(
    selectedFile, 
    currentMonth
  );

  const [layout, setLayout] = useState({
    roomUsage: true,
    bookingTrends: true,
    departmentStats: true,
    bookingStats: true,
    usersData: true,
  });

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

    // Array of colors to be used for each data point (you can modify or expand this)
    const colors = ['#3e95cd', '#8e5ea2', '#3cba9f', '#e8c3b9', '#c45850'];

    return {
      labels: sortedBookingTrends.map((trend) => trend.date),
      datasets: [
        {
          label: 'Number of Bookings',
          data: sortedBookingTrends.map((trend) => trend.count),
          borderColor: '#3e95cd', // Line color
          backgroundColor: 'rgba(62, 149, 205, 0.5)', // Line background fill
          fill: true,
          tension: 0.3,
          // Set individual point colors based on the colors array
          pointBackgroundColor: sortedBookingTrends.map((_, index) => colors[index % colors.length]),
          pointBorderColor: sortedBookingTrends.map((_, index) => colors[index % colors.length]),
          pointRadius: 5, // Adjust point size if needed
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

    const datasets = sortedDepartmentStats.map(({ department, count }) => ({
      label: department,
      data: [count],
      backgroundColor: departmentColorMap[department] || '#000000',
    }));

    return {
      labels: ['Departments'],
      datasets,
    };
  }, [departmentStats]);


  const usersData = useMemo(() => ({
    labels: ['Users'],
    datasets: [
      {
        label: 'Active Users',
        data: [usersStats.active],
        backgroundColor: '#4caf50',
      },
      {
        label: 'Not Registered',
        data: [usersStats.notRegistered],
        backgroundColor: '#f44336',
      },
    ],
  }), [usersStats]);

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

  const handleStatChange = (event) => {
    const value = event.target.value;
    setSelectedFile(value);
    console.log("Selected Date:", value);
  };

  const formatSelectedFile = (file) => {
    // Check if the file contains a hyphen and split accordingly
    const parts = file.includes('-') ? file.split('-') : file.split(' ');
    const month = parts[0].trim(); // Get the month part
    const year = parts[1] ? parts[1].trim() : ''; // Get the year part, ensuring it exists
  
    // Capitalize the month and construct the final string
    return `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
  };
  
  return (
    <div className={`admin-dashboard ${sidebarOpen ? "sidebar-open" : ""}`}>
      <Sidebar sidebarOpen={sidebarOpen} />
      <div className="admin-dashboard-content">
        <h1 className="dashboard-title">Booking System Analytics</h1>

        <div className="export-section">
          <h2 className="analytics-month"> Analytics for the {selectedFile !== 'reset' && selectedFile !== "" ? `month of ${formatSelectedFile(selectedFile)}` : `month of ${currentMonth}`}</h2>
          <select value={selectedFile} onChange={handleStatChange} className="export-dropdown">
            <option value="" disabled>
              Select Date
            </option>
            <option value="reset">
              {currentMonth}
            </option>
            {pastStats.map((file, index) => (
              <option key={index} value={file}>
                {file.replace('-', ' ')}
              </option>
            ))}
          </select>
        </div>
        <StatsOverview bookingStats={bookingStats} />
        <AdditionalStats additionalStats={additionalStats} />

        {/* Chart Containers */}
        <div className="flex-container">
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
                chart={
                  <Line
                    data={bookingTrendsData}
                    options={{ ...chartOptions, onClick: handleChartClick }}
                  />
                }
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
        </div>
        <div className="user-charts-container">
          {layout.usersData && (
            <UserChartContainer
              title="User Statistics"
              chart={<Bar data={usersData} options={chartOptions} />}
            />
          )}
          <UserOverview usersStats={usersStats} />
        </div>

      </div>
    </div>
  );
};

const StatsOverview = ({ bookingStats }) => (
  <div className='db-overview'>
    <div className="stats-overview grid-container">
      {['Total', 'Approved', 'Rejected', 'Pending'].map((type) => (
        <div key={type} className="stat-item">
          <h2>{type} Bookings</h2>
          <p>{bookingStats[type.toLowerCase()]}</p>
        </div>
      ))}
    </div>
  </div>
);

const UserOverview = ({ usersStats }) => (

  <div className="user-stats">
    <div className="user-stat-item">
      <h2>All Users</h2>
      <p>{usersStats.total}</p>
    </div>
    <div className="user-stat-item">
      <h2>Registered Users</h2>
      <p>{usersStats.active}</p>
    </div>
    <div className="user-stat-item">
      <h2>Not Registered Users</h2>
      <p>{usersStats.notRegistered}</p>
    </div>
  </div>
);

const AdditionalStats = ({ additionalStats }) => (
  <div className="additional-stats grid-container">
    {Object.entries(additionalStats).map(([key, value]) => (
      <div key={key} className="stat-item">
        <h2>{formatStatTitle(key)}</h2>
        <p>{value}</p>
      </div>
    ))}
  </div>
);

const ChartContainer = ({ title, chart }) => (
  <div className="chart-container">
    <h2 className="chart-title">{title}</h2>
    {chart}
  </div>
);

const UserChartContainer = ({ title, chart }) => (
  <div className="user-chart-container">
    <h2 className="chart-title">{title}</h2>
    {chart}
  </div>
);

// Utility Function
const formatStatTitle = (title) => title.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());

export default WithAuthAdmin(Dashboard);

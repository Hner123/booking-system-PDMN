import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Bar, Line, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import Sidebar from './Sidebar';
import './AdminPages.css';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import WithAuthAdmin from '../auth/WithAuthAdmin'

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
          size: 16,  // Increased font size for readability
          style: 'bold',
        },
        color: '#333', // Use a dark color for better contrast
        usePointStyle: true,
        padding: 20, // Space out the labels a bit more
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


  const handleExportToExcel = () => {
    const bookingTrendsSheet = bookingTrends.map(item => ({
      Date: new Date(item.date).toLocaleDateString(), // Format date
      Count: item.count,
    }));
  
    const roomUsageSheet = [
      { Room: 'Palawan', Usage: roomUsage.Palawan },
      { Room: 'Boracay', Usage: roomUsage.Boracay },
      { Room: 'Palawan and Boracay', Usage: roomUsage['Palawan and Boracay'] },
    ];
  
    const departmentStatsSheet = departmentStats.map(item => ({
      Department: item.department,
      Bookings: item.count,
    }));
  
    const usersStatsSheet = [
      { Stat: 'Total Users', Count: usersStats.total },
      { Stat: 'Active Users', Count: usersStats.active },
      { Stat: 'Not Registered Users', Count: usersStats.notRegistered },
    ];
  
    const additionalStatsSheet = [
      { Stat: 'Most Frequent Employee', Value: additionalStats.mostFrequentEmployee },
      { Stat: 'Most Frequent Department', Value: additionalStats.mostFrequentDepartment },
      { Stat: 'Most Booked Room', Value: additionalStats.mostBookedRoom },
      { Stat: 'Most Booked Time', Value: additionalStats.mostBookedTime },
    ];
  
    const wb = XLSX.utils.book_new();
  
    // Create sheets
    const wsBookingTrends = XLSX.utils.json_to_sheet(bookingTrendsSheet);
    const wsRoomUsage = XLSX.utils.json_to_sheet(roomUsageSheet);
    const wsDepartmentStats = XLSX.utils.json_to_sheet(departmentStatsSheet);
    const wsUsersStats = XLSX.utils.json_to_sheet(usersStatsSheet);
    const wsAdditionalStats = XLSX.utils.json_to_sheet(additionalStatsSheet);
  
    // Append sheets to workbook
    XLSX.utils.book_append_sheet(wb, wsBookingTrends, 'Booking Trends');
    XLSX.utils.book_append_sheet(wb, wsRoomUsage, 'Room Usage');
    XLSX.utils.book_append_sheet(wb, wsDepartmentStats, 'Department Stats');
    XLSX.utils.book_append_sheet(wb, wsUsersStats, 'Users Stats');
    XLSX.utils.book_append_sheet(wb, wsAdditionalStats, 'Additional Stats');
  
    // Set column widths
    const setColumnWidths = (worksheet) => {
      const cols = [
        { wch: 25 }, // Column width for the first column
        { wch: 15 }, // Column width for the second column
      ];
      worksheet['!cols'] = cols;
    };
  
    // Apply column widths to each sheet
    setColumnWidths(wsBookingTrends);
    setColumnWidths(wsRoomUsage);
    setColumnWidths(wsDepartmentStats);
    setColumnWidths(wsUsersStats);
    setColumnWidths(wsAdditionalStats);
  
    // Generate a timestamp for the filename
    const timestamp = new Date().toISOString().replace(/[-:.]/g, "_").slice(0, 19);
    const filename = `dashboard_stats_${timestamp}.xlsx`;
  
    // Write file
    XLSX.writeFile(wb, filename);
    toast.success('Excel file has been exported with all stats.');
  };
  
  return (
    <div className={`admin-dashboard ${sidebarOpen ? "sidebar-open" : ""}`}>
    <Sidebar sidebarOpen={sidebarOpen} />
    <div className="admin-dashboard-content">
      <h1 className="dashboard-title">Booking System Analytics</h1>

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
      <div className="export-section">
        <button onClick={handleExportToExcel} className="export-btn">
          Export to Excel
        </button>
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

const UserOverview = ({usersStats}) => (
  
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

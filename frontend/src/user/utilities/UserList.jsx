import React, { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import "./UserList.css";
import WithAuth from "../../auth/WithAuth";

const API = import.meta.env.VITE_REACT_APP_API;

const UserList = () => {
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [visibleDepartments, setVisibleDepartments] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const response = await axios.get(`${API}/api/user/`, {
          headers,
        });
        if (response.status === 200) {
          const users = response.data;

          // Group users by department
          const groupedUsers = users.reduce((acc, user) => {
            const department = user.department;
            if (!acc[department]) {
              acc[department] = [];
            }
            acc[department].push(user);
            return acc;
          }, {});

          setUsers(groupedUsers);

          // Initialize the visibleDepartments state to make all departments visible by default
          const initialVisibility = Object.keys(groupedUsers).reduce((acc, dept) => {
            acc[dept] = true; // All departments are visible by default
            return acc;
          }, {});
          setVisibleDepartments(initialVisibility);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const formatDepartmentName = (name) => name.toLowerCase().replace(/ /g, "-");

  const handleToggle = (department) => {
    setVisibleDepartments((prevState) => ({
      ...prevState,
      [department]: !prevState[department], // Toggle the visibility
    }));
  };

  // Sort departments alphabetically
  const sortedDepartments = Object.keys(users).sort();

  return (
    <div className="user-list">
      <h2>User List</h2>
      {Object.keys(users).length > 0 ? (
        sortedDepartments.map((department) => {
          // Filter users with missing firstName or surName
          const filteredUsers = users[department].filter(user => user.firstName && user.surName);

          return filteredUsers.length > 0 ? (
            <div
              key={department}
              className={`department-section ${formatDepartmentName(department)}`}
            >
              <h3>
                <button
                  className="toggle-button"
                  onClick={() => handleToggle(department)}
                >
                  {visibleDepartments[department] ? '-' : '+'} {department}
                </button>
              </h3>
              {visibleDepartments[department] && (
                <div className="user-table-container">
                  <table className="user-table">
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Name</th>
                        <th>Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={`${user.id}-${user.userName}`}>
                          <td>{user.userName}</td>
                          <td>
                            {user.firstName} {user.surName}
                          </td>
                          <td>{user.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : null;
        })
      ) : (
        <p>No users available.</p>
      )}
    </div>
  );
};

UserList.propTypes = {
  users: PropTypes.object,
  firstLogin: PropTypes.bool,
  loading: PropTypes.bool,
};

export default WithAuth(UserList);

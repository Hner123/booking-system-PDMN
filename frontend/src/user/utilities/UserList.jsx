import React, { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import "./UserList.css";
import WithAuth from "../../auth/WithAuth";

const UserList = () => {
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const response = await axios.get("https://booking-system-ge1i.onrender.com/api/user/", {
          headers,
        });
        if (response.status === 200) {
          const users = response.data;

          const groupedUsers = users.reduce((acc, user) => {
            const department = user.department;
            if (!acc[department]) {
              acc[department] = [];
            }
            acc[department].push(user);
            return acc;
          }, {});

          setUsers(groupedUsers);
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

  // Sort departments alphabetically
  const sortedDepartments = Object.keys(users).sort();

  return (
    <div className="user-list">
      <h2>User List</h2>
      {Object.keys(users).length > 0 ? (
        sortedDepartments.map((department) => (
          <div
            key={department}
            className={`department-section ${formatDepartmentName(department)}`}
          >
            <h3>{department}</h3>
            {/* style={{ color: departmentColors[department] }} */}
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
                  {users[department].map((user) => (
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
          </div>
        ))
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

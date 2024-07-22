import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import './UserList.css';

// const departmentColors = {
//   'Philippine Dragon Media Network': '#dc3545',
//   'GDS Travel Agency': '#fccd32',
//   'FEILONG Legal': '#d8a330',
//   'STARLIGHT': '#fbff00',
//   'BIG VISION PRODS.': '#28a745',
//   'SuperNova': '#272727',
//   'ClearPath': '#35bbdc',
// };

const UserList = () => {
  const [users, setUsers] = useState({});
  const [firstLogin, setFirstLogin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const headers = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        };

        const response = await axios.get('http://localhost:8800/api/user/', { headers });
        if (response.status === 200) {
          const users = response.data;
          console.log('Fetched users:', users);

          const groupedUsers = users.reduce((acc, user) => {
            const department = user.department;
            if (!acc[department]) {
              acc[department] = [];
            }
            acc[department].push(user);
            return acc;
          }, {});

          setUsers(groupedUsers);
          setFirstLogin(!users.resetPass);
          console.log('Grouped users:', groupedUsers);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const formatDepartmentName = (name) => name.toLowerCase().replace(/ /g, '-');

  if (loading) {
    return (
      <div className="loading-container">
        <img src="/loading.gif" alt="Loading..." className="loading-gif" />
      </div>
    );
  }

  return (
    <div className="user-list">
      <h2>User List</h2>
      {Object.keys(users).length > 0 ? (
        Object.keys(users).map((department) => (
          <div
            key={department}
            className={`department-section ${formatDepartmentName(department)}`}
          >
            <h3 >{department}</h3> 
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
                    <tr key={user.id}>
                      <td>{user.userName}</td>
                      <td>{user.name}</td>
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

export default UserList;

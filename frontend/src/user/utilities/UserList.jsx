import React, { useState, useEffect } from 'react';
import './UserList.css';

const UserList = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Temporary data for development
    const tempData = [
      { id: 1, name: 'John Doe', email: 'john.doe@example.com', department: 'Starlight' },
      { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', department: 'PDMN' },
      { id: 3, name: 'Alice Johnson', email: 'alice.johnson@example.com', department: 'Supernova' },
      { id: 4, name: 'Bob Brown', email: 'bob.brown@example.com', department: 'PDMN' },
      { id: 5, name: 'Eve White', email: 'eve.white@example.com', department: 'PDMN' },
    ];

    // Group users by department
    const groupedUsers = tempData.reduce((acc, user) => {
      const department = user.department;
      if (!acc[department]) {
        acc[department] = [];
      }
      acc[department].push(user);
      return acc;
    }, {});

    setUsers(groupedUsers);

    // Uncomment the fetch call below and remove the temporary data when API is available
    /*
    fetch('/api/users')
      .then(response => response.json())
      .then(data => {
        // Group data by department
        const groupedData = data.reduce((acc, user) => {
          const department = user.department;
          if (!acc[department]) {
            acc[department] = [];
          }
          acc[department].push(user);
          return acc;
        }, {});
        setUsers(groupedData);
      })
      .catch(error => console.error('Error fetching users:', error));
    */
  }, []);

  return (
    <div className="user-list">
      <h2>User List</h2>
      {Object.keys(users).map(department => (
        <div key={department} className="department-section">
          <h3>{department}</h3>
          <table className="user-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {users[department].map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default UserList;

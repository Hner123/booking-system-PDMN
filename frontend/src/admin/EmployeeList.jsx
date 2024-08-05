import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import './AdminPages.css';
import { toast } from 'react-toastify';
import WithAuthAdmin from '../auth/WithAuthAdmin';

const EmployeeList = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [users, setUsers] = useState([]);
  const [sortedUsers, setSortedUsers] = useState([]);
  const [sortCriteria, setSortCriteria] = useState('');
  const [editDeptModal, setEditDeptModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedDept, setSelectedDept] = useState('');
  const [departments, setDepartments] = useState([
    "Philippine Dragon Media Network",
    "GDS Travel Agency",
    "FEILONG Legal",
    "STARLIGHT",
    "BIG VISION PRODS.",
    "SuperNova",
    "ClearPath",
    "Dragon AI",
  ]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const response = await axios.get("https://booking-system-ge1i.onrender.com/api/user/", { headers });
        if (response.status === 200) {
          setUsers(response.data);
          setSortedUsers(response.data);
        }
      } catch (error) {
        setError("Failed to fetch users. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const deleteUser = async (userId) => {
    if (!userId) {
      toast.error("User ID is not valid.");
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const response = await axios.delete(
        `https://booking-system-ge1i.onrender.com/api/user/delete/${userId}`,
        { headers }
      );

      if (response.status === 200) {
        setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
        setSortedUsers(prevSortedUsers => prevSortedUsers.filter(user => user._id !== userId));
        toast.success("User deleted successfully.");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user.");
    }
  };

  const handleEditDeptClick = (userId) => {
    const user = users.find(user => user._id === userId);
    if (user) {
      setSelectedUser(user);
      setSelectedDept(user.department || '');
      setEditDeptModal(true);
    }
  };

  const saveDeptChange = async (userId) => {
    if (!userId || !selectedDept) return;

    try {
      const token = localStorage.getItem("adminToken");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const response = await axios.patch(
        `https://booking-system-ge1i.onrender.com/api/user/edit/${userId}`,
        { department: selectedDept },
        { headers }
      );

      if (response.status === 201) {
        setUsers(prevUsers => prevUsers.map(user =>
          user._id === userId ? { ...user, department: selectedDept } : user
        ));
        setSortedUsers(prevSortedUsers => prevSortedUsers.map(user =>
          user._id === userId ? { ...user, department: selectedDept } : user
        ));
        toast.success("Department updated successfully.");
        setEditDeptModal(false);
      }
    } catch (error) {
      console.error("Error updating department:", error);
      toast.error("Failed to update department.");
    }
  };

  useEffect(() => {
    let sorted;
    if (sortCriteria) {
      sorted = users.filter(user => user.department === sortCriteria);
    } else {
      sorted = users;
    }

    setSortedUsers(sorted);
  }, [sortCriteria, users]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="employee-list-page">
      <Sidebar />
      <div className="employee-list-content">
        <h1>Employee List</h1>
        <div className="button-group">
          <button
            onClick={() => navigate("/admin/add-employee")}
            className="add-button"
          >
            Add Employee
          </button>
          <div className="dropdown-container" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="sort-button"
            >
              Sort by Department
            </button>
            {showDropdown && (
              <ul className="dropdown-menu">
                {departments.map((dept) => (
                  <li
                    key={dept}
                    onClick={() => {
                      setSortCriteria(dept);
                      setShowDropdown(false);
                    }}
                  >
                    {dept}
                  </li>
                ))}
                <li
                  onClick={() => {
                    setSortCriteria("");
                    setShowDropdown(false);
                  }}
                >
                  Show All
                </li>
              </ul>
            )}
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((user) => (
              <tr key={user._id}>
                <td>{`${user.firstName} ${user.surName}`}</td>
                <td>{user.userName}</td>
                <td>{user.department}</td>
                <td>
                  <button
                    onClick={() => handleEditDeptClick(user._id)}
                    className="action-button edit"
                  >
                    Edit Dept
                  </button>
                  <button
                    onClick={() => { setShowDeleteModal(true); setUserToDelete(user) }}
                    className="action-button delete"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editDeptModal && selectedUser && (
        <div className="edit-dept-modal">
          <div className="modal-content">
            <h2>Edit Department</h2>
            <label htmlFor="department">Select Department:</label>
            <select
              id="department"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            <div className="modal-actions">
              <button onClick={() => saveDeptChange(selectedUser._id)} className="confirm-button">
                Save
              </button>
              <button
                onClick={() => setEditDeptModal(false)}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && userToDelete && (
        <div className="delete-confirmation-modal">
          <div className="modal-content">
            <h2>Confirm Deletion</h2>
            <p>
              Are you sure you want to delete the user{" "}
              <strong>{userToDelete.userName}</strong>?
            </p>
            <div className="modal-actions">
              <button
                onClick={() => {
                  if (userToDelete?._id) {
                    deleteUser(userToDelete._id);
                  }
                  setShowDeleteModal(false);
                  setUserToDelete(null); // Clear userToDelete after deletion
                }}
                className="confirm-button"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setUserToDelete(null);
                }}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default WithAuthAdmin(EmployeeList);

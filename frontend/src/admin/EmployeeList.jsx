import { React, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminPages.css";
import { IoMdArrowDropdown } from "react-icons/io";
import WithAuthAdmin from "../auth/WithAuthAdmin";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

const EmployeeList = () => {
	const navigate = useNavigate();
	const [showDropdown, setShowDropdown] = useState(false);
	const [users, setUsers] = useState([]);
	const [sortedUsers, setSortedUsers] = useState([]);
	const [sortCriteria, setSortCriteria] = useState('');
	const [editDeptModal, setEditDeptModal] = useState(false);
	const [selectedUser, setSelectedUser] = useState(null);

	const toggleEditDept = (userId) => {
		setSelectedUser(userId);
		setEditDeptModal(!editDeptModal);
	};

	const toggleDropdown = () => {
		setShowDropdown(!showDropdown);
	};

	const goAdd = () => {
		navigate("/admin/add-employee");
	};

	const dropdownMenu = (
		<div className="dropdown-content">
			<button onClick={() => handleSort("")}>Clear Filter</button>
			<button onClick={() => handleSort("Philippine Dragon Media Network")}>Philippine Dragon Media Network</button>
			<button onClick={() => handleSort("GDS Travel Agency")}>GDS Travel Agency</button>
			<button onClick={() => handleSort("FEILONG Legal")}>FEILONG Legal</button>
			<button onClick={() => handleSort("STARLIGHT")}>STARLIGHT</button>
			<button onClick={() => handleSort("BIG VISION PRODS.")}>BIG VISION PRODS.</button>
			<button onClick={() => handleSort("SuperNova")}>SuperNova</button>
			<button onClick={() => handleSort("ClearPath")}>ClearPath</button>
			<button onClick={() => handleSort("Dragon AI")}>Dragon AI</button>
		</div>
	);

	const handleSort = (criteria) => {
		setSortCriteria(criteria);
	};

	const DeleteUser = async (userId) => {
		const confirmDelete = window.confirm("Are you sure you want to delete this user?");
		if (!confirmDelete) return;

		try {
			const token = localStorage.getItem("adminToken");
			const headers = {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			};

			const response = await axios.delete(`https://booking-system-ge1i.onrender.com/api/user/delete/${userId}`, {
				headers,
			});

			if (response.status === 200) {
				setUsers(users.filter(user => user.id !== userId));
				setSortedUsers(sortedUsers.filter(user => user.id !== userId));
				toast.success("User deleted successfully.");
			}
		} catch (error) {
			console.error("Error deleting user:", error);
			toast.error("Failed to delete user.");
		}
	};

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const token = localStorage.getItem("adminToken");
				const headers = {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				};

				const response = await axios.get("https://booking-system-ge1i.onrender.com/api/user/", {
					headers,
				});
				if (response.status === 200) {
					setUsers(response.data); // Assuming response.data is an array of user objects
					setSortedUsers(response.data); // Initialize sorted users
				}
			} catch (error) {
				console.error("Error fetching users:", error);
			}
		};

		fetchUsers();
	}, []);

	useEffect(() => {
		let sorted;
		if (sortCriteria) {
			sorted = users.filter(user => user.department === sortCriteria);
		} else {
			sorted = users;
		}
		setSortedUsers(sorted);
	}, [sortCriteria, users]);

	return (
		<div className="listCont" style={{ margin: "100px 0px" }}>
			<ToastContainer />
			<h1>Employee List</h1>

			<div className="listButtonG">
				<button className="mainBtn" onClick={goAdd}>
					Add New Employee
				</button>

				<div className="dropdown">
					<button
						onClick={toggleDropdown}
						className="dropbtn"
						style={{ textAlign: "center" }}
					>
						Sort Company
						<IoMdArrowDropdown style={{ fontSize: "20px", margin: "0" }} />
					</button>
					{showDropdown && dropdownMenu}
				</div>
			</div>
			<div className="tableContainer">
				<div className="horizonscroll">
					<table className="listTable">
						<thead>
							<tr>
								<th className="tName">Name</th>
								<th className="tUname">Username</th>
								<th className="tDept">Department</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{sortedUsers.map(user => (
								<tr key={user.id}> {/* Use a unique key like user.id */}
									<td className="tName">{user.firstName} {user.surName}</td>
									<td className="tUname">{user.userName}</td>
									<td className="tDept">{user.department}</td>
									<td>
										<div className="listMod">
											<button className='editBtnadd' onClick={() => toggleEditDept(user._id)}>Edit Department</button>
											<button onClick={() => DeleteUser(user._id)}>Delete</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{editDeptModal && selectedUser && (
					<div className="modal">
						<p>User ID: {selectedUser}</p>
						{/* Add additional modal content and functionality here */}
					</div>
				)}
			</div>
		</div>
	);
};

export default WithAuthAdmin(EmployeeList);

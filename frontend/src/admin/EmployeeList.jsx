import { React, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminPages.css";
import { IoMdArrowDropdown } from "react-icons/io";
import WithAuthAdmin from "../auth/WithAuthAdmin";
import axios from "axios";

const EmployeeList = () => {
	const navigate = useNavigate();
	const [showDropdown, setShowDropdown] = useState(false);
	const [users, setUsers] = useState([]);
	const [sortedUsers, setSortedUsers] = useState([]);
	const [sortCriteria, setSortCriteria] = useState('');
	const [editDeptModal,seteditDeptModal] = useState(false);

	const toggleEditDept =()=>{
		seteditDeptModal(!editDeptModal)
	}
	const toggleDropdown = () => {
		setShowDropdown(!showDropdown);
	};

	const goAdd = () => {
		navigate("/admin/add-employee");
	};

	const dropdownMenu = (
		<div className="dropdown-content">
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

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const token = localStorage.getItem("adminToken");
				const headers = {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				};

				const response = await axios.get("http://localhost:8800/api/user/", {
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
				<table className="listTable">
					<thead>
						<tr>
							<th>Name</th>
							<th>Username</th>
							<th>Department</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{sortedUsers.map(user => (
							<tr key={user.id}> {/* Use a unique key like user.id */}
								<td>{user.firstName} {user.surName}</td>
								<td>{user.userName}</td>
								<td className="dept">{user.department}</td>
								<td>
									<div className="listMod">
										<button className='editBtnadd' onClick={toggleEditDept}>Edit Department</button>
										<button>Delete</button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
				{editDeptModal&&(
					<div className="modal">
						<button>hello</button>
					</div>
				)

				}
			</div>
		</div>
	);
};

export default WithAuthAdmin(EmployeeList);

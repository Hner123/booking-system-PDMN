import {React, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPages.css'


const EmployeeList =()=>{
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    const dropdownMenu = (
        <div className="dropdown-content">
            <button onClick={() => handleSort("Starlight")}>Starlight</button>
            <button onClick={() => handleSort("GDS Department")}>GDS Department</button>
            {/* Add more sorting options as needed */}
        </div>
    );

    const goAdd=()=>{
        navigate('/admin/add-employee')
    }
    const handleSort = (criteria) => {
        // Implement sorting logic here based on criteria (name, department, etc.)
        console.log(`Sorting by ${criteria}`);
        // You can modify this function to actually sort your employee list
    }
    return(
        <div className='listCont'>
            <h1>Employee List</h1>
            <div className='listButtonG'>
                <button className='mainBtn' onClick={goAdd}> Add New Employee</button>

                <div className="dropdown">
                    <button onClick={toggleDropdown} className="dropbtn">Sort Company</button>
                    {showDropdown && dropdownMenu}
                </div>
            </div>
            <div className="tableContainer">
                <table className='listTable'>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Username</th>
                            <th>Department</th>
                            <th>Role</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Juan Dela Cruz</td>
                            <td>Juan D.C.</td>
                            <td>Starlight</td>
                            <td>Accountant</td>
                            <td>
                                <div className='listMod'>
                                    <button className='editBtn'>Edit</button>
                                    <button>Delete</button>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>Jona Kasimsiman</td>
                            <td>Jona K.</td>
                            <td>GDS Department</td>
                            <td></td>
                            <td>
                                <div className='listMod'>
                                    <button className='editBtn'>Edit</button>
                                    <button>Delete</button>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td> </td>
                            <td> </td>
                            <td> </td>
                            <td> </td>
                            <td> </td>
                        </tr>
 
                    </tbody>
                </table>
            </div>
            
        </div>
    );
}
export default EmployeeList;
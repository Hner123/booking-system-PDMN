// import React from 'react';
// import roomBg from '../assets/palawan2.jpg';
// import { useNavigate } from 'react-router-dom';

// const ApprovalRoom = () => {
//   const navigate = useNavigate();
//   const Rooms = ["Palawan", "Boracay", "Palawan and Boracay"];

//   const approvalHandling = (room) => {
//     let route = '/admin/approval';
//     if (room === 'Palawan') {
//       route = '/admin/approval-palawan';
//     } else if (room === 'Boracay') {
//       route = '/admin/approval-boracay';
//     } else if (room === 'Palawan and Boracay') {
//       route = '/admin/approval-both';
//     }
//     navigate(route);
//   }

//   return (
//     <div className='listCont3'>
//       <h1>For Approval - Rooms</h1>
//       <div className="approval-card-container">
//           {Rooms.map((place, index) => (
//             <div key={`Rooms-${index}`} className="approveRooms" style={{ backgroundImage: `url(${roomBg})` }}>
//               <div className="overlayy">
//                 <h1 style={{ fontSize: '50px' }}>{place}</h1>
//                 <button className="forApproval-btn" onClick={() => approvalHandling(place)}>
//                   See Pending Approvals
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//     </div>
//   );
// }

// export default ApprovalRoom;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './Sidebar';
import './AdminPages.css';
import roomBgPalawan from '../assets/palawan2.jpg';
import roomBgBoracay from '../assets/boracay.jpg';
import roomBgBoth from '../assets/both.jpg';
import WithAuthAdmin from '../auth/WithAuthAdmin';

const ApprovalRoom = ({ sidebarOpen }) => {
  const navigate = useNavigate();
  const [bookData, setBookData] = useState([]);
  const [roomsWithApprovals, setRoomsWithApprovals] = useState([]);
  
  const Rooms = [
    { name: "Palawan", bgImage: roomBgPalawan, pendingApprovals: 0 },
    { name: "Boracay", bgImage: roomBgBoracay, pendingApprovals: 0 },
    { name: "Palawan and Boracay", bgImage: roomBgBoth, pendingApprovals: 0 },
  ];

  useEffect(() => {
    const fetchBookData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const response = await axios.get(`https://booking-system-ge1i.onrender.com/api/book/`, {
          headers,
        });

        if (response.status === 200) {
          const filteredData = response.data.filter(
            (event) => event.confirmation === false && event.approval.archive === false
          );
          setBookData(filteredData);
        } else {
          console.error("Response status is not OK");
        }
      } catch (error) {
        console.error("Error fetching book data:", error);
      }
    };

    fetchBookData();
  }, []);

  useEffect(() => {
    const updatePendingApprovals = () => {
      const updatedRooms = Rooms.map(room => {
        const count = bookData.filter(
          event => event.roomName === room.name
        ).length;
        return { ...room, pendingApprovals: count };
      });
      setRoomsWithApprovals(updatedRooms);
    };

    updatePendingApprovals();
  }, [bookData]);

  const approvalHandling = (room) => {
    let route = `/admin/approval/${room}`;
    navigate(route);
  };

  return (
    <div className={`approval-room-page ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <Sidebar />
      <div className="approval-room-content">
        <h1>Select Room</h1>
        <div className="room-list">
          {roomsWithApprovals.map((room) => (
            <div
              key={room.name}
              className="room-item"
              style={{ backgroundImage: `url(${room.bgImage})` }}
            >
              <div className="approval-badge">
                {room.pendingApprovals}
              </div>
              <h2>{room.name}</h2>
              <button onClick={() => approvalHandling(room.name)}>
                Select Room
              </button>
            </div>
          ))}
        </div>
        <div className="pending-approvals-list">
          {roomsWithApprovals
            .filter(room => room.pendingApprovals > 0)
            .map(room => (
              <div key={room.name} className="pending-approvals-info">
                {room.pendingApprovals > 1
                  ? `${room.pendingApprovals} Pending Approvals for ${room.name}`
                  : `1 Pending Approval for ${room.name}`}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default WithAuthAdmin(ApprovalRoom);
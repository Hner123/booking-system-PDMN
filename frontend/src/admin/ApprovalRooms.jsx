import React from 'react';
import roomBg from '../assets/palawan2.jpg';
import { useNavigate } from 'react-router-dom';

const ApprovalRoom = () => {
  const navigate = useNavigate();
  const Rooms = ["Palawan", "Boracay", "Palawan and Boracay"];

  const approvalHandling = (room) => {
    let route = '/admin/approval';
    if (room === 'Palawan') {
      route = '/admin/approval-palawan';
    } else if (room === 'Boracay') {
      route = '/admin/approval-boracay';
    } else if (room === 'Palawan and Boracay') {
      route = '/admin/approval-both';
    }
    navigate(route);
  }

  return (
    <div className='listCont3'>
      <h1>For Approval - Rooms</h1>
      <div className="approval-card-container">
          {Rooms.map((place, index) => (
            <div key={`Rooms-${index}`} className="approveRooms" style={{ backgroundImage: `url(${roomBg})` }}>
              <div className="overlayy">
                <h1 style={{ fontSize: '50px' }}>{place}</h1>
                <button className="forApproval-btn" onClick={() => approvalHandling(place)}>
                  See Pending Approvals
                </button>
              </div>
            </div>
          ))}
        </div>
    </div>
  );
}

export default ApprovalRoom;

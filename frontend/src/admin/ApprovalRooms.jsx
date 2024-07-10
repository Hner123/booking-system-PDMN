import React from 'react';
import roomBg from '../assets/roombg.jpg';
import { useNavigate } from 'react-router-dom';

const ApprovalRoom=()=>{
    const navigate = useNavigate();
    const Rooms = ["Palawan", "Boracay", "Palawan and Boracay"];

    const approvalHandling =()=>{
        navigate('/admin/approval')
    }
    return(
        <div className='listCont3' >
        <h1> For Approval - Rooms</h1>
        <div className="approval-card-container">
          {Rooms.map((place, index) => (
            <div key={`Rooms-${index}`} className="approveRooms" style={{ backgroundImage: `url(${roomBg})` }}>
              <div className="overlayy">
                <h1>{place}</h1>
                <button className="forApproval-btn" onClick={approvalHandling}>
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
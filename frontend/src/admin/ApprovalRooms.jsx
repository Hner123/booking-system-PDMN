import React from 'react';
import roomBg from '../assets/roombg.jpg';

const ApprovalRoom=()=>{
    const Rooms = ["Palawan", "Boracay", "Palawan and Boracay"]
    return(
        <div className='listCont3' >
        
        <div className="card-container">
          {Rooms.map((place, index) => (
            <div key={`Rooms-${index}`} className="card" style={{ backgroundImage: `url(${roomBg})` }}>
              <div className="overlay">
                <h3>{place}</h3>
                <button className="reserve-btn">
                  Reserve
                </button>
              </div>
            </div>
          ))}
        </div>
        </div>
    );
}

export default ApprovalRoom;
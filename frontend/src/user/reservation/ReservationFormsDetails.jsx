import React, { useState } from 'react';
import roomBg from '../../assets/roombg.jpg';

const ReservationFormsDetails = () => {
  const [phone, setPhone] = useState('');
  const [meeting, setMeeting] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [room, setRoom] = useState('');
  const [agenda, setAgenda] = useState('');
  const [pax, setPax] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    // Add validation and submission logic here
    console.log('Form submitted:', { phone, meeting, date, time, room, agenda, pax, reason });
  };

    return (
    <div className='form-page'>
        <h1>Booking Details</h1> 
        <div className="reservation-details-container" style={{ display: 'flex', justifyContent: 'space-between' }}>
            
            <div className="form-column" style={{ flex: 1 }}>
                {/* Left Column Content */}
                <div className='form-title'>
                    <h2>Reservation Details</h2>
                    <p style={{ fontSize: '12px', color: '#666', textAlign:'left' }}>

                
                Please enter the  correct information and check the details before confirming your booking.
                </p>
                </div>
                <form className="reservation-form" onSubmit={handleSubmit} style={{ display: 'grid', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                    <label htmlFor="name">Username:</label>
                    <div id="name" className="read-only" style={{ border: '1px solid #ccc', padding: '8px', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
                        John Doe
                    </div>
                    </div>
                    <div style={{ flex: 1 }}>
                    <label htmlFor="department">Department:</label>
                    <div id="department" className="read-only" style={{ border: '1px solid #ccc', padding: '8px', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
                        IT Department
                    </div>
                    </div>
                </div>

                <div>
                    <label htmlFor="phone">Number of Pax</label>
                    <div className="radio-group" style={{ display: 'flex' }}>
                        <div className="radio-option half-width">
                        <input
                            type="radio"
                            id="pax-1-2"
                            name="pax"
                            value="1-2"
                            checked={pax === '1-2'}
                            onChange={(event) => setPax(event.target.value)}
                        />
                        <label htmlFor="pax-1-2" style={{ marginLeft: '5px' }}>1-2 attendees</label>
                        </div>
                        <div className="radio-option half-width">
                        <input
                            type="radio"
                            id="pax-3-more"
                            name="pax"
                            value="3-more"
                            checked={pax === '3-more'}
                            onChange={(event) => setPax(event.target.value)}
                        />
                        <label htmlFor="pax-3-more" style={{ marginLeft: '5px' }}>3 or more attendees</label>
                        </div>
                    </div>
                    </div>


                {pax === '1-2' && (
                    <div style={{width: '100%'}}>
                    <label htmlFor="reason">Reason for 1-2 attendees</label>
                    <div>
                        <textarea
                        type="text"
                        id="reason"
                        name="reason"
                        value={reason}
                        rows="2"
                        onChange={(event) => setReason(event.target.value)}
                        placeholder="Enter reason"
                        style={{width: '100%'}}
                        />
                    </div>
                    </div>

                    
                )}

                <label htmlFor="meeting">Meeting Title:</label>
                <input
                    type="text"
                    id="meeting"
                    name="meeting"
                    value={meeting}
                    onChange={(event) => setMeeting(event.target.value)}
                    placeholder="Enter meeting title"
                />

                <label htmlFor="agenda">Agenda:</label>
                <textarea
                    id="agenda"
                    name="agenda"
                    value={agenda}
                    onChange={(event) => setAgenda(event.target.value)}
                    rows="4"
                    placeholder="Enter meeting agenda"
                ></textarea>

                <button type="submit" style={{ alignItems: 'center'}}>Book</button>
                <p style={{ marginTop: '10px', fontSize: '12px', color: '#666', textAlign:'center' }}>
                You cannot edit the meeting details once you book. Please check the details before confirming.
                </p>

                </form>
            </div>

            <div className="details-column" style={{ flex: '1', position: 'relative' }}>
                {/* Background Image */}
                <div className="background-image" style={{backgroundImage: `url(${roomBg})`,}}>
                    {/* Color Overlay */}
                    <div className="color-overlay" >

                    </div>

                    {/* Reservation Details */}
                    <div className="details">
                    <h1>ROOM NAME</h1>
                    <div className="separator"></div> {/* Line Separator */}
                    <p>
                        <strong>Date:</strong> {date}
                    </p>
                    <p>
                        <strong>Meeting Start:</strong> {time}
                    </p>
                    <p>
                        <strong>Meeting End:</strong> {time}
                    </p>
                    {agenda && (
                        <p>
                            <strong>Agenda:</strong> {agenda}
                        </p>
                    )}
                </div>

                </div>
            </div>

        </div>
    </div>
  );
};

export default ReservationFormsDetails;

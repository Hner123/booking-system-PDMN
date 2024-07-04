import React from 'react';


const BookingConfirmation = () => {
  return (
    <div className="booking-confirmation">
      <div className="confirmation-text">
        <h1>Your Palawan Room reservation has been confirmed.</h1>
        <p>Your booking for the dedicated room has been successfully confirmed. You can now rest assured that your reservation is locked in and ready for your upcoming event. You can view the details of your meeting, or head back to the dashboard.</p>
        <div className="buttons">
            <button className="reserve-btn" >View Details</button>
            <button className="block-btn" >Return to Dashboard</button>
              
        </div>
      </div>
      <div className="confirmation-image">
        <div className="image-overlay"></div>
        <img src="path/to/your/image.jpg" alt="Room" />
      </div>
    </div>
  );
};

export default BookingConfirmation;

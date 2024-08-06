import React from "react";
import "./Modal.css"; // Import your styles here

const Modal = ({ show, onConfirm, onCancel }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>You have unsaved changes in your reservation. </h3>{" "}
        <p> Are you sure you want to leave?</p>
        <div className="button-loc">
          <button className="button" onClick={onConfirm}>
            Yes
          </button>
          <button onClick={onCancel}>No</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;

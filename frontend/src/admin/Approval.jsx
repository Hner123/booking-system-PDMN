import React, { useState } from 'react';

const Approval = () => {
    const [rejectModal, setRejectModal] = useState(false);
    const [acceptModal, setAcceptModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    const cancelReject = () => {
        setRejectModal(false);
        setRejectReason('');
    };

    const cancelApprove = () => {
        setAcceptModal(false);
    };

    const handleApprove = () => {
        setAcceptModal(true);
    };

    const handleReject = () => {
        setRejectModal(true);
    };

    const handleRejectConfirm = () => {
        // Here you would handle the rejection action, for now we will just log the reason
        console.log('Reject Reason:', rejectReason);
        setRejectModal(false);
        setRejectReason('');
    };

    const handleReasonChange = (event) => {
        setRejectReason(event.target.value);
    };

    return (
        <div className='listCont1'>
            <h1>For Approval - PALAWAN ROOM</h1>
            <div className='approvalGroup'>
                <div className='approvalMeets'>
                    <div className='approvalDeets'>
                        <h2>Meeting With Client</h2>
                        <p>Date and Time: 09:00 A.M.-10:00 A.M.</p>
                        <p>Reserved By: Jona K.</p>
                        <p>Members: Employee 1, Employee 2</p>
                        <hr/>
                        <div className='approvalGrp'>
                            <button type='not-appr' onClick={handleReject}>Reject</button>
                            <button type='appr' onClick={handleApprove}>Approve</button>
                        </div>
                    </div>
                </div>
                <div className='approvalMeets'>
                    <div className='approvalDeets'>
                        <h2>Meeting With Client</h2>
                        <p>Date and Time: 09:00 A.M.-10:00 A.M.</p>
                        <p>Reserved By: Jona K.</p>
                        <p>Members: Employee 1, Employee 2</p>
                        <hr/>
                        <div className='approvalGrp'>
                            <button type='not-appr' onClick={handleReject}>Reject</button>
                            <button type='appr' onClick={handleApprove}>Approve</button>
                        </div>
                    </div>
                    {rejectModal && (
                        <div className='gen_modal'>
                            <div className='gen_modal-content'>
                                <p>Are you sure you want to reject the meeting?</p>
                                <input
                                    placeholder="Reason for rejecting"
                                    value={rejectReason}
                                    type='reject'
                                    onChange={handleReasonChange}
                                />
                                <button type='cancel' onClick={cancelReject}>Cancel</button>
                                <button type='reject' onClick={handleRejectConfirm}>Yes, reject</button>
                            </div>
                        </div>
                    )}
                    {acceptModal && (
                        <div className='gen_modal'>
                            <div className='gen_modal-content'>
                                <p>Are you sure you want to approve the meeting?</p>
                                <button type='cancel' onClick={cancelApprove}>Cancel</button>
                                <button type='approve'>Yes, approve</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Approval;

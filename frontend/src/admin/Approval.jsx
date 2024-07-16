import {React, useState} from 'react';

const Approval =()=>{

    const [rejectModal, rejectModalState] = useState(false);
    const [acceptModal, acceptModalState] = useState(false);

    const cancelReject =()=>{
        rejectModalState(false);
    }
    const cancelApprove =()=>{
        acceptModalState(false);
    }
    const handleApprove =()=>{
        acceptModalState(true);
    }
    const handleReject =()=>{
        rejectModalState(true);
    }
    return(
        <div className='listCont1'>
            <h1>For Approval - PALAWAN ROOM</h1>
            <div className='approvalGroup'>
                <div className='approvalMeets'>
                    <div className='approvalDeets'>
                    <h2>Meeting With Client</h2>
                    <p>Date and Time: 09:00 A.M.-10:00 A.M.</p>
                    <p>Reserved By: Jona K.</p>
                    <p> Members: Employee 1, Employee 2 </p>
                    <hr/>
                    <div className='approvalGrp'>
                        <button type='not-appr' onClick={handleReject}>Reject</button>
                        <button type = 'appr' onClick ={handleApprove}>Approve</button>
                    </div>
                    </div>

                </div>
                <div className='approvalMeets'>
                    <div className='approvalDeets'>
                    <h2>Meeting With Client</h2>
                    <p>Date and Time: 09:00 A.M.-10:00 A.M.</p>
                    <p>Reserved By: Jona K.</p>
                    <p>Members: Employee 1, Employee 2 </p>
                    <hr/>
                        <div className='approvalGrp'>
                            <button type='not-appr'onClick={handleReject} >Reject</button>
                            <button type = 'appr'onClick ={handleApprove}> Approve</button>
                        </div>
                    </div>
                    {rejectModal && (
                        <div className='gen_modal'>
                            <div className='gen_modal-content'>
                                <p>Are you sure you want to reject the meeting?</p>
                                <button type='cancel' onClick={cancelReject}>Cancel</button>
                                <button type= 'reject'>Yes, reject</button>
                            </div>
                        </div>
                    )}
                    {acceptModal &&(
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
}

export default Approval;
import {React, useState} from 'react';

const Approval =()=>{
    return(
        <div className='listCont1'>
            <h1>For Approval</h1>
            <div className='approvalGroup'>
                <div className='approvalMeets'>
                    <div className='approvalDeets'>
                    <h2>Palawan Room</h2>
                    <p>Meeting Title: Meeting With Client</p>
                    <p>Date and Time: 09:00 A.M.-10:00 A.M.</p>
                    <p>Reserved By: Jona K.</p>
                    <p> Members: Employee 1, Employee 2 </p>
                    <hr/>
                    <div className='approvalGrp'>
                        <button type='reject' >Reject</button>
                        <button type = 'approve'>Approve</button>
                    </div>
                    </div>

                </div>
                <div className='approvalMeets'>
                    <div className='approvalDeets'>
                    <h2>Palawan Room</h2>
                    <p>Meeting Title: Meeting With Client</p>
                    <p>Date and Time: 09:00 A.M.-10:00 A.M.</p>
                    <p>Reserved By: Jona K.</p>
                    <p>Members: Employee 1, Employee 2 </p>
                        <div className='approvalGrp'>
                            <button type='reject' >Reject</button>
                            <button type = 'approve'>Approve</button>
                        </div>
                    </div>

                </div>
                <div className='approvalMeets'>

                </div>
            </div>
        </div>
    );
}

export default Approval;
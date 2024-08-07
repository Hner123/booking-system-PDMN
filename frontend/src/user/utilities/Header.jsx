// import React, { useState, useRef, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import * as FaIcons from "react-icons/fa";
// import logo from "../../assets/logos/GDSLogo.png";
// import profile from "../../assets/Default Avatar.png";
// import "./Header.css";
// import axios from "axios";
// import Modal from "./Modal";
// import io from 'socket.io-client';

// const ENDPOINT = 'https://booking-system-ge1i.onrender.com';
// let socket;

// const Header = () => {
//   const [isProfileOpen, setProfileOpen] = useState(false);
//   const [isNotifOpen, setNotifOpen] = useState(false);
//   const [isMenuOpen, setMenuOpen] = useState(false);
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [showModal, setShowModal] = useState(false);
//   const reserve = localStorage.getItem("reserveToken");

//   const profileModalRef = useRef(null);
//   const notifModalRef = useRef(null);

//   const [userData, setUserData] = useState(null);
//   const [notifications, setNotifications] = useState([]);
//   const [socketConnected, setSocketConnected] = useState(false);

//   useEffect(() => {
//     const userId = localStorage.getItem("userId");

//     socket = io(ENDPOINT);
//     socket.emit("setup", { _id: userId });

//     socket.on("newNotification", (newNotification) => {
//       if (newNotification.receiver._id === userId) {
//         setNotifications(prev => [newNotification, ...prev]);
//       }
//     });

//     return () => {
//       socket.disconnect();
//     };
//   }, []);

//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         const userId = localStorage.getItem("userId");
//         const token = localStorage.getItem("authToken");
//         const headers = {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         };

//         const response = await axios.get(`https://booking-system-ge1i.onrender.com/api/user/${userId}`, { headers });
//         if (response.status === 200) {
//           setUserData(response.data);
//         }
//       } catch (error) {
//         console.error("Error fetching user data:", error);
//       }
//     };

//     fetchUserData();
//   }, []);

//   useEffect(() => {
//     const fetchNotifications = async () => {
//       try {
//         const userId = localStorage.getItem("userId");
//         const response = await axios.get('https://booking-system-ge1i.onrender.com/api/notif');
//         const userNotifications = response.data.filter(notif => notif.receiver._id === userId);
//         setNotifications(userNotifications);
//       } catch (error) {
//         console.error('Error fetching notifications:', error);
//       }
//     };

//     fetchNotifications();
//   }, []);

//   useEffect(() => {
//     const handleOutsideClick = (event) => {
//       if (profileModalRef.current && !profileModalRef.current.contains(event.target)) {
//         setProfileOpen(false);
//       }
//       if (notifModalRef.current && !notifModalRef.current.contains(event.target)) {
//         setNotifOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleOutsideClick);

//     return () => {
//       document.removeEventListener("mousedown", handleOutsideClick);
//     };
//   }, []);

//   const [prevLocation, setPrevLocation] = useState(null);
//   const [nextLocation, setNextLocation] = useState(location.pathname);

//   useEffect(() => {
//     const currentPath = location.pathname;
//     const excludedPaths = ['/reserve', '/reserveform', '/confirmation'];

//     if (excludedPaths.includes(currentPath)) {
//       setPrevLocation(currentPath);
//     } else if (prevLocation && !excludedPaths.includes(prevLocation)) {
//       setPrevLocation(prevLocation);
//     }

//     if (excludedPaths.includes(prevLocation) && !excludedPaths.includes(currentPath) && !showModal) {
//       if (reserve) {
//         setNextLocation(currentPath);
//         setShowModal(true);
//       }
//     }
//   }, [location, reserve, showModal, prevLocation]);

//   const handleConfirm = () => {
//     setShowModal(false);
//     setPrevLocation(nextLocation);
//     localStorage.removeItem("reserveToken");
//   };

//   const handleCancel = () => {
//     setShowModal(false);
//     if (prevLocation !== nextLocation) {
//       navigate(prevLocation);
//     } else {
//       navigate('/reserve');
//     }
//   };

//   const handleModalToggle = () => {
//     setProfileOpen(!isProfileOpen);
//     setNotifOpen(false);
//   };

//   const handleNotifToggle = () => {
//     setNotifOpen(!isNotifOpen);
//     setProfileOpen(false);
//   };

//   const navigateEdit = () => {
//     navigate("/user/edit");
//   };

//   const navigateUserList = () => {
//     navigate("/employee-list");
//   };

//   const handleLogoClick = () => {
//     navigate("/dashboard");
//   };

//   const handleLogout = () => {
//     localStorage.clear();
//     navigate("/");
//   };

//   const toggleMenu = () => {
//     setProfileOpen(false);
//     setNotifOpen(false);
//     setMenuOpen(!isMenuOpen);
//   };

//   return (
//     <header className="dashboard-header">
//       <div
//         className="logodb"
//         onClick={handleLogoClick}
//         style={{ cursor: "pointer" }}
//       >
//         <span className="tooltip-text">Home</span>
//         <img src={logo} alt="Logo" />
//       </div>

//       <Modal
//         show={showModal}
//         onConfirm={handleConfirm}
//         onCancel={handleCancel}
//       />

//       <div className="header-actions">
//         <div className="user-list-icon" onClick={navigateUserList}>
//           <FaIcons.FaUsers />
//           <span className="tooltip-text">User List</span>
//         </div>
//         <div className="notif-icon" onClick={handleNotifToggle}>
//           <FaIcons.FaBell />
//           <span className="notif-count">
//             {notifications.filter((n) => !n.read).length}
//           </span>
//           <span className="tooltip-text">Notifications</span>
//         </div>
//         <div className="profile-icon" onClick={handleModalToggle}>
//           <FaIcons.FaUserCircle />
//           {userData && (
//             <span className="user-name">
//               {userData.firstName} {userData.surName}
//             </span>
//           )}
//         </div>

//         <div className="burger-menu" onClick={toggleMenu}>
//           <FaIcons.FaBars />
//         </div>

//         {isMenuOpen && (
//           <div className="burger-menu-content">
//             <div className="user-list-icon" onClick={navigateUserList}>
//               <FaIcons.FaUsers />
//               <span className="user-name">User List</span>
//             </div>
//             {/* <div className="notif-icon" onClick={handleNotifToggle}>
//               <FaIcons.FaBell />
//               <span className="user-name">Notifications</span>
//             </div> */}
//             <div className="profile-icon" onClick={navigateEdit}>
//               <FaIcons.FaUserCircle />
//               <span className="user-name">
//                 Profile
//               </span>
//             </div>
//           </div>
//         )}

//         {isProfileOpen && (
//           <div className="headermodal" ref={profileModalRef}>
//             <div className="headermodal-content text-center">
//               {userData && (
//                 <>
//                   <h2 style={{ textAlign: "center" }}>
//                     Hello! {userData.firstName} {userData.surName}
//                   </h2>
//                   <p style={{ textAlign: "center" }}>
//                     Department: {userData.department}
//                   </p>
//                 </>
//               )}
//               <div className="headermodal-buttons">
//                 <button onClick={navigateEdit}>Edit Profile</button>
//                 <button onClick={handleLogout}>Log Out</button>
//               </div>
//             </div>
//           </div>
//         )}

//         {isNotifOpen && (
//           <div className="headermodal" ref={notifModalRef}>
//             <div className="headermodal-content">
//               <div>
//                 <h1 style={{ margin: "0" }}>Your Notifications</h1>
//                 <hr style={{ border: "0.5px solid #7C8B9D", margin: "5px" }}></hr>
//                 <ul className="notifications-list">
//                   {notifications.map((notification, index) => (
//                     <li
//                       key={index}
//                       className={`notification-item ${notification.read ? "read" : "unread"}`}
//                     >
//                       <p>{notification.message}</p>
//                       <span>{new Date(notification.createdAt).toLocaleString()}</span>
//                     </li>
//                   ))}
//                 </ul>
//                 <div className="headermodal-buttons">
//                   <button>Mark All as Read</button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </header>
//   );
// };

// export default Header;
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as FaIcons from "react-icons/fa";
import logo from "../../assets/logos/GDSLogo.png";
import profile from "../../assets/Default Avatar.png";
import "./Header.css";
import axios from "axios";
import Modal from "./Modal";
import io from "socket.io-client";

const ENDPOINT = "https://booking-system-ge1i.onrender.com";
let socket;

const Header = () => {
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isNotifOpen, setNotifOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const profileDropdownRef = useRef(null);
  const notifDropdownRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const reserve = localStorage.getItem("reserveToken");

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    socket = io(ENDPOINT);
    socket.emit("setup", { _id: userId });
    socket.on("newNotification", (newNotification) => {
      if (newNotification.receiver._id === userId) {
        setNotifications((prev) => [newNotification, ...prev]);
      }
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("authToken");
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };
        const response = await axios.get(
          `https://booking-system-ge1i.onrender.com/api/user/${userId}`,
          { headers }
        );
        if (response.status === 200) setUserData(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoadingNotifications(true);
      try {
        const userId = localStorage.getItem("userId");
        const response = await axios.get(
          "https://booking-system-ge1i.onrender.com/api/notif"
        );
        const userNotifications = response.data.filter(
          (notif) => notif.receiver._id === userId
        );
        setNotifications(userNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoadingNotifications(false);
      }
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      )
        setProfileOpen(false);
      if (
        notifDropdownRef.current &&
        !notifDropdownRef.current.contains(event.target)
      )
        setNotifOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleProfileToggle = () => {
    setProfileOpen(!isProfileOpen);
    setNotifOpen(false);
  };

  const handleNotifToggle = () => {
    setNotifOpen(!isNotifOpen);
    setProfileOpen(false);
  };

  const handleClearNotifications = async () => {
    try {
      const userId = localStorage.getItem("userId");
      await axios.delete(
        `https://booking-system-ge1i.onrender.com/api/notif/${userId}`
      );
      setNotifications([]);
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  const [prevLocation, setPrevLocation] = useState(null);
  const [nextLocation, setNextLocation] = useState(location.pathname);

  useEffect(() => {
    const currentPath = location.pathname;
    const excludedPaths = ["/reserve", "/reserveform", "/confirmation"];

    if (excludedPaths.includes(currentPath)) {
      setPrevLocation(currentPath);
    } else if (prevLocation && !excludedPaths.includes(prevLocation)) {
      setPrevLocation(prevLocation);
    }

    if (
      excludedPaths.includes(prevLocation) &&
      !excludedPaths.includes(currentPath) &&
      !showModal
    ) {
      if (reserve) {
        setNextLocation(currentPath);
        setShowModal(true);
      }
    }
  }, [location, reserve, showModal, prevLocation]);

  const handleConfirm = () => {
    setShowModal(false);
    setPrevLocation(nextLocation);
    localStorage.removeItem("reserveToken");
  };

  const handleCancel = () => {
    setShowModal(false);
    if (prevLocation !== nextLocation) {
      navigate(prevLocation);
    } else {
      navigate("/reserve");
    }
  };

  const navigateEdit = () => navigate("/user/edit");
  const navigateUserList = () => navigate("/employee-list");
  const handleLogoClick = () => navigate("/dashboard");
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <header>
      <Modal
        show={showModal}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

      <div
        className="headerlogo"
        onClick={handleLogoClick}
        style={{ cursor: "pointer" }}
      >
        <img src={logo} alt="Logo" />
      </div>
      <nav className="nav">
        <div
          className="nav-item"
          onClick={navigateUserList}
          aria-label="User List"
        >
          <FaIcons.FaUsers />
        </div>
        <div
          className="nav-item"
          onClick={handleNotifToggle}
          aria-label="Notifications"
        >
          <FaIcons.FaBell />
          {notifications.length > 0 && (
            <span className="notif-count">{notifications.length}</span>
          )}
          {isNotifOpen && (
            <div
              ref={notifDropdownRef}
              className="dropdown notif-dropdown"
              aria-labelledby="notification-button"
            >
              <h3>Notifications</h3>
              {loadingNotifications ? (
                <p>Loading...</p>
              ) : notifications.length > 0 ? (
                <>
                  <button
                    className="clear-btn"
                    onClick={handleClearNotifications}
                  >
                    Clear All
                  </button>
                  <ul>
                    {notifications.map((notif, index) => {
                      let message = notif.message;
                      // Replace "approved" and "rejected" with styled versions
                      message = message.replace(
                        /(approved)/gi,
                        '<span class="status-approved">$1</span>'
                      );
                      message = message.replace(
                        /(rejected)/gi,
                        '<span class="status-rejected">$1</span>'
                      );

                      return (
                        <li key={index}>
                          <p dangerouslySetInnerHTML={{ __html: message }} />
                          <span>
                            {new Date(notif.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}{" "}
                            {new Date(notif.createdAt).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </>
              ) : (
                <p>No notifications</p>
              )}
            </div>
          )}
        </div>
        <div
          className="nav-item"
          onClick={handleProfileToggle}
          aria-label="Profile"
        >
          <img src={profile} alt="Profile" className="profile-img" />
          {userData && (
            <p className="profile-name">
              {userData.firstName} {userData.surName}
            </p>
          )}
          {isProfileOpen && (
            <div
              ref={profileDropdownRef}
              className="dropdown profile-dropdown"
              aria-labelledby="profile-button"
            >
              {userData && (
                <div className="profile-text">
                  <h3>
                    Hello, {userData.firstName} {userData.surName}!
                  </h3>
                  <p>
                    Department: <strong>{userData.department}</strong>
                  </p>
                </div>
              )}

              <div className="profile-btn">
                <button onClick={navigateUserList}>User List</button>
                <button onClick={navigateEdit}>Edit Profile</button>
                <button onClick={handleLogout}>Logout</button>
              </div>
            </div>
          )}
        </div>
      </nav>
      {showModal && (
        <Modal
          onConfirm={() => setShowModal(false)}
          onCancel={() => setShowModal(false)}
        />
      )}
    </header>
  );
};

export default Header;

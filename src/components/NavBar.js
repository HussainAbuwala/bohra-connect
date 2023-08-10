import { React, useState, useEffect } from "react";
import "./NavBar.css";
import { Link } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { io } from "socket.io-client";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";

export default function NavBar() {
   const navigate = useNavigate();
   const [bohraCount, setBohraCount] = useState(0);
   const [isFlashing, setIsFlashing] = useState(false);

   const flashingStyle = "btn btn-dark flashing-text";

   function handleLinkClick(data) {
      console.log("notification clicked");
      const numberStrings = data.lngLat.split(",");
      const lngLatArray = numberStrings.map((str) => parseFloat(str));

      navigate("/Dashboard", {
         state: { lngLat: lngLatArray, ejamaat: data.ejamaat },
      });
   }

   async function getTotalBohraCount() {
      const response = await fetch(
         `${process.env.REACT_APP_SERVER_URL}/bohra-count`
      );

      if (!response.ok) {
         const message = `An error occured: ${response.statusText}`;
         window.alert(message);
         return;
      }
      const obj = await response.json();
      setBohraCount(obj.bohraCount);
   }

   function onBohraEvent(data) {
      setIsFlashing(true);
      setBohraCount((prevCount) => prevCount + 1);
      toast.info(
         <>
            New Bohra in the community: <strong>{data.fullName}</strong>
            <br />
            <button
               type="button"
               className="btn btn-primary btn-sm rounded"
               onClick={() => handleLinkClick(data)}
            >
               Connect
            </button>
         </>,
         {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 5000,
         }
      );
      setTimeout(() => {
         setIsFlashing(false);
      }, 15000);
   }

   function connect_error(socket) {
      setTimeout(() => socket.connect(), 5000);
   }

   function disconnect(socket) {
      console.log("Client: Server Disconnected");
   }

   useEffect(() => {
      const socket = io(`${process.env.REACT_APP_SERVER_URL}`);

      socket.on("connect", () => {
         console.log("Client:  Connecteed ", socket.id);
      });
      socket.on("connect_error", connect_error);
      socket.on("disconnect", disconnect);
      socket.on("new-bohra", onBohraEvent);

      getTotalBohraCount();

      return () => {
         socket.off("connect_error", connect_error);
         socket.off("disconnect", disconnect);
         socket.off("new-bohra", onBohraEvent);
         socket.disconnect();
      };
   }, []);

   return (
      <div className="bg-light nav-bar-container">
         <img
            src="https://img.icons8.com/?size=512&id=84635&format=png"
            width="30"
            height="30"
            alt=""
         ></img>
         <Link className="navbar-brand navbar-labels navbar-title" to="/">
            Bohra Connect
         </Link>
         <div className="anchor-container">
            <div className="responsive-anchor-container">
               <NavLink to="/" className="btn btn-outline-secondary navbar-label">
                  About
               </NavLink>
               <NavLink
                  to="/Connect"
                  className="btn btn-outline-secondary navbar-label"
               >
                  Connect
               </NavLink>
               <NavLink
                  to="/Dashboard"
                  className="btn btn-outline-secondary navbar-label"
               >
                  Dashboard
               </NavLink>
            </div>
         
            <span className={isFlashing ? flashingStyle : "btn btn-dark"}>
               {bohraCount}
            </span>

            <DropdownButton id="dropdown-basic-button" title="Menu" variant='secondary' className="dropdown-container">
               <Dropdown.Item><NavLink className='menu-nav-link' to="/">About</NavLink></Dropdown.Item>
               <Dropdown.Item><NavLink className='menu-nav-link' to="/Connect">Connect</NavLink></Dropdown.Item>
               <Dropdown.Item><NavLink className='menu-nav-link' to="/Dashboard">Dashboard</NavLink></Dropdown.Item>
            </DropdownButton>
         </div>
         <ToastContainer />
      </div>
   );
}

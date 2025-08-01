'use strict';
const { useState, useEffect, useContext } = React;
const API_URL = ""; // When in VM, set this to "/node"

const Header = () => {
    const { user, setUser } = useContext(UserContext);

    async function logoutHandler() {
        try {
            const res = await fetch(`${API_URL}/auth/logout`, {
                method: "POST"
            });

            if (res.ok) {
                setUser(null);
                localStorage.removeItem("user");
                window.location.href = `${API_URL}/`
            } 
        } catch (e) {
            console.log(`Error on Logout:`,e);
        }
    }

    return (
      <header aria-labelledby="header" role="banner">
        <div className="top-bar">
            <div className="logo">
                <a href={`${API_URL}/index.html`} aria-label="Dirt & Deeds Home">
                    <img src={`${API_URL}/Resources/d&dlogo.png`} alt="Dirt & Deeds logo" />
                </a>
                <h1 id="header">
                    <a href={`${API_URL}/index.html`} aria-label="Go to Homepage">Dirt & Deeds</a>
                </h1>
            </div>
            <nav aria-label="Main navigation">
                <ul>
                    <li><a href={`${API_URL}/Pages/SignUpLogIn/SignUp.html`} aria-label="Join page">Join</a></li>
                    <li><a href={`${API_URL}/Pages/Map/Map.html`} aria-label="View the Map">Map</a></li>
                    <li><a href={`${API_URL}/Pages/Forum/Forum.html`} aria-label="Access the Forum">Forum</a></li>
                    <li><a href={`${API_URL}/Pages/PlantInfo/PlantInfo.html`} aria-label="Learn about Plants">Plants</a></li>
                    <li><a href={`${API_URL}/Pages/Awareness/Awareness.html`} aria-label="Explore Resources">Resources</a></li>
                </ul>
          </nav>

          <div className="user-greeting">
            {user && user.UserInfo && user.UserInfo.username ? (
                <ul className="user-nav" role="navigation" aria-label="User navigation">
                <li><a href={`${API_URL}/Pages/Profile/profile.html`} className="profile-link" aria-label="View Profile">Profile</a></li>
                <li>
                    <div className="user-info">
                        <span className="username" aria-live="polite">{user.UserInfo.username}</span>
                        <button onClick={logoutHandler} aria-label="Log out">Logout</button>
                    </div>
                </li>
                </ul>
            ) : (
                <p className="guest" aria-live="polite">Welcome, Guest</p>
            )}
          </div>
        </div>
      </header>
    );
};

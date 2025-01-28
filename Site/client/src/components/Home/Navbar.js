import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/images/tr_logo.svg'
import '../../styles/Home/Navbar.css'

export default function Navbar() {
    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <img 
                    src={logo}
                    alt="logo"
                    className="home-logo"
                />
            </div>
            <svg width="1" height="21" viewBox="0 0 1 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="0.5" y1="0.5" x2="0.499999" y2="20.5" stroke="#E4E7EC"/>
            </svg>
            <div className="navbar-links">
                <div className="navbar-link">Data</div>
                <div className="navbar-link">Features</div>
                <div className="navbar-link">Docs</div>
                <div className="navbar-link">Contact</div>
            </div>
            <svg width="1" height="21" viewBox="0 0 1 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="0.5" y1="0.5" x2="0.499999" y2="20.5" stroke="#E4E7EC"/>
            </svg>
            <div className="sign-in">
                Sign in
            </div>
            <Link to="/dashboard">
                <div className="launch-button">
                    Launch App
                </div>
            </Link>
        </nav>
    );
}
import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Home/LaunchButton.css'

export default function LaunchButton() {
    return (
        <div className="button-container">
            <Link to="/dashboard">
                <div className="button1">
                    Launch App
                </div>
            </Link>
            <div className="button2">
                Get Data
            </div>
        </div>
    )
}
import React, {useState, useEffect, useContext} from 'react';
import DashCharts from '../components/Dashboard/DashCharts';
import DashNav from '../components/Dashboard/DashNav';
import "../styles/Dashboard/DashBoard.css"
import { DashboardContext } from '../contexts/DashboardContext';


export default function DashBoard() {
    const { layouts } = useContext(DashboardContext);

    return (
        <div className="dashboard">
            <DashNav/>
                <div className="lower-content">
                    <DashCharts layouts={layouts}/>
                </div>
        </div>
    );
};
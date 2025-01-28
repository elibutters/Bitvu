import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/images/tr_logo.svg'
import name_logo from '../../assets/images/name_logo.svg'
import '../../styles/Dashboard/DashNav.css'
import { DashboardContext } from '../../contexts/DashboardContext';

import DNCoinDD from './DNCoinDD';
import DNExchDD from './DNExchDD';
import DNTypeDD from './DNTypeDD';

export default function DashNav() {
    const {
        selectedCoin,
        setSelectedCoin,
        selectedExchange,
        setSelectedExchange,
        selectedType,
        setSelectedType
    } = useContext(DashboardContext);

    return (
        <nav className="dashnav-bar">
            <div className="left-side">
                    <Link to="/" className="full-dash-logo">
                        <img
                            src={logo}
                            alt="logo"
                            className="dash-logo"
                        />
                        <img
                            src={name_logo}
                            alt="name_logo"
                            className="name-logo"
                        />
                    </Link>
                <div className="dropdowns">
                    <DNCoinDD selectedCoin={selectedCoin} setSelectedCoin={setSelectedCoin}/>
                    <DNExchDD selectedExch={selectedExchange} setSelectedExch={setSelectedExchange}/>
                    <DNTypeDD selectedType={selectedType} setSelectedType={setSelectedType}/>
                </div>
            </div>

            <div className="login">
                Log in
            </div>
        </nav>
    );
}
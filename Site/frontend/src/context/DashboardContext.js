'use client'; // Required for client-side state management

import { createContext, useState, useEffect, useContext } from 'react';
import DashPresets from '@/presets/DashPresets';

export const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
    // Existing state management
    const [selectedCoin, setSelectedCoin] = useState("AAVE");
    const [selectedExchange, setSelectedExchange] = useState("Hyperliquid");
    const [selectedType, setSelectedType] = useState("Perps");
    const [selectedExpiryOB, setSelectedExpiryOB] = useState("24JAN25");
    const [dashNavGlobalDropdown, setDashNavGlobalDropdown] = useState(false);
    const [layouts, setLayouts] = useState(() => DashPresets("AAVE", "Hyperliquid", "Perps").layouts);

    // Layout presets update
    useEffect(() => {
        const newPreset = DashPresets(selectedCoin, selectedExchange, selectedType);
        setLayouts(newPreset.layouts);
    }, [selectedCoin, selectedExchange, selectedType]);

    return (
        <DashboardContext.Provider
            value={{
                selectedCoin,
                setSelectedCoin,
                selectedExchange,
                setSelectedExchange,
                selectedType,
                setSelectedType,
                layouts,
                setLayouts,
                dashNavGlobalDropdown,
                setDashNavGlobalDropdown,
                selectedExpiryOB,
                setSelectedExpiryOB,
            }}
        >
            {children}
        </DashboardContext.Provider>
    );
};

export const useDashboard = () => {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
};
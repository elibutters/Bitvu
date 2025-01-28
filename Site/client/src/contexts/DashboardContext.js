import React, { createContext, useState, useEffect } from 'react';
import DashPresets from '../dash_presets/DashPresets';

export const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
    const [selectedCoin, setSelectedCoin] = useState("AAVE");
    const [selectedExchange, setSelectedExchange] = useState("Hyperliquid"); 
    const [selectedType, setSelectedType] = useState("Perps");
    const [selectedExpiryOB, setSelectedExpiryOB] = useState("24JAN25");
    const [dashNavGlobalDropdown, setDashNavGlobalDropdown] = useState(false);

    const newPreset = DashPresets(selectedCoin, selectedExchange, selectedType)
    const [layouts, setLayouts] = useState(newPreset.layouts);
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        const newPreset = DashPresets(selectedCoin, selectedExchange, selectedType);
        setLayouts(newPreset.layouts);
    }, [selectedCoin, selectedExchange, selectedType]);

    const fetchChartData = async (coin, exchange, type) => {
        try {
            //const response = await fetch(`http://127.0.0.1:5001/dashboard/charts?coin=${coin}&exchange=${exchange}&type=${type}`)
            //const data = await response.json();
            //console.log(data)
            //setChartData(data);
            console.log('old get data');
        } catch (error) {
            setChartData({
                '1D': [
                  [Date.UTC(2023, 10, 1), 100],
                  [Date.UTC(2023, 10, 2), 110],
                  [Date.UTC(2023, 10, 3), 105],
                  [Date.UTC(2023, 10, 4), 120],
                  [Date.UTC(2023, 10, 5), 90],
                ],
                '1W': [
                  [Date.UTC(2023, 9, 28), 100],
                  [Date.UTC(2023, 9, 29), 105],
                  [Date.UTC(2023, 9, 30), 95],
                  [Date.UTC(2023, 9, 31), 115],
                  [Date.UTC(2023, 10, 1), 100],
                  [Date.UTC(2023, 10, 2), 110],
                  [Date.UTC(2023, 10, 3), 105],
                ],
                '1M': [
                  [Date.UTC(2023, 9, 5), 100],
                  [Date.UTC(2023, 9, 10), 105],
                  [Date.UTC(2023, 9, 15), 95],
                  [Date.UTC(2023, 9, 20), 115],
                  [Date.UTC(2023, 9, 25), 90],
                  [Date.UTC(2023, 9, 30), 110],
                  [Date.UTC(2023, 10, 5), 105],
                ],
                '3M': [],
              })
            //console.error("Failed to fetch chart data: ", error);
            //setChartData(null);
        }
    };

    useEffect(() => {
        fetchChartData(selectedCoin, selectedExchange, selectedType);
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
                chartData,
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
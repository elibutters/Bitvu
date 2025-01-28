import React, { useState, useContext, useEffect, forwardRef } from 'react';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import { ResponsiveContainer } from 'recharts';
import '../../styles/Dashboard/ExRHC.css';
import { DashboardContext } from '../../contexts/DashboardContext';
import { io } from 'socket.io-client';

const ExRHC = forwardRef((props, ref) => {
    const [timeframe, setTimeframe] = useState('3M');
  const [chartData, setChartData] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  console.log('making RHC');

  useEffect(() => {
    console.log('trying to connect');
    const socket = io('http://localhost:5001', {
        transports: ['websocket'],
    });

    socket.on('connect', () => {
        console.log('Connected to socket server!');
        setSocketConnected(true);
    });

    socket.on('chart_update', (newDataPoint) => {
        console.log('Received update:', newDataPoint);
        setChartData(prevChartData => {
            const updated = [...prevChartData, newDataPoint];
            console.log("Updated chart data:", updated);
            return updated;
          });
    });

    return () => {
        socket.close();
    };
  }, []);

  const chartOptions = {
    chart: {
      type: 'line',
      backgroundColor: '#1b1b1b',
      style: {
        fontFamily: 'sans-serif',
        color: '#ffffff',
        'margin': '-5px',
      },
      zoomType: "",
    },
    navigator: {
      enabled: false,
    },
    scrollbar: {
      enabled: false,
    },
    title: {
      text: ''
    },
    xAxis: {
      type: 'datetime',
      crosshair: true,
      lineColor: '#ffffff',
      tickColor: '#ffffff',
      labels: {
        style: { color: '#ffffff' },
      },
    },
    yAxis: {
      title: {
        text: 'Price',
        style: { color: '#ffffff' },
      },
      labels: {
        style: { color: '#ffffff' },
      },
      gridLineWidth: 0,
      crosshair: true,
    },
    tooltip: {
      shared: true,
      crosshairs: true,
      valueDecimals: 2,
      backgroundColor: '#2c2c2c',
      style: {
        color: '#ffffff',
      },
    },
    rangeSelector: {
      enabled: false
    },
    plotOptions: {
      series: {
        marker: {
          enabled: false,
        },
      },
    },
    series: [
      {
        name: 'Example Series',
        data: chartData ? chartData : [],
        color: '#00bfff',
      },
    ],
    credits: {
      enabled: false,
    },
  };

  return (
    <div 
    className="financial-chart-container"
    ref={ref}
    >
      <HighchartsReact
        highcharts={Highcharts}
        constructorType={'stockChart'}
        options={chartOptions}
      />
    </div>
  );
});

export default ExRHC;
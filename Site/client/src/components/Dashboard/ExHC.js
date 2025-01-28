import React, { useState, useContext, useCallback, forwardRef } from 'react';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import { ResponsiveContainer } from 'recharts';
import '../../styles/Dashboard/ExHC.css';
import { DashboardContext } from '../../contexts/DashboardContext';

const ExHC = forwardRef((props, ref) => {
  const [timeframe, setTimeframe] = useState('3M');
  const { chartData } = useContext(DashboardContext);

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
        data: chartData ? chartData[timeframe] : [],
        color: '#00bfff', // example line color
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

export default ExHC;
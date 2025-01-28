import React, { useState, useEffect, forwardRef, useRef, useContext } from 'react';
import { createChart, LineStyle } from 'lightweight-charts';
import { io } from 'socket.io-client';
import '../../styles/ChartTypes/PerpChart.css';
import { DashboardContext } from '../../contexts/DashboardContext';

const PerpChart = forwardRef((props, ref) => {
  const [timeframe, setTimeframe] = useState('5m');
  const [showDropdown, setShowDropdown] = useState(false);
  const timeframeRef = useRef(timeframe);
  const chartContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const seriesRef = useRef(null);
  const candlesRef = useRef([]);
  const volumeSeriesRef = useRef(null);
  const [hoverData, setHoverData] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  const legendRef = useRef(null);
  const [legendData, setLegendData] = useState({
    time: '',
    open: 0,
    high: 0,
    low: 0,
    close: 0,
    volume: 0,
  });
  const { selectedCoin, selectedExchange } = useContext(DashboardContext);
  const availableTimeframes = ['1m', '5m', '15m', '30m', '1h', '4h', '8h', '12h', '1d', '1w'];

  useEffect(() => {
    timeframeRef.current = timeframe;
  }, [timeframe]);

  useEffect(() => {
    // Initialize chart
    let chart;
    let resizeObserver;
    const container = chartContainerRef.current;

    if (container && !chartInstanceRef.current) {
      chart = createChart(container, {
        layout: {
          background: { color: '#212121' },
          textColor: '#D1D4DC',
        },
        grid: {
          vertLines: { color: '#373737' },
          horzLines: { color: '#373737' },
        },
        width: container.clientWidth,
        height: container.clientHeight,
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
        },
        borderVisible: false
      });

      // CHANGED: Store resizeObserver in local variable
      resizeObserver = new ResizeObserver(entries => {
        const { width, height } = entries[0].contentRect;
        chart.resize(width, height);
      });

      resizeObserver.observe(container);

      seriesRef.current = chart.addCandlestickSeries({
        upColor: '#26A69A',
        downColor: '#EF5350',
        borderVisible: false,
        wickUpColor: '#26A69A',
        wickDownColor: '#EF5350',
      });

      const volumeSeries = chart.addHistogramSeries({
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: 'volume',
        color: '#26a69a',
        priceLineVisible: false,
        priceLineStyle: LineStyle.Dotted,
      });
  
      // Configure pane layout
      chart.priceScale('volume').applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0.0, 
        },
        borderVisible: false
      });
  
      volumeSeriesRef.current = volumeSeries;

      chartInstanceRef.current = chart;
    }

    return () => {
      // CHANGED: Cleanup order and reference checking
      if (resizeObserver && container) {
        resizeObserver.unobserve(container);
        resizeObserver.disconnect();
      }

      if (chartInstanceRef.current) {
        chartInstanceRef.current.remove();
        chartInstanceRef.current = null;
        seriesRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!chartInstanceRef.current || !seriesRef.current) return;
  
    const chart = chartInstanceRef.current;
    
    const handleCrosshairMove = (param) => {
      if (param.time) {
        const candleData = param.seriesData.get(seriesRef.current);
        const volumeData = param.seriesData.get(volumeSeriesRef.current);
        
        if (candleData) {
          setLegendData({
            time: new Date(param.time * 1000).toLocaleString(),
            open: candleData.open,
            high: candleData.high,
            low: candleData.low,
            close: candleData.close,
            volume: volumeData?.value || 0,
          });
        }
      } else {
        // Show latest data when not hovering
        const lastCandle = candlesRef.current[candlesRef.current.length - 1];
        if (lastCandle) {
          setLegendData({
            time: new Date(lastCandle.time * 1000).toLocaleString(),
            ...lastCandle,
            volume: lastCandle.volume || 0,
          });
        }
      }
    };
  
    chart.subscribeCrosshairMove(handleCrosshairMove);
    return () => chart.unsubscribeCrosshairMove(handleCrosshairMove);
  }, [selectedCoin, timeframe]);

  useEffect(() => {
    // Fetch historical data
    const fetchHistoricalData = async () => {
      try {
        const response = await fetch('http://localhost:5001/historical-candles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            exchange: selectedExchange,
            symbol: selectedCoin,
            interval: timeframe,
            from: 1037410321000,  // Replace with your start timestamp
            to: 3037583121000     // Replace with your end timestamp
          })
        });
        console.log('got hstorical data', response);
        const data = await response.json();
        console.log('data', data);
        const formattedCandles = data.map(candle => ({
          time: candle.time,
          open: parseFloat(candle.open),
          high: parseFloat(candle.high),
          low: parseFloat(candle.low),
          close: parseFloat(candle.close),
        }));

        const formattedVolumes = data.map(candle => ({
          time: candle.time,
          value: parseFloat(candle.volume),
          color: candle.close >= candle.open ? '#155952' : '#872f2e',
        }));
        
        candlesRef.current = formattedCandles;
        if (seriesRef.current) {
          seriesRef.current.setData(formattedCandles);
        }
        if (volumeSeriesRef.current) {
          volumeSeriesRef.current.setData(formattedVolumes);
        }
      } catch (error) {
        console.error('Error fetching historical data:', error);
      }
    };

    fetchHistoricalData();
  }, [timeframe, selectedCoin, selectedExchange]);

  useEffect(() => {
    // Socket connection
    const socket = io('http://localhost:5001', { transports: ['websocket'] });

    socket.on(`${selectedExchange}_${selectedCoin}_${timeframe}_perp_candles`, (newCandle) => {
      console.log('new candles: ', newCandle);
      
      const formattedCandle = {
        time: newCandle.s_t / 1000,
        open: parseFloat(newCandle.o),
        high: parseFloat(newCandle.h),
        low: parseFloat(newCandle.l),
        close: parseFloat(newCandle.c)
      }

      const formattedVolume = {
        time: newCandle.s_t / 1000,
        value: parseFloat(newCandle.v),
        color: formattedCandle.close >= formattedCandle.open ? '#26A69A' : '#EF5350',
      };

      console.log('candles ref:', candlesRef.current);
      console.log('formatted: ', formattedCandle);
      const index = candlesRef.current.findIndex(c => c.time === formattedCandle.time);
      console.log('index: ', index);
      if (index > -1) {
        candlesRef.current[index] = formattedCandle;
      } else {
        candlesRef.current.push(formattedCandle);
      }
      
      if (seriesRef.current) {
        seriesRef.current.update(formattedCandle);  // For single updates
      }
      if (volumeSeriesRef.current) {
        volumeSeriesRef.current.update(formattedVolume);
      }
    });

    return () => {
      socket.close();
    };
  }, [selectedCoin, timeframe, selectedExchange]);

  const handleTimeframeChange = (tf) => {
    setTimeframe(tf);
    setShowDropdown(false);
    candlesRef.current = [];
  };

  // ... rest of the component remains the same below this point
  // (The JSX return statement didn't change from your original version)
  return (
    <div className="financial-chart-container">
      <div className="timeframe-selector">
        <div className="interval-header">
         Interval
        </div>
        <div className="current-timeframe">
          <button 
            className={`timeframe-button ${showDropdown ? 'active' : ''}`}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="timeframe-displayed">
                {timeframe}
            </div>
            <span className="dropdown-arrow-tf">{showDropdown ? 
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                </svg>
                : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>}
            </span>
          </button>
          
          {showDropdown && (
            <div className="dropdown-menu">
              {availableTimeframes.map((tf) => (
                <button
                  key={tf}
                  className={`dropdown-item ${timeframe === tf ? 'active' : ''}`}
                  onClick={() => handleTimeframeChange(tf)}
                >
                  {tf}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div 
        className="chart-legend"
        style={{
          position: 'absolute',
          zIndex: 200,
          left: 6,
          top: 46,
          borderRadius: '5px',
          color: '#D1D4DC',
          minWidth: '200px',
          background: "#212121",
          padding: '3px',
          paddingLeft: '4px',
          paddingRight: '4px'
        }}
      >
        <div style={{ 
          display: 'flex', 
          gap: '8px',
          fontSize: '0.7rem'
        }}>
          <div style={{ paddingRight: '0.6rem', fontSize: '0.8rem', marginTop: '-1px'}}>
            {selectedCoin}
          </div>
          
          <div>O: {legendData.open.toFixed(2)}</div>
          <div>H: {legendData.high.toFixed(2)}</div>
          <div>L: {legendData.low.toFixed(2)}</div>
          <div>C: {legendData.close.toFixed(2)}</div>
          <div>V: {legendData.volume.toLocaleString()}</div>
        </div>
      </div>
      <div className="tv-container" ref={chartContainerRef} />
    </div>
  );
});

export default PerpChart;
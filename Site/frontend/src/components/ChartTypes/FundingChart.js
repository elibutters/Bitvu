import React, { useState, useEffect, forwardRef, useRef, useContext } from 'react';
import { createChart, LineStyle } from 'lightweight-charts';
import { io } from 'socket.io-client';
import { useDashboard } from '@/context/DashboardContext';
import styles from '@/styles/PerpChart.module.css';

const FundingChart = () => {
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
  const { selectedCoin, selectedExchange } = useDashboard();
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
          attributionLogo: false,
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
        borderVisible: false,
      });

      // CHANGED: Store resizeObserver in local variable
      resizeObserver = new ResizeObserver(entries => {
        const { width, height } = entries[0].contentRect;
        chart.resize(width, height);
      });
      resizeObserver.observe(container);
      seriesRef.current = chart.addCandlestickSeries({
        priceFormat: {
            minMove: 0.00001,
            precision: 5,
        },
        upColor: '#26A69A',
        downColor: '#EF5350',
        borderVisible: false,
        wickUpColor: '#26A69A',
        wickDownColor: '#EF5350',
      });
  
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
          });
        }
      } else {
        // Show latest data when not hovering
        const lastCandle = candlesRef.current[candlesRef.current.length - 1];
        if (lastCandle) {
          setLegendData({
            time: new Date(lastCandle.time * 1000).toLocaleString(),
            ...lastCandle,
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
        const response = await fetch('http://localhost:5001/historical-funding', {
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
        
        candlesRef.current = formattedCandles;
        if (seriesRef.current) {
          seriesRef.current.setData(formattedCandles);
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
    socket.on(`${selectedExchange}_${selectedCoin}_perp_pred_funding_${timeframe}`, (newCandle) => {
      console.log('new funding: ', newCandle);
      
      let formattedCandle = {
        time: newCandle.s_t / 1000,
        open: parseFloat(newCandle.o),
        high: parseFloat(newCandle.h),
        low: parseFloat(newCandle.l),
        close: parseFloat(newCandle.c)
      }

      console.log('candles ref:', candlesRef.current);
      console.log('formatted: ', formattedCandle);
      const index = candlesRef.current.findIndex(c => c.time === formattedCandle.time);
      console.log('index: ', index);
      if (index > -1) {
        let existing = candlesRef.current[index];
        let mergedCandle = {
            time: existing.time,
            open: existing.open, // Maintain original open
            high: Math.max(existing.high, formattedCandle.high),
            low: Math.min(existing.low, formattedCandle.low),
            close: formattedCandle.close // Always use latest close
        };
        
        // Update references
        candlesRef.current[index] = mergedCandle;
        formattedCandle = mergedCandle; // Use merged candle for updates
      } else {
        candlesRef.current.push(formattedCandle);
      }
      
      if (seriesRef.current) {
        seriesRef.current.update(formattedCandle);  // For single updates
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

  return (
    <div className={styles.financialChartContainer}>
      <div 
        className={styles.chartLegend}
        style={{
          position: 'absolute',
          zIndex: 10,
          left: 6,
          top: 4,
          borderRadius: '5px',
          color: '#D1D4DC',
          minWidth: '200px',
          background: "#212121",
          padding: '3px',
          paddingLeft: '4px',
          paddingRight: '4px',
          border: '#6e6e6e 1px solid'
        }}
      >
        <div style={{ 
          display: 'flex', 
          gap: '8px',
          fontSize: '0.7rem'
        }}>
              <div className={styles.timeframeSelector}>
                <div className={styles.currentTimeframe}>
                <button 
                    className={`${styles.timeframeButton} ${showDropdown ? 'active' : ''}`}
                    onClick={() => setShowDropdown(!showDropdown)}
                >
                    <div className={styles.timeframeDisplayed}>
                        {timeframe}
                    </div>
                    <span className={styles.dropdownArrowTf}>{showDropdown ? 
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="size-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                        </svg>
                        : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="size-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>}
                    </span>
                </button>
                
                {showDropdown && (
                    <div className={styles.dropdownMenu}>
                    {availableTimeframes.map((tf) => (
                        <button
                        key={tf}
                        className={`${styles.dropdownItem} ${timeframe === tf ? 'active' : ''}`}
                        onClick={() => handleTimeframeChange(tf)}
                        >
                        {tf}
                        </button>
                    ))}
                    </div>
                )}
                </div>
            </div>
          <div style={{ paddingRight: '0.6rem', fontSize: '0.8rem', marginTop: '-0.05rem'}}>
            {selectedCoin}
          </div>
          
          <div className="flex justify-between pt-[0.104rem] mb-[-0.2rem]">
            <div className="pr-[0.3rem] mb-[-0.2rem]">O: {legendData.open.toFixed(5)}</div>
            <div className="pr-[0.3rem] mb-[-0.2rem]">H: {legendData.high.toFixed(5)}</div>
            <div className="pr-[0.3rem] mb-[-0.2rem]">L: {legendData.low.toFixed(5)}</div>
            <div className="pr-[0.3rem] mb-[-0.2rem]">C: {legendData.close.toFixed(5)}</div>
          </div>
        </div>
      </div>
      <div className={styles.tvContainer} ref={chartContainerRef} />
    </div>
  );
};
export default FundingChart;
import React, { useState, useContext, useEffect, forwardRef } from 'react';
import '../../styles/ChartTypes/OBTable.css';
import { DashboardContext } from '../../contexts/DashboardContext';
import { io } from 'socket.io-client';

const OBTable = forwardRef((props, ref) => {
    const [timeframe, setTimeframe] = useState('3M');
  const [chartData, setChartData] = useState({});
  const [socketConnected, setSocketConnected] = useState(false);
  console.log('making OB');

  useEffect(() => {
    console.log('trying to connect');
    const socket = io('http://localhost:5001', {
        transports: ['websocket'],
    });

    socket.on('connect', () => {
        console.log('Connected to socket server!');
        setSocketConnected(true);
    });

    socket.on('orderbook_update', (newDataPoint) => {
        console.log('Received update:', newDataPoint);
        setChartData(newDataPoint);
    });

    return () => {
        socket.close();
    };
  }, []);

  const bids = chartData?.bids ?? [];
  const asks = chartData?.asks ?? [];
  const reversedAsks = [...asks].reverse();
  let totalAskQty = 0.0;
  let totalBidQty = 0.0;

  return (
    <div className="orderbook-container" ref={ref}>
      {/* Asks Table */}
      <div className="asks-section">
        <table className="asks-table">
          <div className="ob-head">
              <div style={{padding: '0 0 0 0.55rem'}}>Price</div>
              <div style={{margin: '0 0 0 -1.3rem'}}>Qty</div>
              <div style={{padding: '0 0.45rem 0 0'}}>Total</div>
          </div>
          <tbody className="asks-body">
            {/* Reverse to show highest price at the top if needed */}
            {reversedAsks.map(([price, qty], index) => {
              totalAskQty += parseFloat(qty);
              return (
                <tr key={index} className="table-row">
                  <td style={{ color: 'red', padding: '0 0 0 0.4rem'}}>{Number(price).toFixed(2)}</td>
                  <td>{Number(qty).toFixed(5)}</td>
                  <td style={{padding: '0 0.4rem 0 0'}}>{totalAskQty.toFixed(5)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bids Table */}
      <div className="asks-section">
        <table className="asks-table">
          <tbody className="asks-body">
            {bids.map(([price, qty], index) => {
              totalBidQty += parseFloat(qty);
              return(
                <tr key={index} className="table-row">
                  <td style={{ color: '#1C8C6C', padding: '0 0 0 0.4rem' }}>{Number(price).toFixed(2)}</td>
                  <td>{Number(qty).toFixed(5)}</td>
                  <td style={{padding: '0 0.4rem 0 0'}}>{totalBidQty.toFixed(5)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default OBTable;
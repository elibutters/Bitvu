import React, { useState, useContext, useEffect, forwardRef } from 'react';
import "../../styles/ChartTypes/OptionsBook.css"
import { DashboardContext } from '../../contexts/DashboardContext';
import { io } from 'socket.io-client';

const OptionsBook = forwardRef((props, ref) => {
  const [fullBookData, setFullBookData] = useState({});
  const [viewedBookData, setViewedBookData] = useState({});
  const [socketConnected, setSocketConnected] = useState(false);
  const { selectedExpiryOB, setSelectedExpiryOB } = useContext(DashboardContext);

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
        setFullBookData(newDataPoint);
    });

    return () => {
        socket.close();
    };
  }, []);

  useEffect(() => {
    const newView = fullBookData?.[selectedExpiryOB] ?? {};
    setViewedBookData(newView);
  }, [fullBookData, selectedExpiryOB])

  const handleExpiryClick = (expiry) => {
    setSelectedExpiryOB(expiry);
    setViewedBookData(fullBookData?.[expiry]);
  }

  const cData = viewedBookData?.C || {};
  const pData = viewedBookData?.P || {};
  const strikes = Object.keys(cData);

  return (
    <div className="ob-window">
        <div className="expiry-selection">
            {Object.keys(fullBookData).map((expiry) => {
                return (
                    <button 
                        className="expiry-button"
                        key={expiry}
                        onClick={() => handleExpiryClick(expiry)}>
                        {expiry}
                    </button>
                );
            })}
        </div>
        <div className="orderbook-container" ref={ref}>
            <div className="ob-header">
                <div className="side-header">
                    <div className="side-title">
                        Calls
                    </div>
                    <div className="side-title">
                        Puts
                    </div>
                </div>
                <div className="col-titles">
                    <div className="col-title">Bid Price</div>
                    <div className="col-title">Bid Size</div>
                    <div className="col-title">Ask Price</div>
                    <div className="col-title">Ask Size</div>
                    <div className="col-title">Strike</div>
                    <div className="col-title">Bid Price</div>
                    <div className="col-title">Bid Size</div>
                    <div className="col-title">Ask Price</div>
                    <div className="col-title">Ask Size</div>
                </div>
            </div>
            <div className="ob-grid">
                {strikes.map((strike) => {
                    const call = cData[strike] || {};
                    const put = pData[strike] || {};

                    const callBidPrice = call.bid?.[0] ?? '-';
                    const callBidSize = call.bid?.[1] ?? '-';
                    const callAskPrice = call.ask?.[0] ?? '-';
                    const callAskSize = call.ask?.[1] ?? '-';

                    const putBidPrice = put.bid?.[0] ?? '-';
                    const putBidSize = put.bid?.[1] ?? '-';
                    const putAskPrice = put.ask?.[0] ?? '-';
                    const putAskSize = put.ask?.[1] ?? '-';

                    return (
                        <div className="grid-row">
                            <div className="bid-price grid-item">{callBidPrice}</div>
                            <div className="grid-item">{callBidSize}</div>
                            <div className="ask-price grid-item">{callAskPrice}</div>
                            <div className="grid-item">{callAskSize}</div>
                            <div className="grid-item strike ">{strike.slice(0, -2)}</div>
                            <div className="bid-price grid-item">{putBidPrice}</div>
                            <div className="grid-item">{putBidSize}</div>
                            <div className="ask-price grid-item">{putAskPrice}</div>
                            <div className="grid-item">{putAskSize}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
  );
});

export default OptionsBook;
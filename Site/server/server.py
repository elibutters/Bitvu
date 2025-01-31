from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import datetime
import sys, os, signal
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.dirname(SCRIPT_DIR))

from candle_data.candle_shared_state import CandleSharedState, start_candle_update_loop
from funding_data.funding_shared_state import FundingSharedState, start_funding_update_loop
from candle_data import candle_start
from funding_data import funding_start
from rest_endpoints import historical_candles, historical_funding

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins='*')
app.register_blueprint(historical_candles.historical_candles_bp)
app.register_blueprint(historical_funding.historical_funding_bp)

import time
from threading import Thread
from threading import Event as ThreadEvent
import asyncio

def start_candle_thread(shared_state, shutdown_event, candle_historical_data_done_event, socket):
    thread = Thread(
        target=candle_start.start, 
        args=(shared_state, shutdown_event, candle_historical_data_done_event, socket),
        daemon=True
    )
    thread.start()
    return thread

def start_funding_candle_thread(shared_state, shutdown_event, funding_historical_data_done_event, socket):
    thread = Thread(
        target=funding_start.start,
        args=(shared_state, shutdown_event, funding_historical_data_done_event, socket),
        daemon=True
    )
    thread.start()
    return thread

if __name__ == "__main__":
    shutdown_event = ThreadEvent()
    candle_historical_data_done_event = ThreadEvent()
    funding_historical_data_done_event = ThreadEvent()

    css = CandleSharedState(candle_historical_data_done_event)
    fss = FundingSharedState(funding_historical_data_done_event)
    
    candle_thread = start_candle_thread(css, shutdown_event, candle_historical_data_done_event, socketio)
    update_db_loop = start_candle_update_loop(css)

    funding_thread = start_funding_candle_thread(fss, shutdown_event, funding_historical_data_done_event, socketio)
    update_db_loop = start_funding_update_loop(fss)

    try:
        socketio.run(app, debug=False, port=5001, host='0.0.0.0')
    except KeyboardInterrupt:
        print("KeyboardInterrupt received. Initiating shutdown...")
    finally:
        print('Shutting down')
        shutdown_event.set()

        candle_thread.join()
        funding_thread.join()
        print("All worker threads have terminated. Shutdown complete.")

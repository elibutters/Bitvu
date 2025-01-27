import asyncio
import json, time
import websockets
import pandas as pd
import threading
from typing import List, Dict, Any
from derebit_data.shared_state import SharedState
from flask_socketio import SocketIO, emit

DERIBIT_MAINNET = "wss://www.deribit.com/ws/api/v2"
DERIBIT_TESTNET = "wss://test.deribit.com/ws/api/v2"

class DeribitOrderBookSubscriber:
    def __init__(self,
                 instruments: List[str],
                 shared_state: SharedState,
                 url: str = DERIBIT_MAINNET,
                 ping_interval: int = 30,
                 socket=None):
        """
        :param instruments: a list of instrument names, e.g. ["BTC-PERPETUAL", "ETH-PERPETUAL", ...]
        :param url: WebSocket endpoint (mainnet or testnet).
        :param ping_interval: how often (in seconds) to send a ping to keep the connection alive.
        """
        self.url = url
        self.instruments = instruments
        self.ping_interval = ping_interval
        self.connection = None
        self.running = True
        self.socket = socket
        self.orderbooks: Dict[str, Dict[str, Dict[float, tuple]]] = {}
        self.shared_state = shared_state
        
    async def connect(self):
        """Connect to Deribit WebSocket and subscribe to the orderbook channels."""
        # Establish the WebSocket connection
        self.connection = await websockets.connect(self.url, ping_interval=self.ping_interval)
        print("Connected to Deribit WebSocket.")

        # Build subscription list
        channels = []
        for instrument in self.instruments:
            channel = f"book.{instrument}.none.10.100ms"
            channels.append(channel)
        # Subscribe to all channels in a single message
        subscribe_msg = {
            "jsonrpc": "2.0",
            "id": 42,
            "method": "public/subscribe",
            "params": {
                "channels": channels
            }
        }
        
        # Send the subscription request
        await self._send_json(subscribe_msg)

    async def _send_json(self, message: dict):
        """Helper function to send JSON messages over the WebSocket."""
        if self.connection:
            await self.connection.send(json.dumps(message))
        else:
            raise ConnectionError("WebSocket is not connected.")

    async def _receive_loop(self):
        """Continuously receive messages from Deribit and handle them."""
        while self.running:
            try:
                message_str = await self.connection.recv()
                message = json.loads(message_str)
                await self._handle_message(message)
            except websockets.ConnectionClosed:
                print("Connection closed by server.")
                self.running = False
            except asyncio.CancelledError:
                # This happens if the task is cancelled. Just break cleanly.
                print("Receive loop cancelled.")
                break
            except Exception as e:
                print(f"Error in receive loop: {e}")

    async def _handle_message(self, message: dict):
        """Dispatch incoming messages to the right handler based on their structure."""
        if 'method' in message and message['method'] == 'subscription':
            # This is a subscription update; handle orderbook data
            params = message.get('params', {})
            channel = params.get('channel')
            data = params.get('data')
            if channel and data:
                await self._handle_orderbook_update(channel, data)
        elif 'error' in message:
            print("Error message received:", message['error'])
        else:
            # Could be a subscription confirmation or other info
            # Typically a successful subscription confirmation has `result` field
            if 'result' in message:
                print("Subscription confirmed:", len(message['result']))

    async def _handle_orderbook_update(self, channel: str, data: dict):
        """
        Process orderbook updates here.
        For each update, parse the instrument name => (expiry, C/P, strike).
        Then store best_bid, best_ask in self.orderbooks[expiry][C/P][strike].
        """
        instrument_name = data.get('instrument_name')
        if not instrument_name:
            return

        expiry, cp, strike = parse_instrument_name(instrument_name)
        if not expiry or not cp or strike is None:
            # It's likely a future or perpetual; skip or handle differently
            return

        bids = data.get('bids', [])
        asks = data.get('asks', [])
        best_bid = bids[0] if bids else None  # [price, size]
        best_ask = asks[0] if asks else None  # [price, size]

        # Initialize dictionary if missing
        if expiry not in self.orderbooks:
            self.orderbooks[expiry] = {"C": {}, "P": {}}
        if cp not in self.orderbooks[expiry]:
            self.orderbooks[expiry][cp] = {}

        # Store just the top of book (price, size) or however you want
        self.orderbooks[expiry][cp][strike] = {
            'bid': best_bid,
            'ask': best_ask,
        }
        # Debug print, if desired
        # print(f"[{instrument_name}] BBO: {best_bid} / {best_ask}")


    async def start(self):
        """Orchestrate the connection and receiving tasks."""
        try:
            await self.connect()
            # Start the receive loop
            asyncio.create_task(self._emit_loop())
            await self._receive_loop()
        finally:
            await self.close()

    async def _emit_loop(self):
        """Periodically emit orderbook data (e.g., every 500ms) to Flask-SocketIO."""
        while self.running:
            # Here you decide how to broadcast. 
            # For instance, you might broadcast each expiry separately,
            # or you might just broadcast a partial subset based on user tokens/rooms.
            
            self.shared_state.sync_local_orderbook(self.orderbooks)

            # Sleep 500 ms
            await asyncio.sleep(0.25)

    async def close(self):
        """Close the connection gracefully."""
        self.running = False
        if self.connection:
            await self.connection.close()
            print("WebSocket connection closed.")

def chunk_list(lst, chunk_size=100):
    """Utility to chunk a list into smaller lists of size <= chunk_size."""
    for i in range(0, len(lst), chunk_size):
        yield lst[i:i+chunk_size]

def parse_instrument_name(instrument_name: str):
    """
    Parse an instrument name like 'BTC-31MAR23-27000-C'.
    Returns (expiry, option_type, strike) or (None, None, None) if it's not an option.
    """
    parts = instrument_name.split('-')
    # e.g. ['BTC', '31MAR23', '27000', 'C']
    
    if len(parts) == 4:
        # typical option: e.g. "BTC-31MAR23-27000-C"
        underlying, expiry, strike, option_type = parts
        # We only return expiry, option_type, strike since user wants dict keyed by expiry → C/P → strike
        return expiry, option_type.upper(), float(strike)
    elif len(parts) == 2 and parts[1].upper() == "PERPETUAL":
        # a perpetual or some future format
        return None, None, None
    else:
        # could be a future with a date: "BTC-31MAR23"
        # or something else
        return None, None, None

async def main(socketio):
    # Suppose we have thousands of instrument names
    all_instruments = pd.read_json('derebit_data/all_instruments.json')['instrument_name']

    # We can chunk them into groups of 100
    chunk_size = 100
    instrument_chunks = list(chunk_list(all_instruments, chunk_size=chunk_size))

    print(f"Total Instruments: {len(all_instruments)}")
    print(f"Number of Chunks: {len(instrument_chunks)}")

    shared_state = SharedState()
    # Create one subscriber per chunk
    subscribers = [
        DeribitOrderBookSubscriber(instruments=chunk, shared_state=shared_state)
        for chunk in instrument_chunks
    ]

    # Start them in parallel
    tasks = [asyncio.create_task(sub.start()) for sub in subscribers]

    t = threading.Thread(target=periodic_broadcast, args=(shared_state, socketio), daemon=True)
    t.start()
    
    # If you want them to run indefinitely, just await them
    # If you have some condition or a time-limited run, you can use asyncio.wait_for or similar
    await asyncio.gather(*tasks)

def parse_expiry(expiry_str: str):
    """
    Parse an expiry string like '28JAN25' or '7FEB25' into (year, month, day) 
    so we can sort chronologically.
    """
    # First 1-2 chars: day
    day_str = expiry_str[:-5]    # e.g. '28' or '7'
    # Next 3 chars: month
    mon_str = expiry_str[-5:-2]  # e.g. 'JAN', 'FEB', ...
    # Last 2 chars: year
    yr_str = expiry_str[-2:]     # e.g. '25'

    day = int(day_str)
    year = 2000 + int(yr_str)  # interpret '25' => 2025
    months = {
        'JAN': 1, 'FEB': 2, 'MAR': 3, 'APR': 4, 'MAY': 5, 'JUN': 6,
        'JUL': 7, 'AUG': 8, 'SEP': 9, 'OCT': 10, 'NOV': 11, 'DEC': 12
    }
    month = months[mon_str]

    return (year, month, day)

def sort_expiry_dict(snapshot: dict) -> dict:
    """
    Return a new dict sorted by expiry date and sorted strikes within each expiry.
    The snapshot keys are strings like '28JAN25' or '7FEB25'.
    The inner strike keys are sorted numerically.
    """
    sorted_snapshot = {}
    try:
        # Sort expiries chronologically
        sorted_expiries = sorted(snapshot.items(), key=lambda x: parse_expiry(x[0]))
    except ValueError as e:
        print(f"Error parsing expiry: {e}")
        sorted_expiries = snapshot.items()  # Fallback to unsorted if parsing fails

    for expiry, cp_dict in sorted_expiries:
        sorted_cp_dict = {}
        for cp_type in ['C', 'P']:
            if cp_type in cp_dict:
                # Sort strikes numerically (ascending)
                try:
                    sorted_strikes = dict(
                        sorted(
                            cp_dict[cp_type].items(),
                            key=lambda x: float(x[0])
                        )
                    )
                except ValueError as e:
                    print(f"Error parsing strike in {expiry} {cp_type}: {e}")
                    sorted_strikes = cp_dict[cp_type]  # Fallback to unsorted

                sorted_cp_dict[cp_type] = sorted_strikes
        sorted_snapshot[expiry] = sorted_cp_dict

    return sorted_snapshot

def periodic_broadcast(shared_state, socketio):
    """
    Runs in a background thread, every 500ms, grabs the shared orderbook snapshot,
    and emits it to the frontend or anywhere else needed.
    """
    while True:
        # Get a copy of the entire orderbook
        snapshot = shared_state.get_snapshot()
        print('got snapshot')

        # For each expiry, or for the entire snapshot, emit data
        socketio.emit('orderbook_update', sort_expiry_dict(snapshot)) 
        # or break it by expiry

        # Sleep 500ms
        time.sleep(0.5)

def start(socketio):
    asyncio.run(main(socketio))

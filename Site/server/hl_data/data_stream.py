import asyncio
import json, time
import websockets
import pandas as pd
import threading
from typing import List, Dict, Any
from aiohttp import ClientSession, ClientWebSocketResponse, WSMsgType
from aiohttp_socks import ProxyConnector
from flask_socketio import SocketIO, emit
import ssl

HL_MAINNET = "wss://api.hyperliquid.xyz/ws"

class HLCandleSubscriber:
    def __init__(self,
                 instruments: List[str],
                 intervals: List[str],
                 shared_state,
                 shutdown_event,
                 proxy: str = None,
                 url: str = HL_MAINNET,
                 ping_interval: int = 30,
                 socket=None):
        self.url = url
        self.instruments = instruments
        self.ping_interval = ping_interval
        self.connection = None
        self.running = True
        self.socket = socket
        self.candles: Dict[str, Dict[str, List]] = {}
        self.shared_state = shared_state
        self.intervals = intervals
        self.confirmed_subs = 0
        self.proxy = proxy
        self.unsubscribe_msgs = []
        self.shutdown_event = shutdown_event
        
    async def connect(self):
        connector = ProxyConnector.from_url(self.proxy) if self.proxy else None
        async with ClientSession(connector=connector) as session:
            try:
                self.connection = await session.ws_connect(self.url, heartbeat=self.ping_interval)
                print("Connected to HL WebSocket")

                for instrument in self.instruments:
                    for interval in self.intervals:
                        msg = {
                            'method': 'subscribe',
                            'subscription': {
                                'type': 'candle',
                                'coin': instrument,
                                'interval': interval
                            }
                        }
                        self.unsubscribe_msgs.append({
                            'method': 'unsubscribe',
                            'subscription': {
                                'type': 'candle',
                                'coin': instrument,
                                'interval': interval
                            }
                        })
                        if instrument not in self.candles:
                            self.candles[instrument] = {}
                        if interval not in self.candles[instrument]:
                            self.candles[instrument][interval] = []
                        await self._send_json(msg)
                emit_task = asyncio.create_task(self._emit_loop())
                await self._receive_loop()
            except Exception as e:
                print(f"Failed to connect via proxy {self.proxy}: {e}")
            finally:
                self.running = False
                if self.connection:
                    await self.close()
                if 'emit_task' in locals():
                    emit_task.cancel()
                    try:
                        await emit_task
                    except asyncio.CancelledError:
                        print(f"Emit loop canceled for proxy: {self.proxy}")

    async def _send_json(self, message: dict):
        if self.connection:
            await self.connection.send_json(message)
        else:
            raise ConnectionError("WebSocket is not connected.")

    async def _receive_loop(self):
        async for msg in self.connection:
            if msg.type == WSMsgType.TEXT:
                try:
                    message = json.loads(msg.data)
                    await self._handle_message(message)
                except json.JSONDecodeError:
                    print("Received non-JSON message.")
            elif msg.type == WSMsgType.ERROR:
                print(f"WebSocket connection closed with exception: {msg.data}")
                break

    async def _handle_message(self, message: dict):
        if message['channel'] == 'candle':
            data = message.get('data', {})
            if data:
                self._handle_orderbook_update(data)
        elif 'error' in message:
            print("Error message received:", message['error'])
        else:
            if message['channel'] in 'subscriptionResponse':
                if message['data']['method'] == 'subscribe':
                    self.confirmed_subs += 1
                #print(f"Sub: {self.confirmed_subs} | Should be: {len(self.instruments) * len(self.intervals)} | Subscription confirmation: {message['data']}")
            else:
                print(f'error: {message}')

    def _handle_orderbook_update(self, data: dict):
        instrument_name = data.get('s')
        if not instrument_name:
            return
        interval = data.get('i')
        if not interval:
            return
        if len(self.candles[instrument_name][interval]) == 0:
            self.candles[instrument_name][interval].append(data)
        if self.candles[instrument_name][interval][-1].get('t', 0) == data['t']:
            self.candles[instrument_name][interval][-1] = data
        else:
            self.candles[instrument_name][interval].append(data)

    async def _emit_loop(self):
        while self.running and not self.shutdown_event.is_set():
            print(f'total confirmed conns: {self.confirmed_subs} | Should be: {len(self.instruments) * len(self.intervals)}')
            self.shared_state.sync_local_candles(self.candles, 'hl')
            await asyncio.sleep(0.25)

    async def unsub_all(self):
        for msg in self.unsubscribe_msgs:
            print(msg)
            await self._send_json(msg)

    async def close(self):
        """Close the connection gracefully."""
        self.running = False
        if self.connection:
            await self.unsub_all()
            await self.connection.close()
            print("WebSocket connection closed.")

def get_chunks(all_instruments, intervals):
    if len(all_instruments) >= 90:
        return [all_instruments[:90], all_instruments[90:]]
    else:
        return [all_instruments]


async def main(shared_state, socketio, shutdown_event):
    all_instruments = list(pd.read_csv('hl_data/all_hl_coins.csv')['name'])[:1]
    intervals = ['1m', '5m', '15m', '30m', '1h', '2h', '4h', '8h', '12h', '1d', '1w']
    proxies = [
        'socks5://qfapwzrc:f3f5ahrsce1k@198.23.239.134:6540',
        'socks5://qfapwzrc:f3f5ahrsce1k@207.244.217.165:6712',
    ]
    chunks = get_chunks(all_instruments, intervals)

    subscriptions = [HLCandleSubscriber(instruments=chunk, intervals=intervals, shared_state=shared_state, proxy=proxy, shutdown_event=shutdown_event)
                     for proxy, chunk in zip(proxies, chunks)]

    tasks = [asyncio.create_task(sub.connect()) for sub in subscriptions]

    try:
        await asyncio.gather(*tasks)
    except asyncio.CancelledError:
        print("Main task cancelled. Initiating shutdown...")
        for task in tasks:
            task.close()
        await asyncio.gather(*tasks, return_exceptions=True)
    except Exception as e:
        print(f"An error occurred in main: {e}")
    finally:
        print("Main function is shutting down.")

def start(shared_state, socketio, shutdown_event):
    asyncio.run(main(shared_state, socketio, shutdown_event))
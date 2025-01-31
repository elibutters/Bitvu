import asyncio
import json, time, ssl
import pandas as pd
import threading
from typing import List, Dict, Any
from aiohttp import ClientSession, ClientWebSocketResponse, WSMsgType
from aiohttp_socks import ProxyConnector
from flask_socketio import SocketIO, emit

class CandleSubscriber:
    def __init__(self,
                 instruments,
                 intervals,
                 subscribe_msgs,
                 unsubscribe_msgs,
                 shared_state,
                 shutdown_event,
                 message_handler,
                 url: str,
                 proxy: str = None,
                 ping_interval: int = 30,
                 socket=None):
        self.instruments = instruments
        self.intervals = intervals
        self.subscribe_msgs = subscribe_msgs
        self.unsubscribe_msgs = unsubscribe_msgs
        self.shared_state = shared_state
        self.shutdown_event = shutdown_event
        self.message_handler = message_handler
        self.url = url
        self.ping_interval = ping_interval
        self.connection = None
        self.running = True
        self.socket = socket
        self.candles: Dict[str, List] = {}
        self.confirmed_subs = 0
        self.proxy = proxy
        self.unsubscribe_msgs = unsubscribe_msgs
        self.shown_confirmed = False
        
    async def connect(self):
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        connector = ProxyConnector.from_url(self.proxy, ssl=ssl_context) if self.proxy else None
        async with ClientSession(connector=connector) as session:
            try:
                self.connection = await session.ws_connect(self.url, heartbeat=self.ping_interval)
                print("Connected to WebSocket")

                for instrument in self.instruments:
                    if instrument not in self.candles:
                        self.candles[instrument] = {}
                    for interval in self.intervals:
                        if interval not in self.candles[instrument]:
                            self.candles[instrument][interval] = []
                    
                        sub_msg = self.subscribe_msgs[instrument][interval]
                        await self._send_json(sub_msg)

                receive_task = asyncio.create_task(self._receive_loop())
                emit_task = asyncio.create_task(self._emit_loop())
                shutdown_task = asyncio.create_task(self._handle_shutdown())

                done, pending = await asyncio.wait(
                    [receive_task, emit_task, shutdown_task],
                    return_when=asyncio.FIRST_COMPLETED
                )

                if shutdown_task in done:
                    for task in pending:
                        task.cancel()
                        try:
                            await task
                        except asyncio.CancelledError:
                            pass

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
                    (candles, confirmed_subs) = self.message_handler(message, self.candles, self.confirmed_subs)
                    self.candles = candles
                    self.confirmed_subs = confirmed_subs
                except json.JSONDecodeError:
                    print("Received non-JSON message.")
            elif msg.type == WSMsgType.ERROR:
                print(f"WebSocket connection closed with exception: {msg.data}")
                break

    async def _emit_loop(self):
        while self.running and not self.shutdown_event.is_set():
            if self.confirmed_subs == (len(self.instruments) * len(self.intervals)) and not self.shown_confirmed:
                print(f'total confirmed conns: {self.confirmed_subs} | Should be: {len(self.instruments) * len(self.intervals)}')
                self.shown_confirmed = True
            self.candles = self.shared_state.sync_local_candles(self.candles, self.instruments,'Hyperliquid')
            await asyncio.sleep(0.25)

    async def _handle_shutdown(self):
        await self.shutdown_event.wait()
        print("Shutdown event detected. Closing WebSocket connection...")
        await self.close()

    async def unsub_all(self):
        for msg in self.unsubscribe_msgs:
            await self._send_json(msg)
        print('Unsubbed to all channels')

    async def close(self):
        """Close the connection gracefully."""
        if self.connection and self.running:
            self.running = False
            await self.unsub_all()
            await self.connection.close()
            print("WebSocket connection closed.")
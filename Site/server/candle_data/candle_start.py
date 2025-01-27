from candle_data.helpers.hyperliquid.hl_candle_helper import HLCandleInfo
from candle_data.candle_subscriber import CandleSubscriber
from candle_data.candle_db import candles_db_handler
import asyncio

def start(shared_state, shutdown_event, candle_historical_data_done_event, socket):
    asyncio.run(main(shared_state, shutdown_event, candle_historical_data_done_event, socket))

async def main(shared_state, shutdown_event, historical_data_done_event, socket):
    exchanges = [HLCandleInfo(socket)]
    ws_tasks = [
        asyncio.create_task(start_ws(exchange, shared_state, shutdown_event))
        for exchange in exchanges
    ]

    await asyncio.sleep(15)

    db_task = asyncio.create_task(start_db(exchanges, historical_data_done_event))

    await asyncio.gather(*ws_tasks, db_task)

async def start_db(exchanges, historical_data_done_event):
    loop = asyncio.get_running_loop()
    await loop.run_in_executor(None, candles_db_handler.start, exchanges, historical_data_done_event)

async def start_ws(exchange, shared_state, shutdown_event):
    chunks = exchange.get_chunks()
    
    subscriptions = [CandleSubscriber(
        instruments=chunk['instruments'],
        intervals=chunk['intervals'],
        subscribe_msgs=chunk['subscribe_msgs'],
        unsubscribe_msgs=chunk['unsubscribe_msgs'],
        shared_state=shared_state,
        shutdown_event=shutdown_event,
        message_handler=exchange.message_handler,
        url=exchange.url,
        proxy=chunk['proxy']
    ) for chunk in chunks]
    tasks = [asyncio.create_task(sub.connect()) for sub in subscriptions]
    try:
        await asyncio.gather(*tasks)
    finally:
        print("Main function is shutting down.")
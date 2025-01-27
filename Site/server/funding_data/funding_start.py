from server.funding_data.helpers.hyperliquid.hl_funding_helper import HLFundingInfo
from funding_data.funding_subscriber import FundingSubscriber
from funding_data.funding_db import funding_db_handler
import asyncio

def start(shared_state, shutdown_event, funding_historical_data_done_event, socket):
    asyncio.run(main(shared_state, shutdown_event, funding_historical_data_done_event, socket))

async def main(shared_state, shutdown_event, funding_historical_data_done_event, socket):
    exchanges = [HLFundingInfo(socket)]
    ws_tasks = [
        asyncio.create_task(start_ws(exchange, shared_state, shutdown_event))
        for exchange in exchanges
    ]

    await asyncio.sleep(15)

    db_task = asyncio.create_task(start_db(exchanges, funding_historical_data_done_event))

    await asyncio.gather(*ws_tasks, db_task)

async def start_db(exchanges, funding_historical_data_done_event):
    loop = asyncio.get_running_loop()
    await loop.run_in_executor(None, funding_db_handler.start, exchanges, funding_historical_data_done_event)

async def start_ws(exchange, shared_state, shutdown_event):
    chunks = exchange.get_chunks()
    
    subscriptions = [FundingSubscriber(
        instruments=chunk['instruments'],
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
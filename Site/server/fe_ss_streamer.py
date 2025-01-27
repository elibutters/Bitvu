import time

def stream_hl_candles(shared_state, socket):
    exchanges = ['Hyperliquid']
    assets = ['AAVE']
    while True:
        for exchange in exchanges:
            for asset in assets:
                snapshot = shared_state.get_candle_by_exchange_coin(exchange, asset)
                socket.emit(f'{exchange}_{asset}_perp_candles', snapshot)  
                print(f'Emitting {asset} on {exchange}')
        time.sleep(1)
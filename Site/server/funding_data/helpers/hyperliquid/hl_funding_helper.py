import pandas as pd
import time

class HLFundingInfo:
    def __init__(self, socket):
        self.name = 'Hyperliquid'
        self.url = "wss://api.hyperliquid.xyz/ws"
        self.instruments = list(pd.read_csv('funding_data/helpers/hyperliquid/all_hl_coins.csv')['name'])
        self.intervals = ['1m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '12h', '1d']
        self._set_sub_msgs()
        self.socket = socket
        self.message_handler = self.get_message_handler()

    def _set_sub_msgs(self):
        self.subscribe_msgs = {}
        self.unsubscribe_msgs = []
        for instrument in self.instruments:
            if instrument not in self.subscribe_msgs.keys():
                self.subscribe_msgs[instrument] = {}
            self.subscribe_msgs[instrument] = {
                'method': 'subscribe',
                'subscription': {
                    'type': 'activeAssetCtx',
                    'coin': instrument
                }
            }
            self.unsubscribe_msgs.append({
                'method': 'unsubscribe',
                'subscription': {
                    'type': 'candle',
                    'coin': instrument
                }
            })

    def get_chunks(self):
        return [
            {
                'instruments': self.instruments[:90],
                'subscribe_msgs': {asset: self.subscribe_msgs[asset] for asset in self.instruments[:90]},
                'unsubscribe_msgs': self.unsubscribe_msgs[:(90*len(self.instruments))],
                'proxy': 'socks5://djyahvur:t45bdlc105gi@107.172.163.27:6543'
            },
            {
                'instruments': self.instruments[90:],
                'subscribe_msgs': {asset: self.subscribe_msgs[asset] for asset in self.instruments[90:]},
                'unsubscribe_msgs': self.unsubscribe_msgs[(90*len(self.instruments)):],
                'proxy': 'socks5://djyahvur:t45bdlc105gi@64.137.42.112:5157'
            }
        ]

    def get_message_handler(self):
        socket_ref = self.socket
        name_ref = self.name
        intervals = self.intervals
        def message_handler(message, candles, confirmed_subs):
            if message['channel'] == 'activeAssetCtx':
                data = message.get('data', {})
                if data:
                    instrument_name = data.get('coin')
                    if not instrument_name:
                        return
                    ctx = data.get('ctx')
                    if ctx:
                        cur_time = int(time.time() * 1000.0)
                        for interval in intervals:
                            if interval.endswith('m'):
                                minutes = int(interval[:-1])
                                interval_ms = minutes * 60 * 1000
                            elif interval.endswith('h'):
                                hours = int(interval[:-1])
                                interval_ms = hours * 60 * 60 * 1000
                            elif interval.endswith('d'):
                                days = int(interval[:-1])
                                interval_ms = days * 24 * 60 * 60 * 1000
                            else:
                                print(f'Invalid interval format: {interval}')
                                continue

                            bucket_start = (cur_time // interval_ms) * interval_ms
                            bucket_end = bucket_start + (interval_ms - 1)
                            if instrument_name not in candles:
                                candles[instrument_name] = {}
                            if interval not in candles[instrument_name]:
                                candles[instrument_name][interval] = []

                            candle_list = candles[instrument_name][interval]
                            current_price = float(ctx['funding']) * 100.0
                            if not candle_list:
                                new_candle = {
                                    's_t': bucket_start,
                                    'e_t': bucket_end,
                                    's': instrument_name,
                                    'i': interval,
                                    'o': current_price,
                                    'h': current_price,
                                    'l': current_price,
                                    'c': current_price
                                }
                                candle_list.append(new_candle)
                            else:
                                last_candle = candle_list[-1]
                                if cur_time < last_candle['e_t']:
                                    last_candle['h'] = max(last_candle['h'], current_price)
                                    last_candle['l'] = min(last_candle['l'], current_price)
                                    last_candle['c'] = current_price
                                else:
                                    new_candle = {
                                        's_t': bucket_start,
                                        'e_t': bucket_end,
                                        's': instrument_name,
                                        'i': interval,
                                        'o': current_price,
                                        'h': current_price,
                                        'l': current_price,
                                        'c': current_price
                                    }
                                    candle_list.append(new_candle)

                            current_candle = candle_list[-1]
                            try:
                                socket_ref.emit(f'{name_ref}_{instrument_name}_perp_pred_funding_{interval}', current_candle)
                            except (AttributeError, ConnectionError) as e:
                                print(f"Socket error: {e}")
            elif 'error' in message:
                print("Error message received:", message['error'])
            else:
                if message['channel'] in 'subscriptionResponse':
                    if message['data']['method'] == 'subscribe':
                        confirmed_subs += 1
                else:
                    print(f'massage handle error: {message}')

            return candles, confirmed_subs
        return message_handler
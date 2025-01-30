import pandas as pd

class HLCandleInfo:
    def __init__(self, socket):
        self.name = 'Hyperliquid'
        self.url = "wss://api.hyperliquid.xyz/ws"
        self.instruments = list(pd.read_csv('candle_data/helpers/hyperliquid/all_hl_coins.csv')['name'])
        self.intervals = ['1m', '5m', '15m', '30m', '1h', '2h', '4h', '8h', '12h', '1d', '1w']
        self._set_sub_msgs()
        self.socket = socket
        self.message_handler = self.get_message_handler()

    def _set_sub_msgs(self):
        self.subscribe_msgs = {}
        self.unsubscribe_msgs = []
        for instrument in self.instruments:
            for interval in self.intervals:
                if instrument not in self.subscribe_msgs.keys():
                    self.subscribe_msgs[instrument] = {}
                self.subscribe_msgs[instrument][interval] = {
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

    def get_chunks(self):
        return [
            {
                'instruments': self.instruments[:90],
                'intervals': self.intervals,
                'subscribe_msgs': {asset: self.subscribe_msgs[asset] for asset in self.instruments[:90]},
                'unsubscribe_msgs': self.unsubscribe_msgs[:(90*11)],
                'proxy': 'socks5://djyahvur:t45bdlc105gi@198.23.239.134:6540'
            },
            {
                'instruments': self.instruments[90:],
                'intervals': self.intervals,
                'subscribe_msgs': {asset: self.subscribe_msgs[asset] for asset in self.instruments[90:]},
                'unsubscribe_msgs': self.unsubscribe_msgs[(90*11):],
                'proxy': 'socks5://djyahvur:t45bdlc105gi@207.244.217.165:6712'
            }
        ]

    def get_message_handler(self):
        socket_ref = self.socket
        name_ref = self.name
        def message_handler(message, candles, confirmed_subs):
            key_mapping = {
                't': 's_t',
                'T': 'e_t',
                's': 's',
                'i': 'i',
                'o': 'o',
                'c': 'c',
                'h': 'h',
                'l': 'l',
                'v': 'v',
                'n': 'n'
            }
            if message['channel'] == 'candle':
                data = message.get('data', {})
                if data:
                    data = {key_mapping.get(k, k): v for k, v in data.items()}
                    instrument_name = data.get('s')
                    if not instrument_name:
                        return
                    interval = data.get('i')
                    if not interval:
                        return
                    if len(candles[instrument_name][interval]) == 0:
                        candles[instrument_name][interval].append(data)
                    if candles[instrument_name][interval][-1].get('s_t', 0) == data['s_t']:
                        candles[instrument_name][interval][-1] = data
                    else:
                        candles[instrument_name][interval].append(data)
                    try:
                        socket_ref.emit(f'{name_ref}_{instrument_name}_{interval}_perp_candles', data)
                    except (AttributeError, ConnectionError) as e:
                        print(f"Socket error: {e}")
            elif 'error' in message:
                print("Error message received:", message['error'])
            else:
                if message['channel'] in 'subscriptionResponse':
                    if message['data']['method'] == 'subscribe':
                        confirmed_subs += 1
                else:
                    print(f'error: {message}')

            return candles, confirmed_subs
        return message_handler
import pandas as pd

class HLFundingInfo:
    def __init__(self, socket):
        self.name = 'Hyperliquid'
        self.url = "wss://api.hyperliquid.xyz/ws"
        self.instruments = list(pd.read_csv('candle_data/helpers/hyperliquid/all_hl_coins.csv')['name'])
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
                'unsubscribe_msgs': self.unsubscribe_msgs[:(90*11)],
                'proxy': 'socks5://qfapwzrc:f3f5ahrsce1k@198.23.239.134:6540'
            },
            {
                'instruments': self.instruments[90:],
                'subscribe_msgs': {asset: self.subscribe_msgs[asset] for asset in self.instruments[90:]},
                'unsubscribe_msgs': self.unsubscribe_msgs[(90*11):],
                'proxy': 'socks5://qfapwzrc:f3f5ahrsce1k@207.244.217.165:6712'
            }
        ]

    def get_message_handler(self):
        socket_ref = self.socket
        name_ref = self.name
        def message_handler(message, candles, confirmed_subs):
            print(f'new data:{message}')
            key_mapping = {
                
            }
            if message['channel'] == 'activeAssetCtx':
                data = message.get('data', {})
                if data:
                    instrument_name = data.get('coin')
                    if not instrument_name:
                        return
                    ctx = data.get('ctx')
                    if ctx:
                        if len(candles[instrument_name]) == 0:
                            candles[instrument_name].append(data)
                        if candles[instrument_name][-1].get('s_t', 0) == data['s_t']:
                            candles[instrument_name][interval][-1] = data
                        else:
                            candles[instrument_name][interval].append(data)
                        try:
                            socket_ref.emit(f'{name_ref}_{instrument_name}_perp_funding', data)
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
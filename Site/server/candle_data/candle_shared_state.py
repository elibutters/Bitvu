import threading
import copy
import time
from candle_data.candle_aggregator import candle_coin_updater, update_db
class CandleSharedState:
    def __init__(self, historical_data_done_event):
        self._lock = threading.Lock()
        self.candles = {}
        self.local_candles = {}
        self.historical_data_done_event = historical_data_done_event
        self.db_updated = False

    def sync_local_candles(self, local_candles: dict, instruments, exchange):
        last_local_candles = {}
        with self._lock:
            for instrument in instruments:
                if exchange not in self.local_candles:
                    self.local_candles[exchange] = {}
                self.local_candles[exchange][instrument] = local_candles[instrument]
                if len(local_candles[instrument]) > 0:
                    last_local_candles[instrument] = local_candles[instrument]
            if self.db_updated:
                self.db_updated = False
                return last_local_candles
            else:
                return local_candles

    def update_db(self):
        with self._lock:
            if self.historical_data_done_event.is_set():
                local_candles_copy = copy.deepcopy(self.local_candles)
                self.db_updated = True
                return update_db(local_candles_copy)
        return 0

    def get_candle_by_exchange_coin(self, exchange, coin) -> dict:
        with self._lock:
            if self.historical_data_done_event.is_set():
                latest_candles = {}
                if exchange in self.local_candles and coin in self.local_candles[exchange]:
                    coin_data = self.local_candles[exchange][coin]
                    for interval, candles in coin_data.items():
                        if candles:
                            latest_candles[interval] = candles[-1]
                return latest_candles
            return {}

def start_candle_update_loop(shared_state):
    def update_loop():
        while True:
            try:
                shared_state.update_db()
                time.sleep(0.5)
            except Exception as e:
                print(f"Error in update loop: {e}")
    
    update_thread = threading.Thread(target=update_loop, daemon=True)
    update_thread.start()
import threading
import copy

class SharedState:
    def __init__(self):
        # A standard threading.Lock to protect concurrent access
        self._lock = threading.Lock()
        
        # The global orderbook structure. 
        # For example, keyed by expiry -> { "C": {}, "P": {} }, then strike as subkey.
        self.orderbook = {}

    def sync_local_orderbook(self, local_orderbook: dict):
        """
        Merge a local dictionary of orderbook data into the global self.orderbook.
        
        local_orderbook should match the structure of self.orderbook, e.g.:
          {
            "31MAR23": {
              "C": { 27000.0: (best_bid, best_ask), ... },
              "P": { ... }
            },
            ...
          }
        """
        with self._lock:
            for expiry, cp_map in local_orderbook.items():
                if expiry not in self.orderbook:
                    self.orderbook[expiry] = {"C": {}, "P": {}}
                
                for cp_key, strike_map in cp_map.items():  # cp_key e.g. "C" or "P"
                    if cp_key not in self.orderbook[expiry]:
                        self.orderbook[expiry][cp_key] = {}

                    for strike, bbo_data in strike_map.items():
                        # bbo_data could be {'bid': [price, size], 'ask': [price, size]}
                        # or (best_bid, best_ask), etc.  You decide how to merge.
                        self.orderbook[expiry][cp_key][strike] = bbo_data
    
    def get_snapshot(self) -> dict:
        """
        Safely retrieve a *copy* of the entire orderbook state.
        Useful for reading in a different thread without blocking updates for too long.
        """
        with self._lock:
            # Return a deep copy so the caller can safely read or manipulate it.
            return copy.deepcopy(self.orderbook)
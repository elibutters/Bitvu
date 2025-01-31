from funding_data.funding_db.funding_db_handler import query_funding_candles, insert_funding_candles_from_dict
import sqlite3, time

def funding_candle_coin_updater(old_candles, local_candles):
    final_updated_candles = {}
    for interval in old_candles.keys():
        if interval not in local_candles.keys():
            final_updated_candles[interval] = {}
            continue
        final_updated_candles[interval] = update_candles(old_candles[interval], local_candles[interval])
    return final_updated_candles

def update_candles(old_candles, local_candles):
    candle_map = {candle['s_t']: candle.copy() for candle in old_candles}
    
    for local_candle in local_candles:
        s_t = local_candle['s_t']
        
        if s_t in candle_map:
            # Merge overlapping candles
            existing = candle_map[s_t]
            merged = {
                's_t': s_t,
                'e_t': local_candle['e_t'],
                's': local_candle['s'],
                'i': local_candle['i'],
                'o': existing['o'],  # Preserve original open
                'h': max(existing['h'], local_candle['h']),
                'l': min(existing['l'], local_candle['l']),
                'c': local_candle['c']  # Use latest close
            }
            candle_map[s_t] = merged
        else:
            # Add new candle
            candle_map[s_t] = local_candle
    
    # Convert back to sorted list
    merged_candles = sorted(candle_map.values(), key=lambda x: x['s_t'])
    
    # Handle potential gaps between historical and local data
    if merged_candles:
        # Find common time range
        min_time = min(c['s_t'] for c in merged_candles)
        max_time = max(c['s_t'] for c in merged_candles)
        
        # Filter candles to maintain continuous series
        return [c for c in merged_candles if min_time <= c['s_t'] <= max_time]
    
    return merged_candles

def parse_interval_to_seconds(interval_str: str) -> int:
    unit = interval_str[-1]
    value = int(interval_str[:-1])
    if unit == 'm':
        return value * 60
    elif unit == 'h':
        return value * 3600
    elif unit == 'd':
        return value * 86400
    else:
        raise ValueError(f"Unknown interval unit: {unit} in {interval_str}")
        
def update_funding_db(local_candles):
    with sqlite3.connect('funding_data/funding_db/funding.db') as conn:
        data_to_insert = {}
        
        for exchange_name, coins in local_candles.items():
            data_to_insert[exchange_name] = {}
            for coin_symbol, intervals in coins.items():
                data_to_insert[exchange_name][coin_symbol] = {}
                existing_candles = {}

                for interval_str, local_interval_candles in intervals.items():
                    try:
                        interval_seconds = parse_interval_to_seconds(interval_str)
                    except ValueError as e:
                        print(f"Skipping interval {interval_str}: {e}")
                        continue

                    query_params = {
                        'exchange_name': exchange_name,
                        'coin_symbol': coin_symbol,
                        'interval': interval_str
                    }

                    if interval_seconds < 3600:
                        current_time_ms = int(time.time() * 1000)
                        start_time = current_time_ms - 3600 * 1000  # Last hour in milliseconds
                        df = query_funding_candles(
                            **query_params,
                            order='asc',
                            start_time=start_time
                        )
                    else:
                        df = query_funding_candles(
                            **query_params,
                            order='desc',
                            limit=2
                        )
                        # Re-sort to ascending order if we got data
                        if not df.empty:
                            df = df.sort_values('s_t', ascending=True)

                    existing_candles[interval_str] = df.to_dict('records') if not df.empty else []

                merged_intervals = funding_candle_coin_updater(
                    old_candles=existing_candles,
                    local_candles=intervals
                )
                
                data_to_insert[exchange_name][coin_symbol] = merged_intervals
        
        if data_to_insert:
            #print(data_to_insert['Hyperliquid']['AAVE']['1m'][-10:])
            inserted_count = insert_funding_candles_from_dict(conn, data_to_insert)
            print(f"Updated funding database with {inserted_count} new candles")
            return inserted_count
        return 0
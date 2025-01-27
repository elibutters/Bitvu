from candle_data.candle_db.candles_db_handler import query_candles, insert_candles_from_dict
import sqlite3

def candle_coin_updater(old_candles, local_candles):
    final_updated_candles = {}
    for interval in old_candles.keys():
        if interval not in local_candles.keys():
            final_updated_candles[interval] = {}
            continue
        final_updated_candles[interval] = update_candles(old_candles[interval], local_candles[interval])
    return final_updated_candles

def update_candles(old_candles, local_candles):
    if len(local_candles) == 0: return old_candles
    last_local_end_time = local_candles[-1]['e_t']
    last_old_end_time = old_candles[-1]['e_t']

    if last_old_end_time == last_local_end_time:
        old_candles[-1] = local_candles[-1]
        return old_candles
    else:
        candles_to_add = []
        for candle in local_candles:
            if candle['e_t'] >= last_old_end_time:
                candles_to_add.append(candle)
        old_candles.pop()
        old_candles.extend(candles_to_add)
        return old_candles
        
def update_db(local_candles):
    with sqlite3.connect('candle_data/candle_db/candles.db') as conn:
        data_to_insert = {}
        
        for exchange_name, coins in local_candles.items():
            data_to_insert[exchange_name] = {}
            for coin_symbol, intervals in coins.items():
                data_to_insert[exchange_name][coin_symbol] = {}

                existing_df = query_candles(
                    exchange_name=exchange_name,
                    coin_symbol=coin_symbol
                )
                
                existing_candles = {}
                if not existing_df.empty:
                    existing_groups = existing_df.groupby('interval')
                    for interval, group in existing_groups:
                        existing_candles[interval] = group.to_dict('records')

                merged_intervals = candle_coin_updater(
                    old_candles=existing_candles,
                    local_candles=intervals
                )
                
                data_to_insert[exchange_name][coin_symbol] = merged_intervals
        
        if data_to_insert:
            #print(data_to_insert['Hyperliquid']['AAVE']['1m'][-10:])
            inserted_count = insert_candles_from_dict(conn, data_to_insert)
            print(f"Updated database with {inserted_count} new candles")
            return inserted_count
        return 0
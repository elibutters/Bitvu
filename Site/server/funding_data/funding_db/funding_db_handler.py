import sqlite3, time, requests
from datetime import datetime

API_KEY = 'c0a82b7c-b5b1-4c3c-968f-846f0846dd68'
EXCH_TO_CODE = {'Hyperliquid': 'H'}
MY_INT_TO_COINALYZE = {'1m': '1min', '5m': '5min', '15m': '15min', '30m': '30min', '1h': '1hour', '2h': '2hour',
                       '4h': '4hour', '6h': '6hour', '12h': '12hour', '1d': 'daily'}

def start(exchanges, historical_data_done_event):
    with sqlite3.connect('funding_data/funding_db/funding.db') as conn:
        create_tables(conn)

        for exchange in exchanges:
            exchange_name = exchange.name
            exchange_id = insert_exchange(conn, exchange_name)
            if not exchange_id:
                print("Failed to retrieve exchange_id.")
                return

            all_coins = ['AAVE']
            start_date = int(datetime.strptime('2020-01-01', '%Y-%m-%d').timestamp())
            end_date = int(datetime.strptime('2050-01-30', '%Y-%m-%d').timestamp())
            intervals = ['1m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '12h', '1d']
            #intervals = ['1m', '5m']
        
            for coin in all_coins:
                coin_symbol = str(coin)
                coin_id = insert_coin(conn, coin_symbol)
                if not coin_id:
                    print(f"Failed to retrieve coin_id for {coin_symbol}. Skipping.")
                    continue

                for interval in intervals:
                    interval_id = insert_interval(conn, interval)
                    if not interval_id:
                        print(f"Failed to retrieve interval_id for {interval}. Skipping.")
                        continue

                    print(f'Getting Funding: {coin_symbol} on {interval}')
                    try:
                        request_url = (
                            f'https://api.coinalyze.net/v1/predicted-funding-rate-history'
                            f'?symbols={coin}.{EXCH_TO_CODE[exchange.name]}'
                            f'&interval={MY_INT_TO_COINALYZE[interval]}'
                            f'&from={start_date}'
                            f'&to={end_date}'
                            f'&api_key={API_KEY}'
                        )
                        response = requests.get(request_url).json()
                    except Exception as e:
                        print(f"Error fetching data for {coin_symbol} on {interval}: {e}")
                        continue
                    
                    if not response:
                        print(f"No data returned for {coin_symbol} on {interval}.")
                        continue
                    
                    insert_candles(conn, exchange_id, coin_id, interval_id, response, interval, coin)
                    time.sleep(2)
    historical_data_done_event.set()

def insert_candles(conn, exchange_id, coin_id, interval_id, candles, interval, coin):
    cursor = conn.cursor()
    candles_to_insert = []
    candles = candles[0]

    def interval_to_ms(interval_str):
        unit = interval_str[-1].lower()  # Handle 'm', 'h', 'd'
        value = int(interval_str[:-1])
        conversions = {
            'm': 60 * 1000,        # Minutes to milliseconds
            'h': 60 * 60 * 1000,   # Hours to milliseconds
            'd': 24 * 60 * 60 * 1000  # Days to milliseconds
        }
        return value * conversions[unit]
    
    interval_duration = interval_to_ms(interval)
    for candle in candles['history']:
        start_time = int(candle['t']) * 1000  # Convert to milliseconds
        end_time = start_time + interval_duration - 1
        
        candles_to_insert.append((
            exchange_id,
            coin_id,
            interval_id,
            start_time,
            end_time,  # Calculated end time
            coin,
            interval,
            float(candle['o']),
            float(candle['c']),
            float(candle['h']),
            float(candle['l'])
        ))
    
    try:
        cursor.executemany('''
            INSERT OR IGNORE INTO funding 
            (exchange_id, coin_id, interval_id, s_t, e_t, s, i, o, c, h, l) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        ''', candles_to_insert)
        conn.commit()
    except sqlite3.Error as e:
        print(f"Error inserting candles: {e}")

def insert_coin(conn, coin_symbol):
    cursor = conn.cursor()
    try:
        cursor.execute('''
            INSERT INTO coins (symbol) VALUES (?)
            ON CONFLICT(symbol) DO NOTHING;
        ''', (coin_symbol,))
        conn.commit()
    except sqlite3.Error as e:
        print(f"Error inserting coin '{coin_symbol}': {e}")
    
    cursor.execute('SELECT coin_id FROM coins WHERE symbol = ?', (coin_symbol,))
    result = cursor.fetchone()
    return result[0] if result else None

def insert_interval(conn, interval_str):
    cursor = conn.cursor()
    try:
        cursor.execute('''
            INSERT INTO intervals (int) VALUES (?)
            ON CONFLICT(int) DO NOTHING;
        ''', (interval_str,))
        conn.commit()
    except sqlite3.Error as e:
        print(f"Error inserting interval '{interval_str}': {e}")

    cursor.execute('SELECT interval_id FROM intervals WHERE int = ?', (interval_str,))
    result = cursor.fetchone()
    return result[0] if result else None

def insert_exchange(conn, exchange_name):
    cursor = conn.cursor()
    try:
        cursor.execute('''
            INSERT INTO exchanges (name) VALUES (?)
            ON CONFLICT(name) DO NOTHING;
        ''', (exchange_name,))
        conn.commit()
    except sqlite3.Error as e:
        print(f"Error inserting exchange: {e}")
    
    cursor.execute('SELECT exchange_id FROM exchanges WHERE name = ?', (exchange_name,))
    result = cursor.fetchone()
    return result[0] if result else None

def create_tables(conn):
    cursor = conn.cursor()
    cursor.execute('PRAGMA foreign_keys = ON;')

    cursor.execute('DROP TABLE IF EXISTS funding;')
    cursor.execute('DROP TABLE IF EXISTS intervals;')
    cursor.execute('DROP TABLE IF EXISTS coins;')
    cursor.execute('DROP TABLE IF EXISTS exchanges;')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS exchanges (
            exchange_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL
        );
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS coins (
            coin_id INTEGER PRIMARY KEY AUTOINCREMENT,
            symbol TEXT UNIQUE NOT NULL
        );
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS intervals (
            interval_id INTEGER PRIMARY KEY AUTOINCREMENT,
            int TEXT UNIQUE NOT NULL
        );
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS funding (
            funding_id INTEGER PRIMARY KEY AUTOINCREMENT,
            exchange_id INTEGER,
            coin_id INTEGER,
            interval_id INTEGER,
            s_t INTEGER NOT NULL,
            e_t INTEGER NOT NULL,
            s TEXT NOT NULL,
            i TEXT NOT NULL,
            o REAL NOT NULL,
            c REAL NOT NULL,
            h REAL NOT NULL,
            l REAL NOT NULL,
            UNIQUE (exchange_id, coin_id, interval_id, s_t),
            FOREIGN KEY (exchange_id) REFERENCES exchanges(exchange_id),
            FOREIGN KEY (coin_id) REFERENCES coins(coin_id),
            FOREIGN KEY (interval_id) REFERENCES intervals(interval_id)
        );
    ''')
    
    cursor.execute('''
        CREATE INDEX IF NOT EXISTS idx_funding_main 
        ON funding (exchange_id, coin_id, interval_id, s_t);
    ''')
    
    conn.commit()

import pandas as pd
from typing import Optional

def query_funding_candles(
    db_path: str = 'funding_data/funding_db/funding.db',
    exchange_name: Optional[str] = None,
    coin_symbol: Optional[str] = None,
    interval: Optional[str] = None,
    start_time: Optional[int] = None,
    end_time: Optional[int] = None,
    limit: Optional[int] = None,
    order: str = 'asc'
) -> pd.DataFrame:
    if order.lower() not in ['asc', 'desc']:
        raise ValueError("Parameter 'order' must be either 'asc' or 'desc'.")

    try:
        conn = sqlite3.connect(db_path)
    except sqlite3.Error as e:
        raise ConnectionError(f"Unable to connect to the database: {e}")

    query = """
    SELECT 
        e.name AS exchange,
        c.symbol AS coin,
        i.int AS interval,
        fd.s_t,
        fd.e_t,
        fd.s,
        fd.i,
        fd.o,
        fd.c,
        fd.h,
        fd.l
    FROM funding fd
    JOIN exchanges e ON fd.exchange_id = e.exchange_id
    JOIN coins c ON fd.coin_id = c.coin_id
    JOIN intervals i ON fd.interval_id = i.interval_id
    WHERE 1=1
    """
    params = []
    if exchange_name:
        query += " AND e.name = ?"
        params.append(exchange_name)
    if coin_symbol:
        query += " AND c.symbol = ?"
        params.append(coin_symbol)
    if interval:
        query += " AND i.int = ?"
        params.append(interval)
    if start_time:
        query += " AND fd.s_t >= ?"
        params.append(start_time)
    if end_time:
        query += " AND fd.e_t <= ?"
        params.append(end_time)

    query += f" ORDER BY fd.s_t {order.upper()}"

    if limit:
        query += " LIMIT ?"
        params.append(limit)

    try:
        df = pd.read_sql_query(query, conn, params=params)
    except pd.io.sql.DatabaseError as e:
        raise RuntimeError(f"An error occurred while executing the query: {e}")
    finally:
        conn.close()

    return df

def insert_funding_candles_from_dict(conn, data_dict):
    cursor = conn.cursor()
    total_inserted = 0
    
    for exchange_name, coins in data_dict.items():
        exchange_id = insert_exchange(conn, exchange_name)
        if not exchange_id:
            print(f"Failed to get exchange ID for {exchange_name}, skipping...")
            continue

        for coin_symbol, intervals in coins.items():
            coin_id = insert_coin(conn, coin_symbol)
            if not coin_id:
                print(f"Failed to get coin ID for {coin_symbol}, skipping...")
                continue

            for interval_str, candles in intervals.items():
                interval_id = insert_interval(conn, interval_str)
                if not interval_id:
                    print(f"Failed to get interval ID for {interval_str}, skipping...")
                    continue

                batch = []
                for candle in candles:
                    if batch and candle['s_t'] <= batch[-1][3]:
                        print(f"Out-of-order funding detected: {candle['s_t']}")
                        continue
                    batch.append((
                        exchange_id,
                        coin_id,
                        interval_id,
                        candle['s_t'],  # Start time
                        candle['e_t'],  # End time
                        candle['s'],  # Symbol
                        candle['i'],  # Interval
                        float(candle['o']),  # Open
                        float(candle['c']),  # Close
                        float(candle['h']),  # High
                        float(candle['l']),  # Low
                    ))

                try:
                    cursor.executemany('''
                        INSERT INTO funding 
                        (exchange_id, coin_id, interval_id, s_t, e_t, s, i, o, c, h, l)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(exchange_id, coin_id, interval_id, s_t) 
                        DO UPDATE SET
                            e_t=excluded.e_t,
                            o=excluded.o,
                            c=excluded.c,
                            h=excluded.h,
                            l=excluded.l
                    ''', batch)
                    conn.commit()
                    total_inserted += cursor.rowcount
                except sqlite3.Error as e:
                    conn.rollback()
                    print(f"Error inserting candles for {exchange_name}/{coin_symbol}/{interval_str}: {e}")

    return total_inserted
import sqlite3
import pandas as pd
from hyperliquid.info import Info
from hyperliquid.utils import constants
from datetime import datetime
import time

info = Info(constants.MAINNET_API_URL, skip_ws=True)

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

def create_tables(conn):
    cursor = conn.cursor()
    cursor.execute('PRAGMA foreign_keys = ON;')
    
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
        CREATE TABLE IF NOT EXISTS candles (
            candle_id INTEGER PRIMARY KEY AUTOINCREMENT,
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
            v REAL NOT NULL,
            n INTEGER NOT NULL,
            UNIQUE (exchange_id, coin_id, interval_id, s_t),
            FOREIGN KEY (exchange_id) REFERENCES exchanges(exchange_id),
            FOREIGN KEY (coin_id) REFERENCES coins(coin_id),
            FOREIGN KEY (interval_id) REFERENCES intervals(interval_id)
        );
    ''')
    
    cursor.execute('''
        CREATE INDEX IF NOT EXISTS idx_candles_main 
        ON candles (exchange_id, coin_id, interval_id, s_t);
    ''')
    
    conn.commit()

def insert_candles(conn, exchange_id, coin_id, interval_id, candles):
    cursor = conn.cursor()
    candles_to_insert = []
    for candle in candles:
        candles_to_insert.append((
            exchange_id,
            coin_id,
            interval_id,
            candle['t'],  # Start time as integer
            candle['T'],  # End time as integer
            candle['s'],  # Symbol
            candle['i'],  # Interval
            float(candle['o']),  # Open
            float(candle['c']),  # Close
            float(candle['h']),  # High
            float(candle['l']),  # Low
            float(candle['v']),  # Volume
            int(candle['n'])     # Number of trades
        ))
    
    try:
        cursor.executemany('''
            INSERT OR IGNORE INTO candles 
            (exchange_id, coin_id, interval_id, s_t, e_t, s, i, o, c, h, l, v, n) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        ''', candles_to_insert)
        conn.commit()
    except sqlite3.Error as e:
        print(f"Error inserting candles: {e}")

def start():
    with sqlite3.connect('hl_candles.db') as conn:
        create_tables(conn)
        
        exchange_name = 'HyperLiquid'
        exchange_id = insert_exchange(conn, exchange_name)
        if not exchange_id:
            print("Failed to retrieve exchange_id.")
            return
        
        all_coins = list(pd.read_csv('all_hl_coins.csv')['name'])[:1]
        
        start_date = int(datetime.strptime('2020-01-01', '%Y-%m-%d').timestamp() * 1_000)
        end_date = int(datetime.strptime('2025-01-21', '%Y-%m-%d').timestamp() * 1_000)
        
        intervals = ['1m', '5m', '15m', '30m', '1h', '2h', '4h', '8h', '12h', '1d', '1w']
        
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
                
                print(f'Getting {coin_symbol} on {interval}')
                try:
                    response = info.candles_snapshot(
                        name=coin_symbol, 
                        interval=interval, 
                        startTime=start_date, 
                        endTime=end_date
                    )
                except Exception as e:
                    print(f"Error fetching data for {coin_symbol} on {interval}: {e}")
                    continue
                
                if not response:
                    print(f"No data returned for {coin_symbol} on {interval}.")
                    continue
                
                insert_candles(conn, exchange_id, coin_id, interval_id, response)
                time.sleep(1)


if __name__ == '__main__':
    start()
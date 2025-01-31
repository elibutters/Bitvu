from flask import Blueprint, request, jsonify
from datetime import datetime
import traceback
from funding_data.funding_db.funding_db_handler import query_funding_candles

historical_funding_bp = Blueprint('historical_funding', __name__)

@historical_funding_bp.route('/historical-funding', methods=['POST'])
def historical_funding():
    try:
        data = request.get_json()

        required = ['exchange', 'symbol', 'interval', 'from', 'to']
        if not all(key in data for key in required):
            return jsonify({'error', 'Missing required parameters'}), 400
        
        candles = query_funding_candles(
            exchange_name=data['exchange'],
            coin_symbol=data['symbol'],
            interval=data['interval'],
            start_time=data['from'],
            end_time=data['to']
        )

        formatted = [{
            'time': int(candle['s_t']) / 1000,
            'open': float(candle['o']),
            'high': float(candle['h']),
            'low': float(candle['l']),
            'close': float(candle['c'])
        } for _, candle in candles.iterrows()]

        return jsonify(formatted)
    except Exception as e:
        return jsonify({'error': str(e),
                        'traceback': traceback.format_exc().splitlines()}), 500
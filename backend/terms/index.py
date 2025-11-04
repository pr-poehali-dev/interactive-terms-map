'''
Business: API для получения терминов из базы данных с поиском и фильтрацией
Args: event - dict с httpMethod, queryStringParameters
      context - объект с атрибутами request_id, function_name
Returns: HTTP response с JSON списком терминов
'''

import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any, List

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    # Handle CORS OPTIONS request
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    params = event.get('queryStringParameters') or {}
    search = params.get('search', '')
    category = params.get('category', '')
    letter = params.get('letter', '')
    
    database_url = os.environ.get('DATABASE_URL')
    
    conn = psycopg2.connect(database_url)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    query = "SELECT * FROM terms WHERE 1=1"
    
    if search:
        search_lower = search.lower()
        query += f" AND (LOWER(term) LIKE '%{search_lower}%' OR LOWER(definition) LIKE '%{search_lower}%')"
    
    if category:
        query += f" AND category = '{category}'"
    
    if letter:
        letter_upper = letter.upper()
        query += f" AND UPPER(SUBSTRING(term, 1, 1)) = '{letter_upper}'"
    
    query += " ORDER BY term"
    
    cur.execute(query)
    terms = cur.fetchall()
    
    result = []
    for term in terms:
        result.append({
            'id': term['id'],
            'term': term['term'],
            'definition': term['definition'],
            'category': term['category'],
            'normative_source': term['normative_source'],
            'example': term['example'],
            'related_terms': term['related_terms'] or [],
            'source_site': term['source_site'],
            'note': term['note']
        })
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'isBase64Encoded': False,
        'body': json.dumps(result, ensure_ascii=False)
    }

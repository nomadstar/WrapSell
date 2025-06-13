from flask import Flask, request, jsonify
import os
import psycopg2
import extraer
from parsetodb import json_to_insert

# filepath: /home/ignatus/Documentos/Github/WrapSell/backend_local/app.py

app = Flask(__name__)

# Configuración de la base de datos desde compose.yaml
DB_NAME = "mydatabase"
DB_USER = "user"
DB_PASSWORD = "password"
DB_HOST = "db"
DB_PORT = "5432"
TABLE_NAME = "cards"  # Cambia esto por el nombre real de tu tabla

DB_URL = f"dbname={DB_NAME} user={DB_USER} password={DB_PASSWORD} host={DB_HOST} port={DB_PORT}"

@app.route('/add_card', methods=['POST'])
def add_card():
    data = request.get_json()
    required_fields = ['edition_name', 'card_name', 'card_number']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Faltan campos requeridos"}), 400

    # Extraer datos de la carta usando extraer.py
    card_data = extraer.extract_ungraded_card_data(
        data['edition_name'],
        data['card_name'],
        data['card_number']
    )
    if not card_data:
        return jsonify({"error": "No se pudo extraer la información de la carta"}), 400

    # Generar el statement de inserción
    insert_stmt = json_to_insert(TABLE_NAME, card_data)
    try:
        conn = psycopg2.connect(DB_URL)
        cur = conn.cursor()
        cur.execute(insert_stmt)
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "Datos insertados correctamente", "card_data": card_data}), 201
    except Exception as e:
        return jsonify({"error": f"Error al insertar en la base de datos: {e}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
import requests
from bs4 import BeautifulSoup
import json
import extraer
import os
import sys
import psycopg2

def json_to_insert(table_name, json_obj):
    columns = ', '.join(json_obj.keys())
    values = ', '.join([f"'{str(v).replace("'", "''")}'" if isinstance(v, str) else str(v) for v in json_obj.values()])
    insert_stmt = f"INSERT INTO {table_name} ({columns}) VALUES ({values});"
    return insert_stmt

def insert_card_data_to_db(edition_name, card_name, card_number, table_name, db_url):
    # Extraer datos de la carta
    card_data = extraer.extract_ungraded_card_data(edition_name, card_name, card_number)
    if not card_data:
        print("No se pudo extraer la información de la carta.")
        return False

    # Generar el statement de inserción
    insert_stmt = json_to_insert(table_name, card_data)
    # Realizar la inserción en la base de datos PostgreSQL
    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        cur.execute(insert_stmt)
        conn.commit()
        cur.close()
        conn.close()
        print("Datos insertados correctamente en la base de datos.")
        return True
    except Exception as e:
        print(f"Error al insertar en la base de datos: {e}")
        return False
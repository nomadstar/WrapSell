import requests
from bs4 import BeautifulSoup
import json
import re # Importamos re para trabajar con expresiones regulares

def format_for_url(text):
    """Convierte un texto a formato para URL (minúsculas, espacios a guiones)."""
    return text.lower().replace(' ', '-')

def extract_card_data(edition_name, card_name_input, card_number_input):
    """
    Extrae la información de una carta de Pokémon TCG desde pricecharting.com,
    construyendo la URL a partir de los detalles de la carta.

    Args:
        edition_name (str): El nombre de la edición (ej: "Pokemon Ultra Prism").
        card_name_input (str): El nombre de la carta (ej: "Frost Rotom").
        card_number_input (str): El número de la carta (ej: "41").

    Returns:
        dict: Un diccionario con la información de la carta y sus precios,
              o None si ocurre un error.
    """
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

    # --- 1. Construir la URL ---
    try:
        formatted_edition = format_for_url(edition_name)
        formatted_card_name = format_for_url(card_name_input)
        
        card_number_str = str(card_number_input)

        url = f"https://www.pricecharting.com/game/{formatted_edition}/{formatted_card_name}-{card_number_str}"
        print(f"URL construida: {url}")
    except Exception as e:
        print(f"Error al construir la URL: {e}")
        return None

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()  # Lanza un error para respuestas HTTP malas (4xx o 5xx)
    except requests.exceptions.HTTPError as e:
        if response.status_code == 404:
            print(f"Error: La página no fue encontrada (404) para la URL: {url}. Verifica los nombres y números.")
        else:
            print(f"Error HTTP al realizar la petición: {e}")
        return None
    except requests.exceptions.RequestException as e:
        print(f"Error de conexión al realizar la petición HTTP: {e}")
        return None

    soup = BeautifulSoup(response.content, 'html.parser')

    # --- 2. Información de la carta (ya la tenemos de los parámetros) ---
    edition = edition_name
    card_name = card_name_input
    card_number = card_number_input


    # --- 3. Extraer precios de la tabla ---
    price_data = {}
    try:
        price_table = soup.find('table', id='price_data')
        if not price_table:
            print("Error: No se encontró la tabla de precios (id='price_data').")
            return None
        
        target_td_ids = {
            "Ungraded": "used_price",
            "Grade 7": "complete_price",
            "Grade 8": "new_price",
            "Grade 9": "graded_price",
            "Grade 9.5": "box_only_price",
            "PSA 10": "manual_only_price"
        }

        first_data_row = price_table.find('tbody').find('tr')
        if not first_data_row:
            print("Error: No se encontró la primera fila de datos en la tabla de precios.")
            return None

        for grade_name, td_id in target_td_ids.items():
            price_cell = first_data_row.find('td', id=td_id)
            if price_cell:
                price_span = price_cell.find('span', class_='price')
                if price_span:
                    price_text = price_span.text.strip()
                    price_data[grade_name] = price_text if price_text and price_text != '-' else "N/A"
                else:
                    price_data[grade_name] = "N/A (span.price no encontrado)"
            else:
                price_data[grade_name] = f"N/A (td con id '{td_id}' no encontrado)"
                
    except Exception as e:
        print(f"Error al extraer los precios de la tabla: {e}")
        # Si hay un error aquí, pero tenemos los datos básicos, podríamos devolverlos.
        # Por ahora, si no podemos obtener precios, consideramos que la extracción falló.
        return None # Opcionalmente, podrías devolver la información parcial.

    card_info = {
        "edicion_carta": edition,
        "nombre_carta": card_name.title(), # Capitalizamos el nombre
        "numero_carta": str(card_number), # Aseguramos que sea string para JSON
        "url_extraccion": url,
        "precios": price_data
    }

    return card_info

def save_to_json(data, filename="card_data.json"):
    """
    Guarda un diccionario en un archivo JSON.

    Args:
        data (dict): El diccionario a guardar.
        filename (str): El nombre del archivo JSON de salida.
    """
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        print(f"Datos guardados exitosamente en {filename}")
    except IOError as e:
        print(f"Error al guardar el archivo JSON: {e}")
    except TypeError as e:
        print(f"Error de tipo al convertir a JSON: {e}")


# --- Ejemplo de uso ---
if __name__ == "__main__":
    # Solicitar datos al usuario
    input_edition = input("Ingresa la edición de la carta (ej: Pokemon Ultra Prism): ")
    input_card_name = input("Ingresa el nombre de la carta (ej: Frost Rotom): ")
    input_card_number = input("Ingresa el número de la carta (ej: 41): ")

    print(f"\nExtrayendo datos para: {input_card_name} #{input_card_number} de la edición {input_edition}")
    data = extract_card_data(input_edition, input_card_name, input_card_number)

    if data:
        print("\n--- Datos Extraídos ---")
        print(json.dumps(data, indent=2))
        print("-----------------------\n")
        
        # Generar un nombre de archivo dinámico para evitar sobrescribir
        safe_card_name = format_for_url(input_card_name)
        json_filename = f"{safe_card_name}_{input_card_number}_data.json"
        save_to_json(data, json_filename)

        # Ejemplo con otra carta para probar (sin input de usuario)
        # print("\n--- Ejemplo 2: Charizard Base Set ---")
        # data_2 = extract_card_data("Pokemon Base Set", "Charizard", "4")
        # if data_2:
        #     print("\n--- Datos Extraídos (Charizard) ---")
        #     print(json.dumps(data_2, indent=2))
        #     print("-----------------------------------\n")
        #     save_to_json(data_2, "charizard_4_data.json")
    else:
        print(f"No se pudieron extraer los datos para {input_card_name} #{input_card_number}.")


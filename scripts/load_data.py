import os
import time
from xml.etree import ElementTree as ET
import firebase_admin
import requests
from firebase_admin import credentials, firestore

cred = credentials.Certificate('./keys.json') # This file is the key to access to the firebase database. By default, it is not in the git repository for security reasons.
firebase_admin.initialize_app(cred)
db = firestore.client()


# Function to upload the data of BGG ludoteca to the firebase database. We need to use the BGG API with lots of delays for do not collapse it. 
def fetch_games(username, page, page_size, delay_seconds=5):
    games = []
    try:
        response = requests.get(f'https://www.boardgamegeek.com/xmlapi2/collection?username={username}&page={page}&pagesize={page_size}')
        response.raise_for_status()
        xml_data = response.content

        # Parse XML data
        root = ET.fromstring(xml_data)
        items = root.findall('item')

        for item in items: #First we get all the games per page
            game_id = item.attrib['objectid']
            detail_response = requests.get(f'https://www.boardgamegeek.com/xmlapi2/thing?id={game_id}')
            detail_response.raise_for_status()
            game_data = detail_response.content
            game_root = ET.fromstring(game_data)
            
            print("game_id: "+ game_id)
            game_item = game_root.find('item')
            if game_item is not None: # Here we use the API to get all the necessary information for each game
                game = {
                    'id': game_item.attrib['id'],
                    'name': game_item.find('name').attrib['value'],
                    'image': game_item.find('image').text if game_item.find('image') is not None else '',
                    'url': f'https://boardgamegeek.com/boardgame/{game_item.attrib["id"]}',
                    'description': game_item.find('description').text if game_item.find('description') is not None else 'No description available',
                    'genres': [link.attrib['value'] for link in game_item.findall('link') if link.attrib['type'] == 'boardgamecategory'],
                    'minPlayers': game_item.find('minplayers').attrib['value'] if game_item.find('minplayers') is not None else 'Not specified',
                    'maxPlayers': game_item.find('maxplayers').attrib['value'] if game_item.find('maxplayers') is not None else 'Not specified',
                    'minPlaytime': game_item.find('minplaytime').attrib['value'] if game_item.find('minplaytime') is not None else 'Not specified',
                    'maxPlaytime': game_item.find('maxplaytime').attrib['value'] if game_item.find('maxplaytime') is not None else 'Not specified'
                }
                games.append(game)
                print("game_name: " + game['name'])
                time.sleep(delay_seconds)  # wait 5 seconds between requests
        return games

    except requests.RequestException as e:
        print(f'Error fetching games: {e}')
        return []

# Function to load to firebase database ludoteca collection
def load_to_firebase(games):
    for game in games:
        db.collection('ludoteca').document(game['id']).set(game)
    print(f'Loaded {len(games)} games to Firebase')

def main():
    username = 'citripio'
    page_size = 10
    max_requests_per_batch = 0
    delay_seconds = 5
    page = 1

    batch_games = []
    for _ in range(max_requests_per_batch):
        
        games = fetch_games(username, page, page_size, delay_seconds)
        if not games:
            break
        batch_games.extend(games)
        time.sleep(delay_seconds)  # Wait 5 seconds between requests

    load_to_firebase(batch_games)
    print(f'Waiting for {delay_seconds} seconds before the next batch...')
    time.sleep(delay_seconds)  # Wait 5 seconds for the next batch

if __name__ == '__main__':
    main()
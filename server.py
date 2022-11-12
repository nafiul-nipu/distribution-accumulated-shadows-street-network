import os
import geopandas as gpd
from shapely.geometry import Polygon
from flask import Flask,jsonify, request, send_from_directory, safe_join
from flask_cors import CORS, cross_origin
import numpy as np

app = Flask(__name__, static_folder=os.path.abspath('../vis/shadow-maps/app/'))
geo_network = None
gdf_network = None

@app.route('/', methods=['GET'])
def index():
    return serve_static('index.html')

@app.route('/<path:filename>', methods=['GET'])
def serve_static(filename):
    return send_from_directory(safe_join(app.root_path,'vis/dist/shadow-maps/'), filename)

@app.route('/network', methods=['GET'])
@cross_origin()
def serve_network():
    return geo_network

@app.route('/distribution', methods=['POST'])
@cross_origin()
def serve_distribution():
    result = [
      {
        "Key": "Winter",
        "Value": {}
      },
      {
        "Key": "Summer",
        "Value":{}
      },
      {
        "Key": "Spring",
        "Value":{}
      }
    ]
    
    index = 0
    for i in request.json:
        quartiles = np.percentile(i, [25,50,75])
        minimum = np.min(i)
        maximum = np.max(i)
        interQuantileRange = quartiles[2] - quartiles[0]

        val = {
            "q1": quartiles[0], 
            "median": quartiles[1], 
            "q3": quartiles[2], 
            "interQuantileRange": interQuantileRange, 
            "min": minimum, 
            "max": maximum
            }
        result[index]["Value"] = val
        index = index + 1

    return jsonify(result)

def load():
    global gdf_network
    global geo_network
    gdf_network = gpd.read_file('./chicago-street-shadow.geojson')
    geo_network = gdf_network.to_json()

if __name__ == '__main__':
    load()
    app.run(debug=True, host='127.0.0.1', port=8080)
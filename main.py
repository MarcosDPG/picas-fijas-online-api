from flask import Flask, request
import requests
import os
app = Flask(__name__)

# devuelve el id de sala
@app.route("/")
def hello():
    return "picas-fijas online API"
@app.route('/sala/crear', methods=['POST'])
def crear_sala():
    return "nada"

# une al jugador y le devuelve un identificador
@app.route('/sala/unirse/<id_sala>/<id_user>', methods=['POST'])
def unirse_sala():
    return "nada"

# Crear una concexion en stream con el uso de flask-socketio
@app.route('/sala/stream/<id_sala>/<id_user>', methods=['GET']) #la que debe modificar el codeuler
def stream_sala():
    return "nada"

# guarda el numero del jugador
@app.route('/sala/set/<id_user>/<numero_elegido>', methods=['POST'])
def set_numero():
    return "nada"

# trae el numero del jugador contrario
@app.route('/sala/get/<id_user>', methods=['GET'])
def get_numero():
    return "nada"

if __name__ == '__main__':
    app.run(host='0.0.0.0',port=int(os.environ.get('PORT', 5000)),debug=False)

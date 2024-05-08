from flask import Flask, render_template, request, make_response
from flask_socketio import SocketIO, emit,join_room
import os
import string
import random
app = Flask(__name__)

app.config['SECRET_KEY'] = 'security-key'
socketio = SocketIO(app)

salas = {}

@app.route("/")
def hello():
    return render_template("index.html")

@app.route("/game/local")
def local_game():
    return render_template("localGame.html")

@app.route("/game/local/bot")
def local_game_bot():
    return render_template("localGame_bot.html")

@app.route("/game/online")
def online_game():
    return render_template("online-game.html")

# devuelve el id de sala
@app.route('/sala/crear', methods=['POST'])
def crear_sala():
    salaid = new_id().upper()
    while salas.__contains__(salaid):
        salaid = new_id().upper()
    salas[salaid] = {
                    "size": request.form["digitos"],
                    "turno":-1,
                    "players": []
                    }
    return salaid

# une al jugador
@app.route('/game/unirse/<id_sala>/<id_user>', methods=['POST'])
def unirse_sala(id_sala,id_user):
    texto_respuesta = "ACEPTADO"
    boolean = False
    for player in salas[id_sala]["players"]:
        if(player["id"] == id_user):
            boolean = True
            if (player["status"] == "DESCONECTADO" or player["number"] == "" or (player["number"]!="" and player["status"]=="LISTO") or (player["number"]!="" and player["status"]=="conectado")):
                texto_respuesta = "EN SALA"
            else:
                texto_respuesta = "RECHAZADO"
    #json con un id, status, newPlayer

    if(not boolean and len(salas[id_sala]["players"]) == 2):
            texto_respuesta = "RECHAZADO"
    elif(not boolean):
       jugador = {
                    "id": id_user,
                    "number": "",
                    "status": "EN ESPERA",
                    "sid": "",
                    "tiros": []
                    }
       players = salas[id_sala]["players"]
       players.append(jugador)
       salas[id_sala]["players"] = players
    index=1
    for i in range(len(salas[id_sala]["players"])):
        player = salas[id_sala]["players"][i]
        if (player["id"]!=id_user):
            estatus = salas[id_sala]["players"][index]["status"]
            numero = salas[id_sala]["players"][index]["number"]
            socketio.emit("newPlayer", (id_user, estatus, numero), to=player["sid"])

        else:
            index=i
    respuesta = make_response(texto_respuesta, 200) 
    respuesta.headers['Content-Type'] = 'text/plain'
    return respuesta
#Se abandon la sala al oprimir el botón 
@socketio.on("abandonarSala")
def abandonarSala(id_sala,id_player):
    for player in salas[id_sala]["players"]:
        if (player["id"] == id_player):
            salas[id_sala]["players"].remove(player)
            if(len(salas[id_sala]["players"]) == 0):
                del salas[id_sala]

#retorno si tiene numero elegido o no
@app.route("/sala/<id_sala>/<id_player>")
def validar_jugador(id_sala,id_player):
    for player in salas[id_sala]["players"]:
        if player["id"] ==id_player:
            if len(player["number"]) != 0:
                return "true"
    return "false"


# guarda el numero del jugador
@app.route('/sala/set/<id_sala>/<id_user>/<numero_elegido>', methods=['POST'])
def set_numero(id_sala,id_user,numero_elegido):
    sid = ""
    for player in salas[id_sala]["players"]:
        if(player["sid"] != ""):
            sid = player["sid"]
        if player["id"] == id_user:
            player["number"] = numero_elegido
            player["status"] = "LISTO"
    if(sid != ""):
        socketio.emit("newPlayer",(id_user,"LISTO",numero_elegido), room=sid)
    return "nada"

# trae el numero del jugador contrario
@app.route('/sala/get/<id_sala>/<id_user>', methods=['GET'])
def get_numero(id_sala,id_user):
    retorno = "-1"
    for player in salas[id_sala]["players"]:
        if player["id"] != id_user:
            retorno = player["number"]
    respuesta = make_response(retorno, 200) 
    respuesta.headers['Content-Type'] = 'text/plain'
    return respuesta

# trae las salas disponibles
@app.route('/sala/get/salas', methods=['GET'])
def get_salas():
    respuesta = {}
    for key in salas.keys():
        respuesta[key]={
                        "size":salas[key]["size"],
                        "players":len(salas[key]["players"])
                        }
    return respuesta
#Conectar
@socketio.on("connect")
def connect():
    print(f"Se ha conenctado {request.sid}")
@socketio.on("disconnect")
def disconnect():
    contador = 0
    sala_id = ""
    for sala, campos in salas.items():
        for player in campos["players"]:
            if player["sid"] == request.sid:
                sala_id = sala
    for player in salas[sala_id]["players"]:
        if player["sid"] == request.sid:
            player["status"] = "DESCONECTADO"
            contador += 1
            emit("jugadorOffline",to=sala)
        elif player["status"] == "DESCONECTADO":
            contador += 1
    if(contador == 2):
        del salas[sala_id]
    
#iniciar los tiros 
@socketio.on("join")
def conexionM(id_sala,id_player,):
    if (id_sala in salas):
        boolean = 0
        for player in salas[id_sala]["players"]:
            if id_player == player["id"]:
                emit("confirmarSala",1) 
                player["sid"] = request.sid
                player["status"] = "conectado"
                join_room(id_sala)
        #if id_player in salas[id_sala]:
            if(player["status"] == "conectado"):
                boolean += 1
        if(boolean != 2):
            return
        #Para iniciar la partida ambos deben estar conectados, de lo contrario no se iniciará el juego
        elif(salas[id_sala]["players"][0]["status"] == "conectado" and salas[id_sala]["players"][1]["status"] == "conectado") and salas[id_sala]["turno"] == -1:
            numRandom = random.randint(0,1)
            emit("inicio",(0,0),to=id_sala)
            emit("disparar",getTiros(id_sala,id_player),room=salas[id_sala]["players"][numRandom]["sid"])
            salas[id_sala]["turno"] = numRandom
        else:
            emit("inicio",getTiros(id_sala,salas[id_sala]["players"][salas[id_sala]["turno"]]["id"]),to=id_sala)
            emit("disparar",getTiros(id_sala,salas[id_sala]["players"][salas[id_sala]["turno"]*(-1) + 1]["id"]),room=salas[id_sala]["players"][salas[id_sala]["turno"]]["sid"])
@socketio.on("chatin")
def cahtIn(mensaje,player_id,sala_id):
    emit("chatin",(mensaje,player_id),to=sala_id)
    
#Obtener la cantidad de tiros que han realizado los jugadores
def getTiros(id_sala,id_player):
    tirosA = 0
    tirosB = 0
    for player in salas[id_sala]["players"]:
        if (player["id"] == id_player):
            tirosB = len(player["tiros"])
        else:
            tirosA = len(player["tiros"])
    return (tirosA,tirosB)

@socketio.on("giveShot")
def giveShot(id_sala,id_player,tiro,picas,fijas):
    if int(fijas) == len(tiro):
        for player in salas[id_sala]["players"]:
            if (player["id"]==id_player):
                player["tiros"].append(tiro)
        retorno = (retornarGanador(salas[id_sala]["players"][0],request.sid),retornarGanador(salas[id_sala]["players"][1],request.sid))
        #[{user:"",shots:0,numero:"",state:"GANADOR!"},{user:"",shots:0,numero:"",state:"sigue intentando :)"}]
        emit("getWinner",retorno,to=id_sala)
        del salas[id_sala]
        socketio.close_room(room=id_sala)
        return 
    if int(fijas) == -1:
        retorno = (retornarGanadorVencido(salas[id_sala]["players"][0],request.sid),retornarGanadorVencido(salas[id_sala]["players"][1],request.sid))
        #[{user:"",shots:0,numero:"",state:"GANADOR!"},{user:"",shots:0,numero:"",state:"sigue intentando :)"}]
        emit("getWinner",retorno,to=id_sala)
        del salas[id_sala]
        socketio.close_room(room=id_sala)
        return 
    #se agrega el tiro
    for player in salas[id_sala]["players"]:
            if (player["id"]==id_player):
                player["tiros"].append(tiro)
    turno = (-1) * int(salas[id_sala]["turno"]) + 1
    #for player in salas[id_sala]["players"]:
    salas[id_sala]["turno"] = turno
    boolean = False

    if salas[id_sala]["players"][turno]["status"]=="conectado":
        emit("disparar",getTiros(id_sala,id_player),room=salas[id_sala]["players"][turno]["sid"])
        boolean = True
    if( not boolean):
        emit("esperaConexion")
#Funcion para aquel que se de por vencido
def retornarGanadorVencido(diccionario,sid):
    player = {}
    player["user"] = diccionario["id"]
    player["shots"] = str(len(diccionario["tiros"]))
    player["numero"] = diccionario["number"]
    player["state"] = "PERDEDOR" if (diccionario["sid"] == sid) else "GANADOR"
    return player
#Funcion para aquel que gane la partida
def retornarGanador(diccionario,sid):
    player = {}
    player["user"] = diccionario["id"]
    player["shots"] = str(len(diccionario["tiros"]))
    player["numero"] = diccionario["number"]
    player["state"] = "GANADOR" if (diccionario["sid"] == sid) else "PERDEDOR"
    return player
    
def new_id(longitud=10):
    caracteres = string.ascii_letters + string.digits
    cadena_aleatoria = ''.join(random.choice(caracteres) for _ in range(longitud))
    return cadena_aleatoria

if __name__ == '__main__':
    app.run(host='0.0.0.0',port=int(os.environ.get('PORT', 5000)),debug=False)

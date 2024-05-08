var socket;
var txt_prueba = "0123456789"
var tiro = "";
var picas = 0;
var fijas = 0;
document.addEventListener('DOMContentLoaded', () => {

    document.getElementById("id_sala").textContent = localStorage.getItem("SALA") || "Sin SALA"

    if(localStorage.getItem("SALA")!=null&&localStorage.getItem("USERNAME")!=null&&localStorage.getItem("SIZE")!=null) {    
        document.getElementById("btn_shot").disabled = true;
        fetch(`./unirse/${localStorage.getItem("SALA")}/${localStorage.getItem("USERNAME")}`,{method: 'POST'})
            .then(response => {
                if (!response.ok) {
                    alert("No es posible unirse a la sala, intentalo de nuevo");
                    localStorage.removeItem("MI_NUMERO")
                    localStorage.removeItem("SALA")
                    window.history.back();
                    throw new Error('Ups, algo paso');
                }
                return response.text();
            })
            .then(data => {
                if (data=="ACEPTADO") {
                    set_mi_numero()
                } else {
                    if (data!="EN SALA") {
                        alert("No se pudo unir a la sala")
                        localStorage.removeItem("MI_NUMERO")
                        localStorage.removeItem("SALA")
                        window.history.back();
                    }else {
                        fetch(`${window.location.origin}/sala/${localStorage.getItem("SALA")}/${localStorage.getItem("USERNAME")}`)
                            .then(response => {
                                if (!response.ok) {
                                    alert("No es posible unirse a la sala, intentalo de nuevo");
                                    localStorage.removeItem("MI_NUMERO")
                                    localStorage.removeItem("SALA")
                                    window.history.back();
                                    throw new Error('Ups, algo paso');
                                }
                                return response.text()
                            }).then(respuesta => {
                                console.log(`respuesta: ${respuesta}`)
                                if (respuesta=="true" && localStorage.getItem("MI_NUMERO")==null) {
                                    alert("Ya hay un jugador con este nombre, intentalo de nuevo");
                                            localStorage.removeItem("MI_NUMERO")
                                            localStorage.removeItem("SALA")
                                            window.history.back();
                                }else {
                                    if (localStorage.getItem("MI_NUMERO")==null) {
                                        set_mi_numero()
                                    }
                                }
                            })
                    }
                }
        })
        .then(()=>{
            socket = io()
            setupSocketListeners()
            document.getElementById('jugadores').innerHTML = "<li class=\"animate__animated animate__bounceInRight\" id=\"" + localStorage.getItem("USERNAME") + "\">" +
                "<div style=\"display: flex; justify-content: space-between; flex-direction: row;\">"+
                "<div style=\"display:flex; flex-direction: row;\"><p id=\"User" + localStorage.getItem("USERNAME") + "\">" +"<div id=\"span\"></div>"+ "Jugador Alias:  " + localStorage.getItem("USERNAME") + "</p></div>"+
                "<div style=\"display:flex; flex-direction: row;\"><p id=\"Estado" + localStorage.getItem("USERNAME") + "\">" + "Estado:  " + "conectando..." + "<div id=\"span\"></div>"+"</p></div>"+
                "</div>"+
                "</li>" 
            window.joinSala()
            document.getElementById("bullet").value = txt_prueba.substring(0,parseInt(localStorage.getItem("SIZE"))||localStorage.getItem("ENEMY_NUMERO").length)
        })
    }
})

function shot() {
    num = document.getElementById("bullet").value
    console.log(`shot: ${num}${picas}${fijas}`)
    if (num.length==localStorage.getItem("SIZE") || num.length == localStorage.getItem("ENEMY_NUMERO").length) {
        if(validar(num)) {
            addshot(num)
            console.log(`shot validar: ${num}${picas}${fijas}`)
        }else {
            alert("Ningun digito se puede repetir!,\nIntentalo de nuevo")
        }
    }else {
        alert(`Debe ser un numero de ${localStorage.getItem("SIZE") || localStorage.getItem("ENEMY_NUMERO").length} digitos`)
    }
}

function validar(num) {
    for (const c of num) {
        if(!(num.lastIndexOf(c)==num.indexOf(c))){
            return false
        }
    }
    return true
}

function addshot(num) {
    console.log(`add: ${num}${picas}${fijas}`)
    document.getElementById('tabla').innerHTML = "<li>"+
    "<div style=\"display: flex; flex-direction: row; align-items: center; width: 100%; justify-content: center;\">"+
    "<div class=\"span\"></div>"+
    "<h3>"+num+"</h3>"+
    "<div class=\"span\"></div>"+
    "<h3>"+play(num)+"</h3>"+
    "<div class=\"span\"></div>"+
    "</div>"+
    "</li>"+
    document.getElementById('tabla').innerHTML;
    document.getElementById("shots").value = parseInt(document.getElementById("shots").value) + 1
    window.shotEmit()
}
function play(num) {
    let p = 0;
    let f = 0;
    for (let i = 0; i < localStorage.getItem("ENEMY_NUMERO").length; i++) {
        const ce = localStorage.getItem("ENEMY_NUMERO")[i];
        for (let j = 0; j < num.length; j++) {
            const c = num[j];
            if (ce==c) {
                if(i==j){
                    f++;
                }else{
                    p++;
                }
            }
        }
    }
    console.log(`num:${num}`)
    tiro = num
    picas = p
    fijas = f
    return String(p)+'P  -  '+String(f)+'F'
}

function resultados(players){
    document.getElementById("resultados").classList.add("visible")
    document.getElementById('tablares').innerHTML = ""
        let a = players; //** [{user:"",shots:0,numero:"",state:""},{user:"",shots:0,state:""}]
        a.forEach(p => {
            document.getElementById('tablares').innerHTML = document.getElementById('tablares').innerHTML +"<li>"+
                "<div style=\"display: flex; flex-direction: row; align-items: center; width: 100%; justify-content: center; flex-wrap: wrap;\">"+
                "<div class=\"span\"></div>"+
                "<h4>"+p.user+"</h4>"+
                "<div class=\"span\"></div>"+
                "<h4>"+"Tiros: "+p.shots+"</h4>"+
                "<div class=\"span\"></div>"+
                "<h4>"+"Numero Jugado: "+p.numero+"</h4>"+
                "<h3>"+p.state+"</h3>"+
                "<div class=\"span\"></div>"+
                "<div class=\"span\"></div>"+
                "</div></li>"
        });
}

function set_mi_numero() {
    let numero = prompt(`Por favor ingrese el número con el que desea jugar,\ndebe ser de ${localStorage.getItem('SIZE')} digitos`);
    try {
        parseInt(numero)
    } catch (error) {
        numero="1"
    }
    if (numero >= 3) {
        for (i = 0; i <= numero.length - 2; i++) {
            for (j = i + 1; j <= numero.length - 1; j++) {
                if (numero[i] == numero[j]) {
                    numero = "1"
              }
          }
        }
    }
    if (numero === null) {
        left()
        set_mi_numero()
    } else if (!isNaN(numero) && numero.length==parseInt(localStorage.getItem("SIZE"))) {
        fetch(`${window.location.origin}/sala/set/${localStorage.getItem("SALA")}/${localStorage.getItem("USERNAME")}/${numero}`,{method:'POST'})
            .then(response => {
                if (!response.ok) {
                    alert("No fue posible guardar tu numero, intentalo de nuevo");
                    localStorage.removeItem("MI_NUMERO")
                    set_mi_numero()
                }else{
                    alert("El número seleccionado es " + numero);
                    localStorage.setItem("MI_NUMERO",numero);
                }
                return response.text();
            });
    } else {
        alert(`¡Por favor, ingresa un número válido!\nDebe ser de ${localStorage.getItem('SIZE')}`);
        set_mi_numero()
    }
}


// ************************ SOCKETS ************************ //

function setupSocketListeners() {

    socket.on('connect', function () {
        document.getElementById("Estado"+localStorage.getItem("USERNAME")).textContent = "confirmando sala..."
        console.log("conectado")
    })

    socket.on('newPlayer', function(id,estado,enemy_number){
        localStorage.setItem("ENEMY_NUMERO",enemy_number)
        if (document.getElementById(id)==null) {
            document.getElementById('jugadores').innerHTML = document.getElementById('jugadores').innerHTML + "<li class=\"animate__animated animate__bounceInRight\" id=\"" + id + "\">" +
                "<div style=\"display: flex; justify-content: space-between; flex-direction: row;\">"+
                "<div style=\"display:flex; flex-direction: row;\"><p id=\"User" + id + "\">" +"<div id=\"span\"></div>"+ "Jugador Alias:  " + id + "</p></div>"+
                "<div style=\"display:flex; flex-direction: row;\"><p id=\"Estado" + id + "\">" + "Estado:  " + estado + "<div id=\"span\"></div>"+"</p></div>"+
                "</div>"+
                "</li>" 
        }else{
            document.getElementById("Estado" + id).textContent=estado
        }
    })

    socket.on("confirmarSala", function (response) {
        if (response == 1) {
            document.getElementById("Estado"+localStorage.getItem("USERNAME")).textContent = "¡listo!"
        } else {
            alert("No se pudo unir a la sala")
            localStorage.removeItem("SALA")
            window.history.back();  
        }
    })

    socket.on("inicio", (mis_tiros,tiros_enemigos) => {
        if (!document.getElementById("btn_chat").classList.contains("visible")) {
            document.getElementById("btn_chat").classList.add("visible")
        }
        if (document.getElementById("popup").classList.contains("visible")) {
            show_popup("Jugador contrario desconectado\nEsperando su reconexion.\nSi abandonas la sala sera cerrada.",true)
        }
        document.getElementById("shots").value = mis_tiros
        document.getElementById("shotsenemy").value = tiros_enemigos
        document.getElementById("sala_espera").classList.remove("active")
        fetch(`${window.location.origin}/sala/get/${localStorage.getItem("SALA")}/${localStorage.getItem("USERNAME")}`)
            .then(response => {
                if (!response.ok) {
                    alert("algo salio mal, recarga la pagina porfavor")
                }else {
                    return response.text()
                }
            })
            .then(data => {
                localStorage.setItem("ENEMY_NUMERO",data)
            })
    })

    socket.on("disparar", (mis_tiros,tiros_enemigos) => {
        document.getElementById("btn_shot").disabled = false;
        document.getElementById("shots").value = mis_tiros
        document.getElementById("shotsenemy").value = tiros_enemigos
        show_popup(message="¡Es tu turno!",waiting=false,time=1)
    })

    socket.on("getWinner", (ganador,perdedor)=> {
        resultados([ganador,perdedor])
    })

    socket.on("esperaConexion", function () {
        console.log("Esperando a que el otro jugador se conecte")
        //! falta
    })

    socket.on("jugadorOffline", function (msg) {
        if (document.getElementById("btn_chat").classList.contains("visible")) {
            document.getElementById("btn_chat").classList.remove("visible")
        }
        show_popup("Jugador contrario desconectado\nEsperando su reconexion.\nSi abandonas la sala sera cerrada.",true)
    })

    socket.on("chatin",(mensaje,player_id)=>{
        if (!document.getElementById("notificacion_new_message").classList.contains("visible")) {
            document.getElementById("notificacion_new_message").classList.add("visible")
        }
        const chat = document.getElementById("messages")
        const clase = ["msg_mine","msg_enemy"]
        let claseSelection = 1
        if (player_id==localStorage.getItem("USERNAME")) {
            claseSelection = 0
        }
        chat.innerHTML = `<div class="box_msg">`+
            `<div class="${clase[claseSelection]}">${mensaje}</div>`+
            `</div>` +
            chat.innerHTML
    })

    window.abandonarSala = function() {
        socket.emit("abandonarSala", localStorage.getItem("SALA"), localStorage.getItem("USERNAME"));
    };
    window.joinSala = function() {
        socket.emit("join", localStorage.getItem("SALA"), localStorage.getItem("USERNAME"));
    };
    window.shotEmit = function() {
        document.getElementById("btn_shot").disabled = true
        console.log(fijas)
        socket.emit("giveShot", localStorage.getItem("SALA"), localStorage.getItem("USERNAME"),tiro, picas, fijas);
    };
    window.chatin = function() {
        socket.emit("chatin",document.getElementById("msg").value,localStorage.getItem("USERNAME"),localStorage.getItem("SALA"))
        document.getElementById("msg").value = ""
    };
}

function left() {
    window.abandonarSala();
    localStorage.removeItem("SIZE")
    localStorage.removeItem("SALA")
    localStorage.removeItem("MI_NUMERO")
    window.history.back()
}

function Rendirse() {
    tiro = "1"
    picas = 0
    fijas = -1
    window.shotEmit()
}

function sendMsg() {
    if (document.getElementById("msg").value!="" && document.getElementById("msg").value!=null) {
        window.chatin()
    }
}

function show_popup(message="",waiting=false,time=10) {
    document.getElementById("popup").classList.toggle("visible")
    document.getElementById("message_popup").textContent = message
    if (!waiting) {
        setTimeout(() => {
            document.getElementById("popup").classList.toggle("visible")
        }, time*1000);
    }
}

function toggleChat() {
    if (document.getElementById("notificacion_new_message").classList.contains("visible")) {
        document.getElementById("notificacion_new_message").classList.remove("visible")
    }
    document.getElementById("box_chat").classList.toggle("visible")
}

function Numeros(string){//Solo numeros
    var out = '';
    var filtro = '1234567890';//Caracteres validos
	
    //Recorrer el texto y verificar si el caracter se encuentra en la lista de validos 
    for (var i=0; i<string.length; i++)
       if (filtro.indexOf(string.charAt(i)) != -1) 
             //Se añaden a la salida los caracteres validos
	     out += string.charAt(i);
	
    //Retornar valor filtrado
    return out.substring(0,parseInt(localStorage.getItem("SIZE")) || localStorage.setItem("ENEMY_NUMERO").length);
}
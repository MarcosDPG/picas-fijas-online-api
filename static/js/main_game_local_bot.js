const ND = 10
const bot = new LogicaFijas();
bot.prearranque()
var nums = {
    "p1": "",
    "p2": crearNumero()
};
document.getElementById("numero_p2").value = nums["p2"]
var names = {
    "p1": "",
    "p2": document.getElementById("nombre_p2").value
};
var shots = {
    "p1": 0,
    "p2": 0
};
var player_turn = "2";

function getNextPlayer() {
    if (player_turn == "1") {
        return "2"
    } else {
        return "1"
    }
}
//Fución que evalua que el número num no tenga valores repetidos
function validar(num) {
    for (const c of num) {
        if (!(num.lastIndexOf(c) == num.indexOf(c))) {
            return false
        }
    }
    return true
}
//se intenta 'disparar' el numero, pero antes se debe validar
function shot() {
    let num = document.getElementById('bullet').value
    if (num.length != ND) {
        alert("El numero debe ser de " + String(ND) + " digitos")
    } else {
        if (validar(num)) {
            addshot(num, player_turn)
        } else {
            alert("Ningun digito se puede repetir!, recuerdalo!")
        }
    }
}
function addshot(num, player) {
    let played = play(num, nums["p" + getNextPlayer()])
    document.getElementById('tabla_p' + player).innerHTML = "<li>" +
        "<div style=\"display: flex; flex-direction: row; align-items: center; width: 100%; justify-content: center;\">" +
        "<div class=\"span\"></div>" +
        "<p>" + num + "</p>" +
        "<div class=\"span\"></div>" +
        "<p>" + `${played.p}P - ${played.f}F` + "</p>" +
        "<div class=\"span\"></div>" +
        "</div>" +
        "</li>" +
        document.getElementById('tabla_p' + player).innerHTML;
    if (player=="2") {
        bot.recibirFeedback(played.f)
    }
}
function play(num, enemy) {
    let p = 0;
    let f = 0;
    for (let i = 0; i < enemy.length; i++) {
        const ce = enemy[i];
        for (let j = 0; j < num.length; j++) {
            const c = num[j];
            if (ce == c) {
                if (i == j) {
                    f++;
                } else {
                    p++;
                }
            }
        }
    }
    shots["p" + player_turn] = shots["p" + player_turn] + 1
    setTimeout(() => {
        if (f == ND) {
            resultados()
        } else {
            nextTurn()
        }
    }, 500)
    return {p:p,f:f}
}
function resultados() {
    let msg = (x) => { if (player_turn == x) { return "¡Ganador!" } else { return "¡Sigue intentado!" } }
    let resultados = document.getElementById('resultados')
    resultados.classList.toggle('visible');
    resultados.innerHTML = "<h3>¡Resultados!</h3>" +
        "<p>" + names["p1"] + " -> <b>Tiros:</b> " + shots["p1"] + " | <b>Número jugado:</b> " + nums["p1"] + " | " + msg("1") + "<p/>" +
        "<p>" + names["p2"] + " -> <b>Tiros:</b> " + shots["p2"] + " | <b>Número jugado:</b> " + nums["p2"] + " | " + msg("2") + "<p/>"
}

function Numeros(string) {
    var out = '';
    var filtro = '1234567890';
    for (var i = 0; i < string.length; i++)
        if (filtro.indexOf(string.charAt(i)) != -1)
            out += string.charAt(i);
    return out.substring(0,ND);
}
function eleccion(player, btn) {
    let nombre = document.getElementById("nombre_" + player).value
    let numero = document.getElementById("numero_" + player).value
    if (!validar(numero)) {
        alert("Ningún dígito se puede repetir")
    } else if (numero.length != ND) {
        alert("El numero no tiene los digitos necesarios\nDeben ser: " + ND + " digitos")
    } else {
        names[player] = nombre
        nums[player] = numero
        if (nums["p1"] != "" && nums["p2"] != "") {
            document.getElementById('mensaje_eleccion').classList.toggle('visible')
            nextTurn()
        } else {
            btn.classList.toggle('hidden')
        }
    }
}

function nextTurn() {
    document.getElementById('fieldPlayer1').classList.toggle('selected')
    document.getElementById('fieldPlayer2').classList.toggle('selected')
    player_turn = getNextPlayer()
    document.getElementById('player_name').textContent = names["p" + player_turn]
    if (player_turn=="2") {
        document.getElementById("bullet").readOnly = true
        document.getElementById("bullet").value = bot.lanzar().join("")
        setTimeout(()=>{
            shot()
        },2000)
    } else {
        document.getElementById("bullet").readOnly = false
    }
}


function crearNumero() {
    respuesta = ""
    for (let i = 0; i < 10; i++) {
        let prueba;
        do {
            prueba = Math.floor(Math.random() * 10);
        } while (encontrarNumero(prueba, respuesta));
        respuesta = `${respuesta}${prueba}`
    }
    return respuesta
}

function encontrarNumero(prueba=0, numero="") {
    if (numero.includes(`${prueba}`)) {
        return true
    }
    return false
}
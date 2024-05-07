document.addEventListener('DOMContentLoaded', () => {
  document.getElementById("USERNAME").value = localStorage.getItem("USERNAME")
});


document.getElementById('crear_sala_panel').addEventListener('click', function(event) {
  if (event.target === this) {
      toggleCrearSala()
  }
});

document.getElementById('unirse_sala_panel').addEventListener('click', function(event) {
  if (event.target === this) {
      toggleSalas()
  }
});

document.getElementById('formulario').addEventListener('submit', function(event) {
    event.preventDefault(); // Evitar que el formulario se envíe automáticamente

    // Obtener los datos del formulario
    const formData = new FormData(this);

    fetch('./sala/crear', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            alert("La sala no pudo ser creada, intentalo de nuevo");
            throw new Error('Sala no creada');
        }
        return response.text();
    })
    .then(data => {
      localStorage.setItem("SIZE",formData.get("digitos"))
      localStorage.setItem('SALA', data);
      window.location.href="/game/online"
    })
    .catch(error => {
        console.error('Sala no creada:\t ', error);
    });
});

document.getElementById("USERNAME").addEventListener("change",(data)=>{
  if (data.target.value=="") {
    localStorage.removeItem("USERNAME")
  }else {
    localStorage.setItem("USERNAME",data.target.value)
  }
})

document.getElementById("online").addEventListener("click",()=>{
  if (localStorage.getItem("USERNAME")!=null) {
    toggleCrearSala()
  } else {
    alert("Ponte un nombre")
  }
})

document.getElementById("salas").addEventListener("click",()=>{
  if (localStorage.getItem("USERNAME")!=null) {
    get_salas()
    toggleSalas()
  } else {
    alert("Ponte un nombre")
  }
})

function toggleCrearSala() {
  document.getElementById("crear_sala_panel").classList.toggle("visible")
}
function toggleSalas() {
  document.getElementById("unirse_sala_panel").classList.toggle("visible")
}
function unirseSala(id,size) {
  toggleSalas()
  localStorage.setItem("SIZE",size)
  localStorage.setItem('SALA', id);
  window.location.href="/game/online"
}

function get_salas() {
  fetch('./sala/get/salas')
    .then(response => response.json())
    .then(data => {
      const table = document.getElementById('salas_table');
      table.innerHTML="<tr>"+
      "<th>ID Sala</th>"+
      "<th>N° Jugadores</th>"+
      "<th>N° Digitos</th>"+
      "<th>Opciones</th>"+
      "</tr>";
      for (const idSala in data) {
        if (data.hasOwnProperty(idSala)) {
          const sala = data[idSala];

          const row = document.createElement('tr');

          const idCell = document.createElement('td');
          idCell.textContent = idSala;
          row.appendChild(idCell);

          const playersCell = document.createElement('td');
          playersCell.textContent = sala.players+"/2";
          row.appendChild(playersCell);

          const sizeCell = document.createElement('td');
          sizeCell.textContent = sala.size;
          row.appendChild(sizeCell);

          const joinCell = document.createElement('td');
          joinCell.innerHTML = `<button onclick="javascript:unirseSala('${idSala}',${parseInt(sala.size)})">Unirse</button>`;
          row.appendChild(joinCell);

          // Agregar la fila a la tabla
          table.appendChild(row);
        }
      }
    })
    .catch(error => console.error('Error al obtener las salas:', error));
}
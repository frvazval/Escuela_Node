// Carga los modulos http y fs
const http = require('node:http');
const fs =require("node:fs");

// Obtiene los datos del fichero .env
process.loadEnvFile();

// Puerto de conexión
const PUERTO = process.env.PORT || process.argv[2] || 8888;

// Miro si esxiste el fichero json
let existeJson;
if (!fs.existsSync("escuela.json")) {
    // Si no existe, creo un mensaje indicandolo
    existeJson = false;
    mensaje = "Aun no hay alumnos matriculados en la escuela";
    
} else  {
    // Si existe, leo el archivo JSON
    let lectura = fs.readFileSync("escuela.json", "utf-8");
    jsonLeido = JSON.parse(lectura);
    existeJson = true; // Ahora sabemos que el archivo JSON existe
}

// Guardo en un array las asignaturas distintas que hay en el JSON
let asignaturas = [];
if (existeJson) {
    for (let i = 0; i < jsonLeido.length; i++) {
        if (!asignaturas.includes(jsonLeido[i].asignatura)) {
            asignaturas.push(jsonLeido[i].asignatura);
        }
    }
}

console.log(asignaturas);
// estilos CSS
const style = `
<style>

    * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: Arial, Helvetica, sans-serif;
    }

    h1 {
    font-family: Verdana, Geneva, Tahoma, sans-serif;
    color: black;
    font-size: 2.5rem;
    text-align: center;
    margin: 1rem;
    }

    p {
        font-family: Arial, Helvetica, sans-serif;
        font-size: 1.5rem;
        text-align: center;
        color: darkblue;
    }
    
</style>`;

// Servidor Web
const server = http.createServer((req, res) => {

if (req.url == "/") {
    // Ruta raiz, muestra todos los alumnos    
    res.writeHead(200, {"content-type": "text/html"});
    res.write(style);
    res.write("<h1>Todos los alumnos</h1>");    

    if (existeJson) {
        // Para ordenar los datos por apellido, nombre y asignatura de forma ascendente    
        let alumnosOrdenados = jsonLeido.sort((a, b) => a.asignatura.localeCompare(b.asignatura, "es-ES", { numeric: true }));
        alumnosOrdenados = alumnosOrdenados.sort((a, b) => a.apellido.localeCompare(b.apellido, "es-ES", { numeric: true }));
        alumnosOrdenados = alumnosOrdenados.sort((a, b) => a.nombre.localeCompare(b.nombre, "es-ES", { numeric: true }));
    
        for(let i = 0; i < alumnosOrdenados.length; i++) {
            res.write(`<p>${alumnosOrdenados[i].nombre} ${alumnosOrdenados[i].apellido}, Edad: ${alumnosOrdenados[i].edad}, Asignatura: ${alumnosOrdenados[i].asignatura}</p>`);
        }

    } else {
        res.write("<h2>Aun no hay alumnos matriculados</h2>");
    }
    res.end();
    return
} else if (req.url == "/:asignatura"){
    let asignatura = req.params.asignatura.toLowerCase();
    console.log(asignatura);
    res.writeHead(200, {"content-type": "text/html"});
    res.write(style);
    res.write(`<h1>Alumnos matriculados en la asignatura: ${asignatura.toUppercase()}</h1>`);

    res.end();
    return
} else {
    // Ruta desconocida
    res.writeHead(200, {"content-type": "text/html"});
    res.write(style);
    res.write("<h1>Error 404</h1>");
    res.end();
    return
}


})

// Levanta el servidor Web
server.listen(PUERTO, () => {
    console.log(`Servidor levantado en http://localhost:${PUERTO}`);
})



const http = require('node:http');
const fs = require('node:fs');
const url = require('node:url');

// Requiere Node.js >= 21 y ejecutarse con --env-file

// Función para iniciar el servidor web, es asyncrona para poder usar await
async function iniciarServidor() {
    // Carga las variables del .env   
    try {
        await process.loadEnvFile(); // await sirve para detener temporalmente la ejecución hasta que termine de cargar el archivo .env
    } catch (error) {
        console.warn("Archivo .env no encontrado o falló la carga. Usando valores por parametro o por defecto.");
    }
    const PUERTO = process.env.PORT || process.argv[2] || 8888;

    let mensaje = "";
    let jsonLeido = [];
    let existeJson = false;

    if (!fs.existsSync("escuela.json")) {
        mensaje = "Aun no hay alumnos matriculados en la escuela";
    } else {
        const lectura = fs.readFileSync("escuela.json", "utf-8");
        jsonLeido = JSON.parse(lectura);
        existeJson = true;
    }

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
            
        h2 { 
            text-align: center;
            margin: 1rem;
            color: darkred;
        }
    </style>`;

    const server = http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const path = decodeURIComponent(parsedUrl.pathname.trim());
    const pathParts = path.split("/").filter(p => p !== "");

        res.writeHead(200, { "content-type": "text/html" });
        res.write(style);

        if (path === "/" || pathParts.length === 0) {
            // Muestra todos los alumnos
            res.write("<h1>Todos los alumnos</h1>");

            if (existeJson && jsonLeido.length > 0) {
                const alumnosOrdenados = jsonLeido.sort((a, b) => {
                    const porNombre = a.nombre.localeCompare(b.nombre, "es-ES");
                    if (porNombre !== 0) return porNombre;
                    const porApellido = a.apellido.localeCompare(b.apellido, "es-ES");
                    if (porApellido !== 0) return porApellido;
                    return a.asignatura.localeCompare(b.asignatura, "es-ES");
                });

                for (const alumno of alumnosOrdenados) {
                    res.write(`<p>${alumno.nombre} ${alumno.apellido}, Edad: ${alumno.edad}, Asignatura: ${alumno.asignatura}</p>`);
                }
            } else {
                res.write("<h2>Aun no hay alumnos matriculados</h2>");
            }

        } else if (pathParts.length === 1) {
            const asignatura = pathParts[0].toLowerCase();
            res.write(`<h1>Alumnos en la asignatura: ${asignatura}</h1>`);

            if (existeJson) {
                const alumnos = jsonLeido.filter(a => a.asignatura.toLowerCase() === asignatura);
                if (alumnos.length > 0) {
                    for (const alumno of alumnos) {
                        res.write(`<p>${alumno.nombre} ${alumno.apellido}, Edad: ${alumno.edad}</p>`);
                    }
                } else {
                    res.write(`<h2>No hay alumnos en la asignatura "${asignatura}"</h2>`);
                }
            } else {
                res.write("<h2>Aun no hay alumnos matriculados</h2>");
            }

        } else if (pathParts.length === 2) {
            const nombre = pathParts[0].toLowerCase();
            const apellido = pathParts[1].toLowerCase();
            res.write(`<h1>Alumno: ${nombre} ${apellido}</h1>`);

            if (existeJson) {
                const coincidencias = jsonLeido.filter(a =>
                    a.nombre.toLowerCase() === nombre &&
                    a.apellido.toLowerCase() === apellido
                );

                if (coincidencias.length > 0) {
                const alumnoEjemplo = coincidencias[0]; // Para mostrar edad
                const asignaturas = coincidencias.map(a => a.asignatura);
            
                res.write(`<p><strong>Edad:</strong> ${alumnoEjemplo.edad}</p>`);
                res.write(`<p><strong>Asignaturas:</strong> ${asignaturas.join(", ")}</p>`);
                } else {
                    res.write(`<h2>No se encontro al alumno "${nombre} ${apellido}"</h2>`);
                }
            } else {
                res.write("<h2>Aun no hay alumnos matriculados</h2>");
            }


        } else {
            res.write("<h1>Error 404</h1>");
            res.write("<h2>Ruta no reconocida</h2>");
        }

    res.end();
    });

    server.listen(PUERTO, () => {
        console.log(`Servidor levantado en http://localhost:${PUERTO}`);
    });
}

// Inicia el servidor
iniciarServidor();

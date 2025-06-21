// Escuela - Gestión de Alumnos y Asignaturas
// Le indico que tiene que utilizar el módulo 'fs' de Node.js para manejar archivos
const fs =require("node:fs");
let jsonLeido; // Variable para almacenar el contenido del archivo JSON leído
let existeJson = true; // Variable para comprobar si existe el archivo JSON
let mensaje; // Para mostrar información por pantalla
let alumno = {}; // Objeto para almacenar los datos del alumno
let contador; // Contador para los alumnos

// Lectura del archivo JSON
// Compruebo si existe el archivo JSON
if (!fs.existsSync("escuela.json")) {
    // Si no existe, creo un mensaje indicandolo
    existeJson = false;
    mensaje = "Aun no hay alumnos matriculados en la escuela";
    
} else  {
    // Si existe, leo el archivo JSON
    let lectura = fs.readFileSync("escuela.json", "utf-8");
    jsonLeido = JSON.parse(lectura);
    existeJson = true; // Ahora sabemos que el archivo JSON existe
    // console.log(jsonLeido);
}

// Comprobar si se han pasado argumentos al ejecutar el script
if (process.argv.length == 2) {
    if (existeJson) {
        // Mostrar todos los alumnos matriculados
        mensaje = mostrarAlumnos(jsonLeido);        
    }       
} else if (process.argv.length == 3) {
    // process.argv[2] -> asignatura
    // mostraremos los alumnos matriculados en esa asignatura
    if (existeJson) {        
        let asignatura = process.argv[2];
        mensaje = mostrarAlumnosPorAsignatura(jsonLeido, asignatura);
    }         
} else if (process.argv.length == 4) {
    // process.argv[2] -> nombre
    // process.argv[3] -> apellido
    // mostraremos las asignaturas de las que esta matriculado
    if (existeJson) {
        let nombre = process.argv[2];
        let apellido = process.argv[3];
        mensaje = mostrarAsignaturasAlumno(jsonLeido, nombre, apellido);        
    }
} else if (process.argv.length == 5) {
    // process.argv[2] -> nombre
    // process.argv[3] -> apellido
    // borraremos el alumno con ese nombre y apellido
    if (existeJson) {
        let nombre = process.argv[2];
        let apellido = process.argv[3];
        let numero = process.argv[4];
        mensaje = borrarAlumno(jsonLeido, nombre, apellido, numero);
    }
} else if (process.argv.length == 6) {
    // process.argv[2] -> nombre
    // process.argv[3] -> apellido
    // process.argv[4] -> edad
    // process.argv[5] -> asignatura
    // matricular al alumno con estos datos
    let nombre = process.argv[2];
    let apellido = process.argv[3];
    let edad = process.argv[4];
    let asignatura = process.argv[5];
    // Comprobar si el archivo JSON existe y si ya está matriculado
    if (existeJson) {        
        mensaje = matricularAlumno(jsonLeido, nombre, apellido, edad, asignatura);
    } else {
        nombre_cap = capitalizarPrimeraLetra(nombre);
        apellido_cap = capitalizarPrimeraLetra(apellido);
        asignatura_mayusculas = asignatura.toUpperCase();
        // Si no existe el archivo JSON, lo creo y añado el alumno        
        alumno = { nombre: nombre_cap, apellido: apellido_cap, edad: edad, asignatura: asignatura_mayusculas };
        jsonLeido = [alumno]; // Inicializo el array con el nuevo alumno
        fs.writeFileSync("escuela.json", JSON.stringify(jsonLeido, null, 2));
        mensaje = `Alumno ${nombre_cap} ${apellido_cap} matriculado correctamente en la asignatura ${asignatura_mayusculas}.\n`;
        existeJson = true; // Ahora el archivo JSON existe
    }
};

// Mostrar el mensaje final
console.log(mensaje);


// Funciones

// Función para mostrar los alumnos matriculados
function mostrarAlumnos(jsonLeido ) {
    mensaje = "Alumnos matriculados en la escuela:\n";
    mensaje += "*".repeat(mensaje.length -1).concat("\n");
    contador = 0; // Inicializo el contador

    // Para ordenar los datos por apellido, nombre y asignatura de forma ascendente    
    let alumnosOrdenados = jsonLeido.sort((a, b) => a.asignatura.localeCompare(b.asignatura, "es-ES", { numeric: true }));
    alumnosOrdenados = alumnosOrdenados.sort((a, b) => a.apellido.localeCompare(b.apellido, "es-ES", { numeric: true }));
    alumnosOrdenados = alumnosOrdenados.sort((a, b) => a.nombre.localeCompare(b.nombre, "es-ES", { numeric: true }));
    
    // Recorro el array de alumnos ordenados
    for (let i = 0; i < alumnosOrdenados.length; i++) {
        mensaje += `${alumnosOrdenados[i].nombre} ${alumnosOrdenados[i].apellido}, Edad: ${alumnosOrdenados[i].edad}, Asignatura: ${alumnosOrdenados[i].asignatura}\n`;
        contador++;
    }

    mensaje += "-".repeat(50).concat("\n");
    mensaje += `Total: ${contador} alumnos matriculados\n`;
    return mensaje;
}

// Función para mostrar los alumnos matriculados en una asignatura
function mostrarAlumnosPorAsignatura(jsonLeido, asignatura) {
    mensaje = `Alumnos matriculados en ${asignatura.toUpperCase()}\n`;
    mensaje += "*".repeat(mensaje.length -1).concat("\n");
    contador = 0; // Inicializo el contador
    let asig;

    // Para ordenar los datos por apellido y nombre de forma ascendente    
    let alumnosOrdenados = jsonLeido.sort((a, b) => a.apellido.localeCompare(b.apellido, "es-ES", { numeric: true }));
    alumnosOrdenados = alumnosOrdenados.sort((a, b) => a.nombre.localeCompare(b.nombre, "es-ES", { numeric: true }));

    for (let i = 0; i < alumnosOrdenados.length; i++) {
        asig = alumnosOrdenados[i].asignatura.toLowerCase(); // Convierto la asignatura a minúsculas
        if (asig === asignatura.toLowerCase()) {
            mensaje += `${alumnosOrdenados[i].nombre} ${alumnosOrdenados[i].apellido}, Edad: ${alumnosOrdenados[i].edad}\n`;
            contador++;
        }
    }
    mensaje += "-".repeat(50).concat("\n");
    mensaje += `Total: ${contador} alumnos matriculados\n`;
    return mensaje;
}

// Función para mostrar las asignaturas de un alumno
function mostrarAsignaturasAlumno(jsonLeido, nombre, apellido) {
    mensaje = `El alumno ${capitalizarPrimeraLetra(nombre)} ${capitalizarPrimeraLetra(apellido)} está matriculado en las siguientes asignaturas:\n`;
    mensaje += "*".repeat(mensaje.length -1).concat("\n");

    // Ordeno por asignaturas 
    let asignaturasOrdenadas = jsonLeido.sort((a, b) => a.asignatura.localeCompare(b.asignatura, "es-ES", { numeric: true }));
    let encontrado = false; // Variable para comprobar si se ha encontrado el alumno

    // Recorro el array de alumnos
    for (let i = 0; i < jsonLeido.length; i++) {
        if (asignaturasOrdenadas[i].nombre.toLowerCase() === nombre.toLowerCase() && asignaturasOrdenadas[i].apellido.toLowerCase() === apellido.toLowerCase()) {
            mensaje += `\t-- ${asignaturasOrdenadas[i].asignatura}\n`;
            encontrado = true; // Si se encuentra el alumno, cambio la variable a true
        }
    }

    if (!encontrado) {
        mensaje = `Alumno ${capitalizarPrimeraLetra(nombre)} ${capitalizarPrimeraLetra(apellido)} no encontrado.\n`;
        return mensaje;
    }

    mensaje += "-".repeat(70).concat("\n");
    return mensaje;
}

// Función para borrar un alumno
function borrarAlumno(jsonLeido, nombre, apellido, numero) {    
    let encontrado = false;

    if (numero == "-1") {
        for (let i = jsonLeido.length - 1; i >= 0; i--) {
            if (jsonLeido[i].nombre.toLowerCase() === nombre.toLowerCase() && jsonLeido[i].apellido.toLowerCase() === apellido.toLowerCase()) {
                jsonLeido.splice(i, 1); // Elimina el alumno del array
                encontrado = true;
                mensaje = `Alumno ${capitalizarPrimeraLetra(nombre)} ${capitalizarPrimeraLetra(apellido)} borrado correctamente.\n`;

            }
        }
        // Si no se ha encontrado el alumno, se muestra un mensaje
            if (!encontrado) {
                mensaje = `Alumno ${capitalizarPrimeraLetra(nombre)} ${capitalizarPrimeraLetra(apellido)} no encontrado.\n`;
            }
        // Guardar los cambios en el archivo JSON
        fs.writeFileSync("escuela.json", JSON.stringify(jsonLeido, null, 2));        
    } else { 
        mensaje = "Para borrar un alumno, hay que poner en el tercer argumento -1\n";
        mensaje += `El alumno ${capitalizarPrimeraLetra(nombre)} ${capitalizarPrimeraLetra(apellido)} no ha sido borrado.\n`;        
    }

    return mensaje;
}

// Función para matricular a un alumno
function matricularAlumno(jsonLeido, nombre, apellido, edad, asignatura) {
    let mensaje = "";
    nombre_cap = capitalizarPrimeraLetra(nombre);
    apellido_cap = capitalizarPrimeraLetra(apellido);
    asignatura_mayusculas = asignatura.toUpperCase();
    // Comprobar si el alumno ya está matriculado
    for (let i = 0; i < jsonLeido.length; i++) {
        if (jsonLeido[i].nombre.toLowerCase() === nombre.toLowerCase() && jsonLeido[i].apellido.toLowerCase() === apellido.toLowerCase() && jsonLeido[i].asignatura.toLowerCase() === asignatura.toLowerCase()) {
            mensaje = `El alumno ${nombre_cap} ${apellido_cap} ya está matriculado en la asignatura ${asignatura_mayusculas}.\n`;
            return mensaje;
        }
    }
    // Si no está matriculado, lo añado al array

    alumno = { nombre: nombre_cap, apellido: apellido_cap, edad: edad, asignatura: asignatura_mayusculas };
    jsonLeido.push(alumno);
    // Guardar los cambios en el archivo JSON
    fs.writeFileSync("escuela.json", JSON.stringify(jsonLeido, null, 2));
    mensaje = `Alumno ${nombre_cap} ${apellido_cap} matriculado correctamente en la asignatura ${asignatura_mayusculas}.\n`;
    return mensaje;
}

// Poner el primer caracter de una cadena en mayúscula
function capitalizarPrimeraLetra(cadena) {
    return cadena.charAt(0).toUpperCase() + cadena.slice(1).toLowerCase();
}

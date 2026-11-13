import config from './config.js';
import {writeFile} from 'node:fs/promises';

// Función para obtener un JSON desde una URL
export default async function obtenerJSON(url) {

    try{

        const res = await fetch(url);

        // Si la respuesta no fue exitosa
        if (!res.ok) {
            const error = new Error(res.statusText ? res.statusText : 'Error al obtener el JSON');
            error.status = res.status;

            throw error;
        }

        const data = await res.json();
        return data;

    }catch(error){
        if(error.status){
            console.error(`Error: ${error.message}`);
            console.error(`Código HTTP: ${error.status}`);
        }else {
            console.error("Error de conexión o URL inexistente");
        }
    }
    

}

// Función para guardar un objeto JSON en un archivo
async function guardarJSON(data, nombreArchivo) {

    // Construye la ruta absoluta donde se guardará el archivo JSON
    const absFilePath = `${config.ROOT_DIR}/data/${nombreArchivo}.json`;
    // Parsea el objeto data a formato JSON con indentación de 2 espacios
    const jsonData = JSON.stringify(data, null, 2);

    try{

        await writeFile(absFilePath, jsonData, 'utf8');
        console.log(`Archivo JSON guardado en: ${absFilePath}`);

    }catch(error){
        console.error(`Error al guardar el archivo JSON: ${error.message}`);
    }

}

// Test de funciones
// try{
//     guardarJSON(await obtenerJSON(config.faena), 'muestra_faena');
// }catch(error){
//     console.error(`Error en la prueba de funciones: ${error.message}`);
// }







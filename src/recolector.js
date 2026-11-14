import config from './config.js';
import {writeFile} from 'node:fs/promises';
import path from 'node:path';

// Función para obtener un JSON desde una URL
export async function obtenerJSON(url) {

    const res = await fetch(url);

    if (!res.ok) {
        const error = new Error("Error HTTP.");
        error.status = res.status;
        error.statusText = res.statusText ? res.statusText : "No se proporcionó un mensaje de error.";
        throw error;
    }

    const data = await res.json();

    return data;
}

// Función para guardar un objeto JSON en un archivo
async function guardarJSON(data, nombreArchivo) {

    // Construye la ruta absoluta donde se guardará el archivo JSON
    const absFilePath = path.join(config.paths.dataDir, nombreArchivo);
    // Parsea el objeto data a formato JSON con indentación de 2 espacios
    const jsonData = JSON.stringify(data, null, 2);

    try{
        await writeFile(absFilePath, jsonData, 'utf8');
        console.log(`Archivo JSON guardado en: ${absFilePath}`);
    }catch(error){
        throw new Error(`Error al guardar el archivo JSON`, {cause: error});
    }

}


try {

    // Bucle para pedir y guardar los JSON de cada URL en config.urls
    for(const clave in config.urls){
        // Obtiene la URL
        const url = config.urls[clave];
        console.log(`Obteniendo JSON desde: ${url}`);
        // Guarda el JSON en una archivo 'muestra_clave.json' en la carpeta data/
        const json = await obtenerJSON(url);
        await guardarJSON(json, `muestra_${clave}.json`);
    }

} catch (error) {
    // Si el error es HTTP (viene de obtenerJSON o alguna petición interna)
    if (error.status) {
        console.error(`Error HTTP capturado: ${error.message} (Status: ${error.status}, StatusText: ${error.statusText})`);
    
    // Si es un error de otro tipo (ya sea al obtener o al guardar)
    } else {
        console.error(`Error capturado: ${error.message} ${error.cause ? `(Causa: ${error.cause.message})` : ''}`);
    }
}







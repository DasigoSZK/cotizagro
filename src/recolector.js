import config from './config.js';

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






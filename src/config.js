import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

// Nota 1: import.meta.url devuelve una URL, no una ruta de archivo (file:///C:/Users/Dasig/dev/2_proyectos/06_cotizagro/src/config.js).
// Nota 2: fileURLToPath() convierte la URL en una ruta de archivo (C:\Users\Dasig\dev\2_proyectos\06_cotizagro\src\config.js).
// Nota 3: path.dirname() devuelve la ruta del directorio padre del archivo (se ejecuta 2 veces para subir a "src" y luego a la raíz).

export default {
    "machos": `https://www.decampoacampo.com/gh_funciones.php?function=getListadoPreciosInvernada&p=1&m=peso`,
    "hembras": `https://www.decampoacampo.com/gh_funciones.php?function=getListadoPreciosInvernada&p=2&m=peso`,
    "vientres": `https://www.decampoacampo.com/gh_funciones.php?function=getListadoPreciosInvernada&p=3&m=peso`,
    "faena": `https://www.decampoacampo.com/gh_funciones.php?function=getListadoPreciosGordo`,
    "rutaDirData": path.join(rootDir, 'data')
    // Nota 4: path.join() une la ruta raíz del proyecto con la carpeta 'data' para crear una ruta absoluta.
}


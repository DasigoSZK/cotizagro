import path from 'node:path';

const ROOT_DIR = path.dirname(import.meta.dirname);

// Nota 1: import.meta.dirname devuelve la ruta de la carpeta del archivo actual.
// Nota 2: path.dirname() devuelve la ruta del directorio padre de la ruta proporcionada.

export default {
    urls:{
        "machos": `https://www.decampoacampo.com/gh_funciones.php?function=getListadoPreciosInvernada&p=1&m=peso`,
        "hembras": `https://www.decampoacampo.com/gh_funciones.php?function=getListadoPreciosInvernada&p=2&m=peso`,
        "vientres": `https://www.decampoacampo.com/gh_funciones.php?function=getListadoPreciosInvernada&p=3&m=peso`,
        "faena": `https://www.decampoacampo.com/gh_funciones.php?function=getListadoPreciosGordo`,
    },
    paths:{
        "rootDir": ROOT_DIR,
        "dataDir": path.join(ROOT_DIR, 'data'),
        "srcDir": path.join(ROOT_DIR, 'src')
    }
}


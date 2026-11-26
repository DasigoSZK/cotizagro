import categorias from './categorias.js';

// Cadena de uso de funciones de calculos.js:
/*
 * Flujo: armarPrecios() → armarGrupo() → resumenGrupo() → precioPonderado()
 *
 * armarPrecios()     → Arma el objeto completo de "precios.json" (actualizado, invernada, faena)
 *                      a partir de los datos crudos de los 4 endpoints.
 * 
 * armarGrupo()       → Agrupa las subcategorías según las categorías definidas en categorias.js.
 * 
 * resumenGrupo()     → Calcula actual, promedio, mínimo y máximo (para una categoría,
 *                      considerando sus distintas subcategorías y semanas).
 * 
 * precioPonderado()  → Calcula el precio promedio ponderado (para varias subcategorías
 *                      en una semana determinada).
 *
 */


/**
 * Calcula el precio promedio ponderado de un grupo de subcategorías en una semana.
 *
 * Fórmula: Σ(precio_s × cantidad_s) / Σ(cantidad_s)
 *
 * @param {Object[]} subcategorias - Array de subcategorías de la fuente
 *   (cada una con precio_semana_N y cantidad_semana_N).
 * @param {1|2|3} semana - Número de semana (1 = actual, 2 = pasada, 3 = repasada).
 * @returns {number|null} Precio promedio sin redondear,
 *   o null si no hubo ventas en esa semana (Σcantidad = 0).
 *
 * @example
 *   precioPonderado([
 *     { precio_semana_1: 450, cantidad_semana_1: 10 },
 *     { precio_semana_1: 500, cantidad_semana_1: 90 }
 *   ], 1)
 *   // → 495  ((450×10 + 500×90) / 100)
 *
 *   precioPonderado([{ precio_semana_1: 500, cantidad_semana_1: 0 }], 1)
 *   // → null  (Σcantidad = 0, no se puede dividir)
 */
export function precioPonderado(subcategorias, semana){

    // 0. Fórmula: PW_s = Σ(precio_s × cantidad_s) / Σ(cantidad_s)

    // 1. Claves dinámicas para acceder a los datos de la semana correspondiente
    const precioSemana = `precio_semana_${semana}`;
    const cantidadSemana = `cantidad_semana_${semana}`;

    // 2. Un solo reduce acumulando dos sumas (objeto acumulador)
    const {sumaPonderada, sumaCantidad} = subcategorias.reduce(
        (acu, subcategoriaActual) => ({
            sumaPonderada: acu.sumaPonderada + subcategoriaActual[precioSemana] * subcategoriaActual[cantidadSemana],
            sumaCantidad: acu.sumaCantidad + subcategoriaActual[cantidadSemana]
        }),
        {sumaPonderada: 0, sumaCantidad: 0}
    );

    // 3. Evita dividir por 0
    if(sumaCantidad === 0) return null;

    // 4. Devuelve un "float" sin redondear
    return sumaPonderada / sumaCantidad;
}


/**
 * Calcula el resumen { actual, promedio, minimo, maximo } de una categoría
 * a partir de sus subcategorías, usando los 3 precios ponderados semanales.
 * Los 4 valores salen redondeados a pesos enteros.
 *
 * @param {Object[]} subcategorias - Array de subcategorías de la fuente.
 * @returns {{
 *   actual:   number|null,
 *   promedio: number|null,
 *   minimo:   number|null,
 *   maximo:   number|null
 * }}
 *   - "actual" es el PW de la semana 1. Si esa semana no tuvo ventas, es null.
 *   - Las semanas sin ventas (PW null) no se usan para promedio/min/max.
 *   - Si ninguna semana tuvo ventas, los 4 valores son null.
 *
 * @example
 *   resumenGrupo([
 *     { precio_semana_1: 100, cantidad_semana_1: 10,
 *       precio_semana_2: 200, cantidad_semana_2: 10,
 *       precio_semana_3: 300, cantidad_semana_3: 10 }
 *   ])
 *   // → { actual: 100, promedio: 200, minimo: 100, maximo: 300 }
 */
export function resumenGrupo(subcategorias){

    // 1. Calcula los 3 ponderados (uno por semana)
    const pws = [1, 2, 3].map(n => precioPonderado(subcategorias, n));

    // 2. Descarta los null para promediar / min / max
    const pwsValidos = pws.filter(pw => pw !== null);

    // 3. "actual" = PW de la semana 1. Si esa semana no tuvo ventas → null
    const actual = pws[0] !== null ? Math.round(pws[0]) : null;

    // 4. Promedio / min / max sobre las semanas válidas.
    const promedio = pwsValidos.length !== 0
        ? Math.round(pwsValidos.reduce((acc, pw) => acc + pw, 0) / pwsValidos.length)
        : null;
    const minimo = pwsValidos.length !== 0
        ? Math.round(Math.min(...pwsValidos))
        : null;
    const maximo = pwsValidos.length !== 0
        ? Math.round(Math.max(...pwsValidos))
        : null;

    // 5. Devuelve el resumen
    return { actual, promedio, minimo, maximo };
}


/**
 * Arma un grupo completo (unidad + categorías con sus resúmenes) a partir de
 * los datos crudos de la fuente y la definición del grupo en categorias.js.
 *
 * Valida que no falten subcategorías: si la fuente cambia un nombre, lanza un
 * error indicando qué nombre falta (falla ruidosa en vez de silenciosa).
 *
 * @param {Object[]} datosFuente - Array "data" de una muestra
 *   (una fila por subcategoría de la fuente).
 * @param {{unidad: string, categorias: Object[]}} grupoRef - Un grupo de
 *   categorias.js (ej: categorias.machos, categorias.faena).
 * @returns {{
 *   unidad: string,
 *   categorias: {nombre: string, actual: number|null, promedio: number|null, minimo: number|null, maximo: number|null}[]
 * }}
 * @throws {Error} Si falta alguna subcategoría esperada en datosFuente.
 *
 * @example
 *   armarGrupo(
 *     [{ categoria: 'Terneros -160 Kg.', precio_semana_1: 6480, cantidad_semana_1: 501, ... }],
 *     categorias.machos
 *   )
 *   // → {
 *   //     unidad: '$/kg',
 *   //     categorias: [
 *   //       { nombre: 'Terneros hasta 160 kg', actual: 6480, promedio: 6547, minimo: 6480, maximo: 6640 },
 *   //       ...
 *   //     ]
 *   //   }
 */
export function armarGrupo(datosFuente, grupoRef){

    // 1. Por cada categoría dentro de un grupo (macho o hembra o vientre o faena)
    const datosAgrupados = grupoRef.categorias.map((categoriaRef)=>{

        // 1.1. Filtrar los datos correspondientes a cada categoría
        const datosFuenteFiltrados = datosFuente.filter(objFuente =>
            categoriaRef.subcategorias.includes(objFuente.categoria)
        );

        // 1.2. Validar que no falten subcategorías (por si la fuente cambia)
        const faltantes = categoriaRef.subcategorias.filter(nombreRef => !datosFuenteFiltrados.some(subFiltrada => subFiltrada.categoria === nombreRef));

        if(faltantes.length !== 0){
            const nombreCat = categoriaRef.nombre,
            cantEsperada = categoriaRef.subcategorias.length,
            cantFiltrada = datosFuenteFiltrados.length;

            throw new Error(
                `Error al filtrar las subcategorías de '${nombreCat}' en 'armarGrupo': ` +
                `se esperaban ${cantEsperada}, se encontraron ${cantFiltrada}. ` +
                `Faltan: ${faltantes.join(', ')}.`
            );
        }

        // 1.3. Devuelve un objeto resumen, desestructurando el objeto que devuelve 'resumenGrupo'
        const resumen = resumenGrupo(datosFuenteFiltrados);
        return {nombre: categoriaRef.nombre, ...resumen}

    });

    // 2. Devuelve un GRUPO COMPLETO con todas sus categorías y resumenes
    return {
        unidad: grupoRef.unidad,
        categorias: datosAgrupados
    }
}


/**
 * Arma el objeto completo de precios.json a partir de los datos crudos de los
 * 4 endpoints. Es el objeto que se guarda en disco y se entrega al cliente.
 *
 * @param {Object<string, Object[]>} datosPorGrupo - Objeto con los arrays "data"
 *   de cada endpoint, con las claves: machos, hembras, vientres y faena.
 * @param {string} fecha - Fecha en formato ISO (ej: new Date().toISOString()).
 *   Se guarda tal cual en "actualizado". Es parámetro (no se genera adentro)
 *   para que la función sea pura y testeable con un valor fijo.
 * @returns {{
 *   actualizado: string,
 *   invernada: { machos: Object, hembras: Object, vientres: Object },
 *   faena: Object
 * }}
 *
 * @example
 *   armarPrecios(
 *     {
 *       machos:   [{ categoria: 'Terneros -160 Kg.', precio_semana_1: 6480, cantidad_semana_1: 501, ... }],
 *       hembras:  [...],
 *       vientres: [...],
 *       faena:    [...]
 *     },
 *     '2026-11-24T00:00:00.000Z'
 *   )
 *   // → {
 *   //     actualizado: '2026-11-24T00:00:00.000Z',
 *   //     invernada: {
 *   //       machos:   { unidad: '$/kg',     categorias: [ ... ] },
 *   //       hembras:  { unidad: '$/kg',     categorias: [ ... ] },
 *   //       vientres: { unidad: '$/cabeza', categorias: [ ... ] }
 *   //     },
 *   //     faena: { unidad: '$/kg', categorias: [ ... ] }
 *   //   }
 */
export function armarPrecios(datosPorGrupo, fecha){

    // 1. Arma la estructura inicial del objeto resultado
    const resultado = {
        actualizado: fecha,
        invernada: {}
    }

    // 2. Recorre cada grupo en "datosPorGrupo"
    for (const [claveGrupo, data] of Object.entries(datosPorGrupo)){

        // 2.1. Arma cada grupo "machos: { unidad: '$/kg', categorias: [Array] }"
        const grupo = armarGrupo(data, categorias[claveGrupo]);
        if(claveGrupo === 'faena'){
            resultado.faena = grupo;
        }else{
            resultado.invernada[claveGrupo] = grupo;
        }

    }

    // 3. Devuelve el objeto completo
    return resultado;
}








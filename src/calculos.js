import categorias from './categorias.js';

// Cadena de uso de funciones de calculos.js:
// armarPrecios --usa-> armarGrupo --usa-> resumenGrupo --usa-> precioPonderado

/*
 * armarGrupo()       → Agrupa las subcategorías según las categorías definidas.
 * resumenGrupo()     → Calcula actual, promedio, mínimo y máximo (para una categoría, considerando sus distintas subcategorías y semanas).
 * precioPonderado()  → Calcula el precio promedio ponderado (para varias subcategorías en una semana determinada).
 *
 * Flujo: armarGrupo() → resumenGrupo() → precioPonderado()
 */


export function precioPonderado(subcategorias, semana){

    // 0. Fórmula: PW_s = Σ(precio_s × cantidad_s) / Σ(cantidad_s)
    
    // 1. Claves dinámicas para acceder a los datos de la semana correspondiente
    const precioSemana = `precio_semana_${semana}`;
    const cantidadSemana = `cantidad_semana_${semana}`;

    // 2. Un solo reduce acumulando dos sumas (objeto acumulador)
    const {sumaPonderada, sumaCantidad} = subcategorias.reduce(
        // Por cada subcategoría del array, acumula en el "objeto desestructurado"
        (acu, subcategoriaActual) => ({
            // sumaPonderada += precio_semana_n * cantidad_semana_n
            sumaPonderada: acu.sumaPonderada + subcategoriaActual[precioSemana] * subcategoriaActual[cantidadSemana],
            // sumaCantidad += cantidad 
            sumaCantidad: acu.sumaCantidad + subcategoriaActual[cantidadSemana] 
        }),
        {sumaPonderada: 0, sumaCantidad: 0}
    );

    // Resultado del reduce:
    // sumaPonderada = Σ(precio_s × cantidad_s)
    // sumaCantidad = Σ(cantidad_s)

    // 3. Evita dividir por 0 (Fórmula = Σ(precio_s × cantidad_s) / Σ(cantidad_s))
    if(sumaCantidad === 0) return null;

    // 4. Devuelve un "float" sin redondear
    return sumaPonderada / sumaCantidad;
}

export function resumenGrupo(subcategorias){

    // 1. Calcula los 3 ponderados (uno por semana)
    const pws = [1, 2, 3].map(n => precioPonderado(subcategorias, n));

    // 2. Descarta los null para promediar / min / max
    const pwsValidos = pws.filter(pw => pw !== null);

    // 3. "actual" = PW de la semana 1. Si esa semana no tuvo ventas → null
    const actual = pws[0] !== null ? Math.round(pws[0]) : null;

    // 4. Promedio / min / max sobre las semanas válidas.
    //    Si pwsValidos está vacío (ninguna semana con ventas), los tres quedan null.
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

export function armarPrecios(datosPorGrupo, fecha){

    // 1. Arma la estructura inicial del objeto resultado
    const resultado = {
        actualizado: fecha,
        invernada: {}
    }

    // 2. Recorre cada grupo en "datosPorGrupo" (grupo = machos: [...])
    for (const [claveGrupo, data] of Object.entries(datosPorGrupo)){

        // 2.1. Arma cada grupo "machos: { unidad: '$/kg', categorias: [Array] }"
        const grupo = armarGrupo(data, categorias[claveGrupo]);
        if(claveGrupo === 'faena'){
            resultado.faena = grupo;
        }else{
            resultado.invernada[claveGrupo] = grupo;
        }

    }

    // 3. Devuelve:
    /*
    {
        actualizado: '26/11/2026',
        invernada: {
            machos: { unidad: '$/kg', categorias: [Array] },
            hembras: { unidad: '$/kg', categorias: [Array] },
            vientres: { unidad: '$/cabeza', categorias: [Array] }
        },
        faena: {
            unidad: '$/kg',
            categorias: [ [Object], [Object], [Object], [Object] ]
        }
    }
    */
    return resultado;
}








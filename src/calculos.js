// Calcula el precio ponderado (promedio que tiene en cuenta la cantidad) para:
// una categoría específica (conjunto de subcategorías) de una semana específica

// Nota: 
// Categoría = "Terneros 160-260 kg"
// Subcategorias = "Terneros 160-200 kg" | Subcategoria = "Terneros 200-260 kg" | ...
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


// resumenGrupo
// Usa "precioPonderado" para calcular el PW de cada semana de una categoría
// y devuelve { actual, promedio, minimo, maximo } de esa categoría.
// Los cuatro valores salen redondeados a pesos enteros. Si no hay ventas, son null.
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


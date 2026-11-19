// Calcula el precio ponderado (promedio que tiene en cuenta la cantidad) para una categoría específica del programa
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


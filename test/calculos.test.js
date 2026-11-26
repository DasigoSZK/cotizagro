import test from 'node:test';
import assert from 'node:assert/strict';
import {precioPonderado, resumenGrupo, armarGrupo, armarPrecios} from './../src/calculos.js';
import categorias from '../src/categorias.js';

// Notas: Función "test()"
// "test()" recibe -> 1. string, 2. función
// el string es un mensaje que indica qué se esta probando
// la función es una callback que puede ejecutar 1 o más funciones (aserciones) de prueba internamente
// "test()" solo evalúa si la función se ejecuta sin errores (no lanza excepciones), "test()" NO evalúa la lógica de la función

// Notas: Función "assert.equal()"
// "assert.equal()" recibe 2 argumentos -> 1. "obtenido", 2. "esperado"
// "obtenido" -> el que realmente arroja la función
// "esperado" -> el resultado que se espera que arroje la función
// si "obtenido" === "esperado" -> no hace nada, si son diferentes, lanza un error.


// Test 1: "Precio Ponderado Simple de 450 y 500 = 495"
test("precioPonderado: 2 subcategorías (450, 500) que dan 495", ()=>{
    const subcategorias = [
        {"precio_semana_1": 450, "cantidad_semana_1": 10},
        {"precio_semana_1": 500, "cantidad_semana_1": 90}
    ];

    assert.equal(precioPonderado(subcategorias, 1), 495);
})

// Test 2: "Precio Ponderado de una sola subcategoría es igual a su precio"
test("precioPonderado: una sola subcategoría devuelve su precio", ()=>{
    const subcategoria = [{"precio_semana_1": 300, "cantidad_semana_1": 30}];

    assert.equal(precioPonderado(subcategoria, 1), 300);
})

// Test 3: "Precio Ponderado con cantidades de ventas === 0"
test("precioPonderado: si todas las cantidades de una semana son 0, precioPonderado devuelve null", ()=>{
    const subcategorias = [
        {"precio_semana_1": 450, "cantidad_semana_1": 0},
        {"precio_semana_1": 500, "cantidad_semana_1": 0}
    ];

    assert.equal(precioPonderado(subcategorias, 1), null);
})

// -----------------------------------------------------------------------------------

// Test 4: "resumenGrupo: caso normal con 3 semanas de ventas"
test('resumenGrupo: caso normal con 3 semanas de ventas', () => {
    const subcategorias = [
        { precio_semana_1: 6000, cantidad_semana_1: 700,
          precio_semana_2: 5500, cantidad_semana_2: 500,
          precio_semana_3: 4000, cantidad_semana_3: 600 },
        { precio_semana_1: 7000, cantidad_semana_1: 800,
          precio_semana_2: 6500, cantidad_semana_2: 600,
          precio_semana_3: 5000, cantidad_semana_3: 700 }
    ];

    const resultado = resumenGrupo(subcategorias);

    assert.equal(resultado.actual,   6533);
    assert.equal(resultado.promedio, 5706);
    assert.equal(resultado.minimo,   4538);
    assert.equal(resultado.maximo,   6533);
});


// Test 5: "resumenGrupo: caso en el que solo la semana 1 tiene ventas (precio actual = minimo = promedio = maximo)"
test('resumenGrupo: si solo la semana 1 tiene ventas, actual = promedio = minimo = maximo', () => {
    const subcategorias = [
        { precio_semana_1: 500, cantidad_semana_1: 10,
          precio_semana_2: 999, cantidad_semana_2: 0,  
          precio_semana_3: 999, cantidad_semana_3: 0 }
    ];

    const resultado = resumenGrupo(subcategorias);

    assert.equal(resultado.actual,   500);
    assert.equal(resultado.promedio, 500);
    assert.equal(resultado.minimo,   500);
    assert.equal(resultado.maximo,   500);
});


// Test 6: "resumenGrupo: semana 1 sin ventas (debe devolver null)"
test('resumenGrupo: semana 1 sin ventas → actual es null', () => {
    const subcategorias = [
        { precio_semana_1: 999, cantidad_semana_1: 0,
          precio_semana_2: 200, cantidad_semana_2: 10,
          precio_semana_3: 300, cantidad_semana_3: 10 }
    ];

    const resultado = resumenGrupo(subcategorias);

    assert.equal(resultado.actual,   null); 
    assert.equal(resultado.promedio, 250);  
    assert.equal(resultado.minimo,   200); 
    assert.equal(resultado.maximo,   300);  
});


// Test 7: "resumenGrupo: sin ventas en ninguna semana -> todo null"
test('resumenGrupo: sin ventas en ninguna semana → todo null', () => {
    const subcategorias = [
        { precio_semana_1: 999, cantidad_semana_1: 0,
          precio_semana_2: 999, cantidad_semana_2: 0,
          precio_semana_3: 999, cantidad_semana_3: 0 }
    ];

    const resultado = resumenGrupo(subcategorias);

    assert.equal(resultado.actual,   null);
    assert.equal(resultado.promedio, null);
    assert.equal(resultado.minimo,   null);
    assert.equal(resultado.maximo,   null);
});

// -----------------------------------------------------------------------------------


// Test 8: "armarGrupo" -> caso normal (fuentes sin errores) con 2 categorías
test('armarGrupo: caso normal con 2 categorías', ()=>{

    // valores para "datosFuente"
    const datosFuente = [
        { categoria: 'A', precio_semana_1: 100, cantidad_semana_1: 10,
                          precio_semana_2: 110, cantidad_semana_2: 10,
                          precio_semana_3: 120, cantidad_semana_3: 10 },
        { categoria: 'B', precio_semana_1: 200, cantidad_semana_1: 20,
                          precio_semana_2: 210, cantidad_semana_2: 20,
                          precio_semana_3: 220, cantidad_semana_3: 20 }
    ];

    // valores para "grupoRef"
    const grupoRef = {
        unidad: '$/kg',
        categorias: [
            { nombre: 'Cat A', subcategorias: ['A'] },
            { nombre: 'Cat B', subcategorias: ['B'] }
        ]
    };

    const res = armarGrupo(datosFuente, grupoRef);

    // Verificaciones de los resultados
    assert.equal(res.unidad, "$/kg");
    assert.equal(res.categorias.length, 2);

    assert.equal(res.categorias[0].nombre, "Cat A");
    assert.equal(res.categorias[0].actual, 100);
    assert.equal(res.categorias[0].promedio, 110);
    assert.equal(res.categorias[0].minimo, 100);
    assert.equal(res.categorias[0].maximo, 120);

    assert.equal(res.categorias[1].nombre, "Cat B");
    assert.equal(res.categorias[1].actual, 200);
    assert.equal(res.categorias[1].promedio, 210);
    assert.equal(res.categorias[1].minimo, 200);
    assert.equal(res.categorias[1].maximo, 220);

});

// Test 9: "armarGrupo" -> caso de error controlado (fuentes cambiaron)
test("armarGrupo: caso de error (los datosFuente cambian)", ()=>{
    // valores para "datosFuente"
    const datosFuente = [
        { 
            categoria: 'A', 
            precio_semana_1: 100, cantidad_semana_1: 10,
            precio_semana_2: 110, cantidad_semana_2: 10,
            precio_semana_3: 120, cantidad_semana_3: 10 
        },
        { 
            categoria: 'C', 
            precio_semana_1: 100, cantidad_semana_1: 10,
            precio_semana_2: 110, cantidad_semana_2: 10,
            precio_semana_3: 120, cantidad_semana_3: 10  
        }
    ];

    // valores para "grupoRef"
    const grupoRef = {
        unidad: '$/kg',
        categorias: [
            { nombre: 'Cat A', subcategorias: ['A'] },
            { nombre: 'Cat B', subcategorias: ['B'] }   // ← B no está en datosFuente
        ]
    };


    // Comprueba que el mensaje del error menciona la categoría "/CatB/" (sin comillas, /CatB/ es una "regex")
    assert.throws(
        ()=> armarGrupo(datosFuente, grupoRef),
        /Cat B/
    );

});

// -----------------------------------------------------------------------------------

// Test 10: "categorias.js" -> verifica que ningun valor del objeto tenga espacios extras
test('categorias.js: ningún nombre tiene espacios al inicio o al final', ()=>{
    for (const grupo of Object.values(categorias)){
        for(const cat of grupo.categorias){
            assert.equal(cat.nombre, cat.nombre.trim(), `Nombre con espacios: ${cat.nombre}`);
        }
    }
})

// -----------------------------------------------------------------------------------

// Test 11: "armarPrecios" -> verifica que se cree un objeto con 
// { actualizado: '...', invernada: { machos: {}, hembras: {}, vientres: {} }, faena: {} }
function generarDatosMinimos() {
    const datos = {};
    for (const [grupo, def] of Object.entries(categorias)) {
        datos[grupo] = def.categorias.flatMap(cat =>
            cat.subcategorias.map(sub => ({
                categoria: sub,
                precio_semana_1: 100, cantidad_semana_1: 10,
                precio_semana_2: 100, cantidad_semana_2: 10,
                precio_semana_3: 100, cantidad_semana_3: 10
            }))
        );
    }
    return datos;
}
test('armarPrecios: estructura correcta con datos mínimos', ()=> {

    // Fecha fija (inyección de dependencias, la función es "pura")
    const fechaFija = '2026-11-24T00:00:00.000Z';
    // Genera datos mínimos de prueba para que "armarGrupo" no lance error 
    // por no tener todas las subcategorías presentes en los datos 
    const datos = generarDatosMinimos();

    const resultado = armarPrecios(datos, fechaFija);

    // Verifica que el objeto tenga exactamente la fecha que le pasamos
    assert.equal(resultado.actualizado, fechaFija);

    // Verifica que el "primer nivel del objeto"
    assert.deepEqual(Object.keys(resultado), ['actualizado', 'invernada', 'faena']);

    // Verifica el nivel de "resultado.invernada"
    assert.deepEqual(
        Object.keys(resultado.invernada).sort(),
        ['hembras', 'machos', 'vientres']  // .sort() para no depender del orden
    );

    // Verifica el nivel de "resultado.faena"
    assert.equal(resultado.faena.unidad, '$/kg');
    assert.equal(resultado.faena.categorias.length, 4);
})
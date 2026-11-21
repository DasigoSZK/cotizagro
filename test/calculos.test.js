import test from 'node:test';
import assert from 'node:assert/strict';
import {precioPonderado, resumenGrupo} from './../src/calculos.js';

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
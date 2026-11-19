import test from 'node:test';
import assert from 'node:assert/strict';
import {precioPonderado} from './../src/calculos.js';

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
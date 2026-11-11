# Documento de diseño — Cotizagro

> Fecha: 10/11/2026
> Versión: 0.2

---

## 1. Descripción

Proyecto de consola (CLI) que muestra un resumen de los precios de hacienda bovina en Argentina, agrupados por:

- Destino (invernada o faena).
- Categoría y peso del animal.

Un recolector obtiene los precios de la fuente una vez por día y los guarda en un archivo JSON. Un servidor entrega esos datos y un cliente de consola los muestra.

## 2. Objetivo de aprendizaje

Practicar los temas del curso de fundamentos de Node.js de jonmircha y los conceptos básicos del backend:

- Iniciar un proyecto con Node: `npm init`, `package.json`, dependencias de producción y de desarrollo, scripts personalizados.
- Uso de npm.
- Módulos nativos de Node: `fs/promises`, `path`, `readline`, `http`.
- Dependencias sencillas de terceros, como `chalk`.
- Objetos globales de Node: `globalThis`, `process`.
- Solicitudes HTTP con `fetch` y `async/await`.
- Un servidor con el módulo nativo `http`, sin frameworks.
- Separar responsabilidades: obtener datos, guardarlos, entregarlos y mostrarlos.

## 3. Alcance

**Sí hace (v1):**

- Obtiene los precios de la fuente una vez por día y los guarda procesados.
- Muestra, para cada categoría simplificada: precio actual, promedio, mínimo y máximo.
- Muestra la unidad de cada grupo ($/kg o $/cabeza) y la fecha de actualización de los datos.

**No hace (por ahora):**

- Tendencia alcista o bajista.
- Cotización del dólar oficial y blue.
- Historial propio de precios (solo se guarda la última consulta).
- CRUD de la hacienda del productor (registrar, listar, actualizar y eliminar animales o tropas).

## 4. Fuente de datos

Fuente: API interna no documentada de deCampoaCampo. Es pública (no requiere login), pero puede cambiar sin aviso.

| Endpoint (URL) | Qué devuelve | Unidad |
|---|---|---|
| `https://www.decampoacampo.com/gh_funciones.php?function=getListadoPreciosInvernada&p=1&m=peso` | Invernada: machos | $/kg |
| `https://www.decampoacampo.com/gh_funciones.php?function=getListadoPreciosInvernada&p=2&m=peso` | Invernada: hembras | $/kg |
| `https://www.decampoacampo.com/gh_funciones.php?function=getListadoPreciosInvernada&p=3&m=peso` | Invernada: vientres | $/cabeza |
| `https://www.decampoacampo.com/gh_funciones.php?function=getListadoPreciosGordo` | Faena (Mercado de Cañuelas) | $/kg |

Datos de cada subcategoría que se usan: `categoria`, `cantidad_semana_1/2/3` y `precio_semana_1/2/3`.

- Semana 1: semana en curso (ventana móvil de 7 días que termina el día de la consulta).
- Semana 2: semana pasada.
- Semana 3: semana anterior a la pasada ("repasada").

## 5. Reglas de negocio

### 5.1 Categorías

```
INVERNADA – MACHOS ($/kg)          ← p=1
  Terneros hasta 160 kg            ← Terneros -160 Kg.
  Terneros 160-260 kg              ← Terneros 160-180, 180-200, 200-230, 230-260 Kg.
  Novillitos 260-300 kg            ← Novillitos 260-300 Kg.
  Novillitos +300 kg               ← Novillitos +300 Kg.

INVERNADA – HEMBRAS ($/kg)         ← p=2
  Terneras hasta 150 kg            ← Terneras -150 Kg.
  Terneras 150-210 kg              ← Terneras 150-170, 170-190, 190-210 Kg.
  Vaquillonas 210-290 kg           ← Vaquillonas 210-250, 250-290 Kg.
  Vaquillonas +290 kg              ← Vaquillonas +290 Kg.

INVERNADA – VIENTRES ($/cabeza)    ← p=3
  Vaquillonas (entorar / preñadas) ← Vaquillonas Para Entorar, Vaquillonas Preñadas
  Vacas preñadas                   ← Vacas Nuevas, 1/2 diente y CUT Preñadas
  Vacas con cría                   ← Vacas Nuevas, 1/2 diente y CUT con cría
  Vacas de invernada               ← Vacas de Invernada

FAENA ($/kg)                       ← getListadoPreciosGordo
  Novillitos hasta 390 kg          ← Novillitos hasta 390 Kg.
  Novillos 391-490 kg              ← Novillitos 391/430, Novillos 431/460, Novillos 461/490 Kg.
  Vaquillonas hasta 390 kg         ← Vaquillonas hasta 390 Kg.
  Vacas                            ← Vacas Buenas, Vacas Regulares, Vacas Conserva
```

### 5.2 Cálculos

Todas las categorías usan **la misma fórmula**, tengan una o varias subcategorías.

**Paso 1: precio ponderado de cada semana (PW).** Para cada semana `s` (1, 2 y 3):

```
PW_s = Σ (precio_semana_s × cantidad_semana_s) / Σ cantidad_semana_s
```

Si el grupo tiene una sola subcategoría, PW_s es directamente su precio de esa semana.

**Paso 2: datos que se muestran.**

- **Actual:** `PW_1`
- **Promedio:** `(PW_1 + PW_2 + PW_3) / 3`
- **Mínimo:** `min(PW_1, PW_2, PW_3)`
- **Máximo:** `max(PW_1, PW_2, PW_3)`

**Redondeo:** los cuatro valores se guardan redondeados a pesos enteros.

**Semanas sin ventas:** si en una semana la suma de cantidades del grupo es 0, esa semana no se usa. Promedio, mínimo y máximo se calculan con las semanas que sí tienen ventas. Si la semana 1 no tiene ventas, "actual" se guarda como `null`.

### 5.3 Exclusiones

Se descartan de la fuente:

- `cotizacion_*` (dólar): funcionalidad futura.
- `precio_*_usd`, `precio_*_blue`: se guardan solo los precios en pesos.
- `*_formatted`: se guardan números sin formato; el formato se aplica al mostrar.
- `variacion_*`: no se usan en la v1 (sin tendencia).
- Categorías "Holando": raza lechera, fuera del alcance.

## 6. Formato de los datos guardados (precios.json)

Se guarda **solo la última consulta**. Cada ejecución del recolector reemplaza el archivo completo.

Ejemplo (valores calculados con datos reales del 09/11/2026; se muestran algunas categorías):

```json
{
  "actualizado": "2026-11-10T09:00:00.000Z",
  "invernada": {
    "machos": {
      "unidad": "$/kg",
      "categorias": [
        { "nombre": "Terneros hasta 160 kg", "actual": 6490, "promedio": 6507, "minimo": 6410, "maximo": 6620 },
        { "nombre": "Terneros 160-260 kg", "actual": 5879, "promedio": 5879, "minimo": 5833, "maximo": 5926 }
      ]
    },
    "hembras": {
      "unidad": "$/kg",
      "categorias": []
    },
    "vientres": {
      "unidad": "$/cabeza",
      "categorias": [
        { "nombre": "Vacas preñadas", "actual": 2075704, "promedio": 2076538, "minimo": 2016641, "maximo": 2137268 }
      ]
    }
  },
  "faena": {
    "unidad": "$/kg",
    "categorias": []
  }
}
```

**Campos:**

- **actualizado:** fecha y hora en que se ejecutó el recolector (`new Date().toISOString()`). El cliente la muestra para que el usuario sepa de cuándo son los datos.
- **invernada / faena:** destinos. Invernada se divide en tres grupos (machos, hembras, vientres); faena es un solo grupo.
- **unidad:** unidad de todos los precios del grupo.
- **categorias:** lista de categorías simplificadas del grupo, en el orden de la sección 5.1.
- **nombre:** nombre de la categoría simplificada.
- **actual, promedio, minimo, maximo:** según la sección 5.2. Siempre con estos mismos nombres, en todos los grupos.

## 7. Componentes

```
[deCampoaCampo: 4 endpoints]
            │  1 vez por día
            ▼
     [Recolector] ── calcula y guarda ──► [precios.json]
                                              │ lee
                                              ▼
                                         [Servidor http] ◄── pide datos ── [Cliente de consola]
                                              └──────── responde JSON ──────►
```

- **Recolector:** pide los 4 endpoints, aplica las reglas de la sección 5 y escribe `precios.json`.
- **precios.json:** guarda la última consulta procesada. Funciona como una base de datos mínima.
- **Servidor:** lee `precios.json` y lo entrega en JSON cuando un cliente lo pide. No da formato ni muestra nada.
- **Cliente de consola:** muestra un menú, pide los datos al servidor y los presenta legibles (formato de miles, unidad, fecha de actualización).

## 8. Riesgos

| Qué puede salir mal | Qué hace el programa |
|---|---|
| La fuente no responde (sin internet o caída) | El recolector registra el error y **no toca** `precios.json`. El servidor sigue entregando los últimos datos y el cliente muestra su fecha. |
| La fuente cambia la estructura del JSON | El recolector valida los campos esperados; si faltan, registra el error y no sobrescribe los datos anteriores. |
| Una subcategoría o semana sin ventas (cantidad 0) | Se excluye esa semana del cálculo (sección 5.2) para evitar dividir por cero. |
| Todavía no existe `precios.json` | El servidor responde que aún no hay datos y el cliente lo informa. |
| El servidor no está encendido | El cliente informa que no pudo conectarse. |
| El usuario elige una opción inválida | El cliente vuelve a mostrar el menú. |
| Términos de uso de la fuente | Uso personal y educativo. Para uso comercial futuro: pedir permiso o buscar una fuente oficial. |

## 9. Preguntas abiertas

- Al promediar "Vacas preñadas" se pierde la diferencia entre vaca nueva y CUT. ¿Conviene mostrar el rango entre subcategorías, o una tabla edad × situación?
- ¿"Vacas de invernada" está bien como categoría aparte? Verificar el significado como productor.

## 10. Ideas futuras

- Tendencia alcista o bajista con colores (comparando actual y promedio).
- Mostrar la cantidad de cabezas vendidas como indicador de confianza del precio.
- Historial propio de precios (un registro por día o por semana).
- Cotización del dólar y precios en dólares.
- Definiciones cortas de cada categoría para el productor.
- Tabla de vientres por edad (nueva, 1/2 diente, CUT) × situación (preñada, con cría).
- Menú principal con dos opciones: "Precios de hacienda hoy" y "Mi hacienda".
- CRUD sencillo de la hacienda del productor.
- Pasar el servidor a Express.
- Reemplazar el JSON por una base de datos real.

---

## Cambios respecto a v0.1

1. **Una sola fórmula para todas las categorías.** El promedio ponderado de un grupo con una sola subcategoría es igual a su precio, así que "simple" y "ponderado" eran el mismo cálculo. Se eliminaron `tipo_calculo` y los sufijos `_simple` / `_ponderado`.
2. **Nombres de campos fijos** (`actual`, `promedio`, `minimo`, `maximo`) en todos los grupos, para que el cliente recorra los datos sin preguntar de qué tipo es cada fila.
3. **Se guarda solo la última consulta.** El campo `semana` no servía como clave semanal porque la "semana actual" de la fuente es una ventana móvil que cambia todos los días. Además, la fuente ya trae tres semanas de historia. Se eliminaron `id` y `semana`; `fecha_registro` pasó a ser `actualizado`.
4. **Vientres con la misma forma de datos que el resto.** Se quitaron tendencia y variación (estaban en "No hace") y se volvió a la agrupación por situación. La tabla por edad pasó a ideas futuras.
5. **Unidad por grupo** ($/kg o $/cabeza), para que el cliente la muestre.
6. **Reglas nuevas:** redondeo a pesos enteros y manejo de semanas sin ventas.
7. **Riesgos ampliados:** si la fuente falla, se conservan los datos anteriores en vez de mostrar solo un error.
8. **Responsabilidades separadas:** el servidor entrega JSON; el cliente da formato y muestra.

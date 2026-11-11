# Documento de diseño — Cotizagro

> Fecha: 10/11/2026  
> Versión: 0.1

---

## 1. Descripción

Es un proyecto de CLI que muestra un resumen de los precios de hacienda bovina en Argentina, agrupándolos por:
- Destino (faena o invernada).
- Peso/categoría del bovino.


## 2. Objetivo de aprendizaje

Quiero practicar los temas más importantes vistos en el curso de fundamentos de Node.js de "Jonmircha" (youtube), junto a cualquier otro tema importante para entender el funcionamiento básico de Node.  
Ejemplos:
- Inicio de un proyecto básico con node (npm init, configuración del package.json, instalación de dependencias del proyecto y de desarrollo, uso de scripts personalizados, entre otros).
- Uso de npm.
- Uso de módulos comunes de Node (como fs o fs/promises, path, readline).
- Uso de dependencias sencillas como chalk.
- Objetos importantes de Node como "globalThis" o "process".
- Configuración básica de un servidor con Node vanilla (si es posible y apropiado hacerlo en este proyecto).


## 3. Alcance

**Sí hace:**

- Muestra los precios actuales, promedios, mínimos y máximos para cada categoría.

**No hace (por ahora):**

- Mostrar tendencias alcista / bajista basada en el precio histórico comparado al actual.
- Cotización del dolar y dolar blue hoy.
- Registrar un bovino con sus datos.
- Registrar una "tropa" de bovinos con los mismos datos.
- Listar los bovinos registrados.
- Actualizar los datos de 1 bovino.
- Actualizar los datos de muchos bovinos a la vez seleccionando sus IDs.
- Eliminar el registro de 1 bovino.
- Eliminar el registro de muchos bovinos a la vez seleccionando sus IDs.

## 4. Fuente de datos

| Endpoint (URL) | Qué devuelve | Unidad |
|---|---|---|
| `https://www.decampoacampo.com/gh_funciones.php?function=getListadoPreciosInvernada&p=1&m=peso` | Precios de MACHOS para INVERNADA | pesos, dólares y dolares blue |
| `https://www.decampoacampo.com/gh_funciones.php?function=getListadoPreciosInvernada&p=2&m=peso` | Precios de HEMBRAS para INVERNADA | pesos, dólares y dolares blue |
| `https://www.decampoacampo.com/gh_funciones.php?function=getListadoPreciosInvernada&p=3&m=peso` | Precios de VIENTRES para INVERNADA | pesos, dólares y dolares blue |
| `https://www.decampoacampo.com/gh_funciones.php?function=getListadoPreciosGordo` | Precios para FAENA | pesos, dólares y dolares blue |

## 5. Reglas de negocio

### 5.1 Categorías


#### 1.1. INVERNADA - MACHOS
```
- Terneros hasta 160 kg.
Datos que muestra: Precio Actual, Precio Mínimo Simple, Precio Promedio Simple, Precio Máximo Simple.
Agrupa categorías: "Terneros -160 Kg.".

- Terneros 160-260 kg .
Datos que muestra: Precio Actual, Precio Mínimo Ponderado, Precio Promedio Ponderado, Precio Máximo Ponderado.
Agrupa categorías: "Terneros 160-180 Kg.", "Terneros 180-200 Kg.", "Terneros 200-230 Kg.", "Terneros 230-260 Kg.".

- Novillitos 260-300kg.
Datos que muestra: Precio Actual, Precio Mínimo Simple, Precio Promedio Simple, Precio Máximo Simple.
Agrupa categorías: "Novillitos 260-300 Kg".

- Novillitos +300 kg.
Datos que muestra: Precio Actual, Precio Mínimo Simple, Precio Promedio Simple, Precio Máximo Simple.
Agrupa categorías: "Novillitos +300 Kg.".
```

#### 1.2. INVERNADA - HEMBRAS
```
- Terneras hasta 150 kg.
Datos que muestra: Precio Actual, Precio Mínimo Simple, Precio Promedio Simple, Precio Máximo Simple.
Agrupa categorías: "Terneras -150 Kg."

- Terneras hasta 150-210 kg.
Datos que muestra: Precio Actual, Precio Mínimo Ponderado, Precio Promedio Ponderado, Precio Máximo Ponderado.
Agrupa categorías: "Terneras 150-170 Kg.", "Terneras 170-190 Kg.", "Terneras 190-210 Kg.".

- Vaquillonas hasta 210-290 kg.
Datos que muestra: Precio Actual, Precio Mínimo Ponderado, Precio Promedio Ponderado, Precio Máximo Ponderado.
Agrupa categorías: "Vaquillonas 210-250 Kg.", "Vaquillonas 250-290 Kg.".

- Vaquillonas hasta +290 kg.
Datos que muestra: Precio Actual, Precio Mínimo Simple, Precio Promedio Simple, Precio Máximo Simple.
Agrupa categorías: "Vaquillonas +290 Kg.".
```

#### 1.3. INVERNADA - VIENTRES
```
- Vaquillonas (para entorar / preñadas).
Datos que muestra: Precio Actual para entorar, Precio Actual preñada, Tendencia, Variación.
Agrupa categorías: "Vaquillonas Para Entorar", "Vaquillonas Preñadas".

- Vacas Nuevas (para entorar / preñadas / con cría).
Datos que muestra: Precio Actual para entorar, Precio Actual preñada, Precio actual con cría, Tendencia, Variación.
Agrupa categorías: "Vacas de Invernada", "Vacas Nuevas Preñadas", "Vacas Nuevas con cría".

- Vacas 1/2 diente (preñadas / con cría).
Datos que muestra: Precio Actual preñada, Precio Actual con cría, Tendencia, Variación.
Agrupa categorías: "Vacas 1/2 diente Preñadas", "Vacas 1/2 diente con cría"

- Vacas CUT (preñadas / con cría).
Datos que muestra: Precio Actual para entorar, Precio Actual preñada, Tendencia, Variación.
Agrupa categorías: "Vacas CUT Preñadas", "Vacas CUT con cría".
```


#### 2. FAENA - NOVILLITOS / VAQUILLONAS / VACAS
```
- Novillitos hasta 390 kg.
Datos que muestra: Precio Actual, Precio Mínimo Simple, Precio Promedio Simple, Precio Máximo Simple.
Agrupa categorías: "Novillitos hasta 390 Kg.".

- Novillitos 391-490 kg.
Datos que muestra: Precio Actual, Precio Mínimo Ponderado, Precio Promedio Ponderado, Precio Máximo Ponderado.
Agrupa categorías: "Novillitos 391/430 Kg.", "Novillos 431/460 Kg.", "Novillos 461/490 Kg.".

- Vaquillonas hasta 390 kg.
Datos que muestra: Precio Actual, Precio Mínimo Simple, Precio Promedio Simple, Precio Máximo Simple.
Agrupa categorías: "Vaquillonas hasta 390 Kg.".

- Vacas.
Datos que muestra: Precio Actual, Precio Mínimo Ponderado, Precio Promedio Ponderado, Precio Máximo Ponderado.
Agrupa categorías: "Vacas Buenas", "Vacas Regulares", "Vacas Conserva".
```


### 5.2 Cálculos

#### Datos de precio (Invernada Machos, Invernada Hembras, Faena)

- **Precio Actual:**
  - Simple: `data[n].precio_semana_1`
  - Ponderado: `PW_1`

- **Precio Promedio Simple:**  
`(data[n].precio_semana_1 + data[n].precio_semana_2 + data[n].precio_semana_3) / 3`

- **Precio Promedio Ponderado:**  
`(PW_1 + PW_2 + PW_3) / 3`
  - Se calcula el precio ponderado de cada semana y luego se promedian las 3 semanas.

- **Precio Mínimo Simple:**  
`min(data[n].precio_semana_1, data[n].precio_semana_2, data[n].precio_semana_3)`

- **Precio Mínimo Ponderado:**  
`min(PW_1, PW_2, PW_3)`

- **Precio Máximo Simple:**  
`max(data[n].precio_semana_1, data[n].precio_semana_2, data[n].precio_semana_3)`

- **Precio Máximo Ponderado:**  
`max(PW_1, PW_2, PW_3)`

#### Datos de Vientres (Invernada – Vientres)

- **Precio Actual para entorar:**
  - Vaquillonas: `data["Vaquillonas Para Entorar"].precio_semana_1`
  - Vacas Nuevas: `data["Vacas de Invernada"].precio_semana_1`

- **Precio Actual preñada:**
  - Vaquillonas: `data["Vaquillonas Preñadas"].precio_semana_1`
  - Vacas Nuevas: `data["Vacas Nuevas Preñadas"].precio_semana_1`
  - Vacas 1/2 diente: `data["Vacas 1/2 diente Preñadas"].precio_semana_1`
  - Vacas CUT: `data["Vacas CUT Preñadas"].precio_semana_1`

- **Precio Actual con cría:**
  - Vacas Nuevas: `data["Vacas Nuevas con cría"].precio_semana_1`
  - Vacas 1/2 diente: `data["Vacas 1/2 diente con cría"].precio_semana_1`
  - Vacas CUT: `data["Vacas CUT con cría"].precio_semana_1`

- **Tendencia:** `Si Variación < 0 → "Bajista"; si Variación > 0 → "Alcista"; si Variación = 0 → "Estable"`

- **Variación:** `(Σ_j data[j].variacion_precio_semana_1) / N`
  - Donde `j` recorre las subcategorías internas del bloque Vientres y `N` es la cantidad de subcategorías.
  - Vaquillonas: `(data["Vaquillonas Para Entorar"].variacion_precio_semana_1 + data["Vaquillonas Preñadas"].variacion_precio_semana_1) / 2`
  - Vacas Nuevas: promedio simple de `Vacas de Invernada`, `Vacas Nuevas Preñadas` y `Vacas Nuevas con cría`.
  - Vacas 1/2 diente: promedio simple de `Vacas 1/2 diente Preñadas` y `Vacas 1/2 diente con cría`.
  - Vacas CUT: promedio simple de `Vacas CUT Preñadas` y `Vacas CUT con cría`.

### 5.3 Exclusiones

Se descartan los datos de la fuente relacionados al precio del dolar y los precios de cada categoría en dolares, dolares blue y los "precios formateados".
El motivo es que mostrar datos rellacionados a la cotización del dolar hoy es una funcionalidad futura, y los precios de hacienda en dolares y/o formateados se descartan debido a que capturamos los precios en pesos en números sin formato, y formateamos al momento de entregar.

## 6. Formato de los datos guardados (precios.json)

```json
[
  {
    "id": 1,
    "semana": "2026-11-09",
    "fecha_registro": "2026-11-09",
    "invernada": [
      {
        "categoria": "Terneros hasta 160 kg.",
        "grupo": "machos",
        "tipo_calculo": "simple",
        "precio_actual": 6490,
        "precio_minimo_simple": 6410,
        "precio_promedio_simple": 6506.67,
        "precio_maximo_simple": 6620
      },
      {
        "categoria": "Terneros 160-260 kg.",
        "grupo": "machos",
        "tipo_calculo": "ponderado",
        "precio_actual": 5832.29,
        "precio_minimo_ponderado": 5832.29,
        "precio_promedio_ponderado": 5863.6,
        "precio_maximo_ponderado": 5925.55
      },
      {
        "categoria": "Novillitos 260-300 kg.",
        "grupo": "machos",
        "tipo_calculo": "simple",
        "precio_actual": 5220,
        "precio_minimo_simple": 5220,
        "precio_promedio_simple": 5246.67,
        "precio_maximo_simple": 5290
      },
      {
        "categoria": "Novillitos +300 kg.",
        "grupo": "machos",
        "tipo_calculo": "simple",
        "precio_actual": 4970,
        "precio_minimo_simple": 4970,
        "precio_promedio_simple": 5100,
        "precio_maximo_simple": 5170
      },
      {
        "categoria": "Terneras hasta 150 kg.",
        "grupo": "hembras",
        "tipo_calculo": "simple",
        "precio_actual": 6180,
        "precio_minimo_simple": 5960,
        "precio_promedio_simple": 6110,
        "precio_maximo_simple": 6190
      },
      {
        "categoria": "Terneras 150-210 kg.",
        "grupo": "hembras",
        "tipo_calculo": "ponderado",
        "precio_actual": 5617,
        "precio_minimo_ponderado": 5617,
        "precio_promedio_ponderado": 5686.94,
        "precio_maximo_ponderado": 5821.95
      },
      {
        "categoria": "Vaquillonas 210-290 kg.",
        "grupo": "hembras",
        "tipo_calculo": "ponderado",
        "precio_actual": 5132.29,
        "precio_minimo_ponderado": 5132.29,
        "precio_promedio_ponderado": 5179.94,
        "precio_maximo_ponderado": 5209.89
      },
      {
        "categoria": "Vaquillonas +290 kg.",
        "grupo": "hembras",
        "tipo_calculo": "simple",
        "precio_actual": 4490,
        "precio_minimo_simple": 4490,
        "precio_promedio_simple": 4670,
        "precio_maximo_simple": 4870
      },
      {
        "categoria": "Vaquillonas (para entorar / preñadas)",
        "grupo": "vientres",
        "tipo_calculo": "vientres",
        "precio_actual_para_entorar": 1502000,
        "precio_actual_prenada": 2493000,
        "tendencia": "Bajista",
        "variacion": -201500
      },
      {
        "categoria": "Vacas Nuevas (para entorar / preñadas / con cría)",
        "grupo": "vientres",
        "tipo_calculo": "vientres",
        "precio_actual_para_entorar": 1266000,
        "precio_actual_prenada": 2084000,
        "precio_actual_con_cria": 1375000,
        "tendencia": "Bajista",
        "variacion": -167666.67
      },
      {
        "categoria": "Vacas 1/2 diente (preñadas / con cría)",
        "grupo": "vientres",
        "tipo_calculo": "vientres",
        "precio_actual_prenada": 2162000,
        "precio_actual_con_cria": 1230000,
        "tendencia": "Bajista",
        "variacion": -59500
      },
      {
        "categoria": "Vacas CUT (preñadas / con cría)",
        "grupo": "vientres",
        "tipo_calculo": "vientres",
        "precio_actual_prenada": 1531000,
        "precio_actual_con_cria": 1042000,
        "tendencia": "Bajista",
        "variacion": -49500
      }
    ],
    "faena": [
      {
        "categoria": "Novillitos hasta 390 kg.",
        "tipo_calculo": "simple",
        "precio_actual": 4670,
        "precio_minimo_simple": 4670,
        "precio_promedio_simple": 4756.67,
        "precio_maximo_simple": 4830
      },
      {
        "categoria": "Novillitos 391-490 kg.",
        "tipo_calculo": "ponderado",
        "precio_actual": 4431.09,
        "precio_minimo_ponderado": 4431.09,
        "precio_promedio_ponderado": 4469.82,
        "precio_maximo_ponderado": 4535.06
      },
      {
        "categoria": "Vaquillonas hasta 390 kg.",
        "tipo_calculo": "simple",
        "precio_actual": 4600,
        "precio_minimo_simple": 4560,
        "precio_promedio_simple": 4623.33,
        "precio_maximo_simple": 4710
      },
      {
        "categoria": "Vacas",
        "tipo_calculo": "ponderado",
        "precio_actual": 2999.49,
        "precio_minimo_ponderado": 2999.49,
        "precio_promedio_ponderado": 3091.8,
        "precio_maximo_ponderado": 3157.95
      }
    ]
  }
]
```

**Campos y para qué sirve cada uno:**

**Datos Generales del registro**
1. **id:**  
Identificador único de cada registro semanal.  
Si no existen registros, se genera empezando con "1".
Si existen registros, se utiliza alguna función "max(id)+1" para añadir un nuevo registro.
2. **semana:**  
Clave que contiene el valor de "semana_actual.hasta" que viene dentro del JSON de la respuesta del endpoint de "invernada" (o el campo "hoy" del endpoint de "faena").
La función de este campo es lograr generar un solo registro por semana, pero pudiendo hacer actualizaciones a este registro durante la semana.  
Su funcionamiento es el siguiente:
Si no existe ningún registro en el archivo que funciona de base de datos dentro del servidor con el campo "semana" === "hoy" o "semana_actual.hasta" -> entonces se genera un nuevo "id" y se guarda un nuevo registro.
Si ya existe un registro con ese valor de "hoy" o "semana_actual.hasta" dentro del campo "semana", entonces se "pisa" ese registro, actuaizando los datos, pero sin generar una nueva inserción dentro del archivo (pudiendo asi, actualizar datos que cambien en el endopoint durante la semana, pero sin generar mas de 1 registro semanal en el servidor).
3. **fecha_registro:**  
Fecha real en la que se guardó el registro, generada internamente con new Date() (se actualiza cada vez que se genera un nuevo registro, o se pisa uno existente).
4. **invernada:**  
Array de objetos que contiene 1 objeto por cada grupo especificado en el bloque "5.1" de destino invernada.
5. **faena:**
Array de objetos que contiene 1 objeto por cada grupo especificado en el bloque "5.1" de destino faena.

---

**Datos Compartidos de objetos dentro de "faena" e "invernada"**
1. **categoria:**  
Nombre de cada categoría especificada en el bloque 5.1.
2. **tipo_calculo:**  
Nombre que permitirá dentro del servidor distinguir los nombres de los campos internos de cada objeto dentro de "faena" e "invernada" rapidamente sin tener que consultarlos internamente. Si su tipo_calculo es "simple", sus campos se nombran como "nombrecampo_simple", si su "tipo_calculo" es "ponderado", sus campos se nombran como "nombrecampo_ponderado", y si su "tipo_calculo" es "vientres", entonces son "precio_actual_para_entorar / precio_actual_prenada / precio_actual_con_cria + tendencia / variacion".
3. **precio_actual:**  
Proviene de "data[n].precio_semana_1".
3. **precio_minimo_simple:**  
Mínimo de los 3 precios semanales de esa categoría única (para aquellos grupos que tienen 1 sola categoría).
3. **precio_promedio_simple:**  
Precio promedio de los 3 precios semanales de esa única categoría.
3. **precio_maximo_simple:**  
Máximo de los 3 precios semanales de esa categoría única (para aquellos grupos que tienen 1 sola categoría).
3. **precio_minimo_ponderado:**  
Mínimo de los 3 precios ponderados semanales (minimo ponderado de cada subcategoría del endpoint que agrupa esta categoría en el servidor).
3. **precio_promedio_ponderado:**
Promedio de los 3 precios ponderados semanales (minimo ponderado de cada subcategoría del endpoint que agrupa esta categoría en el servidor).
3. **precio_maximo_ponderado:**
Máximo de los 3 precios ponderados semanales (minimo ponderado de cada subcategoría del endpoint que agrupa esta categoría en el servidor).

---

**Datos exclusivos de los objetos dentro de "invernada"**
1. **grupo:**  
(solo existe dentro de los objetos de "invernada").
Permite agrupar en consola los objetos de invernada de una manera simple (sin tener que consultar dentro del objeto), usando los valores "machos", "hembras", "vientres".
1. **precio_actual_para_entorar:**  
(solo en categoría: "vientres").
Se obtiene de "precio_semana_1" en las categorías que terminen en "Para Entorar" dentro del array de objetos "data" del endpoint de "vientres".
1. **precio_actual_prenada:**  
(solo en categoría: "vientres").  
Se obtiene de "precio_semana_1" en las categorías que terminen en "Preñadas" dentro del array de objetos "data" del endpoint de "vientres".
1. **precio_actual_con_cria:**  
(solo en categoría: "vientres").  
Se obtiene de "precio_semana_1" en las categorías que terminen en "con cría" dentro del array de objetos "data" del endpoint de "vientres".
1. **tendencia:**  
Sus valores son:
"Bajista" -> si variación < 0.
"Alcista" -> si variación > 0.
"Estable" -> si variación = 0.
1. **variacion:**  
Promedio simple de "variación_precio_semana_1" de las subcategorías internas del bloque.


**Posibles Reglas para el funcionamiento futuro del servidor**
1. Leer "precios_hacienda.json", si no existe, crear uno arrancando con "[]".
2. Calcular el campo "semana" con los datos de la API.
3. Buscar registro con esa semana:
- Si no existe -> "id" = max(id) + 1, "fecha_registro" = hoy, y un push al array.
- Si existe -> reemplazar el registro preservando su "id" y actualizando "fecha_registro".
4. Completar los campos internos de "faena" e "invernada" haciendo los calculos de mínimos/máximos/promedios simples/ponderados correspondientes.
5. Datos descartados de la API:
- cotizacion_*
- precio_*_usd
- precio_*_bue
- *_formatted
- categorías "Holando".


## 7. Componentes


```
1. precios_hacienda.json -> archivo que sirve como "base de datos" para los registros semanales.

2. Recolector -> script / función / modulo que se encargara de hacer las solicitudes http al endpoint, procesarlas y guardarlas ya procesadas en "precios_hacienda.json".

3. Servidor -> aplicación en Node que consume los datos que procesa y guarda "recolector", y espera consultas de clientes para mostrarlos de manera fácilmente legible.

4. Cliente de consola -> pide los precios de hacienda al servidor digitando números en consola basándose en opciones que le ofrece el servidor.
```


## 8. Riesgos

| Qué puede salir mal | Qué hace el programa |
|---|---|
| Que el usuario digite una opción inválida | Vuelve a mostrar el panel de opciones |
| Que la API que nos proporciona los datos deje de funcionar | Muestra un mensaje aclarando que la fuente de datos que consumía el servidor dejó de estar disponible |
| Que la API cambie la estructura del JSON | Muestra un mensaje aclarando que las fuentes cambiaron y el servidor requiere mantenimiento para seguir funcionando |

## 9. Ideas futuras

> Ideas que surgen en el camino y quedan para después.

- Separar el inicio del programa en 2 funcionalidades principales: 1. "Precios Hacienda HOY" (entra a la funcionalidad que estamos trabajando), "Mi Hacienda" (entra al CRUD de la hacienda propia del productor).
- Añadir un CRUD muy sencillo para registrar / actualizar / listar / eliminar la hacienda personal de un productor.
- Pasar el proyecto a express.
- Usar una base de datos real en lugar de un JSON.

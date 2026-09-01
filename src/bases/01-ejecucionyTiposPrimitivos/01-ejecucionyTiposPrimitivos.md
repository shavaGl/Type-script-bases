# Bloque 01 — Ejecución y tipos primitivos

[← Volver al índice](../../../README.md)

| | |
| --- | --- |
| **Archivo** | `src/bases/01-ejecucionyTiposPrimitivos/01-ejecucionyTiposPrimitivos.ts` |
| **Prerrequisitos** | Ninguno |
| **Siguiente** | [Bloque 02 — Operadores y coerción](../02-OperadoresyCoerción/02-OperadoresyCoerción.md) |

---

El piso de todo. Parece trivial y es exactamente donde se rompe la intuición de quien viene de un lenguaje de tipado nominal como Java o C#. Este bloque cubre el tipado básico y deja abierta la puerta al sistema de tipos completo (bloque 05).

## Índice

1. [La anotación va después, y casi siempre sobra](#1-la-anotación-va-después-y-casi-siempre-sobra)
2. [Los primitivos](#2-los-primitivos)
3. [`null` y `undefined` son dos cosas distintas](#3-null-y-undefined-son-dos-cosas-distintas)
4. [Arreglos y tuplas](#4-arreglos-y-tuplas)
5. [Objetos y tipado estructural](#5-objetos-y-tipado-estructural)
6. [`interface` vs `type`](#6-interface-vs-type)
7. [Uniones y literales](#7-uniones-y-literales)
8. [Funciones](#8-funciones)
9. [`any`, `unknown`, `never`](#9-any-unknown-never)
10. [Aserciones: el escape que casi nunca deberías usar](#10-aserciones-el-escape-que-casi-nunca-deberías-usar)

**Al final:** [Ejercicios del bloque](#ejercicios-del-bloque) · [Checklist del bloque](#checklist-del-bloque)

---

## 1. La anotación va después, y casi siempre sobra

```ts
// Java: String nombre = "Salvador";
let nombre: string = "Salvador";

// Pero TypeScript ya lo sabe. Esto es lo idiomático:
let nombre2 = "Salvador"; // inferido: string
const edad = 34; // inferido: 34  (¡no number!)
```

Con `const` el tipo inferido es el **literal** `34`, no `number`, porque el valor nunca va a cambiar. Parece un detalle y es la base de las uniones discriminadas del bloque 05.

> **Regla práctica:** anota los parámetros y el retorno de las funciones; deja que las variables locales se infieran. Anotar de más es ruido, no rigor.

---

## 2. Los primitivos

```ts
let activo: boolean = true;
let total: number = 19.99; // un solo number: no hay int/long/float/double
let clave: string = `Hola ${nombre}`; // template literals con backticks
let id: bigint = 9007199254740993n; // solo si de verdad lo necesitas
let simbolo: symbol = Symbol("k"); // casi nunca lo vas a usar
```

`number` es un IEEE-754 de 64 bits, **siempre**. Consecuencias directas:

```ts
0.1 + 0.2; // 0.30000000000000004
10 / 3; // 3.3333333333333335   ← no hay división entera
Math.trunc(10 / 3); // 3
```

**Para dinero:** enteros en centavos, o una librería decimal. Nunca `number` flotante.

---

## 3. `null` y `undefined` son dos cosas distintas

```ts
let a: string | undefined; // declarada, nunca asignada
let b: string | null = null; // asignada a propósito como "vacío"
```

| Valor       | Significado                        | Quién lo produce |
| ----------- | ---------------------------------- | ---------------- |
| `undefined` | Esto no existe / no se ha definido | El lenguaje      |
| `null`      | Esto está vacío a propósito        | Tú               |

Con `strict: true`, TypeScript no te deja mezclarlos con el tipo base:

```ts
function saludar(n: string) {
  return n.toUpperCase();
}

let x: string | undefined = obtenerNombre();

saludar(x); // Error: 'string | undefined' no es asignable a 'string'
if (x !== undefined) saludar(x); // OK: narrowing, aquí x es string
saludar(x ?? "invitado"); // OK: valor por defecto
```

> Ese error es el `NullPointerException` de Java, pero detectado en compilación en vez de en producción. Vale oro.

---

## 4. Arreglos y tuplas

```ts
const nombres: string[] = ["Ana", "Luis"];
const numeros: Array<number> = [1, 2, 3]; // misma cosa, otra sintaxis
const matriz: number[][] = [
  [1, 2],
  [3, 4],
];

// Tupla: longitud y tipo fijos por posición
const coordenada: [number, number] = [19.28, -99.65];
const entrada: [string, number] = ["edad", 34];
```

**Importante:** el arreglo no está protegido en tiempo de ejecución. `nombres.push(42)` falla al compilar, pero si el dato viene de un JSON externo TypeScript no revisa nada — **el tipado se borra al compilar**.

```ts
const fijo: readonly string[] = ["a", "b"];
fijo.push("c"); // Error de compilación (no de runtime)
```

---

## 5. Objetos y tipado estructural

```ts
type Alumno = {
  nombre: string;
  grado: number;
  correo?: string; // opcional → string | undefined
  readonly matricula: string;
};

const a: Alumno = { nombre: "Ana", grado: 3, matricula: "A-01" };
a.matricula = "A-02"; // Error: readonly
```

Y aquí está la diferencia grande con Java — **el tipado estructural**:

```ts
type Punto = { x: number; y: number };
type Vector = { x: number; y: number };

const p: Punto = { x: 1, y: 2 };
const v: Vector = p; // Compila. Son el mismo tipo: tienen la misma forma.
```

En Java esto sería imposible sin una interfaz común. Aquí **el nombre del tipo no existe en tiempo de ejecución**: es una etiqueta para el compilador. Si camina como pato, es pato.

Con una excepción útil, el _excess property check_ sobre literales:

```ts
const q: Punto = { x: 1, y: 2, z: 3 }; // Error: 'z' no existe en Punto

const objeto = { x: 1, y: 2, z: 3 };
const r: Punto = objeto; // OK: la variable ya tiene su tipo
```

---

## 6. `interface` vs `type`

```ts
interface Usuario {
  id: number;
  nombre: string;
}

type Usuario2 = {
  id: number;
  nombre: string;
};
```

Para describir un objeto son intercambiables. Las diferencias reales:

```ts
// interface se extiende y se fusiona (declaration merging)
interface Usuario {
  activo: boolean;
} // se suma a la declaración anterior

// type puede hacer lo que interface no:
type ID = string | number; // unión
type Callback = (e: Error) => void; // función
type Par = [string, number]; // tupla
```

> **Criterio del repo:** `interface` para la forma de objetos y contratos públicos; `type` para todo lo demás (uniones, alias, funciones). No pierdas tiempo en el debate: sé consistente.

---

## 7. Uniones y literales

```ts
type Estado = "pendiente" | "activo" | "cancelado";

let s: Estado = "activo";
s = "borrado"; // Error — y el editor te autocompleta las tres opciones válidas
```

Esto sustituye a la mitad de tus `enum` de Java, y **no genera código** en el bundle. Además el compilador verifica exhaustividad:

```ts
function etiqueta(e: Estado): string {
  switch (e) {
    case "pendiente":
      return "Pendiente";
    case "activo":
      return "Activo";
    case "cancelado":
      return "Cancelado";
  }
  // Sin default: si mañana agregas "pausado", esta función deja de compilar.
}
```

Ese "deja de compilar" es la característica, no el defecto: el compilador como lista de pendientes.

---

## 8. Funciones

```ts
function sumar(a: number, b: number): number {
  return a + b;
}

const sumar2 = (a: number, b: number): number => a + b;

// Opcional, por defecto y rest
function crear(nombre: string, grado = 1, ...tags: string[]): Alumno {
  /* ... */
}

// void = "no devuelve nada útil"
function log(msg: string): void {
  console.log(msg);
}
```

El tipo de retorno se infiere, pero anótalo en funciones públicas: es documentación y te avisa cuando un `return` se sale del contrato.

---

## 9. `any`, `unknown`, `never`

```ts
let a1: any = JSON.parse(txt);
a1.loQueSea.explota(); // Compila. Y truena en runtime. any apaga TypeScript.

let u: unknown = JSON.parse(txt);
u.nombre; // Error. Tienes que comprobar primero.

if (typeof u === "object" && u !== null && "nombre" in u) {
  console.log(u.nombre); // OK
}
```

| Tipo      | Qué significa                    | Cuándo usarlo                                                  |
| --------- | -------------------------------- | -------------------------------------------------------------- |
| `any`     | Apaga el compilador              | Casi nunca. Siempre con comentario justificándolo               |
| `unknown` | "Algo llegó, demuéstrame qué es" | Todo lo que venga de fuera: JSON, `catch`, librerías sin tipos  |
| `never`   | Este valor no puede existir      | Funciones que siempre lanzan, chequeos de exhaustividad         |

`unknown` es `any` con disciplina: acepta cualquier cosa de entrada, pero te obliga a demostrar qué es antes de usarla.

---

## 10. Aserciones: el escape que casi nunca deberías usar

```ts
const el = document.getElementById("x") as HTMLInputElement;
```

`as` **no convierte nada**: le mientes al compilador. No es el `(HTMLInputElement) obj` de Java, que valida en tiempo de ejecución y lanza `ClassCastException` si te equivocas. Aquí, si te equivocas, no hay excepción: hay un `undefined` apareciendo tres capas más abajo, lejos de la causa.

> Cada `as` que escribas debería incomodarte. En este repositorio, cada uno lleva comentario justificándolo.

---

## Ejercicios del bloque

**Orden sugerido: 1 → 2 → 3.** El primero es opcionales y `null`; el segundo, uniones y exhaustividad; el tercero, la frontera con el mundo real, que es donde el tipado se gana el sueldo.

### Problema 1 — Boletas con calificaciones incompletas

**Escenario.** Cierras trimestre de 3.º y hay alumnos que no entregaron algún proyecto. Faltar una calificación **no es lo mismo** que sacar cero.

```ts
const grupo = [
  { nombre: "Ana Torres", proyectos: [9, 8, 10] },
  { nombre: "Luis Pérez", proyectos: [7, null, 6] }, // no entregó el 2º
  { nombre: "Sofía Ruiz", proyectos: [] }, // se dio de baja
  { nombre: "Diego Mora", proyectos: [0, 0, 0] }, // sí fue evaluado: reprobó
];
```

**Lo que tienes que hacer:**

1. Define el tipo `Alumno` con `nombre`, `proyectos` y un `observaciones` opcional.
2. Escribe `promedio(a: Alumno): number | null` — devuelve `null` si no hay ninguna calificación válida. Los `null` no suman ni cuentan para el divisor.
3. Escribe `boleta(a: Alumno): string` que devuelva `"Ana Torres: 9.0"` o `"Sofía Ruiz: sin evaluar"`.

**Prohibido:** `any`, `as`, y el operador `!` para callar al compilador.

**Criterio de aceptación:** el compilador debe obligarte a manejar el caso `null` en `boleta` antes de poder llamar a `.toFixed(1)`. Si no te obligó, tu tipo está mal.

**Salida esperada:**

```text
Ana Torres: 9.0
Luis Pérez: 6.5
Sofía Ruiz: sin evaluar
Diego Mora: 0.0
```

---

### Problema 2 — Inventario del aula de cómputo

**Escenario.** 20 equipos, cada uno en un estado, y hay que reportar cuáles bloquean la clase.

```ts
// Los estados posibles son exactamente estos cuatro. Ni uno más.
const inventario = [
  { id: "PC-01", estado: "operativo", ram: 8 },
  { id: "PC-02", estado: "sin_teclado", ram: 4 },
  { id: "PC-03", estado: "en_reparacion", ram: 8, desde: "2026-08-14" },
  { id: "PC-04", estado: "baja", ram: 2, motivo: "fuente quemada" },
];
```

**Lo que tienes que hacer:**

1. Define `type EstadoEquipo` como una unión de literales con esos cuatro valores.
2. Define `Equipo` de modo que `desde` solo exista cuando el estado es `"en_reparacion"`, y `motivo` solo cuando es `"baja"`.
   > **Pista:** no es un objeto con dos campos opcionales — son cuatro formas distintas unidas con `|`.
3. Escribe `mensaje(e: Equipo): string` con un `switch` sin `default`.
4. Escribe `utilizables(equipos: readonly Equipo[]): Equipo[]`.

**Criterio de aceptación:** agrega un quinto estado `"prestado"` a la unión. La función `mensaje` debe dejar de compilar de inmediato, señalando exactamente el `switch`. Ese es el punto del ejercicio: el compilador como lista de pendientes.

> Este es el patrón que en Spring resolverías con una jerarquía de clases y un _visitor_. Aquí son 12 líneas.

---

### Problema 3 — Lista de asistencia que llega en JSON sucio

**Escenario.** Exportas la asistencia de un sistema escolar y el JSON viene inconsistente: fechas como texto, grados a veces número y a veces string, campos ausentes.

```ts
const crudo = `[
  {"alumno":"Ana Torres","grado":3,"asistio":true},
  {"alumno":"Luis Pérez","grado":"3","asistio":"si"},
  {"alumno":"Sofía Ruiz"},
  {"nombre":"Error","grado":2}
]`;
```

**Lo que tienes que hacer:**

1. `JSON.parse(crudo)` devuelve `any`. Asígnalo a `unknown` de inmediato:
   ```ts
   const datos: unknown = JSON.parse(crudo);
   ```
2. Escribe una guarda de tipo `function esRegistro(v: unknown): v is Registro` que valide de verdad: que sea objeto, que no sea `null`, que tenga `alumno` string, etc.
3. Escribe `normalizar(datos: unknown): Registro[]` que descarte lo inválido y convierta `"3"` → `3` y `"si"` → `true`.
4. Devuelve también los rechazados: `type Resultado = { validos: Registro[]; rechazados: unknown[] }`.

**Criterio de aceptación:** si borras la guarda de tipo, el código no compila. Si la sustituyes por un `as Registro[]`, compila y truena en runtime al leer a Sofía Ruiz. Corre las dos versiones y ve el fallo con tus ojos — es la lección más cara de TypeScript, y aquí sale gratis.

---

> **Cuando tengas el 1 resuelto, pégamelo y te lo reviso como si fuera un PR:** tipos, nombres y decisiones, no solo si compila.

---

## Checklist del bloque

- [ ] `let` y `const`, y por qué `var` no entra en el vocabulario
- [ ] Tipado estructural: la forma manda, no el nombre del tipo
- [ ] Los primitivos y el `number` único
- [ ] `null` vs `undefined`: de dónde sale cada uno y cuál usar
- [ ] Arreglos, tuplas y `readonly`
- [ ] Objetos, propiedades opcionales y _excess property check_
- [ ] `interface` vs `type`: qué puede cada uno
- [ ] Uniones de literales y exhaustividad en `switch`
- [ ] `unknown` en lugar de `any`
- [ ] Por qué `as` no es un cast

---

[← Volver al índice](../../../README.md) · [Bloque 02 — Operadores y coerción →](../02-OperadoresyCoerción/02-OperadoresyCoerción.md)

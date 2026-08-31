# TypeScript — Bases

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Node](https://img.shields.io/badge/Node-20%2B-339933?logo=node.js&logoColor=white)
![strict](https://img.shields.io/badge/strict-true-17805A)

Fundamentos de TypeScript trabajados en orden, **antes de tocar React o cualquier otro framework**.

Este repositorio no es un curso de lógica de programación: es el **modelo mental de JavaScript** que TypeScript recubre, documentado desde la perspectiva de alguien que ya programa en un lenguaje de tipado nominal (Java, C#). Cada bloque tiene su archivo ejecutable, sus ejemplos y el error clásico que hay que ver fallar al menos una vez.

---

## Requisitos

- Node.js 20 o superior
- TypeScript 5.x

## Instalación

```bash
git clone <url-del-repo>
cd bases
npm install
```

## Ejecución

```bash
# Verificar tipos de todo el proyecto sin generar archivos
npx tsc --noEmit

# Compilar a JavaScript
npx tsc

# Ejecutar un tema concreto
node dist/bases/ejecucionyTiposPrimitivos.js
```

> **`strict: true` es obligatorio en este repositorio.** Sin esa bandera, la mitad de los ejercicios compilan cuando no deberían y se pierde el punto de cada bloque.

`tsconfig.json` mínimo:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true
  },
  "include": ["src"]
}
```

---

## Estructura

```
bases/
├── src/
│   └── bases/
│       ├── 01-ejecucionyTiposPrimitivos.ts
│       ├── 02-operadoresyCoercion.ts
│       ├── 03-controlFlujoyColecciones.ts
│       ├── 04-funciones.ts
│       ├── 05-sistemaDeTipos.ts
│       ├── 06-inmutabilidadyTransformacion.ts
│       ├── 07-scopeClosuresyThis.ts
│       ├── 08-asincronia.ts
│       ├── 09-modulosyConfiguracion.ts
│       └── 10-erroresyDominio.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## Ruta de aprendizaje

| # | Bloque | Qué se domina | Estado |
|---|--------|---------------|--------|
| 01 | [Ejecución y tipos primitivos](#01--ejecución-y-tipos-primitivos) | Inferencia, primitivos, `null` vs `undefined`, tipado estructural | ⬜ |
| 02 | [Operadores y coerción](#02--operadores-y-coerción) | `===`, truthy/falsy, `??`, `?.` | ⬜ |
| 03 | [Control de flujo y colecciones](#03--control-de-flujo-y-colecciones) | `for...of`, arrays, `Record`, `Map`, `Set` | ⬜ |
| 04 | [Funciones a fondo](#04--funciones-a-fondo) | Arrow, opcionales, rest, funciones como valor | ⬜ |
| 05 | [El sistema de tipos](#05--el-sistema-de-tipos) | Uniones, narrowing, genéricos, utility types | ⬜ |
| 06 | [Inmutabilidad y transformación](#06--inmutabilidad-y-transformación-de-datos) | `map`, `filter`, `reduce`, spread, destructuring | ⬜ |
| 07 | [Scope, closures y `this`](#07--scope-closures-y-this) | Ámbito léxico, closures, `this` dinámico | ⬜ |
| 08 | [Asincronía](#08--asincronía) | Event loop, `Promise`, `async`/`await` | ⬜ |
| 09 | [Módulos y configuración](#09--módulos-y-configuración) | ESM, `tsconfig`, `tsc`, estructura de proyecto | ⬜ |
| 10 | [Errores y modelado de dominio](#10--errores-y-modelado-de-dominio) | `try/catch`, `Result<T, E>`, `class` y `enum` | ⬜ |

---

## 01 — Ejecución y tipos primitivos

El piso. Parece trivial y es donde se rompe la intuición de un lenguaje de tipado nominal.

- `let` y `const`; `var` no entra en el vocabulario.
- Inferencia: anotar variables locales suele ser ruido; anotar parámetros y retornos, no.
- Los primitivos y el `number` único: no hay `int`, `long`, `float` ni `double`.
- `null` (vacío a propósito) vs `undefined` (nunca se definió).
- **Tipado estructural**: la forma manda, no el nombre del tipo.

```ts
const edad = 34;          // inferido: 34 (literal, no number)
let total: number = 19.99;

type Punto  = { x: number; y: number };
type Vector = { x: number; y: number };

const p: Punto = { x: 1, y: 2 };
const v: Vector = p;      // Compila: mismo tipo, misma forma.
```

**Error clásico**

```ts
0.1 + 0.2   // 0.30000000000000004
10 / 3      // 3.3333333333333335 — no hay división entera
```

Para dinero: enteros en centavos o una librería decimal. Nunca flotantes.

**Viniendo de Java** — Ahí `Perro` no es `Gato` aunque tengan los mismos campos. Aquí sí lo es: el nombre del tipo no existe en tiempo de ejecución, es una etiqueta para el compilador.

---

## 02 — Operadores y coerción

El bloque que más bugs ahorra. Hay que estudiarlo aunque parezca básico.

- `===` siempre, `==` nunca — y saber exactamente por qué.
- Truthy y falsy: `0`, `""`, `NaN`, `null`, `undefined`, `0n`.
- `??` (nullish) vs `||` (falsy).
- Encadenamiento opcional `?.` en propiedades, llamadas e índices.

```ts
const puerto = config.puerto ?? 3000;   // solo si es null/undefined
const puertoMal = config.puerto || 3000; // 0 se convierte en 3000 — bug

usuario?.perfil?.avatar          // undefined si algo falta, sin explotar
callback?.()                     // solo llama si existe
```

**Error clásico**

```ts
[] == false     // true
"0" == false    // true
null == undefined // true
null === undefined // false
```

Nada de esto hay que memorizarlo: hay que usar `===` y desaparece el problema.

---

## 03 — Control de flujo y colecciones

Iterar ya se sabe. Lo que cambia son las estructuras y qué métodos mutan.

- `for...of` (valores) vs `for...in` (llaves, incluye heredadas).
- Arrays: `push`, `slice` (copia) vs `splice` (muta), `includes`, `indexOf`.
- El objeto como diccionario y su tipo `Record<string, T>`.
- `Map` y `Set`: cuándo superan al objeto plano.

```ts
const stock: Record<string, number> = { "PC-01": 8, "PC-02": 4 };

for (const [id, ram] of Object.entries(stock)) {
  console.log(`${id} → ${ram} GB`);
}

const vistos = new Set<string>();
const porId  = new Map<string, Alumno>();   // llaves no-string, orden garantizado
```

**Error clásico**

```ts
const nums = [3, 1, 2];
const ordenados = nums.sort();   // muta nums Y ordena como texto: [1, 2, 3] por suerte
[10, 9, 1].sort();               // [1, 10, 9] — orden lexicográfico

[...nums].sort((a, b) => a - b); // correcto: copia + comparador
```

---

## 04 — Funciones a fondo

Aquí empieza lo que los lenguajes orientados a clases enseñan a medias: la función como valor de primera clase.

- Declaración, expresión y arrow: las tres formas y sus diferencias reales.
- Parámetros opcionales, por defecto, `rest` y spread al invocar.
- Pasar, devolver y almacenar funciones sin envolverlas en una clase.
- Tipar firma y retorno; `void` vs `undefined`.

```ts
type Validador = (valor: string) => boolean;

const noVacio: Validador = (v) => v.trim().length > 0;

const componer = <T>(...fns: Array<(x: T) => T>) =>
  (valor: T): T => fns.reduce((acc, fn) => fn(acc), valor);

function crear(nombre: string, grado = 1, ...tags: string[]) { /* ... */ }
```

**Error clásico**

```ts
// Declaración: se puede llamar antes de declararla (hoisting)
saludar();
function saludar() {}      // funciona

// Expresión / arrow: no
despedir();                // ReferenceError
const despedir = () => {};
```

---

## 05 — El sistema de tipos

El corazón de TypeScript, y el bloque más largo a propósito. Todo lo demás de esta lista es JavaScript.

- `interface` vs `type`: qué puede cada uno.
- Uniones `A | B` e intersecciones `A & B`.
- Tipos literales y **uniones discriminadas**.
- **Narrowing**: `typeof`, `in`, `instanceof`, type predicates.
- Genéricos `<T>` y restricciones con `extends`.
- Utility types: `Partial`, `Pick`, `Omit`, `Readonly`, `Record`.
- `unknown` como reemplazo disciplinado de `any`.

```ts
type Equipo =
  | { id: string; estado: "operativo" }
  | { id: string; estado: "en_reparacion"; desde: string }
  | { id: string; estado: "baja"; motivo: string };

function mensaje(e: Equipo): string {
  switch (e.estado) {
    case "operativo":      return `${e.id} listo`;
    case "en_reparacion":  return `${e.id} en taller desde ${e.desde}`;
    case "baja":           return `${e.id} dado de baja: ${e.motivo}`;
  }
  // Sin default: agregar un estado nuevo rompe la compilación aquí.
}

function primero<T>(items: readonly T[]): T | undefined {
  return items[0];
}
```

**Criterio de dominio del bloque**: agregar un cuarto estado a la unión debe **romper la compilación** de `mensaje`, señalando el `switch`. El compilador como lista de pendientes.

**Viniendo de Java** — Media docena de jerarquías de herencia que allá resolverías con clases y un *visitor*, aquí son una unión discriminada de cuatro líneas. Y no genera código en el bundle.

---

## 06 — Inmutabilidad y transformación de datos

Prerrequisito duro de React. Sin este cambio de mentalidad, el framework se siente hostil.

- `map`, `filter`, `reduce` hasta que salgan sin pensar.
- `find`, `some`, `every`, `sort` — y saber cuáles mutan.
- Spread para copiar objetos y arrays sin tocar el original.
- Destructuring de objetos y arrays, anidado y con valores por defecto.

```ts
const activos = alumnos.filter((a) => a.activo);
const nombres = activos.map((a) => a.nombre);
const suma    = notas.reduce((acc, n) => acc + n, 0);

// Copiar en lugar de mutar
const actualizado = { ...alumno, grado: 3 };
const conNuevo    = [...lista, nuevo];

// Destructuring
const { nombre, observaciones = "sin notas" } = alumno;
const [primero, ...resto] = lista;
```

**Error clásico**

```ts
const copia = { ...original };   // copia superficial
copia.direccion.calle = "otra";  // ¡también cambia original!

const profunda = structuredClone(original);  // copia real
```

---

## 07 — Scope, closures y `this`

Explica la mitad de los errores raros de JavaScript.

- Ámbito léxico, bloques y hoisting.
- Closure: una función que recuerda el entorno donde nació.
- `this` dinámico: se decide al llamar, no al declarar.
- Arrow functions como regla práctica para no pelear con `this`.

```ts
function contador() {
  let n = 0;                    // vive mientras exista la función devuelta
  return () => ++n;
}

const siguiente = contador();
siguiente(); // 1
siguiente(); // 2
```

**Error clásico**

```ts
const timer = {
  segundos: 0,
  iniciarMal() {
    setInterval(function () {
      this.segundos++;          // this ya no es timer
    }, 1000);
  },
  iniciarBien() {
    setInterval(() => {
      this.segundos++;          // arrow: this léxico, correcto
    }, 1000);
  },
};
```

**Viniendo de Java** — El `this` de acá no es una referencia a la instancia: es un parámetro implícito que cambia según **cómo** se invoca la función.

---

## 08 — Asincronía

Solo el mecanismo. Nada de `fetch` ni red todavía: eso viene después de este repositorio.

- Event loop en una frase: un solo hilo, una cola de tareas.
- `Promise`: estados, encadenamiento y propagación de errores.
- `async`/`await` con `try`/`catch` alrededor del `await`.
- `Promise.all` vs esperar en secuencia.
- Tipar lo asíncrono: `Promise<T>`.

```ts
const esperar = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function procesar(ids: string[]): Promise<Resultado[]> {
  try {
    // En paralelo: los tres arrancan a la vez
    return await Promise.all(ids.map((id) => cargar(id)));
  } catch (error: unknown) {
    console.error(error);
    return [];
  }
}
```

**Error clásico**

```ts
// Secuencial sin necesidad: 3 segundos
for (const id of ids) await cargar(id);

// Paralelo: 1 segundo
await Promise.all(ids.map(cargar));

// Y el olvido más caro de todos:
const datos = cargar(id);        // Promise<Datos>, no Datos
const datos2 = await cargar(id); // Datos
```

---

## 09 — Módulos y configuración

Lo mínimo para que el código compile y corra sin copiar el boilerplate de alguien más.

- `export` / `import` en ESM: nombrados vs `default`.
- `tsconfig.json`: `strict: true`, `target`, `module`, `outDir`.
- Compilar con `tsc` y ejecutar el resultado en Node.
- Estructura mínima de proyecto y qué hace realmente `package.json`.

```ts
// alumno.ts
export type Alumno = { nombre: string; grado: number };
export const crear = (nombre: string): Alumno => ({ nombre, grado: 1 });

// main.ts
import { crear, type Alumno } from "./alumno.js";
```

> En ESM el `import` lleva la extensión `.js` aunque el archivo fuente sea `.ts`: se importa lo que existirá **después** de compilar.

**Regla del repo**: exports nombrados. `export default` complica el renombrado, el autocompletado y el refactor por poca ganancia.

---

## 10 — Errores y modelado de dominio

Al final a propósito: ya se sabe hacer, pero en TypeScript moderno se resuelve distinto.

- `throw`, `try`, `catch`, `finally`, y el `catch` de tipo `unknown`.
- Por qué TypeScript no tiene excepciones declaradas en la firma.
- El patrón `Result<T, E>` con uniones discriminadas.
- `class` y `enum`: qué sí, y por qué se usan menos de lo esperado.

```ts
type Result<T, E = string> =
  | { ok: true;  valor: T }
  | { ok: false; error: E };

function dividir(a: number, b: number): Result<number> {
  if (b === 0) return { ok: false, error: "División entre cero" };
  return { ok: true, valor: a / b };
}

const r = dividir(10, 0);
if (r.ok) console.log(r.valor);   // narrowing: aquí valor existe
else      console.error(r.error); // y aquí error
```

**Error clásico**

```ts
try {
  riesgoso();
} catch (e) {
  console.log(e.message);      // e es unknown: no compila
}

// Correcto:
catch (e: unknown) {
  const msg = e instanceof Error ? e.message : String(e);
}
```

**Viniendo de Java** — Sin *checked exceptions*, el contrato de error vive en el tipo de retorno o no vive en ningún lado. Es una decisión explícita, no un descuido del lenguaje.

---

## Ejercicios

Los ejercicios están en `src/ejercicios/`. Reglas para todos: **sin `any`, sin `as`, sin `!`**, y con `strict: true`.

### 1. Boletas con calificaciones incompletas

Promediar proyectos donde un `null` significa "no entregado" — que no es lo mismo que cero. Salida esperada: `"Ana Torres: 9.0"` o `"Sofía Ruiz: sin evaluar"`.

*Lo que enseña*: opcionales, `number | null`, y que TypeScript hace **narrowing sobre variables, no sobre llamadas a funciones**.

### 2. Inventario del aula de cómputo

Modelar equipos cuyos campos dependen de su estado (`desde` solo si está en reparación, `motivo` solo si está dado de baja) con una unión discriminada y un `switch` sin `default`.

*Lo que enseña*: uniones de literales, narrowing por discriminante y verificación de exhaustividad.

### 3. Lista de asistencia en JSON sucio

`JSON.parse` devuelve `any`. Asignarlo a `unknown`, escribir una type predicate que valide de verdad, y separar registros válidos de rechazados.

*Lo que enseña*: la frontera entre el mundo tipado y el mundo real. Es donde el tipado se gana el sueldo.

---

## Criterio de salida

La base está lista cuando se puede escribir, sin consultar nada, esta función con tipos correctos y `strict: true` activo:

```ts
function groupBy<T, K extends keyof T>(items: T[], key: K): Record<string, T[]>
```

Y explicar por qué cada parte de la firma está donde está. A partir de ahí, sí: React.

---

## Convenciones del repositorio

- Un archivo por bloque, numerado, en `src/bases/`.
- `strict: true` innegociable.
- Exports nombrados, nunca `export default`.
- Cada `as` que se escriba debe llevar un comentario justificándolo. Idealmente, no hay ninguno.
- Cada bloque incluye al menos un ejemplo que **falla a propósito**, comentado. Ver el error es parte del ejercicio.

## Recursos

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) — la documentación oficial, sorprendentemente buena
- [Type Challenges](https://github.com/type-challenges/type-challenges) — para cuando el bloque 05 se quede corto
- [TypeScript Playground](https://www.typescriptlang.org/play) — probar sin instalar nada

---

## Licencia

MIT

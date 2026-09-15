# Bloque 03 — Control de flujo y colecciones

[← Volver al índice](../../../README.md)

| | |
| --- | --- |
| **Archivo** | `src/bases/03-ControlDeFlujoyColecciones/03-ControlDeFlujoyColecciones.ts` |
| **Prerrequisitos** | [Bloque 02 — Operadores y coerción](../02-OperadoresyCoerción/02-OperadoresyCoerción.md) |
| **Siguiente** | Bloque 04 — Funciones a fondo |

---

Iterar ya lo sabes: `if`, `for` y `while` se escriben casi igual que en Java. Lo que **no** es igual son las colecciones: qué métodos modifican el original y cuáles devuelven una copia, qué pasa cuando un índice no existe, y por qué un objeto plano no es un `HashMap` aunque lo parezca.

La idea que hay que llevarse: en Java, `lista.get(10)` en una lista de 3 elementos lanza una excepción. En JavaScript, `lista[10]` devuelve `undefined` y el programa sigue como si nada. Con `noUncheckedIndexedAccess` activado (y en este repo lo está), TypeScript te obliga a manejar ese `undefined` antes de usarlo.

## Índice

1. [Condicionales y cláusulas de guarda](#1-condicionales-y-cláusulas-de-guarda)
2. [`switch` y el fallthrough](#2-switch-y-el-fallthrough)
3. [Bucles: `for`, `while` y `do...while`](#3-bucles-for-while-y-dowhile)
4. [`for...of` contra `for...in` (y `forEach`)](#4-forof-contra-forin-y-foreach)
5. [Arrays y `noUncheckedIndexedAccess`](#5-arrays-y-nouncheckedindexedaccess)
6. [Métodos que mutan y métodos que copian](#6-métodos-que-mutan-y-métodos-que-copian)
7. [Buscar en un array: `includes`, `indexOf` y el `-1`](#7-buscar-en-un-array-includes-indexof-y-el--1)
8. [`sort` ordena como texto y muta](#8-sort-ordena-como-texto-y-muta)
9. [El objeto como diccionario: `Record`](#9-el-objeto-como-diccionario-record)
10. [`Object.keys`, `values` y `entries`](#10-objectkeys-values-y-entries)
11. [`Map`: el diccionario de verdad](#11-map-el-diccionario-de-verdad)
12. [`Set`: pertenencia y duplicados](#12-set-pertenencia-y-duplicados)
13. [Modificar una colección mientras la recorres](#13-modificar-una-colección-mientras-la-recorres)
14. [¿Qué estructura uso?](#14-qué-estructura-uso)

**Al final:** [Ejercicios del bloque](#ejercicios-del-bloque) · [Checklist del bloque](#checklist-del-bloque)

---

## 1. Condicionales y cláusulas de guarda

`if` / `else if` / `else` funcionan como en Java. La diferencia es la del bloque 02: la condición **no tiene que ser booleana**, se evalúa por truthiness. Por eso aquí se escribe la comparación explícita.

```ts
const adeudo = 0;

if (adeudo) {
} // NO entra: 0 es falsy — y un adeudo de 0 es un dato real
if (adeudo > 0) {
} // lo que de verdad querías decir
```

### Cláusula de guarda (early return)

En vez de anidar `if` dentro de `if`, se descartan los casos inválidos **primero** y se sale. El caso feliz queda al final, sin sangría:

```ts
// Anidado: la lógica real está enterrada tres niveles abajo
function inscribirMal(alumno: string, grado: number, cupo: number): string {
  if (alumno.trim() !== "") {
    if (grado >= 1 && grado <= 6) {
      if (cupo > 0) {
        return `${alumno} inscrito`;
      } else {
        return "sin cupo";
      }
    } else {
      return "grado inválido";
    }
  } else {
    return "nombre vacío";
  }
}

// Con guardas: cada regla en una línea, el caso feliz al final
function inscribir(alumno: string, grado: number, cupo: number): string {
  if (alumno.trim() === "") return "nombre vacío";
  if (grado < 1 || grado > 6) return "grado inválido";
  if (cupo <= 0) return "sin cupo";

  return `${alumno} inscrito`;
}
```

Dentro de un bucle, la guarda es `continue` (salta a la siguiente vuelta) o `break` (termina el bucle).

### El ternario

Es una **expresión**: devuelve un valor. Úsalo para elegir entre dos valores, nunca para ejecutar efectos, y no lo anides.

```ts
const etiqueta = cupo > 0 ? "disponible" : "lleno"; // bien

const nivel = p >= 9 ? "A" : p >= 8 ? "B" : p >= 7 ? "C" : "D"; // ilegible: usa if o una función
cupo > 0 ? inscribir() : avisar(); // efectos en un ternario: usa if
```

---

## 2. `switch` y el fallthrough

`switch` compara con **`===`**, sin coerción. Eso significa que `case 1` nunca atrapa al string `"1"`:

```ts
const grado: string = "1"; // vino de un <select>
switch (grado) {
  case 1: // Error: Type 'number' is not comparable to type 'string'
}
```

### Fallthrough: el `break` olvidado

Si un `case` no termina en `break`, `return`, `continue` o `throw`, la ejecución **cae** al siguiente `case`. Es herencia de C y es un bug casi siempre. Este repo tiene `noFallthroughCasesInSwitch: true`, así que el compilador lo detecta:

```ts
switch (estado) {
  case "activo":
    console.log("activo");
  // Error: Fallthrough case in switch.
  case "baja":
    console.log("baja");
    break;
}
```

Agrupar casos **vacíos** sí está permitido, y es la forma idiomática de decir "estos dos hacen lo mismo":

```ts
switch (dia) {
  case "sábado":
  case "domingo":
    return "sin clases";
  default:
    return "hay clases";
}
```

### Un `const` dentro de un `case` necesita llaves

Todo el `switch` comparte un solo bloque de ámbito. Dos `case` que declaren la misma variable chocan:

```ts
switch (tipo) {
  case "llega":
    const mensaje = "llegó"; // Error: Cannot redeclare block-scoped variable 'mensaje'
    break;
  case "sale":
    const mensaje = "salió";
    break;
}

// Correcto: cada case con su propio bloque
switch (tipo) {
  case "llega": {
    const mensaje = "llegó";
    console.log(mensaje);
    break;
  }
  case "sale": {
    const mensaje = "salió";
    console.log(mensaje);
    break;
  }
}
```

> Cuando el `switch` es sobre un campo de una **unión de tipos literales**, TypeScript estrecha el tipo dentro de cada `case`. Lo usarás en el problema 1 y lo estudiarás a fondo en el bloque 05.

**Viniendo de Java** — Java 14+ tiene `switch` con flecha (`case X ->`) que no hace fallthrough. JavaScript no: aquí solo existe el `switch` clásico, con todas sus trampas.

---

## 3. Bucles: `for`, `while` y `do...while`

Idénticos a Java en sintaxis. Lo que importa es **cuándo usar cada uno**:

```ts
// for clásico: cuando el índice importa (saltos, recorrer al revés, pares de elementos)
for (let i = lista.length - 1; i >= 0; i--) {
  console.log(lista[i]);
}

// while: cuando NO sabes cuántas vueltas son. El caso típico: una fila
const fila = ["Ana", "Luis", "Sofía"];
let cupo = 2;
while (fila.length > 0 && cupo > 0) {
  const alumno = fila.shift(); // string | undefined
  if (alumno === undefined) break;
  console.log(`${alumno} pasa`);
  cupo--;
}

// do...while: el cuerpo corre al menos una vez
let intento = 0;
do {
  intento++;
} while (intento < 3 && !conectado());
```

Siempre `let` en el contador, nunca `var` (bloque 07 explica por qué `var` rompe los closures dentro de un bucle).

### `break` y `continue`

```ts
for (const nota of notas) {
  if (nota < 0) continue; // dato basura: salta a la siguiente
  if (nota > 10) break; // dato imposible: deja de procesar
  suma += nota;
}
```

Existen **etiquetas** para romper un bucle externo desde uno interno (`externo: for (...) { for (...) { break externo; } }`). Funcionan, pero casi siempre son señal de que ese bloque debería ser una función con `return`.

---

## 4. `for...of` contra `for...in` (y `forEach`)

La confusión más cara del bloque, porque **los dos compilan**.

| | Recorre | En un array da |
| --- | --- | --- |
| `for...of` | los **valores** de cualquier iterable (array, string, `Map`, `Set`) | `"Ana"`, `"Luis"` |
| `for...in` | las **llaves** enumerables de un objeto, incluidas las heredadas | `"0"`, `"1"` — **como string** |

```ts
const alumnos = ["Ana", "Luis"];

for (const a of alumnos) console.log(a); // "Ana", "Luis"

for (const i in alumnos) {
  console.log(i); // "0", "1"
  const siguiente = i + 1; // "01", "11" — el + del bloque 02
}
```

**Regla del repo:** `for...of` para arrays, `Map` y `Set`. `for...in` no se usa; para objetos está `Object.entries` (sección 10).

### ¿Y si necesito el índice?

`entries()` devuelve tuplas `[índice, valor]`, con el índice como `number`:

```ts
for (const [i, alumno] of alumnos.entries()) {
  console.log(`${i + 1}. ${alumno}`); // 1. Ana, 2. Luis
}
```

### `forEach` no es un bucle

Es un método que recibe una función. Eso tiene consecuencias:

```ts
alumnos.forEach((a) => {
  if (a === "Luis") return; // NO termina el recorrido: solo sale de esta vuelta (actúa como continue)
  if (a === "Ana") break; // Error de sintaxis: no hay break dentro de una función
});
```

Y en el bloque 08 verás la peor: `forEach` **no espera** a un `await`. Si necesitas `break`, `continue`, `return` de la función externa o `await`, usa `for...of`.

---

## 5. Arrays y `noUncheckedIndexedAccess`

El bloque 01 ya cubrió cómo se declaran. Aquí lo que importa es **leer** de ellos.

Sin la bandera, TypeScript miente:

```ts
const nombres: string[] = ["Ana"];
const tercero = nombres[2]; // TS dice: string. Runtime: undefined
tercero.toUpperCase(); // compila, y truena
```

Con `noUncheckedIndexedAccess: true`, el acceso por índice devuelve `T | undefined`:

```ts
const primero = nombres[0]; // string | undefined
primero.toUpperCase(); // Error: 'primero' is possibly 'undefined'

if (primero !== undefined) primero.toUpperCase(); // OK
(nombres[0] ?? "sin nombre").toUpperCase(); // OK
```

Lo mismo pasa con todo lo que puede no encontrar nada:

```ts
nombres.at(-1); // string | undefined — el último elemento, sin nombres[nombres.length - 1]
nombres.shift(); // string | undefined — la lista puede estar vacía
nombres.pop(); // string | undefined
```

Y lo que **no** se ve afectado: `for...of` te da `T` directo, porque ahí el elemento existe por definición. Otra razón para preferirlo sobre el `for` con índice.

```ts
for (const n of nombres) n.toUpperCase(); // n: string, sin chequeo
```

**Anota el tipo de los arrays vacíos.** `const lista = []` compila, pero el tipo lo va deduciendo el compilador con reglas raras. Declara la intención: `const lista: string[] = []`.

**Error clásico**

```ts
const salones = Array(3).fill([]); // parece una matriz de 3 listas vacías
salones[0].push("Ana");
console.log(salones); // [["Ana"], ["Ana"], ["Ana"]] — es el MISMO array tres veces

const bien = Array.from({ length: 3 }, (): string[] => []); // tres arrays distintos
```

---

## 6. Métodos que mutan y métodos que copian

`const` impide **reasignar la variable**, no modificar el array. Esto compila y cambia el contenido:

```ts
const lista = [1, 2, 3];
lista.push(4); // [1, 2, 3, 4]
lista = []; // Error: esto sí lo impide const
```

Por eso hay que saber de memoria qué métodos tocan el original:

| Mutan el original | Devuelven uno nuevo |
| --- | --- |
| `push`, `pop` | `[...lista, x]`, `slice(0, -1)` |
| `shift`, `unshift` | `slice(1)`, `[x, ...lista]` |
| `splice` | `toSpliced` · `slice` · `concat` |
| `sort` | `toSorted` |
| `reverse` | `toReversed` |
| `fill`, `lista[i] = x` | `with(i, x)` |

`toSorted`, `toReversed`, `toSpliced` y `with` son de ES2023: están disponibles porque `tsconfig.app.json` tiene `"lib": ["ES2023", ...]`.

```ts
const notas = [8, 10, 7];

const ordenadas = notas.toSorted((a, b) => a - b); // [7, 8, 10]
const sinPrimera = notas.toSpliced(0, 1); // [10, 7]
const corregida = notas.with(2, 9); // [8, 10, 9]
console.log(notas); // [8, 10, 7] — intacto
```

### `slice` contra `splice`

Se parecen en nombre y son opuestos:

```ts
const grupo = ["Ana", "Luis", "Sofía", "Diego"];

grupo.slice(1, 3); // ["Luis", "Sofía"]  — desde 1 hasta 3 (sin incluir). grupo intacto
grupo.splice(1, 2); // ["Luis", "Sofía"]  — desde 1, quita 2. grupo ahora es ["Ana", "Diego"]
```

### `readonly` como candado

Si una función no debe modificar lo que recibe, dilo en la firma. El compilador borra los métodos que mutan:

```ts
function promedio(notas: readonly number[]): number {
  notas.sort(); // Error: Property 'sort' does not exist on type 'readonly number[]'
  notas.toSorted(); // OK: no muta
  // ...
}
```

> Esto importa mucho más adelante: en React **nunca** se muta el estado. Si hoy aprendes a pensar en "copia", el bloque 06 y React salen solos.

**Viniendo de Java** — `ArrayList.remove(i)` muta y `List.of(...)` es inmutable en runtime. Aquí `readonly` es solo del compilador: en runtime el array sigue siendo modificable.

---

## 7. Buscar en un array: `includes`, `indexOf` y el `-1`

```ts
const talleres = ["Robótica", "Ajedrez", "Teatro"];

talleres.includes("Ajedrez"); // true  — ¿está? Úsalo cuando solo quieres saber eso
talleres.indexOf("Ajedrez"); // 1     — ¿dónde está?
talleres.indexOf("Música"); // -1    — no está
```

Ambos comparan con `===`: sirven para primitivos, **no para objetos** (dos objetos iguales en contenido son distintos en referencia). Para buscar por un campo hay `find` / `findIndex`, que verás completos en el bloque 06:

```ts
const alumno = lista.find((a) => a.matricula === "A-01"); // Alumno | undefined
```

Detalle de `NaN` (bloque 02): `[NaN].includes(NaN)` es `true`, pero `[NaN].indexOf(NaN)` es `-1`.

**Error clásico — `splice` con el `-1`**

`splice` acepta índices negativos: `-1` significa "el último". Si `indexOf` no encontró nada, borras un elemento que no tenía nada que ver:

```ts
const libres = ["PC-01", "PC-02", "PC-03"];

libres.splice(libres.indexOf("PC-09"), 1); // indexOf da -1 → splice(-1, 1)
console.log(libres); // ["PC-01", "PC-02"] — PC-03 desapareció sin razón

// Correcto: la guarda que casi nadie escribe
const pos = libres.indexOf("PC-09");
if (pos !== -1) libres.splice(pos, 1);
```

Compila perfecto. Ningún tipo te protege: `-1` es un `number` válido.

---

## 8. `sort` ordena como texto y muta

Dos sorpresas en un solo método:

```ts
const edades = [10, 9, 1];
edades.sort(); // [1, 10, 9] — sin comparador, convierte a string y compara texto
console.log(edades); // [1, 10, 9] — y además modificó el original
```

La forma correcta: **copia + comparador**.

```ts
edades.toSorted((a, b) => a - b); // [1, 9, 10] ascendente
edades.toSorted((a, b) => b - a); // [10, 9, 1] descendente

nombres.toSorted((a, b) => a.localeCompare(b, "es")); // texto en español (bloque 02)
```

El comparador devuelve un número: negativo si `a` va antes, positivo si va después, `0` si da igual.

### Ordenar por varios criterios

`||` es útil aquí precisamente por lo que hace con el `0` (bloque 02): si la primera comparación empata, pasa a la segunda.

```ts
// Por promedio descendente; si empatan, por nombre
alumnos.toSorted((a, b) => b.promedio - a.promedio || a.nombre.localeCompare(b.nombre, "es"));
```

`sort` es **estable** desde ES2019: los elementos que empatan conservan su orden original.

**Viniendo de Java** — `Collections.sort(List<Integer>)` usa el orden natural de `Integer`. Aquí no existe "orden natural": sin comparador, todo es texto.

---

## 9. El objeto como diccionario: `Record`

Durante años, la única forma de tener un diccionario en JavaScript fue un objeto plano. Su tipo es `Record<Llave, Valor>`:

```ts
const stock: Record<string, number> = { "PC-01": 8, "PC-02": 4 };

stock["PC-03"] = 16; // agregar
delete stock["PC-01"]; // quitar
const ram = stock["PC-99"]; // number | undefined — por noUncheckedIndexedAccess
```

### `Record` con llaves conocidas

Si las llaves son un conjunto cerrado, usa una unión. El compilador exige **todas** y deja de agregar `undefined`:

```ts
type Turno = "matutino" | "vespertino";

const cupos: Record<Turno, number> = { matutino: 30, vespertino: 25 };
const m = cupos.matutino; // number, sin undefined: la llave existe seguro

const incompleto: Record<Turno, number> = { matutino: 30 }; // Error: falta 'vespertino'
const parcial: Partial<Record<Turno, number>> = { matutino: 30 }; // OK: todas opcionales
```

### El patrón acumulador

Del bloque 02: `??=` para inicializar y luego acumular.

```ts
const porGrado: Record<string, number> = {};
for (const a of alumnos) {
  porGrado[a.grado] ??= 0;
  porGrado[a.grado] += 1;
}
```

**Error clásico — el objeto ya trae llaves**

Un objeto "vacío" `{}` hereda propiedades de `Object.prototype`: `constructor`, `toString`, `valueOf`... Si una de tus llaves se llama igual, el acumulador se rompe **en silencio**:

```ts
const conteo: Record<string, number> = {};

conteo["constructor"] ??= 0; // no asigna: conteo.constructor ya existe (es una función heredada)
conteo["constructor"] += 1; // función + 1 → coerción a texto

console.log(conteo["constructor"]); // "function Object() { [native code] }1"
```

TypeScript dice que es `number | undefined`. En runtime es un string. `"constructor"` es una palabra normal en español: puede llegar de un buscador, un formulario o un catálogo.

Las defensas:

```ts
"constructor" in {}; // true  — in también mira lo heredado: no sirve
Object.hasOwn({}, "constructor"); // false — solo propias: esta es la buena

// O, mejor: usa Map (sección 11), que no hereda llaves de nadie
```

---

## 10. `Object.keys`, `values` y `entries`

La forma de recorrer un objeto sin `for...in`:

```ts
const stock: Record<string, number> = { "PC-01": 8, "PC-02": 4 };

Object.keys(stock); // string[]            → ["PC-01", "PC-02"]
Object.values(stock); // number[]            → [8, 4]
Object.entries(stock); // [string, number][]  → [["PC-01", 8], ["PC-02", 4]]

for (const [id, ram] of Object.entries(stock)) {
  console.log(`${id} → ${ram} GB`);
}
```

Solo devuelven llaves **propias** (no las heredadas), a diferencia de `for...in`. Y la operación inversa existe:

```ts
const copia = Object.fromEntries(Object.entries(stock)); // de tuplas a objeto
```

### Por qué `Object.keys` devuelve `string[]` y no las llaves del tipo

```ts
type Alumno = { nombre: string; grado: number };
const a: Alumno = { nombre: "Ana", grado: 3 };

const llaves = Object.keys(a); // string[], no ("nombre" | "grado")[]

for (const k of llaves) {
  a[k]; // Error: expression of type 'string' can't be used to index type 'Alumno'
}
```

No es un descuido: es el **tipado estructural** del bloque 01. Un valor de tipo `Alumno` puede tener más propiedades de las que declara el tipo (cualquier objeto con `nombre` y `grado` cabe), así que el compilador no puede prometer que las llaves son solo esas dos. Si necesitas recorrer campos conocidos, lístalos tú: `const campos = ["nombre", "grado"] as const`.

### El orden de las llaves no es el de inserción

Las llaves que parecen **números enteros** se ordenan primero, de menor a mayor. Las demás respetan el orden de inserción:

```ts
const busquedas: Record<string, number> = {};
busquedas["planetas"] = 1;
busquedas["1984"] = 1;
busquedas["451"] = 1;

Object.keys(busquedas); // ["451", "1984", "planetas"] — no es el orden en que llegaron
```

Si el orden importa (un historial, un ranking por llegada, un reporte), un objeto plano **no** sirve.

---

## 11. `Map`: el diccionario de verdad

`Map` resuelve de raíz los tres problemas del objeto plano: no hereda llaves, respeta el orden de inserción siempre, y acepta llaves de cualquier tipo.

```ts
const stock = new Map<string, number>();

stock.set("PC-01", 8); // agregar o reemplazar (devuelve el Map: se puede encadenar)
stock.get("PC-01"); // number | undefined
stock.has("PC-01"); // true
stock.delete("PC-01"); // true si existía
stock.size; // no .length, no Object.keys(...).length

const inicial = new Map<string, number>([
  ["PC-01", 8],
  ["PC-02", 4],
]); // se construye con tuplas
```

Se recorre directo con `for...of`, y cada vuelta es una tupla `[llave, valor]`:

```ts
for (const [id, ram] of inicial) console.log(`${id} → ${ram} GB`);
for (const id of inicial.keys()) console.log(id);
for (const ram of inicial.values()) console.log(ram);
```

### `has` no estrecha el tipo de `get`

```ts
if (stock.has("PC-01")) {
  const ram: number = stock.get("PC-01"); // Error: number | undefined
}
```

El compilador no relaciona dos llamadas a métodos distintos (el mismo principio del bloque 02: el narrowing es sobre **variables**, no sobre llamadas). El patrón correcto es pedir una vez y revisar el resultado:

```ts
const ram = stock.get("PC-01");
if (ram !== undefined) {
  console.log(ram * 2); // number
}
```

### El acumulador con `Map`

```ts
const conteo = new Map<string, number>();
for (const palabra of palabras) {
  conteo.set(palabra, (conteo.get(palabra) ?? 0) + 1);
}
```

**Error clásico — `?.` que se traga el dato**

Un `Map` de listas donde olvidaste inicializar la llave:

```ts
const porTaller = new Map<string, string[]>();

porTaller.get("Robótica")?.push("Ana"); // get da undefined → ?. corta → Ana nunca se guardó
console.log(porTaller.size); // 0 — ni un error, ni un aviso
```

El `?.` hizo exactamente lo que dice, y por eso es peligroso: convirtió un bug en silencio. Inicializa primero, o crea la lista cuando falte:

```ts
const lista = porTaller.get("Robótica");
if (lista === undefined) porTaller.set("Robótica", ["Ana"]);
else lista.push("Ana");
```

### Lo que hay que saber de `Map`

```ts
// Las llaves objeto se comparan por referencia
const m = new Map<{ id: string }, number>();
m.set({ id: "A" }, 1);
m.get({ id: "A" }); // undefined — es otro objeto

// JSON no sabe serializarlo
JSON.stringify(new Map([["a", 1]])); // "{}" — se pierde todo
JSON.stringify(Object.fromEntries(miMap)); // así sí

// De objeto a Map
const desdeObjeto = new Map(Object.entries(stock));
```

**Viniendo de Java** — Es lo más cercano a `LinkedHashMap`: orden de inserción garantizado. Diferencias: `get` devuelve `undefined`, no `null`; y no hay `equals`/`hashCode`, así que las llaves objeto son siempre por referencia. Para llaves compuestas, arma un string: `` `${alumno}|${taller}` ``.

---

## 12. `Set`: pertenencia y duplicados

Una colección de valores **únicos**, en orden de inserción.

```ts
const conAdeudo = new Set<string>(["Luis Pérez", "Marta Gil"]);

conAdeudo.add("Diego Mora");
conAdeudo.add("Diego Mora"); // no hace nada: ya estaba
conAdeudo.has("Luis Pérez"); // true
conAdeudo.delete("Marta Gil");
conAdeudo.size; // 2

for (const alumno of conAdeudo) console.log(alumno);
```

### Los dos usos que más vas a escribir

```ts
// 1. Quitar duplicados
const grados = [3, 1, 3, 2, 1];
const unicos = [...new Set(grados)]; // [3, 1, 2] — conserva la primera aparición

// 2. Preguntar "¿ya lo vi?" dentro de un bucle
const vistos = new Set<string>();
for (const folio of folios) {
  if (vistos.has(folio)) continue; // duplicado
  vistos.add(folio);
  procesar(folio);
}
```

¿Por qué no `array.includes`? Porque `includes` recorre el array completo en cada llamada. Dentro de un bucle de 10 000 elementos, son 10 000 × 10 000 comparaciones. `Set.has` es prácticamente instantáneo sin importar el tamaño.

### Operaciones de conjuntos

`union`, `intersection` y `difference` existen como métodos desde ES2025, pero este repo compila con `lib: ES2023`:

```ts
new Set([1]).union(new Set([2])); // Error: Property 'union' does not exist on type 'Set<number>'
```

Se escriben a mano, y es buen ejercicio:

```ts
const robotica = new Set(["Ana", "Sofía", "Diego"]);
const ajedrez = new Set(["Ana", "Luis", "Sofía"]);

const ambos = [...robotica].filter((a) => ajedrez.has(a)); // intersección: ["Ana", "Sofía"]
const soloRobotica = [...robotica].filter((a) => !ajedrez.has(a)); // diferencia: ["Diego"]
const todos = new Set([...robotica, ...ajedrez]); // unión: 4 alumnos
```

**Error clásico — un `Set` de objetos no quita duplicados**

```ts
const solicitudes = new Set([
  { alumno: "Ana", taller: "Robótica" },
  { alumno: "Ana", taller: "Robótica" },
]);
solicitudes.size; // 2 — mismo contenido, distinta referencia

// Correcto: deduplicar por una llave de texto
const vistas = new Set<string>();
const clave = `${s.alumno}|${s.taller}`;
```

---

## 13. Modificar una colección mientras la recorres

Borrar elementos de un array mientras lo recorres con índice **salta elementos**:

```ts
const notas = [1, 2, 2, 3];
for (let i = 0; i < notas.length; i++) {
  if (notas[i] === 2) notas.splice(i, 1); // al borrar, todo se recorre una posición a la izquierda
}
console.log(notas); // [1, 2, 3] — el segundo 2 se escapó
```

Las salidas, de mejor a peor:

```ts
// 1. No mutar: construir la colección nueva (bloque 06 lo hace con filter)
const sinDos: number[] = [];
for (const n of notas) if (n !== 2) sinDos.push(n);

// 2. Si tienes que mutar: recorrer al revés
for (let i = notas.length - 1; i >= 0; i--) {
  if (notas[i] === 2) notas.splice(i, 1);
}
```

`Map` y `Set` sí toleran `delete` durante un `for...of` (el elemento borrado simplemente ya no aparece), pero "funciona" no es lo mismo que "se lee bien": prefiere igual construir una colección nueva.

---

## 14. ¿Qué estructura uso?

| Necesito... | Usa | Por qué |
| --- | --- | --- |
| Una lista ordenada, con posiciones y duplicados | `T[]` | Es lo natural |
| Una lista que la función no debe modificar | `readonly T[]` | El compilador borra los métodos que mutan |
| Llaves fijas y conocidas de antemano | `Record<Union, T>` | Exige todas las llaves, sin `undefined` |
| Un diccionario con llaves que llegan de fuera | `Map<K, V>` | No hereda llaves, respeta orden, `size` directo |
| Un diccionario que va a `JSON` tal cual | `Record<string, T>` | `Map` se serializa como `{}` |
| Saber si algo ya está / quitar duplicados | `Set<T>` | `has` rápido, unicidad garantizada |
| Llave compuesta (dos o más campos) | `Map` o `Set` con llave string | Los objetos se comparan por referencia |

> La pregunta que decide entre `Record` y `Map`: **¿las llaves las escribo yo, o las escribe el usuario?** Si las escribes tú, `Record`. Si llegan de un formulario, un archivo o un buscador, `Map`.

---

## Ejercicios del bloque

**Orden sugerido: 1 → 2 → 3.** El primero es control de flujo puro sobre arrays que se mutan a propósito (una fila real); el segundo enfrenta `Record` contra `Map` con datos donde el objeto plano falla; el tercero combina `Map` y `Set` con reglas de negocio encadenadas.

Reglas para los tres: **sin `any`, sin `as`, sin `!`**, con `strict: true` y `noUncheckedIndexedAccess: true`. Nada de `for...in` ni `forEach`: estos tres se resuelven con `for...of`, `while`, `break` y `continue`. (`map`, `filter` y `reduce` son del bloque 06; si los necesitas aquí, probablemente estás pensando el problema al revés.)

Crea cada solución como `03-ControlDeFlujoyColecciones-ProblemaN.ts` en esta carpeta e impórtala desde `src/main.tsx`.

### Problema 1 — Turnos del laboratorio de cómputo

**Escenario.** El laboratorio tiene cuatro computadoras y una fila de alumnos esperando. Un lector registra lo que pasa durante la hora: alumnos que llegan, equipos que se liberan, equipos que fallan y el cierre del laboratorio. El prefecto quiere saber, al final, quién se quedó sin turno.

```ts
type Evento =
  | { tipo: "llega"; alumno: string }
  | { tipo: "libera"; equipo: string }
  | { tipo: "falla"; equipo: string }
  | { tipo: "cierre" };

const equiposIniciales: readonly string[] = ["PC-01", "PC-02", "PC-03", "PC-04"];
const filaInicial: readonly string[] = ["Ana", "Luis"];

const eventos: readonly Evento[] = [
  { tipo: "falla", equipo: "PC-09" }, // no existe
  { tipo: "falla", equipo: "PC-03" }, // estaba libre
  { tipo: "llega", alumno: "Sofía" },
  { tipo: "llega", alumno: "Diego" },
  { tipo: "falla", equipo: "PC-02" }, // la está usando Luis
  { tipo: "libera", equipo: "PC-01" },
  { tipo: "llega", alumno: "   " }, // lectura vacía
  { tipo: "libera", equipo: "PC-02" }, // se libera, pero está descompuesta
  { tipo: "llega", alumno: "Marta" },
  { tipo: "cierre" },
  { tipo: "llega", alumno: "Pedro" }, // después del cierre
  { tipo: "libera", equipo: "PC-04" },
];
```

**Lo que tienes que hacer:**

1. Crea `libres` y `fila` como **copias** de los arreglos iniciales (esos son `readonly`: el compilador no te dejará mutarlos, y está bien). Crea también `descompuestos: string[]`.
2. Escribe `asignar()`: **mientras** haya equipo libre y alumno en fila, saca el primero de cada uno con `shift()` e imprime `"  Ana → PC-01"`. `shift()` devuelve `T | undefined`: manéjalo sin `!`.
3. Llama a `asignar()` una vez antes de procesar, y después de cada evento válido.
4. Recorre `eventos` con `for...of` y `entries()` (necesitas el número de evento) y un `switch` sobre `tipo`:
   - **`llega`**: si el nombre está vacío tras `trim()`, cuéntalo como inválido y `continue`. Si no, a la fila.
   - **`libera`**: si el equipo está en `descompuestos`, no regresa a `libres`. Si no, regresa.
   - **`falla`**: si el equipo no está en `equiposIniciales`, inválido y `continue`. Si está, va a `descompuestos` y, **si estaba libre**, sale de `libres` con `indexOf` + `splice`.
   - **`cierre`**: guarda cuántos eventos quedaron sin procesar y termina el recorrido con `break`.
5. Imprime el resumen final y comprueba que `equiposIniciales` y `filaInicial` siguen intactos.

**Prohibido:** `any`, `as`, `!`, `for...in`, `forEach`.

**Salida esperada:**

```text
  Ana → PC-01
  Luis → PC-02
#1 inválido: PC-09 no existe
#2 PC-03 falla (estaba libre)
#3 llega Sofía
  Sofía → PC-04
#4 llega Diego
#5 PC-02 falla (en uso)
#6 PC-01 liberada
  Diego → PC-01
#7 inválido: lectura vacía
#8 PC-02 liberada, pero está descompuesta: no vuelve
#9 llega Marta
#10 cierre
Sin atender: Marta
Libres: ninguno
Descompuestos: PC-03, PC-02
Inválidos: 2 · Sin procesar: 2
Originales: 4 equipos, 2 en fila
```

**Criterio de aceptación:**

- Quita la validación de `equiposIniciales` en `falla` y **no** revises el `-1` de `indexOf`. Córrelo: Diego debe quedarse sin turno, porque `splice(-1, 1)` borró `PC-04` en el primer evento sin que nadie lo pidiera. Anota en un comentario qué evento causó el daño y en qué evento se notó. Luego regresa las dos guardas.
- Si `break` está dentro del `switch`, solo sale del `switch`, no del `for`. Resuélvelo sin etiquetas.
- Agrega un quinto `tipo` a la unión (por ejemplo `"mantenimiento"`) sin tocar el `switch`. Observa qué te dice el compilador y qué no — lo retomamos en el bloque 05.

---

### Problema 2 — Lo más buscado en el kiosco de la biblioteca

**Escenario.** El kiosco de la biblioteca guarda todo lo que los alumnos teclean en el buscador. La bibliotecaria quiere dos reportes: las búsquedas **en el orden en que aparecieron por primera vez** (para ver tendencias del día) y el **top 3**. Los alumnos escriben como escriben: con mayúsculas, espacios de más y, a veces, nada.

```ts
const busquedas: readonly string[] = [
  "Dinosaurios",
  "1984",
  "  principito",
  "constructor",
  "dinosaurios ",
  "451",
  "Principito",
  "",
  "1984",
  "Constructor",
  "planetas",
  "DINOSAURIOS",
];
```

**Lo que tienes que hacer:**

1. Escribe `normalizar(texto: string): string` — sin espacios alrededor y en minúsculas.
2. Escribe `contarConRecord(bs: readonly string[]): Record<string, number>` con el patrón `??=` + `+=`. Ignora las búsquedas vacías con `continue`.
3. Escribe `contarConMap(bs: readonly string[]): Map<string, number>` con `get` + `?? 0` + `set`.
4. Imprime los dos conteos recorriéndolos (`Object.entries` y `for...of` directo sobre el `Map`).
5. Escribe `contarConRecordSeguro` que arregle el `Record` usando `Object.hasOwn`.
6. Escribe `top(conteo: Map<string, number>, n: number)` que devuelva los `n` más buscados: por cantidad descendente y, si empatan, alfabético con `localeCompare("es")`. **El `Map` original no se modifica**: conviértelo con `[...conteo]` y usa `toSorted`.

**Salida esperada:**

```text
[Record]
  451: 1
  1984: 2
  dinosaurios: 3
  principito: 2
  constructor: function Object() { [native code] }11
  planetas: 1
[Record + hasOwn]
  451: 1
  1984: 2
  dinosaurios: 3
  principito: 2
  constructor: 2
  planetas: 1
[Map]
  dinosaurios: 3
  1984: 2
  principito: 2
  constructor: 2
  451: 1
  planetas: 1
Top 3:
  1. dinosaurios (3)
  2. 1984 (2)
  3. constructor (2)
```

**Criterio de aceptación:**

- Tu `[Record]` **debe** reproducir los dos bugs: `"constructor"` convertido en texto, y `"451"` / `"1984"` al principio aunque llegaron después de `"dinosaurios"`. Si no los ves, no usaste `??=` sobre un objeto `{}` — y ver fallar eso es el punto del ejercicio.
- Fíjate que `contarConRecordSeguro` arregla `constructor` pero **no** el orden. Anota en un comentario por qué ningún `hasOwn` puede arreglar el orden, y qué estructura lo resolvió sin código extra.
- Fíjate también que TypeScript tipó el valor de `"constructor"` como `number | undefined` durante todo el programa, y en runtime era un `string`. Escribe en una línea qué parte del sistema de tipos te mintió.

---

### Problema 3 — Inscripción a talleres extraescolares

**Escenario.** Se abrieron los talleres de la tarde. El formulario en línea recibió las solicitudes en orden de llegada, con los problemas de siempre: alumnos que dieron doble clic, un taller que no existe, un alumno con adeudo que no puede inscribirse, y una regla de la dirección: **nadie toma más de 2 talleres**.

```ts
type Solicitud = { alumno: string; taller: string };

const cupos = new Map<string, number>([
  ["Robótica", 2],
  ["Ajedrez", 3],
  ["Teatro", 2],
  ["Pintura", 1],
]);

const conAdeudo = new Set<string>(["Luis Pérez"]);
const MAX_TALLERES = 2;

const solicitudes: readonly Solicitud[] = [
  { alumno: "Ana Torres", taller: "Robótica" },
  { alumno: "Luis Pérez", taller: "Ajedrez" },
  { alumno: "Sofía Ruiz", taller: "Robótica" },
  { alumno: "Ana Torres", taller: "Robótica" }, // doble clic
  { alumno: "Diego Mora", taller: "Robótica" },
  { alumno: "Ana Torres", taller: "Ajedrez" },
  { alumno: "Ana Torres", taller: "Teatro" },
  { alumno: "Diego Mora", taller: "Ajedrez" },
  { alumno: "Sofía Ruiz", taller: "Ajedrez" },
  { alumno: "Marta Gil", taller: "Música" },
  { alumno: "Marta Gil", taller: "Ajedrez" },
];
```

**Lo que tienes que hacer:**

1. Crea las estructuras de trabajo, eligiendo tú entre `Map`, `Set` y array para cada una (y justifica en un comentario cada elección con la tabla de la sección 14):
   - las solicitudes ya vistas,
   - los inscritos por taller,
   - la lista de espera por taller,
   - cuántos talleres lleva cada alumno,
   - los rechazos con su motivo.
2. **Antes** de procesar, inicializa inscritos y espera con una lista vacía por cada taller, recorriendo `cupos.keys()`.
3. Procesa las solicitudes en orden con cláusulas de guarda y `continue`. Las reglas se evalúan **en este orden**, y la primera que aplique decide:
   1. Duplicada (mismo alumno y taller ya visto) → se ignora y se cuenta.
   2. El taller no existe → rechazada.
   3. El alumno tiene adeudo → rechazada.
   4. El alumno ya tiene `MAX_TALLERES` → rechazada.
   5. El taller está lleno → lista de espera.
   6. Si nada de lo anterior → inscrito.
4. Calcula, a partir de lo que construiste:
   - los talleres que se quedaron sin inscritos,
   - los alumnos inscritos **a la vez** en Robótica y Ajedrez (intersección con `Set.has`),
   - los alumnos distintos inscritos en cualquier taller, ordenados alfabéticamente sin mutar nada.

**Salida esperada:**

```text
Inscritos:
  Robótica (2/2): Ana Torres, Sofía Ruiz
  Ajedrez (3/3): Ana Torres, Diego Mora, Sofía Ruiz
  Teatro (0/2): —
  Pintura (0/1): —
Lista de espera:
  Robótica: Diego Mora
  Ajedrez: Marta Gil
Rechazadas:
  Luis Pérez → Ajedrez: tiene adeudo
  Ana Torres → Teatro: ya tiene 2 talleres
  Marta Gil → Música: el taller no existe
Duplicadas ignoradas: 1
Talleres sin inscritos: Teatro, Pintura
En Robótica y Ajedrez: Ana Torres, Sofía Ruiz
Alumnos distintos inscritos (3): Ana Torres, Diego Mora, Sofía Ruiz
```

**Criterio de aceptación:**

- Antes de usar la llave de texto, intenta deduplicar con `new Set(solicitudes)` e imprime su `size`. Debe darte `11`, no `10`. Anota por qué en un comentario.
- Comenta la inicialización del paso 2 y usa `inscritos.get(taller)?.push(alumno)`. El programa no truena, pero Teatro y Pintura desaparecen del reporte y **nadie** queda inscrito. Ese es el `?.` que se traga el dato de la sección 11: regresa la inicialización.
- `cupos.get(taller)` es `number | undefined`: la regla 2 ("el taller no existe") tiene que salir **de ese `undefined`**, no de un `cupos.has` aparte. Si escribiste `has` y luego `get`, notarás que el compilador te sigue pidiendo revisar el `undefined`: quita el `has`.
- Intercambia el orden de las reglas 3 y 5 y observa qué le pasa a Luis Pérez si Ajedrez ya estuviera lleno. En las reglas de negocio, el orden de las guardas **es** la regla.

---

> **Cuando tengas el 1 resuelto, pégamelo y te lo reviso como si fuera un PR:** tipos, nombres y decisiones, no solo si compila.

---

## Checklist del bloque

- [ ] Cláusulas de guarda en lugar de `if` anidados
- [ ] `switch` compara con `===`, y qué hace `noFallthroughCasesInSwitch`
- [ ] Por qué un `const` dentro de un `case` necesita llaves
- [ ] Cuándo `for` clásico, cuándo `while` y cuándo `do...while`
- [ ] `for...of` (valores) contra `for...in` (llaves como string)
- [ ] Por qué `forEach` no admite `break` ni espera un `await`
- [ ] Qué cambia `noUncheckedIndexedAccess` en `arr[i]`, `at`, `shift` y `pop`
- [ ] La tabla de métodos que mutan contra los que copian (`toSorted`, `toSpliced`, `with`)
- [ ] `slice` contra `splice`, y el `splice(-1, 1)` accidental
- [ ] `sort` sin comparador ordena como texto y muta
- [ ] `Record<string, T>` contra `Record<Union, T>`
- [ ] Las llaves heredadas (`constructor`) y `Object.hasOwn` contra `in`
- [ ] Por qué `Object.keys` devuelve `string[]`, y el orden de las llaves numéricas
- [ ] `Map`: `get` devuelve `undefined`, `has` no estrecha, y `JSON.stringify` da `{}`
- [ ] `Set` para duplicados y pertenencia; los objetos se comparan por referencia
- [ ] No borrar de un array mientras lo recorres hacia adelante
- [ ] Elegir entre array, `Record`, `Map` y `Set` con un criterio, no por costumbre

---

[← Bloque 02 — Operadores y coerción](../02-OperadoresyCoerción/02-OperadoresyCoerción.md) · [Volver al índice →](../../../README.md)

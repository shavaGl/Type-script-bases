# Bloque 02 — Operadores y coerción

[← Volver al índice](../../../README.md)

| | |
| --- | --- |
| **Archivo** | `src/bases/02-OperadoresyCoerción/02-OperadoresyCoerción.ts` |
| **Prerrequisitos** | [Bloque 01 — Ejecución y tipos primitivos](../01-ejecucionyTiposPrimitivos/01-ejecucionyTiposPrimitivos.md) |
| **Siguiente** | [Bloque 03 — Control de flujo y colecciones](../03-ControlDeFlujoyColecciones/03-ControlDeFlujoyColecciones.md) |

---

El bloque que más bugs ahorra. Parece básico y no lo es: la mitad de los errores raros de JavaScript salen de que el lenguaje **convierte tipos por su cuenta** en vez de fallar. TypeScript apaga varias de esas conversiones en tiempo de compilación, pero **no todas**, porque el código que se ejecuta sigue siendo JavaScript.

La idea que hay que llevarse: en Java `"3" + 3` no compila. En JavaScript da `"33"` y nadie te avisa.

## Índice

1. [Coerción: qué hace JavaScript cuando mezclas tipos](#1-coerción-qué-hace-javascript-cuando-mezclas-tipos)
2. [`+` está sobrecargado y es el culpable habitual](#2--está-sobrecargado-y-es-el-culpable-habitual)
3. [`===` siempre, `==` nunca](#3--siempre--nunca)
4. [Truthy y falsy](#4-truthy-y-falsy)
5. [`&&`, `||` y el valor que devuelven](#5---y-el-valor-que-devuelven)
6. [`??` no es `||`](#6--no-es-)
7. [Encadenamiento opcional `?.`](#7-encadenamiento-opcional-)
8. [Asignaciones lógicas `??=`, `||=`, `&&=`](#8-asignaciones-lógicas---)
9. [Aritmética: `NaN`, división entre cero y `%`](#9-aritmética-nan-división-entre-cero-y-)
10. [Comparaciones `<` `>` y el desastre de ordenar texto](#10-comparaciones---y-el-desastre-de-ordenar-texto)
11. [Conversión explícita: `Number`, `parseInt`, `String`, `Boolean`](#11-conversión-explícita-number-parseint-string-boolean)
12. [Operadores que además hacen narrowing](#12-operadores-que-además-hacen-narrowing)
13. [Precedencia: los paréntesis que sí importan](#13-precedencia-los-paréntesis-que-sí-importan)

**Al final:** [Ejercicios del bloque](#ejercicios-del-bloque) · [Checklist del bloque](#checklist-del-bloque)

---

## 1. Coerción: qué hace JavaScript cuando mezclas tipos

Coerción es la conversión **implícita** de tipos que hace el lenguaje para poder ejecutar una operación en vez de detenerse. Hay tres destinos posibles: número, texto o booleano.

```ts
// A booleano: lo hace if, !, &&, ||, el ternario
if ("0") {
} // entra: "0" es un string no vacío → true

// A número: lo hacen -, *, /, %, <, >
"10" - 2; // 8
true + true; // 2
[] * 1; // 0

// A texto: lo hace + si alguno de los dos lados es string
1 + "2"; // "12"
```

TypeScript bloquea la mayoría de estas expresiones cuando los tipos son conocidos:

```ts
const a: string = "10";
a - 2; // Error: el lado izquierdo debe ser number, bigint o enum
```

Pero **no bloquea nada** cuando el dato entra como `string` legítimo y tú lo usas como texto, ni cuando llega de fuera:

```ts
const grado = "3"; // vino de un <input>: siempre string
const siguiente = grado + 1; // "31" — compila perfecto, y está mal
```

> La coerción no es un bug del lenguaje: es una decisión de diseño de 1995 que ya no se puede revertir. La defensa no es memorizar la tabla, es **no dejar que los tipos se mezclen**.

---

## 2. `+` está sobrecargado y es el culpable habitual

`+` es el único operador aritmético que también concatena. Si **cualquiera** de los dos operandos es string, gana el texto:

```ts
1 + 2; // 3
"1" + 2; // "12"
1 + 2 + "3"; // "33"   ← izquierda a derecha: (1+2) = 3, luego 3 + "3"
"1" + 2 + 3; // "123"  ← el string contamina el resto
```

Los demás operadores no concatenan nunca, así que convierten a número:

```ts
"10" - 5; // 5
"10" * "2"; // 20
"10" / "a"; // NaN
```

**Error clásico**

```ts
const totalPagado = "1500"; // del formulario
const beca = 300;
console.log(totalPagado + beca); // "1500300" — y el recibo sale mal
console.log(Number(totalPagado) + beca); // 1800
```

**Viniendo de Java** — Allá `+` también concatena con `String`, pero el compilador conoce el tipo estático de todo y `int x = "1" + 2;` no compila. Aquí el problema no es el operador: es que el `string` viaja disfrazado hasta el punto donde se usa.

---

## 3. `===` siempre, `==` nunca

`==` compara **después de coercionar**. `===` compara valor y tipo, sin conversiones.

```ts
0 == "";          // true
0 == "0";         // true
"" == "0";        // false   ← y aquí se rompe la transitividad
[] == false;      // true
[] == ![];        // true
null == undefined;  // true
null === undefined; // false
NaN == NaN;       // false   ← NaN no es igual ni a sí mismo
```

Con `strict: true`, TypeScript ni siquiera te deja escribir la mayoría de estas comparaciones entre tipos que no se solapan:

```ts
const n: number = 0;
n === ""; // Error: esta comparación siempre da false
```

La única excepción defendible de `==` es `x == null`, que cubre `null` y `undefined` a la vez. Aun así, en este repositorio se escribe explícito:

```ts
if (x === null || x === undefined) {
}
```

> `==` tiene ~10 reglas de conversión. `===` tiene una. No hay nada que ganar del otro lado.

---

## 4. Truthy y falsy

Cualquier valor puede usarse donde se espera un booleano. Los **falsy** son exactamente ocho, y conviene sabérselos:

| Valor       | Nota                                     |
| ----------- | ---------------------------------------- |
| `false`     | —                                        |
| `0`         | **el que más bugs causa**                |
| `-0`        | —                                        |
| `0n`        | bigint cero                              |
| `""`        | string vacío, **el segundo que más duele** |
| `null`      | —                                        |
| `undefined` | —                                        |
| `NaN`       | —                                        |

Todo lo demás es truthy. **Todo**, incluyendo lo que no esperas:

```ts
if ([]) {
} // entra: el arreglo vacío es truthy
if ({}) {
} // entra
if ("false") {
} // entra
if (0) {
} // NO entra
```

**Error clásico**

```ts
const alumnos: string[] = [];
if (alumnos) console.log("hay alumnos"); // se imprime siempre
if (alumnos.length > 0) console.log("hay alumnos"); // correcto
```

---

## 5. `&&`, `||` y el valor que devuelven

No devuelven booleanos: devuelven **uno de los dos operandos**, y cortocircuitan.

```ts
"Ana" || "invitado"; // "Ana"     ← || devuelve el primero truthy
"" || "invitado"; // "invitado"
0 && caro(); // 0         ← && corta: caro() no se ejecuta
1 && caro(); // lo que devuelva caro()
```

El tipo que infiere TypeScript lo dice todo:

```ts
declare const nombre: string;
const etiqueta = nombre || "invitado"; // string
const flag = Boolean(nombre); // boolean — si de verdad quieres un booleano
```

---

## 6. `??` no es `||`

`??` (nullish coalescing) solo entra al lado derecho si el izquierdo es `null` o `undefined`. `||` entra con **cualquier falsy**.

```ts
const config = { puerto: 0, titulo: "", reintentos: undefined };

config.puerto ?? 3000; // 0          ← respeta el cero
config.puerto || 3000; // 3000       ← BUG: el 0 era intencional

config.titulo ?? "Sin título"; // ""  ← respeta el vacío
config.titulo || "Sin título"; // "Sin título"

config.reintentos ?? 3; // 3          ← aquí ambos coinciden
```

**Regla práctica:** para valores por defecto, `??`. `||` solo cuando de verdad quieres tratar `0` y `""` como "no hay valor" — y eso casi nunca es cierto en datos de negocio: una calificación de 0, un adeudo de 0 y un stock de 0 son datos reales.

---

## 7. Encadenamiento opcional `?.`

Corta la evaluación y devuelve `undefined` si lo de la izquierda es `null` o `undefined`. Tiene tres formas:

```ts
alumno?.tutor?.telefono; // propiedad
alumno.notificar?.(); // llamada: solo si notificar existe
grupo?.[0]; // índice
```

Lo que devuelve siempre incluye `undefined` en el tipo, y `strict` te obliga a manejarlo:

```ts
const tel: string | undefined = alumno?.tutor?.telefono;
tel.trim(); // Error
tel?.trim(); // OK: string | undefined
(tel ?? "sin teléfono").trim(); // OK: string
```

**Cuidado — `?.` no protege lo que va después de un paréntesis o de una operación:**

```ts
(alumno?.tutor).telefono;   // truena si tutor es undefined: el ?. ya se "cerró"
alumno?.tutor.telefono;     // correcto: la cadena entera se corta
alumno?.proyectos.length ?? 0; // si alumno existe pero proyectos no está tipado opcional, truena
```

Y el antipatrón: **`?.` no es para tapar tipos mal modelados.** Si un campo nunca puede faltar, ponerle `?.` esconde el bug en vez de arreglarlo.

---

## 8. Asignaciones lógicas `??=`, `||=`, `&&=`

Azúcar sintáctico que hereda exactamente la semántica de su operador:

```ts
let apodo: string | undefined;
apodo ??= "sin apodo"; // asigna solo si es null/undefined

let intentos = 0;
intentos ||= 3; // 3 — otra vez el bug del cero

const cache: Record<string, number> = {};
cache["PC-01"] ??= 0; // inicializa la llave una sola vez
cache["PC-01"] += 1;
```

Ese último patrón (`??=` para inicializar un acumulador) es el que más se usa en la práctica.

---

## 9. Aritmética: `NaN`, división entre cero y `%`

```ts
10 / 0; // Infinity   ← no lanza excepción, a diferencia de Java con enteros
-10 / 0; // -Infinity
0 / 0; // NaN
Number("hola"); // NaN
2 ** 10; // 1024
-7 % 3; // -1         ← el signo lo pone el dividendo
```

`NaN` es de tipo `number` y **no es igual a sí mismo**. Para detectarlo:

```ts
const n = Number(entrada);

n === NaN; // siempre false — nunca funciona
Number.isNaN(n); // true si n es NaN. Esta es la buena
isNaN("hola"); // true, pero coerciona el argumento primero: evítala
Number.isFinite(n); // false para NaN, Infinity y -Infinity
```

**Error clásico**

```ts
const promedio = suma / cantidad; // si cantidad es 0 → NaN o Infinity
if (!Number.isFinite(promedio)) return null; // la guarda que casi nadie escribe
```

Y el de siempre, arrastrado del bloque 01:

```ts
0.1 + 0.2 === 0.3; // false
Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON; // true — así se comparan flotantes
```

---

## 10. Comparaciones `<` `>` y el desastre de ordenar texto

Entre números funcionan como esperas. Entre strings comparan **código Unicode carácter por carácter**, no alfabéticamente:

```ts
"a" < "b"; // true
"Z" < "a"; // true   ← las mayúsculas van antes
"á" < "b"; // false  ← los acentos van después de la z
"10" < "9"; // true   ← comparación de texto: '1' < '9'
```

Y mezclando tipos, coerciona a número:

```ts
"10" < 9; // false — aquí sí convierte
```

Para ordenar nombres en español:

```ts
const nombres = ["Ávila", "Zamora", "ana", "Bravo"];

[...nombres].sort(); // ["Bravo","Zamora","ana","Ávila"] — inservible
[...nombres].sort((a, b) => a.localeCompare(b, "es")); // ["ana","Ávila","Bravo","Zamora"]
```

---

## 11. Conversión explícita: `Number`, `parseInt`, `String`, `Boolean`

Cuando hay que convertir, se convierte **a propósito y en un solo lugar**: en la frontera por donde entra el dato.

```ts
Number("42"); // 42
Number("42abc"); // NaN      ← estricta: o todo o nada
Number(""); // 0        ← ojo con esta
Number(null); // 0        ← y con esta
Number(undefined); // NaN

parseInt("42abc", 10); // 42       ← permisiva: lee hasta donde puede
parseInt("abc", 10); // NaN
parseFloat("3.14cm"); // 3.14

String(42); // "42"
(42).toFixed(2); // "42.00"
Boolean(""); // false
```

**Criterio:** `Number` para validar entradas (un `"42abc"` en un formulario es un error, no un 42). `parseInt` solo cuando de verdad quieres extraer el número de un texto sucio, y **siempre con la base 10**.

**Error clásico**

```ts
const grado = Number(""); // 0 — el campo estaba vacío y quedó "primero de primaria"

// Correcto: validar el vacío antes de convertir
const crudo = "".trim();
const grado2 = crudo === "" ? null : Number(crudo);
```

---

## 12. Operadores que además hacen narrowing

Estos operadores no solo evalúan: **le enseñan tipos al compilador** dentro de la rama. Es la puerta de entrada al bloque 05.

```ts
function describir(v: string | number | null): string {
  if (v === null) return "vacío"; // aquí v es null
  if (typeof v === "number") return v.toFixed(2); // aquí v es number
  return v.toUpperCase(); // aquí v es string, sin escribirlo
}

// in — para distinguir formas de objeto
if ("motivo" in equipo) equipo.motivo;

// instanceof — para clases y builtins
if (e instanceof Error) e.message;

// Array.isArray — para lo que viene de JSON
if (Array.isArray(datos)) datos.length;
```

Y el que **no** hace narrowing y hay que tener presente:

```ts
if (Boolean(v)) v.toUpperCase(); // Error: la llamada no estrecha nada
if (v) v.toUpperCase(); // OK: la condición sí
```

> Ese es el mismo principio del problema 1 del bloque 01: TypeScript hace narrowing sobre **variables**, no sobre llamadas a funciones.

---

## 13. Precedencia: los paréntesis que sí importan

`??` **no se puede mezclar** con `||` o `&&` sin paréntesis. Es un error de sintaxis, y está puesto a propósito:

```ts
a || b ?? c; // Error de sintaxis
(a || b) ?? c; // OK
a || (b ?? c); // OK — y significa otra cosa
```

Las trampas más comunes de precedencia:

```ts
"Total: " + 1 + 2; // "Total: 12"    ← + es izquierda a derecha
"Total: " + (1 + 2); // "Total: 3"

!("a" === "b"); // true
(!"a") === "b"; // false — ! se aplica antes que ===

const activo = a === 1 || (b === 2 && c === 3); // && aprieta más que ||
```

Regla del repo: si tienes que pensar dos segundos en la precedencia, pon los paréntesis. No los cobran.

---

## Ejercicios del bloque

**Orden sugerido: 1 → 2 → 3.** El primero es `??` contra `||` con datos donde el cero es real; el segundo, la frontera del formulario (todo llega como texto); el tercero, `?.` y coerción encadenadas sobre datos incompletos de verdad.

Reglas para los tres: **sin `any`, sin `as`, sin `!`**, y con `strict: true`.

### Problema 1 — Configuración del kiosco de la biblioteca

**Escenario.** La pantalla táctil de la biblioteca lee su configuración de un archivo que llena el prefecto a mano. Casi todos los campos son opcionales, y **el cero y el texto vacío son valores legítimos**: `minutosInactividad: 0` significa "no cerrar sesión nunca", y `mensajeBienvenida: ""` significa "no mostrar banner".

```ts
const guardadas = [
  { minutosInactividad: 0, mensajeBienvenida: "", maxLibros: 5 },
  { minutosInactividad: 15 },
  { mensajeBienvenida: "Bienvenido a la biblioteca", maxLibros: 0 },
  {},
];
```

**Lo que tienes que hacer:**

1. Define `type ConfigParcial` con los tres campos, todos opcionales, y `type Config` con los tres obligatorios.
2. Escribe `resolver(parcial: ConfigParcial): Config` que aplique los valores por defecto: `minutosInactividad: 10`, `mensajeBienvenida: "Biblioteca escolar"`, `maxLibros: 3`.
3. Escribe `describir(c: Config): string` que devuelva, por ejemplo:
   `"Biblioteca escolar · 15 min · 3 libros"`, y `"sin banner"` cuando el mensaje sea `""`, y `"sin cierre automático"` cuando los minutos sean `0`.
4. Escribe además `resolverMal` idéntica pero usando `||` en lugar de `??`, e imprime las dos salidas una junto a la otra.

**Prohibido:** `any`, `as`, `!`.

**Criterio de aceptación:** las dos funciones deben dar resultados **distintos** en la primera y la tercera configuración. Si te dan iguales, no reprodujiste el bug — y ese bug es el punto del ejercicio. Anota en un comentario cuántos de los cuatro casos cambia `||` y por qué.

**Salida esperada:**

```text
[??]  sin banner · sin cierre automático · 5 libros
[||]  Biblioteca escolar · 10 min · 5 libros      ← el 0 y el "" se perdieron
[??]  Biblioteca escolar · 15 min · 3 libros
[||]  Biblioteca escolar · 15 min · 3 libros
[??]  Bienvenido a la biblioteca · 10 min · 0 libros
[||]  Bienvenido a la biblioteca · 10 min · 3 libros  ← el 0 se perdió
[??]  Biblioteca escolar · 10 min · 3 libros
[||]  Biblioteca escolar · 10 min · 3 libros
```

---

### Problema 2 — Inscripciones que llegan de un formulario HTML

**Escenario.** Un formulario web entrega **todo como string**, siempre. Nada de lo que llega es número ni booleano, aunque el campo se llame `edad`. Hay que validarlo antes de que entre al sistema.

```ts
const enviados = [
  { nombre: "Ana Torres", edad: "12", promedio: "9.5", beca: "true" },
  { nombre: "Luis Pérez", edad: "12años", promedio: "8", beca: "false" },
  { nombre: "  ", edad: "13", promedio: "7.2", beca: "true" },
  { nombre: "Sofía Ruiz", edad: "", promedio: "", beca: "" },
  { nombre: "Diego Mora", edad: "0", promedio: "0", beca: "false" },
];
```

**Lo que tienes que hacer:**

1. Define `type Formulario` (los cuatro campos como `string`) y `type Inscripcion` (`nombre: string`, `edad: number`, `promedio: number`, `beca: boolean`).
2. Escribe `aNumero(v: string): number | null` que devuelva `null` para `""`, para `"12años"` y para cualquier cosa que no sea un número completo. **`Number("")` es `0`: esa es la trampa del ejercicio.**
3. Escribe `aBooleano(v: string): boolean | null` — solo `"true"` y `"false"` son válidos; `""` es `null`. Nada de `Boolean(v)`, que diría que `"false"` es verdadero.
4. Escribe `validar(f: Formulario): Inscripcion | string[]`: o la inscripción completa, o la lista de errores legibles (`"edad no es un número"`, `"nombre vacío"`).
5. Procesa los cinco y reporta cuántos pasaron.

**Criterio de aceptación:**

- Diego Mora **debe pasar** con `edad: 0` y `promedio: 0`. Si tu validación lo rechaza, estás usando truthiness donde va una comparación explícita.
- Sofía Ruiz **debe fallar** con dos errores, no colarse con ceros.
- Si sustituyes `aNumero` por `Number(v)` directo, dos registros inválidos entran al sistema. Córrelo así una vez y míralo.

---

### Problema 3 — Directorio de tutores incompleto

**Escenario.** El sistema escolar tiene el directorio a medio llenar: hay alumnos sin tutor registrado, tutores sin teléfono, y un campo `contactar` que solo existe en los que autorizaron llamadas.

```ts
const directorio = [
  {
    alumno: "Ana Torres",
    tutor: { nombre: "Rosa Torres", telefono: "555-0101", contactar: () => "llamando a Rosa" },
  },
  { alumno: "Luis Pérez", tutor: { nombre: "Mario Pérez" } }, // sin teléfono
  { alumno: "Sofía Ruiz" }, // sin tutor
  { alumno: "Diego Mora", tutor: { nombre: "Elsa Mora", telefono: "", adeudo: 0 } },
];
```

**Lo que tienes que hacer:**

1. Modela `Tutor` y `Registro` con los campos opcionales donde corresponde. `contactar` es `(() => string) | undefined`.
2. Escribe `telefonoDe(r: Registro): string` usando `?.` y `??`, que devuelva el teléfono o `"sin teléfono"` — y ojo: el de Diego Mora **es** `""`, que también es "sin teléfono", pero por una razón distinta a la de Sofía. Distingue los dos casos en la salida: `"no registrado"` vs `"registrado vacío"`.
3. Escribe `avisar(r: Registro): string` que llame a `contactar` **solo si existe**, con `?.()`, y devuelva `"sin autorización"` si no.
4. Escribe `adeudoDe(r: Registro): number` que devuelva el adeudo o `0` — el de Diego ya es `0` y debe seguir siendo `0`, no convertirse en el default.
5. Construye un `Record<string, number>` de adeudos por alumno usando `??=` para inicializar.

**Criterio de aceptación:** ninguna de las cuatro funciones puede usar `!` ni `as`, y el compilador debe obligarte a manejar `undefined` en cada paso de la cadena. Si en algún punto agregas `?.` y el compilador **no** cambia el tipo del resultado, ese `?.` está de más: quítalo. Un `?.` sobrante es una mentira sobre el modelo de datos.

---

> **Cuando tengas el 1 resuelto, pégamelo y te lo reviso como si fuera un PR:** tipos, nombres y decisiones, no solo si compila.

---

## Checklist del bloque

- [ ] Qué es coerción y cuáles son los tres destinos de conversión
- [ ] Por qué `+` es distinto a los demás operadores aritméticos
- [ ] `===` contra `==`, y por qué `==` rompe la transitividad
- [ ] Los ocho valores falsy, especialmente `0` y `""`
- [ ] `&&` y `||` devuelven operandos, no booleanos
- [ ] `??` contra `||`: cuándo el default se traga un dato real
- [ ] `?.` en propiedad, llamada e índice — y cuándo sobra
- [ ] `??=` para inicializar acumuladores
- [ ] `NaN`, `Infinity` y `Number.isNaN` / `Number.isFinite`
- [ ] Ordenar texto con `localeCompare` en vez de `<`
- [ ] `Number` contra `parseInt`, y la trampa de `Number("")`
- [ ] Qué operadores hacen narrowing y por qué una llamada a función no

---

[← Bloque 01 — Ejecución y tipos primitivos](../01-ejecucionyTiposPrimitivos/01-ejecucionyTiposPrimitivos.md) · [Volver al índice](../../../README.md) · [Bloque 03 — Control de flujo y colecciones →](../03-ControlDeFlujoyColecciones/03-ControlDeFlujoyColecciones.md)

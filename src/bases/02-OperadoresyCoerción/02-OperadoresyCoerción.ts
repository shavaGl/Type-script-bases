// Problema 1 — Configuración del kiosco de la biblioteca
// El punto del ejercicio: 0 y "" son datos legítimos, no "falta de dato".

// Lo que escribe el prefecto: puede faltar cualquier campo.
type ConfigParcial = {
  minutosInactividad?: number;
  mensajeBienvenida?: string;
  maxLibros?: number;
};

// Lo que consume el kiosco: aquí ya no falta nada.
type Config = {
  minutosInactividad: number;
  mensajeBienvenida: string;
  maxLibros: number;
};

// Los defaults en un solo lugar, tipados como Config para que agregar
// un campo a Config obligue a darle default aquí.
const PREDETERMINADA: Config = {
  minutosInactividad: 10,
  mensajeBienvenida: "Biblioteca escolar",
  maxLibros: 3,
};

const guardadas: ConfigParcial[] = [
  { minutosInactividad: 0, mensajeBienvenida: "", maxLibros: 5 },
  { minutosInactividad: 15 },
  { mensajeBienvenida: "Bienvenido a la biblioteca", maxLibros: 0 },
  {},
];

// Correcta: ?? solo rellena cuando el campo es null o undefined,
// es decir, cuando de verdad no vino en el archivo.
const resolver = (parcial: ConfigParcial): Config => ({
  minutosInactividad:
    parcial.minutosInactividad ?? PREDETERMINADA.minutosInactividad,
  mensajeBienvenida:
    parcial.mensajeBienvenida ?? PREDETERMINADA.mensajeBienvenida,
  maxLibros: parcial.maxLibros ?? PREDETERMINADA.maxLibros,
});

// Idéntica salvo el operador: || rellena con cualquier falsy,
// así que se traga el 0 y el "" que el prefecto escribió a propósito.
const resolverMal = (parcial: ConfigParcial): Config => ({
  minutosInactividad:
    parcial.minutosInactividad || PREDETERMINADA.minutosInactividad,
  mensajeBienvenida:
    parcial.mensajeBienvenida || PREDETERMINADA.mensajeBienvenida,
  maxLibros: parcial.maxLibros || PREDETERMINADA.maxLibros,
});

// Una sola describir: recibe Config ya resuelta, así que no sabe ni le importa
// qué operador la produjo. Las comparaciones son explícitas (=== "" y === 0),
// no truthiness: aquí el 0 y el "" significan algo y hay que distinguirlos.
const describir = (c: Config): string => {
  const banner =
    c.mensajeBienvenida === "" ? "sin banner" : c.mensajeBienvenida;

  const cierre =
    c.minutosInactividad === 0
      ? "sin cierre automático"
      : `${c.minutosInactividad} min`;

  return `${banner} · ${cierre} · ${c.maxLibros} libros`;
};

for (const g of guardadas) {
  console.log(`[??]  ${describir(resolver(g))}`);
  console.log(`[||]  ${describir(resolverMal(g))}`);
}

// ¿Cuántos de los cuatro casos cambia ||? Dos: el primero y el tercero.
//
// 1) { minutosInactividad: 0, mensajeBienvenida: "", maxLibros: 5 }
//    0 y "" son falsy, así que || los sustituye por los defaults: se pierden
//    "no cerrar sesión nunca" y "no mostrar banner", que era justo lo pedido.
// 2) { minutosInactividad: 15 }
//    Los ausentes son undefined, que es falsy y además nullish: los dos
//    operadores hacen lo mismo. Sin diferencia.
// 3) { mensajeBienvenida: "...", maxLibros: 0 }
//    maxLibros: 0 ("préstamo suspendido") se convierte en 3 con ||.
// 4) {}
//    Todo undefined: otra vez coinciden.
//
// Regla: || y ?? solo difieren cuando el valor presente es falsy pero no nullish
// (0, -0, 0n, "", NaN, false). Para valores por defecto va ??; || solo si de
// verdad quieres tratar el 0 y el "" como "no hay dato", que casi nunca es cierto.

const crudo = `[
  {"alumno":"Ana Torres","grado":3,"asistio":true},
  {"alumno":"Luis Pérez","grado":"3","asistio":"si"},
  {"alumno":"Sofía Ruiz"},
  {"nombre":"Error","grado":2}
]`;

// Lo que queremos tener DESPUÉS de limpiar: todo con su tipo definitivo.
type Registro = {
  alumno: string;
  grado: number;
  asistio: boolean;
};

// Lo que el JSON puede traer de VERDAD: el grado llega como 3 o como "3",
// la asistencia como true o como "si". Es la única forma que sabemos normalizar.
type RegistroCrudo = {
  alumno: string;
  grado: number | string;
  asistio: boolean | string;
};

type Resultado = {
  validos: Registro[];
  rechazados: unknown[];
};

// JSON.parse devuelve any, que es "apágate, compilador". Lo atamos a unknown
// en el acto: unknown no deja hacer NADA hasta demostrar de qué se trata.
const datos: unknown = JSON.parse(crudo);

// Guarda de tipo: el `v is RegistroCrudo` es una promesa que le haces al compilador.
// Por eso el cuerpo tiene que revisar de verdad, campo por campo.
const esRegistroCrudo = (v: unknown): v is RegistroCrudo => {
  if (typeof v !== "object" || v === null) return false;
  if (!("alumno" in v) || !("grado" in v) || !("asistio" in v)) return false;

  // Tras el `in`, TypeScript sabe que las llaves existen, pero su valor sigue siendo unknown.
  return (
    typeof v.alumno === "string" &&
    (typeof v.grado === "number" || typeof v.grado === "string") &&
    (typeof v.asistio === "boolean" || typeof v.asistio === "string")
  );
};

// Devuelven null en vez de lanzar: "no supe convertir esto" es un dato, no una catástrofe.
const aNumero = (v: number | string): number | null => {
  const n = typeof v === "number" ? v : Number(v.trim());
  return Number.isFinite(n) ? n : null;
};

const aBooleano = (v: boolean | string): boolean | null => {
  if (typeof v === "boolean") return v;
  const s = v.trim().toLowerCase();
  if (s === "si" || s === "sí" || s === "true" || s === "1") return true;
  if (s === "no" || s === "false" || s === "0") return false;
  return null;
};

const normalizar = (datos: unknown): Resultado => {
  const validos: Registro[] = [];
  const rechazados: unknown[] = [];

  // Ni siquiera damos por hecho que el JSON sea un arreglo.
  if (!Array.isArray(datos)) return { validos, rechazados: [datos] };

  const filas: unknown[] = datos;
  for (const fila of filas) {
    if (!esRegistroCrudo(fila)) {
      rechazados.push(fila);
      continue;
    }

    // Aquí dentro fila ya es RegistroCrudo: fila.grado existe y es number | string.
    const grado = aNumero(fila.grado);
    const asistio = aBooleano(fila.asistio);
    if (grado === null || asistio === null) {
      rechazados.push(fila);
      continue;
    }

    validos.push({ alumno: fila.alumno, grado, asistio });
  }

  return { validos, rechazados };
};

const resultado = normalizar(datos);

console.log("--- Versión con guarda de tipo ---");
for (const r of resultado.validos) {
  console.log(
    `${r.alumno}: grado ${r.grado.toFixed(1)}, ${r.asistio ? "asistió" : "faltó"}`,
  );
}
console.log(`Rechazados (${resultado.rechazados.length}):`, resultado.rechazados);

// ---------------------------------------------------------------------------
// La versión mentirosa: `as Registro[]` no valida nada, solo silencia al compilador.
// Compila perfecto y truena en runtime al llegar a Sofía Ruiz, que no tiene grado.
// ---------------------------------------------------------------------------
const versionMentirosa = (): void => {
  const registros = JSON.parse(crudo) as Registro[];
  for (const r of registros) {
    // El compilador jura que r.asistio es boolean. El JSON opina distinto:
    // en Luis Pérez es la cadena "si" y en Sofía Ruiz no existe.
    console.log(
      `${r.alumno}: grado ${r.grado}, asistio=${r.asistio.toString().toUpperCase()}`,
    );
  }
};

console.log("--- Versión con `as Registro[]` ---");
try {
  versionMentirosa();
} catch (error) {
  console.error("Truena en runtime:", error);
}

// Problema 2 — Inscripciones que llegan de un formulario HTML
// El punto del ejercicio: un <input> siempre entrega string, aunque el campo
// se llame "edad". Convertir no es validar: Number("") da 0 y Boolean("false")
// da true, así que la conversión directa deja pasar basura como si fuera dato.

// Lo que llega del formulario: los cuatro campos son texto, sin excepción.
type Formulario = {
  nombre: string;
  edad: string;
  promedio: string;
  beca: string;
};

// Lo que consume el sistema: aquí ya no hay strings disfrazados de número.
// La frontera entre los dos tipos es justo donde vive la validación.
type Inscripcion = {
  nombre: string;
  edad: number;
  promedio: number;
  beca: boolean;
};

// Los cinco casos del enunciado, elegidos para romper la conversión ingenua:
// "12años" (Number → NaN), "" (Number → 0, la trampa), y el "0"/"0" de Diego,
// que es dato legítimo y debe pasar.
const enviados: Formulario[] = [
  { nombre: "Ana Torres", edad: "12", promedio: "9.5", beca: "true" },
  { nombre: "Luis Pérez", edad: "12años", promedio: "8", beca: "false" },
  { nombre: "  ", edad: "13", promedio: "7.2", beca: "true" },
  { nombre: "Sofía Ruiz", edad: "", promedio: "", beca: "" },
  { nombre: "Diego Mora", edad: "0", promedio: "0", beca: "false" },
];

// Devuelve null en vez de NaN: null significa "no hay número", y a diferencia
// de NaN se compara con === sin sorpresas (NaN !== NaN).
//   - trim() !== "" descarta "" y "   ", que Number convertiría en 0.
//   - isNaN(Number(v)) descarta "12años" y cualquier texto parcial;
//     Number es estricto con el string completo, parseInt no lo sería
//     (parseInt("12años") daría 12 y colaría el registro de Luis).
// El typeof sobra en TypeScript porque v ya está tipado string, pero no estorba.
const aNumero = (v: string): number | null => {
  if (typeof v === "string" && v.trim() !== "" && !isNaN(Number(v))) {
    return Number(v);
  } else {
    return null;
  }
};

// Lista blanca en vez de Boolean(v): solo "true" y "false" son respuestas,
// todo lo demás es ausencia de respuesta. Boolean("false") daría true, y
// Boolean("") daría false, que es peor: convertiría "no contestó" en "no quiere beca".
const aBoleano = (v: string): boolean | null => {
  if (v === "true") {
    return true;
  }
  if (v === "false") {
    return false;
  }

  return null;
};

// Devuelve la inscripción completa o la lista de errores: nunca un objeto a medias.
// Se acumulan todos los errores antes de decidir, para reportarle al usuario
// todo lo que tiene que corregir de una vez y no de uno en uno.
const validar = (f: Formulario): Inscripcion | string[] => {
  const errores: string[] = [];

  // === null y no !aNumero(...): con truthiness, el 0 de Diego sería falsy
  // y se reportaría como error siendo un dato válido.
  if (aNumero(f.edad) === null) {
    errores.push("edad no es un número");
  }
  // trim() para que "  " (el tercer registro) cuente como vacío.
  if (f.nombre.trim() === "") {
    errores.push("nombre vacio");
  }

  if (aBoleano(f.beca) === null) {
    errores.push("beca esta vacio");
  }

  if (aNumero(f.promedio) === null) {
    errores.push("promedio esta vacio");
  }

  if (errores.length === 0) {
    const inscripcion: Inscripcion = {
      nombre: f.nombre,
      edad: Number(f.edad),
      promedio: Number(f.promedio),
      beca: Boolean(f.promedio),
    };

    return inscripcion;
  } else {
    return errores;
  }
};

for (const e of enviados) {
  console.log(validar(e));
}

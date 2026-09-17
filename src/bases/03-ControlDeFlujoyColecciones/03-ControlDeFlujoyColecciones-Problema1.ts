type Evento =
  | { tipo: "llega"; alumno: string }
  | { tipo: "libera"; equipo: string }
  | { tipo: "falla"; equipo: string }
  | { tipo: "cierre" };

const equiposIniciales: readonly string[] = [
  "PC-01",
  "PC-02",
  "PC-03",
  "PC-04",
];
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

// 1. Copias mutables: los originales son readonly y se quedan intactos.
const libres: string[] = [...equiposIniciales];
const fila: string[] = [...filaInicial];
const descompuestos: string[] = [];

let invalidos = 0;
let sinProcesar = 0;
let cerrado = false;

// 2. Mientras haya alumno Y equipo, empareja los primeros de cada fila.
const asignar = (): void => {
  while (fila.length > 0 && libres.length > 0) {
    const alumno = fila.shift();
    const equipo = libres.shift();
    // length ya lo garantiza, pero shift() devuelve T | undefined y no usamos "!"
    if (alumno === undefined || equipo === undefined) break;
    console.log(`  ${alumno} → ${equipo}`);
  }
};

const listar = (xs: readonly string[]): string =>
  xs.length === 0 ? "ninguno" : xs.join(", ");

// 3. Una pasada antes de procesar: se atiende a quien ya estaba formado.
asignar();

// 4. entries() da el índice y el evento en el mismo for...of.
for (const [i, e] of eventos.entries()) {
  const n = i + 1;

  switch (e.tipo) {
    case "llega": {
      const nombre = e.alumno.trim();
      if (nombre === "") {
        console.log(`#${n} inválido: lectura vacía`);
        invalidos++;
        continue;
      }
      console.log(`#${n} llega ${nombre}`);
      fila.push(nombre);
      break;
    }

    case "libera":
      if (descompuestos.includes(e.equipo)) {
        console.log(
          `#${n} ${e.equipo} liberada, pero está descompuesta: no vuelve`
        );
        break;
      }
      console.log(`#${n} ${e.equipo} liberada`);
      libres.push(e.equipo);
      break;

    case "falla": {
      if (!equiposIniciales.includes(e.equipo)) {
        console.log(`#${n} inválido: ${e.equipo} no existe`);
        invalidos++;
        continue;
      }
      // indexOf devuelve -1 si no está: hay que revisarlo ANTES de splice.
      const pos = libres.indexOf(e.equipo);
      if (pos === -1) {
        console.log(`#${n} ${e.equipo} falla (en uso)`);
      } else {
        console.log(`#${n} ${e.equipo} falla (estaba libre)`);
        libres.splice(pos, 1);
      }
      descompuestos.push(e.equipo);
      break;
    }

    case "cierre":
      console.log(`#${n} cierre`);
      sinProcesar = eventos.length - n;
      cerrado = true;
      break;
  }

  // El break del case solo sale del switch: la bandera corta el for sin etiquetas.
  if (cerrado) break;

  asignar();
}

// 5. Resumen final.
console.log(`Sin atender: ${listar(fila)}`);
console.log(`Libres: ${listar(libres)}`);
console.log(`Descompuestos: ${listar(descompuestos)}`);
console.log(`Inválidos: ${invalidos} · Sin procesar: ${sinProcesar}`);
console.log(
  `Originales: ${equiposIniciales.length} equipos, ${filaInicial.length} en fila`
);

// --- Criterio de aceptación ---
// Sin la guarda de equiposIniciales y sin revisar el -1 de indexOf:
// el daño lo causa el evento #1 (falla PC-09, que no existe): indexOf da -1 y
// splice(-1, 1) borra el ÚLTIMO elemento, PC-04, que nadie pidió liberar.
// Se nota hasta el evento #6: al liberarse PC-01 solo alcanza para Sofía y
// Diego se queda sin turno, aunque PC-04 nunca falló.

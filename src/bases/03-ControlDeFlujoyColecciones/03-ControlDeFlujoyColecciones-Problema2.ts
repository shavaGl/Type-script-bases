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

const normalizar = (texto: string): string => {
  //if (texto === "") return "Nombre vacio";

  return texto.trim().toLowerCase();
};
const contarConRecord = (bs: readonly string[]): Record<string, number> => {
  const conteo: Record<string, number> = {};

  for (const palabra of bs) {
    const p = normalizar(palabra);
    if (p === "") continue;

    conteo[p] ??= 0;
    conteo[p] += 1;
  }
  return conteo;
};

const contarConRecordSeguro = (
  bs: readonly string[],
): Record<string, number> => {
  const conteo: Record<string, number> = {};

  for (const palabra of bs) {
    const p = normalizar(palabra);
    if (p === "") continue;
    const previo = Object.hasOwn(conteo, p) ? (conteo[p] ?? 0) : 0;
    conteo[p] = previo + 1;
  }
  return conteo;
};

const contarConMap = (bs: readonly string[]): Map<string, number> => {
  const conteo = new Map<string, number>();

  for (const palabra of bs) {
    const p = normalizar(palabra);
    if (p !== "") conteo.set(p, (conteo.get(p) ?? 0) + 1);
  }
  return conteo;
};

const top = (
  conteo: Map<string, number>,
  n: number,
): [string, number][] => {
  const ordenado = [...conteo].toSorted(
    ([palabraA, cantidadA], [palabraB, cantidadB]) =>
      cantidadB - cantidadA || palabraA.localeCompare(palabraB, "es"),
  );

  return ordenado.slice(0, n);
};
const rRecord = contarConRecord(busquedas);
console.log("[Record]");
for (const [p, n] of Object.entries(rRecord)) {
  console.log(`${p}: ${n}`);
}
const rRecordSeguro = contarConRecordSeguro(busquedas);
console.log("[Record + hasOwn]");
for (const [p, n] of Object.entries(rRecordSeguro)) {
  console.log(`${p}: ${n}`);
}
const rMap = contarConMap(busquedas);
console.log("[MAP]");
for (const [p, n] of rMap) {
  console.log(`${p}: ${n}`);
}
console.log("[Top 3]");
for (const [p, n] of top(rMap, 3)) {
  console.log(`${p}: ${n}`);
}

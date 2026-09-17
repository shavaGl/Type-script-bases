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
    if (p !== "") {
      conteo[p] ??= 0;
      conteo[p] += 1;
    }
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

const rRecord = contarConRecord(busquedas);
console.log("[Record]");
for (const [p, n] of Object.entries(rRecord)) {
  console.log(`${p}: ${n}`);
}

const rMap = contarConMap(busquedas);
console.log("[MAP]");
for (const [p, n] of rMap) {
  console.log(`${p}: ${n}`);
}

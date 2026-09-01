type Alumno = {
  nombre: string;
  proyectos: (number | null)[];
  observaciones?: string;
};

const grupo: Alumno[] = [
  { nombre: "Ana Torres", proyectos: [9, 8, 10] },
  { nombre: "Luis Pérez", proyectos: [7, null, 6] },
  { nombre: "Sofía Ruiz", proyectos: [] },
  { nombre: "Diego Mora", proyectos: [0, 0, 0] }, // caso que tu versión rompía
];

const promedio = (a: Alumno): number | null => {
  const validas = a.proyectos.filter((n): n is number => n !== null);
  if (validas.length === 0) return null;

  const suma = validas.reduce((acc, n) => acc + n, 0);
  return suma / validas.length;
};

const boleta = (a: Alumno): string => {
  const p = promedio(a); // ← una sola llamada, y ahora sí narrowing
  return p === null
    ? `${a.nombre}: sin evaluar`
    : `${a.nombre}: ${p.toFixed(1)}`;
};

for (const alumno of grupo) console.log(boleta(alumno));

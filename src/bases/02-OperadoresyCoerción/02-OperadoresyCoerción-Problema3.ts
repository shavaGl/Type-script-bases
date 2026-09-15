type Tutor = {
  nombre?: string;
  telefono?: string;
  contactar?: () => string | undefined;
  adeudo?: number;
};

type Registro = {
  alumno: string;
  tutor?: Tutor;
};

const telefonoDe = (r: Registro): string => {
  const telefono = r.tutor?.telefono ?? "sin telefono";
  return telefono.length === 0 ? "sin telefono" : telefono;
};

const avisar = (r: Registro): string => {
  const avisar = r.tutor?.contactar ?? "sin autorizacion";

  return String(avisar);
};

const adeudoDe = (r: Registro): number => {
  const adeudo = r.tutor?.adeudo ?? 0;

  return adeudo;
};

const directorio: Registro[] = [
  {
    alumno: "Ana Torres",
    tutor: {
      nombre: "Rosa Torres",
      telefono: "555-0101",
      contactar: () => "llamando a Rosa",
    },
  },
  { alumno: "Luis Pérez", tutor: { nombre: "Mario Pérez" } }, // sin teléfono
  { alumno: "Sofía Ruiz" }, // sin tutor
  {
    alumno: "Diego Mora",
    tutor: { nombre: "Elsa Mora", telefono: "", adeudo: 0 },
  },
];

const acc: Record<string, number> = {};

for (const d of directorio) {
  const nombre = d.alumno;
  acc[nombre] ??= 0;
  acc[nombre] += adeudoDe(d);

  console.log(
    `Alumno:  ${d.alumno}, telefono: ${telefonoDe(d)}, Avisar: ${avisar(d)}, Adeudo de: ${adeudoDe(d)}`,
  );
}
for (const [alumno, adeudo] of Object.entries(acc)) {
  console.log(`${alumno}: ${adeudo}`);
}

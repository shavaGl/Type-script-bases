// Los estados posibles son exactamente estos cuatro. Ni uno más.
type EstadoEquipo = "operativo" | "sin_teclado" | "en_reparacion" | "baja";

type EquipoBase = {
  id: string;
  ram: number;
};

// Formas distintas unidas con |: cada estado carga exactamente los campos que le tocan.
// La última rama es "todo estado que no pida campos extra", derivada de EstadoEquipo:
// así, agregar un estado a la unión de arriba lo mete solo en el tipo Equipo.
type Equipo =
  | (EquipoBase & { estado: "en_reparacion"; desde: string })
  | (EquipoBase & { estado: "baja"; motivo: string })
  | (EquipoBase & { estado: Exclude<EstadoEquipo, "en_reparacion" | "baja"> });

const inventario: Equipo[] = [
  { id: "PC-01", estado: "operativo", ram: 8 },
  { id: "PC-02", estado: "sin_teclado", ram: 4 },
  { id: "PC-03", estado: "en_reparacion", ram: 8, desde: "2026-08-14" },
  { id: "PC-04", estado: "baja", ram: 2, motivo: "fuente quemada" },
];

const mensaje = (e: Equipo): string => {
  switch (e.estado) {
    case "operativo":
      return `${e.id}: operativo, ${e.ram} GB de RAM`;
    case "sin_teclado":
      return `${e.id}: sin teclado, ${e.ram} GB de RAM`;
    case "en_reparacion":
      return `${e.id}: en reparación desde ${e.desde}`;
    case "baja":
      return `${e.id}: dado de baja por ${e.motivo}`;
  }

  // Inalcanzable mientras el switch cubra todos los estados.
  // Si agregas uno y no lo manejas arriba, el error aparece aquí y te lo nombra.
  const estadoSinManejar: never = e;
  return estadoSinManejar;
};

// Lista blanca: un estado nuevo queda fuera hasta que lo declares utilizable a propósito.
const utilizables = (equipos: readonly Equipo[]): Equipo[] =>
  equipos.filter((e) => e.estado === "operativo" || e.estado === "sin_teclado");

for (const equipo of inventario) console.log(mensaje(equipo));
console.log(
  `Utilizables: ${utilizables(inventario)
    .map((e) => e.id)
    .join(", ")}`,
);

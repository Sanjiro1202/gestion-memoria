class Particion {
  // Agregar programa
  asignarEspacioPrograma(tipoAjuste) {
    throw new Error("Este método debe ser implementado en una subclase");
  }

  // Quitar Proceso
  detenerProceso(conCompactacion) {
    throw new Error("Este método debe ser implementado en una subclase");
  }
}

export default Particion;

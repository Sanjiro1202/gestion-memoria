import Particion from "./TemplateParticiones";

class ParticionesEstaticasFijas extends Particion {
  espacioBytes;
  numParticiones;
  posicionDeAsignacionActual = 0;
  programasEnMemoria = [];
  TAM_MAXIMO_BYTES = 1024;
  constructor(espacioBytes, numParticiones) {
    super();
    this.espacioBytes = espacioBytes;
    this.numParticiones = numParticiones;
    this.iniciar();
  }
  iniciar() {
    for (let i = 0; i < this.numParticiones; i++) {
      this.programasEnMemoria.push(null);
    }
  }
  // Agregar programa
  asignarEspacioPrograma(programa) {
    if (this.posicionDeAsignacionActual >= this.numParticiones) {
      throw new Error(
        "No hay suficiente espacio para el nuevo programa, por favor quita un proceso"
      );
    }

    if (programa.tamKiB <= this.TAM_MAXIMO_BYTES) {
      this.programasEnMemoria[this.posicionDeAsignacionActual] = programa;
      let pos = this.posicionDeAsignacionActual + 1;
      if (pos === this.numParticiones) {
        this.posicionDeAsignacionActual += 1;
      } else {
        // Siguiente posición vacía
        for (; pos < this.numParticiones; pos++) {
          if (this.programasEnMemoria[pos] === null) {
            this.posicionDeAsignacionActual = pos;
            break;
          }
        }
      }
    } else {
      throw new Error("El programa excede el tamaño disponible en memoria");
    }
  }
  obtenerProgramasEnMemoria() {
    return [...this.programasEnMemoria];
  }
  mostrarProgramas() {
    console.log(this.programasEnMemoria);
  }

  // Quitar Proceso
  detenerProceso(posicion) {
    this.programasEnMemoria[posicion] = null;
    this.posicionDeAsignacionActual = posicion;
  }
}

export default ParticionesEstaticasFijas;

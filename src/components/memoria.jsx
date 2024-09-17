import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';

export default function Memoria({ memoriaTotal = 16777216, procesoPorAsignar, tipoAlgoritmo = 0, tipoParticionPorDefecto = 0 }) {
    const [memoriaDisponible, setMemoriaDisponible] = useState(memoriaTotal);
    const [procesoActualYaAsignado, setProcesoActualYaAsignado] = useState(false);
    const [proceso, setProceso] = useState();
    const [particiones, setParticiones] = useState([]);

    const asignarParticiones = (particiones) => {
        setParticiones(particiones);
    }

    const asignarMemoriaDisponible = (memoriaDisponible) => {
        setMemoriaDisponible(memoriaDisponible);
    }

    const asignarProceso = (particionesActuales, proceso) => {
        const posicionParticion = particionesActuales.findIndex(particion => particion.proceso == null && particion.tamano >= proceso.memUsar);
        particionesActuales[posicionParticion].proceso = proceso;
        const memoriaDisponibleNueva = memoriaDisponible - proceso.memUsar;
        asignarParticiones(particionesActuales);
        setProceso(procesoPorAsignar);
        return memoriaDisponibleNueva;
    }

    const marcarProcesoComoAsignado = () => {
        setProcesoActualYaAsignado(true)
    }

    const reemplazarParticiones = (tamanoProceso, tamanoParticion) => tamanoParticion == tamanoProceso ? true : false

    const existeEspacioEnMemoria = (proceso) => proceso.memUsar <= memoriaDisponible

    const existeUnaParticionConSuficienteMemoria = (particiones, proceso) =>
        particiones.some(particion => particion.tamano >= proceso.memUsar)

    const generarParticionesDinamicas = (procesoNuevo) => {
        try {
            let particionesNuevas = !particiones.length ? [{
                proceso: null,
                tamano: memoriaTotal,
                inicio: 0,
                fin: memoriaTotal,
            }] : [...particiones]
            for (let i = 0; i < particionesNuevas.length; i++) {
                if (particionesNuevas[i].proceso == null && particionesNuevas[i].tamano >= procesoNuevo.memUsar) {
                    if (reemplazarParticiones(procesoNuevo.memUsar, particionesNuevas[i].tamano)) {
                        particionesNuevas[i].proceso = procesoNuevo;
                        posicionNuevaParticion = i;
                        break;
                    }
                    let particionNueva = {
                        proceso: null,
                        tamano: 0,
                        inicio: 0,
                        fin: 0,
                    };
                    particionesNuevas[i].tamano -= procesoNuevo.memUsar;
                    particionNueva.tamano = procesoNuevo.memUsar;
                    particionNueva.inicio = particionesNuevas[i].inicio;
                    particionesNuevas[i].inicio += procesoNuevo.memUsar;
                    particionNueva.fin = particionNueva.inicio + procesoNuevo.memUsar;
                    procesoNuevo.pid === "SO" ? particionesNuevas = [particionNueva, ...particionesNuevas]
                        : particionesNuevas.splice(i, 0, particionNueva);
                    break;
                }
            }
            if (!existeUnaParticionConSuficienteMemoria(particionesNuevas, procesoNuevo)) {
                throw new Error("No existe una partición con el suficiente espacio para albergar el proceso.");
            }
            return particionesNuevas;
        }
        catch (err) {
            mensajeDeError(procesoNuevo, err.message)
        }
    }

    const generarParticionesEstaticasFijas = (cantidad) => {
        let particionesNuevas = [];
        if (memoriaTotal && cantidad) {
            const tamanoParticion = Math.floor(memoriaTotal / cantidad);
            particionesNuevas = Array(cantidad).fill(null).map((index) => ({
                proceso: null,
                tamano: tamanoParticion,
                inicio: tamanoParticion * index,
                fin: tamanoParticion * (index + 1)
            }));
        }
        return particionesNuevas;
    }

    const generarParticionesEstaticasVariables = (tamanosParticiones) => {
        let particionesNuevas = [];
        let acumulado = 0;
        particionesNuevas = tamanosParticiones.map((tamano) => {
            acumulado += tamano;
            return {
                proceso: null,
                tamano: tamano,
                inicio: acumulado - tamano,
                fin: acumulado,
            };
        });
        return particionesNuevas;
    }

    useEffect(() => {
        procesoPorAsignar !== proceso ? setProcesoActualYaAsignado(false) : null;
    }, [procesoPorAsignar])

    useEffect(() => {
        if(!procesoActualYaAsignado){
            if (tipoParticionPorDefecto == 0 || tipoParticionPorDefecto == 1) {
                const tamanos = [1024, 256, 256, 512, 512, 512, 1024, 2048, 2048, 4096, 4096].map(tamano => tamano * (1024 ^ 2)) // Tamaño de particiones en MB
                const cantidad = 16 // Número de particiones
                const tamanoOCantidad = tipoParticionPorDefecto == 0 ? cantidad : tamanos
                const particionesGeneradas = !particiones.length
                    ? tipoParticionPorDefecto == 0
                        ? generarParticionesEstaticasFijas(tamanoOCantidad) : generarParticionesEstaticasVariables(tamanoOCantidad)
                    : [...particiones];
                if (existeEspacioEnMemoria(procesoPorAsignar[0]) && existeUnaParticionConSuficienteMemoria(particionesGeneradas, procesoPorAsignar[0])) {
                    const memoriaDisponibleNueva = asignarProceso(particionesGeneradas, procesoPorAsignar[0]);
                    asignarMemoriaDisponible(memoriaDisponibleNueva);
                }
                else {
                    const msg = "Los siguientes procesos exceden memoria y no han sido asignados en un espacio en memoria:"
                    mensajeDeError(procesoPorAsignar[0], msg);
                }
            }
            if (tipoParticionPorDefecto == 2 || tipoParticionPorDefecto == 3) {
                const particionesGeneradas = generarParticionesDinamicas(procesoPorAsignar[0]);
                if (existeEspacioEnMemoria(procesoPorAsignar[0])) {
                    const memoriaDisponibleNueva = asignarProceso(particionesGeneradas, procesoPorAsignar[0]);
                    asignarMemoriaDisponible(memoriaDisponibleNueva);
                }
                else {
                    const msg = "Los siguientes procesos exceden memoria y no han sido asignados en un espacio en memoria:"
                    mensajeDeError(procesoPorAsignar[0], msg);
                }
            }
            marcarProcesoComoAsignado();
        }
    }, [tipoParticionPorDefecto, procesoPorAsignar, procesoActualYaAsignado])

    const mensajeDeError = (procesoNoAsignado, msg) => {
        msg += `\n ${procesoNoAsignado.nombre} (${procesoNoAsignado.memUsar}B)\n`;
        Swal.fire({
            title: 'Procesos no asignados',
            text: msg,
            icon: 'warning',
            confirmButtonText: 'Entendido'
        });
    }

    const eliminarProcesoSinCompactacion = (index) => {
        let particionesActuales = [...particiones];
        particionesActuales[index].proceso = null;
        const unificarAnterior = particionesActuales[index - 1].proceso == null;
        const unificarPosterior = particionesActuales[index + 1].proceso == null;
        let particionUnificada = {
            proceso: null,
            tamano: 0,
            inicio: 0,
            fin: 0
        }
        if (unificarAnterior && unificarPosterior) {
            particionUnificada.tamano = particionesActuales[index].tamano + particionesActuales[index - 1].tamano + particionesActuales[index + 1].tamano;
            particionUnificada.inicio = particionesActuales[index - 1].inicio;
            particionUnificada.fin = particionesActuales[index + 1].fin;
            particionesActuales.splice(index - 1, 3, particionUnificada)
        }
        else if (unificarAnterior) {
            particionUnificada.tamano = particionesActuales[index].tamano + particionesActuales[index - 1].tamano;
            particionUnificada.inicio = particionesActuales[index - 1].inicio;
            particionUnificada.fin = particionesActuales[index].fin;
            particionesActuales.splice(index - 1, 2, particionUnificada)
        }
        else if (unificarPosterior) {
            particionUnificada.tamano = particionesActuales[index].tamano + particionesActuales[index + 1].tamano;
            particionUnificada.inicio = particionesActuales[index].inicio;
            particionUnificada.fin = particionesActuales[index + 1].fin;
            particionesActuales.splice(index, 2, particionUnificada)
        }
        asignarParticiones(particionesActuales)
    };

    const eliminarProcesoConCompactación = (index) => {
        let particionesActuales = [...particiones];
        let particionEliminada = particionesActuales.splice(index, 1);
        particionesActuales[index].inicio = particionEliminada[0].inicio;
        particionesActuales[index].fin = particionesActuales[index].inicio + particionesActuales[index].tamano;
        for (let j = index + 1; j < particionesActuales.length - 1; j++) {
            let particionActual = particionesActuales[j];
            let particionAnterior = particionesActuales[j - 1];
            particionActual.inicio = particionAnterior.fin;
            particionActual.fin = particionActual.inicio + particionActual.tamano;
        }
        particionesActuales.at(-1).tamano += particionEliminada[0].tamano;
        asignarParticiones(particionesActuales);
    }

    const eliminarProceso = (index) => {
        let particionesActuales = [...particiones];
        particionesActuales[index].proceso = null;
        asignarParticiones(particionesActuales);
    }

    return (
        <div>
            <h3>Partición Dinámica ({tipoParticionPorDefecto == 2 ? 'Sin' : 'Con'} Compactación)</h3>
            <p>Memoria Total: {memoriaTotal}B</p>
            <div className="particion-container">
                {particiones.toReversed().map((particion, index) => (
                    <div key={particiones.length - index} className="particion">
                        <div>
                            Partición {particiones.length - index}: {particion.tamano}B (Inicio: {particion.inicio} - Fin: {particion.fin})
                        </div>
                        <div className={`estado ${particion.proceso ? 'ocupado' : 'libre'}`}>
                            {particion.proceso
                                ? `Proceso: ${particion.proceso.nombre} (${particion.proceso.memUsar}B)`
                                : 'Libre'}
                            {index != particiones.length - 1 && particion.proceso
                                ? <button className="eliminar" onClick={() => {
                                    if (tipoParticionPorDefecto == 0 || tipoParticionPorDefecto == 1) {
                                        return eliminarProceso(particiones.length - index - 1)
                                    }
                                    else {
                                        return tipoParticionPorDefecto == 2
                                            ? eliminarProcesoSinCompactacion(particiones.length - index - 1)
                                            : eliminarProcesoConCompactación(particiones.length - index - 1)
                                    }
                                }
                                }>
                                    X
                                </button>
                                : ""
                            }

                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
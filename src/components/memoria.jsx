import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';

export default function Memoria({ memoriaTotal = 16777216, procesoPorAsignar, tipoAlgoritmo, tipoParticionPorDefecto }) {
    const [memoriaDisponible, setMemoriaDisponible] = useState(memoriaTotal);
    const [procesoActualYaAsignado, setProcesoActualYaAsignado] = useState(tipoParticionPorDefecto);
    const [tipoDeParticion, setTipoDeParticion] = useState(0)
    const [particiones, setParticiones] = useState([]);

    const asignarParticiones = (particiones) => {
        setParticiones(particiones);
    }

    const asignarMemoriaDisponible = (memoriaDisponible) => {
        setMemoriaDisponible(memoriaDisponible);
    }

    const asignarProceso = (particionesActuales, proceso) => {
        let posicionParticion = 0;
        if(tipoDeParticion == 1){
            if(tipoAlgoritmo == 0){
                posicionParticion = particionesDisponibles(particionesActuales);
            }
            else if(tipoAlgoritmo == 1){
                posicionParticion = algoritmoPeorAjuste(particionesActuales, proceso);
            }
            else{
                posicionParticion = algoritmoMejorAjuste(particionesActuales, proceso);
            }
        }
        else{
            posicionParticion = particionesDisponibles(particionesActuales);
        }
        particionesActuales[posicionParticion].proceso = proceso;
        const memoriaDisponibleNueva = memoriaDisponible - proceso.memUsar;
        asignarParticiones(particionesActuales);
        return memoriaDisponibleNueva;
    }

    const algoritmoMejorAjuste = (particionesActuales, proceso) => {
        let mejorIndex = -1;
        let mejorEspacioLibre = Infinity;
        particionesActuales.forEach((particion, index) => {
            const espacioLibre = particion.tamano - (particion.proceso ? particion.proceso.memUsar : 0);
            if (!particion.proceso && espacioLibre >= proceso.memUsar && espacioLibre < mejorEspacioLibre) {
                mejorEspacioLibre = espacioLibre;
                mejorIndex = index;
            }
        });
        return mejorIndex;
    }

    const algoritmoPeorAjuste = (particionesActuales, proceso) => {
        let peorIndex = -1;
        let peorEspacioLibre = -Infinity;

        particionesActuales.forEach((particion, index) => {
            const espacioLibre = particion.tamano - (particion.proceso ? particion.proceso.memUsar : 0);
            if (!particion.proceso && espacioLibre >= proceso.memUsar && espacioLibre > peorEspacioLibre) {
                peorEspacioLibre = espacioLibre;
                peorIndex = index;
            }
        });

        return peorIndex;
    }

    const marcarProcesoComoAsignado = () => {
        setProcesoActualYaAsignado(true)
    }

    const reemplazarParticiones = (tamanoProceso, tamanoParticion) => tamanoParticion == tamanoProceso ? true : false

    const existeEspacioEnMemoria = (proceso) => proceso.memUsar <= memoriaDisponible

    const existeUnaParticionConSuficienteMemoria = (particiones, proceso) =>
        particiones.some(particion => particion.tamano >= proceso.memUsar)

    const generarParticionesDinamicas = (procesoNuevo) => {
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
        return particionesNuevas;
    }

    const generarParticionesEstaticasFijas = (cantidad) => {
        let particionesNuevas = [];
        if (memoriaTotal && cantidad) {
            const tamanoParticion = Math.floor(memoriaTotal / cantidad);
            particionesNuevas = Array(cantidad).fill(null).map((_, index) => ({
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

    const particionesDisponibles = (particionesActuales) => {
        return particionesActuales.findIndex(particion => particion.proceso == null);
    }

    const hayErroresEnAsignación = (particionesGeneradas) => {
        if (tipoDeParticion == 0 || tipoDeParticion == 1) {
            if (particionesDisponibles(particionesGeneradas) === -1) {
                const msg = "No existen más particiones para albergar el siguiente proceso:"
                mensajeDeError(procesoPorAsignar[0], msg);
                marcarProcesoComoAsignado();
                return true;
            }
        }
        if (!existeEspacioEnMemoria(procesoPorAsignar[0])) {
            const msg = "Los siguientes procesos exceden memoria y no han sido asignados en un espacio en memoria:"
            mensajeDeError(procesoPorAsignar[0], msg);
            marcarProcesoComoAsignado();
            return true;
        }
        else if (!existeUnaParticionConSuficienteMemoria(particionesGeneradas, procesoPorAsignar[0])) {
            const msg = "Para los siguientes procesos no existe una partición lo suficientemente grande y no han sido asignados en memoria:"
            mensajeDeError(procesoPorAsignar[0], msg);
            marcarProcesoComoAsignado();
            return true;
        }
        return false;
    }

    useEffect(() => {
        setProcesoActualYaAsignado(false);
    }, [procesoPorAsignar])

    useEffect(() => {
        if (tipoParticionPorDefecto !== tipoDeParticion) {
            setTipoDeParticion(tipoParticionPorDefecto);
            setParticiones([])
        }
    }, [tipoParticionPorDefecto])

    useEffect(() => {
        if (tipoDeParticion == 0 || tipoDeParticion == 1) {
            const tamanos = [1024, 4096, 256, 256, 512, 512, 512, 1024, 2048, 2048, 4096].map(tamano => tamano * 1024) // Tamaño de particiones en MB
            const cantidad = 16 // Número de particiones
            const tamanoOCantidad = tipoDeParticion == 0 ? cantidad : tamanos
            const particionesGeneradas = !particiones.length
                ? tipoDeParticion == 0
                    ? generarParticionesEstaticasFijas(tamanoOCantidad) : generarParticionesEstaticasVariables(tamanoOCantidad)
                : [...particiones];
            asignarParticiones(particionesGeneradas)
            if (!procesoActualYaAsignado) {
                if (!hayErroresEnAsignación(particionesGeneradas)) {
                    const memoriaDisponibleNueva = asignarProceso(particionesGeneradas, procesoPorAsignar[0]);
                    asignarMemoriaDisponible(memoriaDisponibleNueva);
                    marcarProcesoComoAsignado();
                }
            }
        }
        if (tipoDeParticion == 2 || tipoDeParticion == 3) {
            if (!procesoActualYaAsignado) {
                const particionesGeneradas = generarParticionesDinamicas(procesoPorAsignar[0]);
                if (!hayErroresEnAsignación(particionesGeneradas)) {
                    asignarParticiones(particionesGeneradas)
                    const memoriaDisponibleNueva = asignarProceso(particionesGeneradas, procesoPorAsignar[0]);
                    asignarMemoriaDisponible(memoriaDisponibleNueva);
                    marcarProcesoComoAsignado();
                }
            }
        }
    }, [tipoDeParticion, procesoActualYaAsignado])

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
        const memoriaDisponibleActual = memoriaDisponible + particionUnificada.tamano;
        setMemoriaDisponible(memoriaDisponibleActual)
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
            <h3>
                Partición de tipo {
                    tipoDeParticion == 0 ? 'Estática Fija' :
                        tipoDeParticion == 1 ? 'Estática Variable' :
                            tipoDeParticion == 2 ? 'Dinámica Sin Compactación' :
                                tipoDeParticion == 3 ? 'Dinámica Con Compactación' : ''
                }
            </h3>
            <p>Memoria Total: {memoriaTotal}B</p>
            <div className="particion-container">
                {particiones.toReversed().map((particion, index) => (
                    <div key={particiones.length - index} className="particion">
                        <div>
                            Partición {particiones.length - index}: {particion.tamano}B (Inicio: {particion.inicio} - Fin: {particion.fin - 1})
                        </div>
                        <div className={`estado ${particion.proceso ? 'ocupado' : 'libre'}`}>
                            {particion.proceso
                                ? `Proceso: ${particion.proceso.nombre} (${particion.proceso.memUsar}B)`
                                : 'Libre'}
                            {index != particiones.length - 1 && particion.proceso
                                ? <button className="eliminar" onClick={() => {
                                    if (tipoDeParticion == 0 || tipoDeParticion == 1) {
                                        return eliminarProceso(particiones.length - index - 1)
                                    }
                                    else {
                                        return tipoDeParticion == 2
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
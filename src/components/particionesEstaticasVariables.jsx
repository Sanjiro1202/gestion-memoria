import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2'; // Para alertas con estilo

const ParticionEstaticaVariable = ({ memoriaTotal, particionesTamano, procesos: proceso, algoritmo }) => {
  const [particiones, setParticiones] = useState([]);
  const [procesosAsignados, setProcesosAsignados] = useState(false); // Controla la asignación de procesos

  // Calcula el tamaño y los límites de las particiones
  useEffect(() => {
    let acumulado = 0;
    const nuevasParticiones = particionesTamano.map((tamano, index) => {
      acumulado += tamano;
      return {
        id: index + 1,
        tamano: tamano,
        hasta: acumulado, // Hasta dónde llega la partición en la memoria
        proceso: null,    // Inicialmente sin proceso asignado
      };
    });
    setParticiones(nuevasParticiones);
    setProcesosAsignados(false); // Restablece el estado de asignación de procesos
  }, [particionesTamano]);

  // Asigna los procesos a las particiones disponibles
  useEffect(() => {
    let msg = "Los siguientes procesos no han sido asignados: \n";
    if (!procesosAsignados && particiones.length > 0 && proceso.length > 0) {
      const nuevasParticiones = [...particiones];

      // Itera sobre los procesos para asignarlos
      proceso.forEach(proceso => {
        let asignado = false;
        // Primer ajuste
        if(algoritmo == 0){
         
          for (let i = 0; i < nuevasParticiones.length; i++) {
            if (!nuevasParticiones[i].proceso && nuevasParticiones[i].tamano >= proceso.memUsar) {
              nuevasParticiones[i].proceso = proceso;
              asignado = true;
              break;
            }

          }
        }
        
        // Peor ajuste
        else if(algoritmo == 1){
          for (let i = 0; i < nuevasParticiones.length; i++) {
            if (!nuevasParticiones[i].proceso && nuevasParticiones[i].tamano >= proceso.memUsar) {
              nuevasParticiones[i].proceso = proceso;
              asignado = true;
              break;
            }
          }
        }

        // Mejor ajuste
        else if(algoritmo == 2){
          for (let i = 0; i < nuevasParticiones.length; i++) {
           
          }
        }

        // Si el proceso no fue asignado, agregarlo al mensaje de alerta
        if (!asignado) {
            msg += `${proceso.nombre} (${proceso.memUsar}B)\n`;
            Swal.fire({
              title: 'Procesos no asignados',
              text: msg,
              icon: 'warning',
              confirmButtonText: 'Entendido'
            });
            msg = "Los siguientes procesos no han sido asignados puesto que son demasiados grandes: \n";
          }
      });

      // Actualiza las particiones con los procesos asignados
      setParticiones(nuevasParticiones);
      setProcesosAsignados(true); // Marca los procesos como asignados
    }
  }, [proceso, particiones, procesosAsignados]);

  return (
    <div>
      <h3>Partición Estática Variable</h3>
      <p>Memoria Total: {memoriaTotal}B</p>
      <div className="particion-container">
        {particiones.toReversed().map((particion, index) => (
          <div key={index} className="particion">
            <div>
              Partición {particiones.length - index}: {particion.tamano}B (Hasta {particion.hasta}B)
            </div>
            <div className={`estado ${particion.proceso ? 'ocupado' : 'libre'}`}>
              {particion.proceso
                ? `Proceso: ${particion.proceso.nombre} (${particion.proceso.memUsar}B)`
                : 'Libre'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParticionEstaticaVariable;

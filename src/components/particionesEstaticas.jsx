import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2'; // Importa SweetAlert
import '../styles/Memoria.css'; // Archivo CSS opcional para estilos

const ParticionEstatica = ({ memoriaTotal, numParticiones, procesos }) => {
  const [particiones, setParticiones] = useState([]);
  const [procesosAsignados, setProcesosAsignados] = useState(false); // Marcador de cambios

  // Divide la memoria en particiones fijas
  useEffect(() => {
    if (memoriaTotal && numParticiones) {
      const tamanoParticion = Math.floor(memoriaTotal / numParticiones);
      const nuevasParticiones = Array(numParticiones).fill(null).map(() => ({
        tamano: tamanoParticion,
        proceso: null,
      }));
      setParticiones(nuevasParticiones);
      setProcesosAsignados(false); // Marcar que los procesos aún no han sido asignados
    }
  }, [memoriaTotal, numParticiones]);

  // Asigna los procesos a las particiones disponibles cuando las particiones han sido inicializadas
  useEffect(() => {
    let msg = "Los siguientes procesos exceden memoria y no han sido asignados en un espacio en memoria: \n";
    if (!procesosAsignados && particiones.length > 0 && procesos && procesos.length > 0) {
      const nuevasParticiones = [...particiones];
      // Asigna los procesos a las particiones
      procesos.forEach(proceso => {
        for (let i = 0; i < nuevasParticiones.length; i++) {
          if (!nuevasParticiones[i].proceso && nuevasParticiones[i].tamano >= proceso.memUsar) {
            nuevasParticiones[i].proceso = proceso;
            break;
          } else if (!nuevasParticiones[i].proceso && nuevasParticiones[i].tamano <= proceso.memUsar) {
            msg += `${proceso.nombre} (${proceso.memUsar}B)\n`;
            Swal.fire({
              icon: 'warning',
              title: 'Advertencia',
              text: msg,
              confirmButtonText: 'Entendido'
            });
            msg = "Los siguientes procesos exceden memoria y no han sido asignados en un espacio en memoria: \n";
            break;
          }
        }
      });

      setParticiones(nuevasParticiones); // Actualiza las particiones con los procesos asignados
      setProcesosAsignados(true); // Marcar como asignados para evitar el bucle
    }
  }, [particiones, procesosAsignados]);

  return (
    <div className="ParticionEstatica">
      <div className='PE2'>
      {particiones.toReversed().map((particion, index) => (
        <div key={index} className="particion">
          <div className="tamano">Partición {particiones.length - index}: {particion.tamano}B</div>
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

export default ParticionEstatica;

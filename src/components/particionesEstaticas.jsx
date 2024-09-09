import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2'; // Importa SweetAlert
import '../styles/Memoria.css'; // Archivo CSS opcional para estilos

const ParticionEstatica = ({ memoriaTotal, numParticiones, procesos }) => {
  const [particiones, setParticiones] = useState([]);
  const [procesosAsignados, setProcesosAsignados] = useState(false); // Marcador de cambios
  let msg = "Los siguientes procesos exceden memoria y no han sido asignados en un espacio en memoria: \n";

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
    if (!procesosAsignados && particiones.length > 0 && procesos && procesos.length > 0) {
      const nuevasParticiones = [...particiones];
      console.log(nuevasParticiones);

      // Asigna los procesos a las particiones
      procesos.forEach(proceso => {
        for (let i = 0; i < nuevasParticiones.length; i++) {
          if (!nuevasParticiones[i].proceso && nuevasParticiones[i].tamano >= proceso.memUsar) {
            nuevasParticiones[i].proceso = proceso;
            break;
          } else if (!nuevasParticiones[i].proceso && nuevasParticiones[i].tamano <= proceso.memUsar) {
            msg += proceso.nombre + "\n";
            break;
          }
        }
      });

      // Muestra la alerta con SweetAlert
      if (msg !== "Los siguientes procesos exceden memoria y no han sido asignados en un espacio en memoria: \n") {
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          text: msg,
          confirmButtonText: 'Entendido'
        });
      }

      setParticiones(nuevasParticiones); // Actualiza las particiones con los procesos asignados
      setProcesosAsignados(true); // Marcar como asignados para evitar el bucle
    }
  }, [procesos, particiones, procesosAsignados]);

  return (
    <div className="ParticionEstatica">
      <div>{particiones.length > 0 ? console.log(particiones) : "No hay particiones disponibles"}</div>
      {particiones.map((particion, index) => (
        <div key={index} className="particion">
          <div className="tamano">Partición {index + 1}: {particion.tamano}KB</div>
          <div className={`estado ${particion.proceso ? 'ocupado' : 'libre'}`}>
            {particion.proceso
              ? `Proceso: ${particion.proceso.nombre} (${particion.proceso.memUsar}KB)`
              : 'Libre'}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ParticionEstatica;

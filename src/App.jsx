import { useEffect, useState } from "react";
import "./styles/App.css";
import "./styles/Memoria.css"
import Memoria from "./components/memoria";

function App() {
  const ramMB = 16;
  const ramKB = ramMB * 1024;
  const ramB = ramKB * 1024;

  const [
    deshabilitarAlgoritmosDeAsignacion,
    setDeshabilitarAlgoritmosDeAsignacion,
  ] = useState(true);

  const [algoritmoDeAsignacion, setAlgoritmoDeAsignacion] = useState(0);
  const programas = [
    {
      pid: "P1",
      nombre: "Notepad",
      tamDisco: 33808,
      tamCodigo: 19524,
      tamDatosInic: 12352,
      tamDatosSinInic: 1165,
      memInicial: 33041,
      memUsar: 224649,
      tamKiB: 219.38,
    },
    {
      pid: "P2",
      nombre: "Word",
      tamDisco: 115086,
      tamCodigo: 77539,
      tamDatosInic: 32680,
      tamDatosSinInic: 4100,
      memInicial: 114319,
      memUsar: 286708,
      tamKiB: 279.99,
    },
    {
      pid: "P3",
      nombre: "Excel",
      tamDisco: 132111,
      tamCodigo: 99542,
      tamDatosInic: 24245,
      tamDatosSinInic: 7557,
      memInicial: 131344,
      memUsar: 309150,
      tamKiB: 301.9,
    },
    {
      pid: "P4",
      nombre: "AutoCAD",
      tamDisco: 240360,
      tamCodigo: 115000,
      tamDatosInic: 123470,
      tamDatosSinInic: 1123,
      memInicial: 239593,
      memUsar: 436201,
      tamKiB: 425.98,
    },
    {
      pid: "P5",
      nombre: "Calculadora",
      tamDisco: 16121,
      tamCodigo: 12342,
      tamDatosInic: 1256,
      tamDatosSinInic: 1756,
      memInicial: 15354,
      memUsar: 209465,
      tamKiB: 204.55,
    },
    {
      pid: "P6",
      nombre: "p6",
      tamDisco: 3800767,
      tamCodigo: 525000,
      tamDatosInic: 3224000,
      tamDatosSinInic: 51000,
      memInicial: 3800000,
      memUsar: 3996608,
      tamKiB: 3902.94,
    },
    {
      pid: "P7",
      nombre: "p7",
      tamDisco: 1589767,
      tamCodigo: 590000,
      tamDatosInic: 974000,
      tamDatosSinInic: 25000,
      memInicial: 1589000,
      memUsar: 17856228,
      tamKiB: 1743.76,
    },
    {
      pid: "P8",
      nombre: "p8",
      tamDisco: 2500767,
      tamCodigo: 349000,
      tamDatosInic: 2150000,
      tamDatosSinInic: 1000,
      memInicial: 2500000,
      memUsar: 23696228,
      tamKiB: 2633.41,
    },
  ];

  const SOInfo = {
    pid: "SO",
    nombre: "Sistema Operativo",
    tamDisco: 0,
    tamCodigo: 0,
    tamDatosInic: 0,
    tamDatosSinInic: 0,
    memInicial: 0,
    memUsar: 1048576,
    tamKiB: 1024,
  };

  const [programaACargar, setProgramaACargar] = useState([SOInfo, 1]);

  const [tipoParticion, setTipoParticion] = useState('');

  const handleSelectTipoAlgoritmo = (event) => {
    setAlgoritmoDeAsignacion(event.target.value);
  };

  const handleSelectTipoParticion = (event) => {
    setDeshabilitarAlgoritmosDeAsignacion(true)
    setProgramaACargar([SOInfo, 1])
    if(event.target.value == 1){
      setDeshabilitarAlgoritmosDeAsignacion(false)
    }
    setTipoParticion(event.target.value); 
  };


  const agregarProceso = () => {
    const proceso = document.getElementById('seleccionar-proceso').value;
    let nuevoProceso = programas[proceso]
    nuevoProceso = nuevoProceso == programaACargar[0] 
    ? nuevoProceso.pid == "SO" 
      ? [nuevoProceso, programaACargar[1] + 1]
      : [nuevoProceso, programaACargar[1]]
    : [nuevoProceso, 1]
    setProgramaACargar(nuevoProceso);
  };

  return (
    <>
      <h1>Gestión de memoria</h1>
      <br />
      <label>Seleccione el tipo de partición</label>
      <select
        className="form-select"
        aria-label="Disabled select example"
        onChange={handleSelectTipoParticion}
      >
        <option value="0" defaultValue="true">
          Particiones estáticas de tamaño fijo
        </option>
        <option value="1">
          Particiones estáticas de tamaño variable
        </option>
        <option value="2">
          Particiones dinámicas sin compactación
        </option>
        <option value="3">
          Particiones dinámicas con compactación
        </option>
      </select>
      <br />
      <label>Seleccione el algoritmo de asignación</label>
      <select
        className="form-select"
        aria-label="Disabled select example"
        disabled={deshabilitarAlgoritmosDeAsignacion}
        onChange={handleSelectTipoAlgoritmo}
      >
        <option value="0">
          Primer ajuste
        </option>
        <option value="1">
          Peor ajuste
        </option>
        <option value="2">
          Mejor ajuste
        </option>
      </select>
      <br />
      <h2>Programas instalados en el sistema</h2>
      <table>
        <thead>
          <tr>
            <th>PID</th>
            <th>Nombre Programa</th>
            <th>Tamaño en disco</th>
            <th>Tamaño código</th>
            <th>Tamaño datos inicializados</th>
            <th>Tamaño de datos sin inicializar</th>
            <th>Memoria inicial</th>
            <th>Memoria a usar</th>
            <th>en KiB</th>
          </tr>
        </thead>
        <tbody>
          {programas.map((programa, index) => {
            return (
              <tr key={index}>
                <td>{programa.pid}</td>
                <td>{programa.nombre}</td>
                <td>{programa.tamDisco}</td>
                <td>{programa.tamCodigo}</td>
                <td>{programa.tamDatosInic}</td>
                <td>{programa.tamDatosSinInic}</td>
                <td>{programa.memInicial}</td>
                <td>{programa.memUsar}</td>
                <td>{programa.tamKiB}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <br />
      <div>
        <div className="col">
          <label>Seleccione un proceso</label>
          <select
            className="form-select form-select-sm" id="seleccionar-proceso"
          >
            {programas.map((programa, index) => {
              return (
                <option key={programa.pid} value={index}>
                  {programa.nombre}
                </option>
              );
            })}
          </select>
          <br />
          <button
            type="button"
            className="btn btn-primary"
            onClick={agregarProceso}
          >
            Agregar
          </button>
        </div>
        <br />  
      </div>
      <div>       
        <Memoria procesoPorAsignar={programaACargar} tipoParticionPorDefecto={tipoParticion} tipoAlgoritmo={algoritmoDeAsignacion}/>
      </div>
    </>
  );
}

export default App;

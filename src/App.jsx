import { useState } from "react";
import "./App.css";

function App() {
  const ramMB = 16;
  const ramKB = ramMB * 1024;
  const ramB = ramKB * 1024;

  const [tipoParticion, setTipoParticion] = useState("");
  const [tiposAjustes, setTiposAjustes] = useState(["Primer Ajuste"]);
  const [
    deshabilitarAlgoritmosDeAsignacion,
    setDeshabilitarAlgoritmosDeAsignacion,
  ] = useState(true);
  const [algoritmoDeAsignacion, setAlgoritmoDeAsignacion] = useState(
    tiposAjustes[0]
  );
  const [programas, setProgramas] = useState([
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
  ]);
  const [proceso, setProceso] = useState(programas[0]);
  const [procesosEnPila, setProcesosEnPila] = useState([]);
  const [posicionDeProcesoADetener, setPosicionDeProcesoADetener] =
    useState(undefined);

  const handleSelectTipoParticion = (event) => {
    if (event.target !== undefined) {
      setTipoParticion(event.target.value);
      if (event.target.value == "estatica-fijo") {
        setTiposAjustes(["Primer Ajuste"]);
        setDeshabilitarAlgoritmosDeAsignacion(true);
      } else {
        setTiposAjustes(["Primer Ajuste", "Peor Ajuste", "Mejor Ajuste"]);
        setDeshabilitarAlgoritmosDeAsignacion(false);
      }
    }
  };
  const handleSelectAlgoritmoAsignacion = (event) => {
    if (event.target !== undefined) {
      setAlgoritmoDeAsignacion(event.target.value);
    }
  };

  const handleSelectProceso = (event) => {
    const selectedPid = event.target.value;
    const selectedPrograma = programas.find(
      (programa) => programa.pid === selectedPid
    );
    setProceso(selectedPrograma);
  };
  const guardarProcesoEnPila = () => {
    setProcesosEnPila([...procesosEnPila, proceso]);
  };

  const eliminarProcesoDePila = () => {
    if (posicionDeProcesoADetener !== undefined)
      setProcesosEnPila(procesosEnPila.pop(posicionDeProcesoADetener));
  };
  return (
    <>
      <h1>Gestión de memoria</h1>
      <h2>Características del Sistema</h2> <span>Ram instalada</span>
      <table>
        <thead>
          <tr>
            <th>MiB</th>
            <th>KiB</th>
            <th>Bytes</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{ramMB}</td>
            <td>{ramKB}</td>
            <td>{ramB}</td>
          </tr>
        </tbody>
      </table>
      <br />
      <label>Seleccione el tipo de partición</label>
      <select
        className="form-select"
        aria-label="Disabled select example"
        onChange={handleSelectTipoParticion}
      >
        <option value="estatica-fijo">
          Particiones estáticas de tamaño fijo
        </option>
        <option value="estatica-variable">
          Particiones estáticas de tamaño variable
        </option>
        <option value="dinamica-sin-compactacion">
          Particiones dinámicas sin compactación
        </option>
        <option value="dinamica-con-compactacion">
          Particiones dinámicas con compactación
        </option>
      </select>
      <br />
      <label>Seleccione el algoritmo de asignación</label>
      <select
        className="form-select"
        aria-label="Disabled select example"
        disabled={deshabilitarAlgoritmosDeAsignacion}
        onChange={handleSelectAlgoritmoAsignacion}
      >
        {tiposAjustes.map((ajuste, key) => {
          return (
            <option key={key} value={ajuste}>
              {ajuste}
            </option>
          );
        })}
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
      <label>Seleccione un proceso</label>
      <select
        className="form-select form-select-sm"
        onChange={handleSelectProceso}
      >
        {programas.map((programa) => {
          return (
            <option key={programa.pid} value={programa.pid}>
              {programa.nombre}
            </option>
          );
        })}
      </select>
      <br />
      <button
        type="button"
        className="btn btn-primary"
        onClick={guardarProcesoEnPila}
      >
        Agregar
      </button>
      <br />
      <br />
      <label>Seleccione el proceso a quitar de la pila</label>
      <select
        className="form-select form-select-sm"
        onChange={(event) => {
          setPosicionDeProcesoADetener(event.target.value);
        }}
        disabled={procesosEnPila.length === 0}
      >
        {procesosEnPila.map((programa, index) => {
          return (
            <option key={index} value={index}>
              {programa.nombre}
            </option>
          );
        })}
      </select>
      <br />
      <button
        type="button"
        className="btn btn-secondary"
        onClick={eliminarProcesoDePila}
        disabled={procesosEnPila.length === 0}
      >
        Quitar
      </button>
    </>
  );
}

export default App;

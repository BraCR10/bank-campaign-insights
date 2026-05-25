import React, { useEffect, useState } from "react"; //controlan cambios y recarga de tabla
import { useActiveFilter } from '../context/FilterContext';  //importamos filtros globales
import { useToastContext } from '../context/ToastContext';
import apiClient from '../services/api';

function Table() {

  //estado actual
  const [page, setPage] = useState(1);  //determina la pagina actual y la cambia
  const [totalPages, setTotalPages] = useState(1); //numero de paginas calculada a partir de la cantidad de documentos
  const [totalDocuments, setTotalDocuments] = useState(1);
  const [todosDocuments, setTodosDocuments] =  useState([]);
  const limit = 100;  //cantidad de filas por pagina
  const { activeFilter } = useActiveFilter(); //filtro
  const [loadingCSV, setLoadingCSV] = useState(false);
  const { error: showError } = useToastContext();
  const [permissionDenied, setPermissionDenied] = useState(false);

  //ordenamiento
  const [sortColumn, setSortColumn] = useState(null); // columna a ordenar
  const [sortDirection, setSortDirection] = useState("asc"); // 'asc' o 'desc'
  

useEffect(() => {
  fetchAllDocuments(page, sortColumn, sortDirection);
}, [page, sortColumn, sortDirection, activeFilter]);



//se extraen los datos del backend
//el backend maneja los sorts, y solo trae la cantidad de documentos que se mostraran en la pagina actual
const fetchAllDocuments = async (currentPage = page, column = sortColumn, direction = sortDirection) => {
  try {
    setPermissionDenied(false);
    const filterEntries = activeFilter?.queryParams
      ? Object.fromEntries(activeFilter.queryParams.entries())
      : {};

    const params = new URLSearchParams({
      page: currentPage,
      limit,
      sortBy: column || "",
      order: direction || "",
      ...filterEntries
    });

    const res = await apiClient.get(`/documents?${params.toString()}`);
    const data = res.data;

    if (data.success) {
      setTodosDocuments(data.data);
      setTotalDocuments(data.pagination.totalCount);
      setTotalPages(data.pagination.totalPages);
    } else {
      console.error("Error fetching documents:", data.message);
      showError(data.message || 'Error al cargar los documentos.');
    }
  } catch (error) {
    if (error.status === 403) {
      setPermissionDenied(true);
    }
    showError(error.message || 'Error al cargar los documentos. Intenta nuevamente.');
  }
};



//se hace sort cuando se hace click a la columna para ordenar
const controlSort = (column) => {
  if (sortColumn === column) {
    if (sortDirection === "asc") {
      setSortDirection("desc");   // si ya esta ascendente, y se hace click, cambiar a descendente
    } else if (sortDirection === "desc") {
      setSortColumn(null);  // si ya esta descendente, y hace click, se quita el ordenamiento
      setSortDirection(null);
    }
  } else {
    setSortColumn(column);
    setSortDirection("asc");  // si no tiene orden y hace click, se pone ascendente
  }
  setPage(1); // vuelve a la primera página al cambiar orden
;}



//convertir a csv (solo agregar comas y dar formato)
const exportToCSV = async () => {
  try {
    setLoadingCSV(true);

    // Convertir queryParams (que es un URLSearchParams) a objeto plano
    const filterEntries = activeFilter?.queryParams
      ? Object.fromEntries(activeFilter.queryParams.entries())
      : {};

    //Traer los mismos documentos que ves en la tabla
    const params = new URLSearchParams({
      sortBy: sortColumn || "",
      order: sortDirection || "",
      page: 1,
      limit: 100000, // grande para exportar todo
      ...filterEntries
    });

    const response = await apiClient.get(`/documents?${params.toString()}`);
    const documentos = response.data.data;

    if (!documentos.length) {
      showError('No hay datos para exportar');
      return;
    }

    //Excluir campos internos
    const excludeFields = ["_id", "userId", "__v", "createdAt", "updatedAt"];
    const headers = Object.keys(documentos[0]).filter(key => !excludeFields.includes(key));

    //Construir CSV
    const csvRows = [
      headers.join(","), // encabezado
      ...documentos.map(doc =>
        headers.map(key => JSON.stringify(doc[key] ?? "")).join(",")
      )
    ];

    const csvString = csvRows.join("\n");

    //Crear archivo y descargar
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "tabla_ordenada.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  } catch (error) {
    console.error("Error exportando CSV:", error);
    showError('Error al exportar los datos. Intenta nuevamente.');
  } finally {
    setLoadingCSV(false);
  }
};



//control de cambio de paginas
//al cambiar, se vuelve a ejecutar useEffect
const handlePrev = () => setPage((p) => Math.max(p - 1, 1));  //resta una pagina, sin bajar de 1
const handleNext = () => setPage((p) => Math.min(p + 1, totalPages)); //suma una pagina, sin pasar de Total



//estilo de la tabla y generacion de columnas y filas dinamicamente
return (
  <div style={{  //estilo
    backgroundColor: "#060606",
    width: "100%",
    minHeight: "100%",
    padding: "2rem",
    boxSizing: "border-box",
    color: "white",
    overflow: "auto",
    display: "flex",
    flexDirection: "column"
  }}>

    {/* Titulo */}
    <div style={{
      backgroundColor: "#1f1f1f",
      borderRadius: "12px",
      padding: "1rem 3rem",
      margin: "1rem 0",
      maxWidth: "85%",
      marginLeft: "auto",
      marginRight: "auto",
      textAlign: "center"
    }}>
      <h1 style={{ color: "white", margin: 0 }}>
        Datos en Tabla
      </h1>
    </div>

    {permissionDenied && (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
        minHeight: "500px"
      }}>
        <div style={{
          textAlign: "center"
        }}>
          <h2 style={{ color: "#e74c3c", marginBottom: "1rem", fontSize: "2rem" }}>Acceso Denegado</h2>
          <p style={{ color: "#ccc", fontSize: "1.1rem" }}>No tienes permisos para acceder a esta sección.</p>
          <p style={{ fontSize: "0.9rem", color: "#999", marginTop: "1rem" }}>
            Contacta con un administrador si crees que esto es un error.
          </p>
        </div>
      </div>
    )}

    {!permissionDenied && (
    <>
    {/* Contenedor del botón y label */}
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "1rem",
      padding: "0 4.5rem"
    }}>
      {/* Boton exportar */}
      <button 
          onClick={exportToCSV}
          disabled={loadingCSV}
          style={{
            padding: "0.75rem 1.5rem",
            fontSize: "1.1rem",
            backgroundColor: loadingCSV ? "#555" : "#0D4A6B",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: loadingCSV ? "wait" : "pointer"
          }}
        >
          {loadingCSV ? "Procesando..." : "Exportar CSV"}
        </button>

      {/* Cantidad registros */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center", 
        justifyContent: "center",
        padding: "0.5rem 1rem", 
        border: "4px solid #44A1B4",
        borderRadius: "8px", //redondito
        color: "white",
        fontWeight: "bold",
        backgroundColor: "#0D4A6B"
      }}>
        <span style={{fontSize: "1.5rem"}}>{totalDocuments}</span>
        <span style={{fontSize: "0.9rem"}}>REGISTROS</span>
      </div>
    </div>



    {/* Paginación + mensajito */}
    <div style={{
    position: "relative",      
    display: "flex",
    justifyContent: "center",    
    alignItems: "center",
    marginTop: "1.5rem",
    marginBottom: "2.5rem",
    padding: "0 4.5rem"          
    }}>
    {/* Botones de cambio de página */}
    <div style={{
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        paddingTop: "3.5rem"
    }}>
        <button onClick={handlePrev} disabled={page === 1} style={{
        padding: "0.5rem 1.5rem",
        fontSize: "1rem",
        backgroundColor: "#17749fff",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        opacity: page === 1 ? 0.5 : 1
        }}>Back</button>

        <div style={{
        width: "2.5rem",
        height: "2.5rem",
        borderRadius: "50%",
        backgroundColor: "#44A1B4",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
        fontSize: "1rem"
        }}>{page}</div>

        <span style={{color: "white", fontSize: "1rem"}}>/ {totalPages}</span>

        <button onClick={handleNext} disabled={page === totalPages} style={{
        padding: "0.5rem 1.5rem",
        fontSize: "1rem",
        backgroundColor: "#17749fff",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        opacity: page === totalPages ? 0.5 : 1
        }}>Next</button>
    </div>

    {/* Mensajito */}
    <div style={{
        position: "absolute",
        right: 0,
        display: "inline-block",
        backgroundColor: "#1f1f1f",
        color: "#44A1B4",
        border: "1px solid #44A1B4",
        borderRadius: "8px",
        padding: "0.5rem 1rem",
        textAlign: "center",
        fontWeight: "bold",
        marginRight: "4.8rem",
    }}>
        <div style={{ fontSize: "1.2rem", marginBottom: "0.2rem" }}>Orden</div>
        <div style={{ fontSize: "1rem" }}>
            {sortColumn ? (
                <>
                {sortColumn} <span style={{ fontSize: "1.5rem" }}>{sortDirection === "asc" ? "↑" : "↓"}</span>
                </> ) : ( "Ninguno" )}
        </div>
        </div>
    </div>



    {/* Contenedor con scroll horizontal siempre visible arriba */}
    <div
      style={{
        position: "sticky",   // se queda fija arriba
        top: 0,               
        zIndex: 50,           // por encima del resto
        backgroundColor: "#060606",
        overflowX: "auto",    // scroll horizontal
        whiteSpace: "nowrap", 
      }}
    >
      <table style={{
        width: "90%",          
        maxWidth: "1200px",   
        margin: "0 auto",
        borderCollapse: "collapse",
        color: "white",
      }}>
        {/* Columnas */}
        <thead>
          <tr style={{ backgroundColor: "#2a2a2a" }}>
            {todosDocuments[0] &&
              Object.keys(todosDocuments[0])
                .filter(
                  (key) => !["_id", "userId", "createdAt", "updatedAt", "__v"].includes(key)
                )
                .map((key) => (
                <th
                  onClick={() => controlSort(key)}
                  key={key}
                  style={{
                    border: "1px white",
                    padding: "0.75rem 1.5rem",
                    fontWeight: "500",
                    minWidth: "110px",
                    cursor: "pointer",
                  }}
                >
                  {key}
                </th>
              ))}
          </tr>
        </thead>

        {/* Filas */}
        <tbody>
          {todosDocuments.map((doc, index) => (
            <tr
              key={doc._id}
              style={{
                backgroundColor: index % 2 === 0 ? "#0c4d63ff" : "#6a6a6aff",
              }}
            >
              {Object.keys(doc)
                .filter(
                  (key) => !["_id", "userId", "createdAt", "updatedAt", "__v"].includes(key)
                )
                .map((key) => (
                <td
                  key={key}
                  style={{
                    border: "none",
                    padding: "1rem",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  {doc[key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Botones de cambio de página */}
    <div style={{
      display: "flex",
      justifyContent: "center",   
      alignItems: "center",
      gap: "1rem",                
      marginTop: "1.5rem"
    }}>
      {/* Botón anterior */}
      <button onClick={handlePrev} disabled={page === 1} style={{
        padding: "0.5rem 1.5rem",
        fontSize: "1rem",
        backgroundColor: "#17749fff",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        opacity: page === 1 ? 0.5 : 1   //cuando es 1, 0.5. sino 1
      }}>
        Back
      </button>

      {/* Número de página dentro de un círculo */}
      <div style={{
        width: "2.5rem",
        height: "2.5rem",
        borderRadius: "50%", // círculo
        backgroundColor: "#44A1B4",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
        fontSize: "1rem"
      }}>
        {page}
      </div>

      {/* Total de páginas */}
      <span style={{color: "white", fontSize: "1rem"}}>/ {totalPages}</span>

      {/* Botón siguiente */}
      <button onClick={handleNext} disabled={page === totalPages} style={{
        padding: "0.5rem 1.5rem",
        fontSize: "1rem",
        backgroundColor: "#17749fff",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        opacity: page === totalPages ? 0.5 : 1
      }}>
        Next
      </button>
    </div>
    </>
    )}
  </div>
);

}
export default Table
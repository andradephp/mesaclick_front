
import { useEffect, useState } from "react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

function GraficoVentas() {
  const [ventas, setVentas] = useState([]);
  const [dias, setDias] = useState(7);
  const [tipoGrafico, setTipoGrafico] = useState("barras");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  
useEffect(() => {
  let activo = true;
  let consultando = false;
  let controlador = null;

  const cargarVentas = async () => {
    if (consultando) return;

    consultando = true;
    controlador = new AbortController();

    try {
      const token = localStorage.getItem("token");

      const API_URL =
        import.meta.env.VITE_API_URL ||
        "http://localhost:8080";

      const respuesta = await fetch(
        `${API_URL}/api/admin/estadisticas/ventas?dias=${dias}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controlador.signal,
        }
      );

      if (!respuesta.ok) {
        throw new Error("No se pudieron cargar las ventas");
      }

      const datos = await respuesta.json();

      if (activo) {
        setVentas(datos);
        setError("");
      }
    } catch (err) {
      if (activo && err.name !== "AbortError") {
        setError(err.message);
      }
    } finally {
      consultando = false;

      if (activo) {
        setCargando(false);
      }
    }
  };

  // Al cambiar el rango, mostrar la carga inicial
  setCargando(true);
  setError("");

  // Primera consulta inmediata
  cargarVentas();

  // Consultar nuevamente cada 10 segundos
  const intervalo = setInterval(cargarVentas, 10000);

  return () => {
    activo = false;
    clearInterval(intervalo);
    controlador?.abort();
  };
}, [dias]);


  const formatoCOP = (valor) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(valor || 0);

  const datosGrafico = ventas.map((venta) => ({
    ...venta,
    etiqueta: venta.fecha.slice(5),
  }));

  const totalPeriodo = ventas.reduce(
    (total, venta) => total + Number(venta.ventas || 0),
    0
  );

  return (
    <section className="admin-grafico-ventas">
      <div className="admin-grafico-header">
        <div>
          <h2>Estadísticas de ventas</h2>
          <p>Ingresos confirmados por fecha</p>
        </div>

        <div className="admin-grafico-filtros">
          <select
            value={dias}
            onChange={(e) => setDias(Number(e.target.value))}
          >
            <option value={7}>Últimos 7 días</option>
            <option value={30}>Últimos 30 días</option>
            <option value={90}>Últimos 90 días</option>
            <option value={365}>Último año</option>
          </select>

          <select
            value={tipoGrafico}
            onChange={(e) => setTipoGrafico(e.target.value)}
          >
            <option value="barras">Barras</option>
            <option value="lineas">Líneas</option>
          </select>
        </div>
      </div>

      <div className="admin-grafico-total">
        <span>Ventas del período</span>
        <strong>{formatoCOP(totalPeriodo)}</strong>
      </div>

      {cargando && <p>Cargando ventas...</p>}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!cargando && !error && (
        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            {tipoGrafico === "barras" ? (
              <BarChart data={datosGrafico}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="etiqueta" />
                <YAxis />
                <Tooltip
                  formatter={(valor) => formatoCOP(valor)}
                />
                <Bar
                  dataKey="ventas"
                  name="Ventas"
                  fill="#f18a04"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            ) : (
              <LineChart data={datosGrafico}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="etiqueta" />
                <YAxis />
                <Tooltip
                  formatter={(valor) => formatoCOP(valor)}
                />
                <Line
                  type="monotone"
                  dataKey="ventas"
                  name="Ventas"
                  stroke="#f18a04"
                  strokeWidth={3}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

export default GraficoVentas;

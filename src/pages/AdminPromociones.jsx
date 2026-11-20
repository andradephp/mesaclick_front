import { useCallback, useEffect, useState } from "react";
import AdminSidebar from "../components/admin/AdminSidebar";


const API = (import.meta.env.VITE_API_URL || "http://localhost:8080").replace(/\/$/, "");
const formatoDinero = (valor) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(Number(valor) || 0);
const formatoFecha = (valor) => valor ? new Date(valor).toLocaleString("es-CO") : "—";
const vacio = { nombrePromocion: "", descripcionPromocion: "", idProducto: "", porcentajeDescuento: "", fechaInicio: "", fechaFin: "" };

async function solicitar(ruta, opciones = {}) {
  const token = localStorage.getItem("token");
  const respuesta = await fetch(`${API}${ruta}`, {
    ...opciones,
    headers: {
      ...(opciones.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opciones.headers,
    },
  });
  const texto = await respuesta.text();
  let datos;
  try { datos = texto ? JSON.parse(texto) : null; } catch { datos = texto; }
  if (!respuesta.ok) {
    const detalle = typeof datos === "object" && datos !== null ? (datos.message || datos.error || datos.detail) : datos;
    throw new Error(detalle || `Error HTTP ${respuesta.status}${respuesta.status === 403 ? ": verifica que ingresaste como ADMIN" : ""}`);
  }
  return datos;
}

export default function AdminPromociones() {
  const [promociones, setPromociones] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formulario, setFormulario] = useState(vacio);
  const [pestana, setPestana] = useState("promociones");

  const cargar = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      const [listaPromociones, listaProductos] = await Promise.all([
        solicitar("/api/admin/promociones"),
        solicitar("/api/admin/productos"),
      ]);
      setPromociones(Array.isArray(listaPromociones) ? listaPromociones : []);
      setProductos(Array.isArray(listaProductos) ? listaProductos : []);
    } catch (e) { setError(e.message); }
    finally { setCargando(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const crear = async (evento) => {
    evento.preventDefault();
    setError(""); setMensaje("");
    const porcentaje = Number(formulario.porcentajeDescuento);
    if (!formulario.nombrePromocion.trim() || !formulario.idProducto || !Number.isInteger(porcentaje) || porcentaje < 1 || porcentaje > 100) {
      setError("Completa el nombre, producto y un descuento entero entre 1 y 100%."); return;
    }
    if (!formulario.fechaInicio || !formulario.fechaFin || new Date(formulario.fechaInicio) >= new Date(formulario.fechaFin)) {
      setError("La fecha de finalización debe ser posterior a la de inicio."); return;
    }
    setGuardando(true);
    try {
      await solicitar("/api/admin/promociones", {
        method: "POST",
        body: JSON.stringify({
          nombrePromocion: formulario.nombrePromocion.trim(),
          descripcionPromocion: formulario.descripcionPromocion.trim(),
          idProducto: Number(formulario.idProducto),
          porcentajeDescuento: porcentaje,
          fechaInicio: `${formulario.fechaInicio}:00`,
          fechaFin: `${formulario.fechaFin}:00`,
        }),
      });
      setMostrarFormulario(false); setFormulario(vacio);
      await cargar(); setMensaje("Promoción creada correctamente.");
    } catch (e) { setError(e.message); }
    finally { setGuardando(false); }
  };

  const cambiarEstado = async (promocion) => {
    setError(""); setMensaje(""); setGuardando(true);
    try {
      await solicitar(`/api/admin/promociones/${promocion.idPromocion}/estado`, {
        method: "PATCH",
        body: JSON.stringify({ estadoPromocion: !promocion.estadoPromocion }),
      });
      await cargar(); setMensaje("Estado de la promoción actualizado.");
    } catch (e) { setError(e.message); }
    finally { setGuardando(false); }
  };

  const vigentes = promociones.filter(p => p.estadoPromocion && new Date(p.fechaInicio) <= new Date() && new Date(p.fechaFin) >= new Date()).length;

  const estadoVisual = (p) => {
    if (!p.estadoPromocion) return { texto: "Desactivada", clase: "" };
    const ahora = new Date();
    if (new Date(p.fechaInicio) > ahora) return { texto: "Programada", clase: "scheduled" };
    if (new Date(p.fechaFin) < ahora) return { texto: "Finalizada", clase: "expired" };
    return { texto: "Vigente", clase: "active" };
  };

  return (
    <div className="admin-dashboard">
      <AdminSidebar />
      <main className="admin-main mc-promos">
        <header className="mc-promos-header">
          <div>
            <p className="mc-promos-eyebrow">Administración</p>
            <h1>Promociones y eventos</h1>
          </div>
          <button className="mc-promos-btn mc-promos-btn-primary" type="button"
            onClick={() => { setMostrarFormulario(true); setError(""); }}
            disabled={pestana !== "promociones"}>＋ Nueva promoción</button>
        </header>

        <nav className="mc-promos-tabs" aria-label="Secciones de promociones">
          <button type="button" className={`mc-promos-tab ${pestana === "promociones" ? "is-active" : ""}`} onClick={() => setPestana("promociones")}>Promociones</button>
          <button type="button" className={`mc-promos-tab ${pestana === "eventos" ? "is-active" : ""}`} onClick={() => setPestana("eventos")}>Eventos</button>
        </nav>

        {error && <div role="alert" className="mc-promos-alert mc-promos-alert-error">{error}</div>}
        {mensaje && <div role="status" className="mc-promos-alert mc-promos-alert-ok">{mensaje}</div>}

        {pestana === "eventos" ? (
          <section className="mc-promos-panel">
            <div className="mc-promos-panel-header"><div><h2>Eventos especiales</h2><p>Próximamente podrás gestionar eventos desde aquí. Por ahora puedes programar ofertas por fechas en Promociones.</p></div></div>
          </section>
        ) : (
          <>
            <section className="mc-promos-stats" aria-label="Resumen de promociones">
              <div className="mc-promos-stat"><div className="mc-promos-stat-icon">%</div><div><span>Promociones registradas</span><strong>{promociones.length}</strong></div></div>
              <div className="mc-promos-stat"><div className="mc-promos-stat-icon green">✓</div><div><span>Vigentes ahora</span><strong>{vigentes}</strong></div></div>
            </section>
            <section className="mc-promos-panel">
              <div className="mc-promos-panel-header">
                <div><h2>Promociones registradas</h2><p>Consulta las ofertas y administra su disponibilidad.</p></div>
                <button className="mc-promos-btn mc-promos-btn-outline" type="button" onClick={cargar} disabled={cargando || guardando}>↻ Actualizar</button>
              </div>
              {cargando ? <div className="mc-promos-empty">Cargando promociones...</div> : promociones.length === 0 ? <div className="mc-promos-empty">No hay promociones registradas.</div> : (
                <div className="mc-promos-table-wrap">
                  <table className="mc-promos-table">
                    <thead><tr><th>Promoción</th><th>Producto</th><th>Descuento</th><th>Fechas</th><th>Estado</th><th>Acción</th></tr></thead>
                    <tbody>{promociones.map(p => {
                      const producto = productos.find(item => item.idProducto === (p.idProducto ?? p.producto?.idProducto));
                      const estado = estadoVisual(p);
                      return (
                        <tr key={p.idPromocion}>
                          <td><strong className="mc-promos-name">{p.nombrePromocion}</strong><span className="mc-promos-description">{p.descripcionPromocion}</span></td>
                          <td><strong>{p.nombreProducto || p.producto?.nombreProducto || producto?.nombreProducto || "—"}</strong>{producto && <span className="mc-promos-secondary">{formatoDinero(producto.precioProducto)}</span>}</td>
                          <td><span className="mc-promos-discount">{p.porcentajeDescuento}%</span></td>
                          <td>{formatoFecha(p.fechaInicio)}<span className="mc-promos-secondary">Hasta {formatoFecha(p.fechaFin)}</span></td>
                          <td><span className={`mc-promos-status ${estado.clase}`}>{estado.texto}</span></td>
                          <td><button className={`mc-promos-btn ${p.estadoPromocion ? "mc-promos-btn-danger" : "mc-promos-btn-outline"}`} type="button" disabled={guardando} onClick={() => cambiarEstado(p)}>{p.estadoPromocion ? "Desactivar" : "Activar"}</button></td>
                        </tr>
                      );
                    })}</tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}

        {mostrarFormulario && (
          <div className="mc-promos-overlay" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget && !guardando) setMostrarFormulario(false); }}>
            <div className="mc-promos-modal" role="dialog" aria-modal="true" aria-labelledby="titulo-promocion">
              <div className="mc-promos-modal-header"><h2 id="titulo-promocion">Nueva promoción</h2><button className="mc-promos-close" type="button" aria-label="Cerrar" disabled={guardando} onClick={() => setMostrarFormulario(false)}>×</button></div>
              <form className="mc-promos-form" onSubmit={crear}>
                <label>Nombre de la promoción<input required maxLength={150} value={formulario.nombrePromocion} onChange={e => setFormulario({ ...formulario, nombrePromocion: e.target.value })} /></label>
                <label>Descripción<textarea rows={3} value={formulario.descripcionPromocion} onChange={e => setFormulario({ ...formulario, descripcionPromocion: e.target.value })} /></label>
                <label>Producto<select required value={formulario.idProducto} onChange={e => setFormulario({ ...formulario, idProducto: e.target.value })}><option value="">Seleccionar producto</option>{productos.filter(p => p.estadoProducto !== false).map(p => <option key={p.idProducto} value={p.idProducto}>{p.nombreProducto} — {formatoDinero(p.precioProducto)}</option>)}</select></label>
                <div className="mc-promos-form-grid">
                  <label>Descuento (%)<input required type="number" min="1" max="100" step="1" value={formulario.porcentajeDescuento} onChange={e => setFormulario({ ...formulario, porcentajeDescuento: e.target.value })} /></label>
                  <label>Inicio<input required type="datetime-local" value={formulario.fechaInicio} onChange={e => setFormulario({ ...formulario, fechaInicio: e.target.value })} /></label>
                </div>
                <label>Finalización<input required type="datetime-local" value={formulario.fechaFin} onChange={e => setFormulario({ ...formulario, fechaFin: e.target.value })} /></label>
                {error && <div role="alert" className="mc-promos-alert mc-promos-alert-error">{error}</div>}
                <div className="mc-promos-form-actions"><button className="mc-promos-btn mc-promos-btn-outline" type="button" disabled={guardando} onClick={() => setMostrarFormulario(false)}>Cancelar</button><button className="mc-promos-btn mc-promos-btn-primary" type="submit" disabled={guardando}>{guardando ? "Guardando..." : "Crear promoción"}</button></div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

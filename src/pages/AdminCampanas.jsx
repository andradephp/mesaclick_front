import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AdminSidebar from "../components/admin/AdminSidebar";

const API = (import.meta.env.VITE_API_URL || "http://localhost:8080").replace(/\/+$/, "");
const dinero = (n) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(Number(n) || 0);
const fecha = (n) => n ? new Date(n).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" }) : "—";
const imagen = (ruta) => !ruta ? "" : /^https?:\/\//i.test(ruta) ? ruta : `${API}/${ruta.replace(/^\/+/, "")}`;

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
    const detalle = datos && typeof datos === "object"
      ? (datos.mensaje || datos.message || datos.error || datos.detail)
      : datos;
    throw new Error(detalle || `Error HTTP ${respuesta.status}`);
  }
  return datos;
}

async function solicitarHtml(ruta) {
  const token = localStorage.getItem("token");
  const respuesta = await fetch(`${API}${ruta}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!respuesta.ok) {
    const detalle = await respuesta.text();
    throw new Error(detalle && detalle.length < 200 ? detalle : `No se pudo cargar el correo (HTTP ${respuesta.status}).`);
  }
  return respuesta.text();
}

const caja = { background: "#fff", border: "1px solid #ececec", borderRadius: 14, padding: 20, marginBottom: 18 };
const campo = { width: "100%", boxSizing: "border-box", padding: 11, border: "1px solid #ddd", borderRadius: 8, marginTop: 6, font: "inherit" };
const etiqueta = { display: "block", marginBottom: 14, fontWeight: 600, color: "#333" };
const boton = { background: "#f18a04", color: "#fff", border: 0, borderRadius: 9, padding: "12px 18px", fontWeight: 700, cursor: "pointer" };
const botonSecundario = { ...boton, background: "#fff", color: "#a65a00", border: "1px solid #e6b778" };
const estiloEstado = {
  BORRADOR: { background: "#f1f3f5", color: "#495057" },
  ENVIANDO: { background: "#fff3cd", color: "#875900" },
  ENVIADA: { background: "#e7f6ec", color: "#147d42" },
};

export default function AdminCampanas() {
  const [promociones, setPromociones] = useState([]);
  const [productos, setProductos] = useState([]);
  const [campanas, setCampanas] = useState([]);
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [asunto, setAsunto] = useState("¡Descubre las promociones de MesaClick!");
  const [titulo, setTitulo] = useState("¡Ofertas especiales para ti!");
  const [introduccion, setIntroduccion] = useState("Disfruta estas promociones por tiempo limitado.");
  const [evento, setEvento] = useState({ nombre: "", fecha: "", descripcion: "" });
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [campanaVista, setCampanaVista] = useState(null);
  const [htmlVistaPrevia, setHtmlVistaPrevia] = useState("");
  const [cargandoVistaPrevia, setCargandoVistaPrevia] = useState(false);
  const [errorVistaPrevia, setErrorVistaPrevia] = useState("");
  const [idVistaPrevia, setIdVistaPrevia] = useState(null);
  const [confirmarEnvio, setConfirmarEnvio] = useState(null);
  const [enviandoId, setEnviandoId] = useState(null);
  const [resultadoEnvio, setResultadoEnvio] = useState("");
  const envioBloqueado = useRef(false);

  const actualizarCampanas = useCallback(async () => {
    const lista = await solicitar("/api/admin/campanas");
    setCampanas(Array.isArray(lista) ? lista : []);
    return Array.isArray(lista) ? lista : [];
  }, []);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      const [listaPromociones, listaProductos, listaCampanas] = await Promise.all([
        solicitar("/api/admin/promociones"),
        solicitar("/api/admin/productos"),
        solicitar("/api/admin/campanas"),
      ]);
      setPromociones(Array.isArray(listaPromociones) ? listaPromociones : []);
      setProductos(Array.isArray(listaProductos) ? listaProductos : []);
      setCampanas(Array.isArray(listaCampanas) ? listaCampanas : []);
    } catch (e) { setError(e.message); }
    finally { setCargando(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const disponibles = useMemo(() => {
    const ahora = Date.now();
    return promociones.map((p) => {
      const producto = productos.find((item) => String(item.idProducto) === String(p.idProducto ?? p.producto?.idProducto));
      return { ...p, producto };
    }).filter((p) => p.estadoPromocion === true && p.producto && p.producto.estadoProducto !== false &&
      Number.isFinite(Date.parse(p.fechaInicio)) && Number.isFinite(Date.parse(p.fechaFin)) &&
      Date.parse(p.fechaInicio) <= ahora && Date.parse(p.fechaFin) >= ahora &&
      Number(p.porcentajeDescuento) > 0 && Number(p.porcentajeDescuento) <= 100);
  }, [promociones, productos]);

  const elegidas = disponibles.filter((p) => seleccionadas.includes(Number(p.idPromocion)));
  const alternar = (id) => setSeleccionadas((actual) => actual.includes(Number(id))
    ? actual.filter((x) => x !== Number(id)) : [...actual, Number(id)]);

  async function guardarBorrador() {
    setError(""); setMensaje(""); setResultadoEnvio("");
    if (!asunto.trim() || !titulo.trim()) { setError("Escribe el asunto y el título del correo."); return; }
    if (seleccionadas.length === 0 && !evento.nombre.trim()) { setError("Selecciona una promoción o agrega un evento."); return; }
    if (evento.nombre.trim() && !evento.fecha) { setError("Indica la fecha y hora del evento."); return; }
    if (seleccionadas.some((id) => !disponibles.some((p) => Number(p.idPromocion) === id))) {
      setError("Una promoción seleccionada dejó de estar vigente. Actualiza la página y revisa las ofertas.");
      return;
    }
    setGuardando(true);
    try {
      const creada = await solicitar("/api/admin/campanas", {
        method: "POST",
        body: JSON.stringify({
          asunto: asunto.trim(), titulo: titulo.trim(), mensaje: introduccion.trim(),
          nombreEvento: evento.nombre.trim() || null,
          descripcionEvento: evento.nombre.trim() ? evento.descripcion.trim() : null,
          fechaEvento: evento.nombre.trim() ? `${evento.fecha}:00` : null,
          idsPromociones: seleccionadas,
        }),
      });
      setMensaje(`Campaña #${creada.idCampana} guardada como borrador. No se ha enviado ningún correo.`);
      setCampanaVista(creada);
      setHtmlVistaPrevia(""); setIdVistaPrevia(null); setErrorVistaPrevia("");
      await actualizarCampanas();
    } catch (e) { setError(e.message); }
    finally { setGuardando(false); }
  }

  function cargarBorrador(c) {
    setCampanaVista(c);
    setAsunto(c.asunto || ""); setTitulo(c.titulo || ""); setIntroduccion(c.mensaje || "");
    setEvento({ nombre: c.nombreEvento || "", descripcion: c.descripcionEvento || "", fecha: c.fechaEvento ? String(c.fechaEvento).slice(0, 16) : "" });
    setSeleccionadas((c.idsPromociones || []).map(Number));
    setMensaje(`Campaña #${c.idCampana} cargada en el formulario. Si guardas, se creará un nuevo borrador.`);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function verVistaPreviaReal(idCampana) {
    if (!idCampana) { setErrorVistaPrevia("Primero guarda la campaña."); return; }
    setCargandoVistaPrevia(true); setErrorVistaPrevia(""); setHtmlVistaPrevia(""); setIdVistaPrevia(null);
    try {
      const html = await solicitarHtml(`/api/admin/campanas/${idCampana}/vista-previa`);
      setHtmlVistaPrevia(html); setIdVistaPrevia(idCampana);
    } catch (e) { setErrorVistaPrevia(e.message); }
    finally { setCargandoVistaPrevia(false); }
  }

  async function enviarCampana() {
    if (!confirmarEnvio || envioBloqueado.current) return;
    const id = confirmarEnvio.idCampana;
    envioBloqueado.current = true;
    setEnviandoId(id); setConfirmarEnvio(null); setError(""); setMensaje(""); setResultadoEnvio("");
    try {
      // Consultar estado reciente antes de enviar. El backend también debe impedir duplicados.
      const actuales = await actualizarCampanas();
      const actual = actuales.find((c) => Number(c.idCampana) === Number(id));
      if (!actual || actual.estado !== "BORRADOR") {
        throw new Error(`La campaña #${id} ya no está en BORRADOR. No se realizó otro envío.`);
      }
      const respuesta = await solicitar(`/api/admin/campanas/${id}/enviar`, { method: "POST" });
      const detalle = typeof respuesta === "string" ? respuesta : respuesta?.mensaje || "El servidor procesó la solicitud.";
      setResultadoEnvio(`Campaña #${id}: ${detalle}`);
      setMensaje("Solicitud completada. Revisa el historial y el correo recibido para confirmar la entrega.");
    } catch (e) {
      setError(`Campaña #${id}: ${e.message}. No vuelvas a enviarla sin revisar primero el estado y los registros de envío en MySQL.`);
    } finally {
      try { await actualizarCampanas(); }
      catch (e) { setError((anterior) => `${anterior ? anterior + " " : ""}No se pudo actualizar el historial: ${e.message}. Verifica el estado antes de intentar cualquier envío.`); }
      setEnviandoId(null);
      envioBloqueado.current = false;
    }
  }

  return (
    <div className="admin-dashboard">
      <AdminSidebar />
      <main className="admin-main" style={{ padding: 28, minWidth: 0 }}>
        <p style={{ color: "#e67e00", fontWeight: 700, letterSpacing: 1 }}>ADMINISTRACIÓN</p>
        <h1>Campañas de correo</h1>
        <p style={{ color: "#666", marginBottom: 24 }}>Crea campañas, revisa su vista previa y envía correos a suscriptores confirmados.</p>
        {error && <p role="alert" style={{ color: "#b42318", background: "#fff3f1", padding: 12, borderRadius: 8 }}>{error}</p>}
        {mensaje && <p role="status" style={{ color: "#147d42", background: "#eef9f1", padding: 12, borderRadius: 8 }}>{mensaje}</p>}
        {resultadoEnvio && <p role="status" style={{ padding: 12, background: "#f5f5f5", borderRadius: 8, fontWeight: 600 }}>{resultadoEnvio}</p>}

        <section style={caja}>
          <h2 style={{ marginTop: 0 }}>1. Contenido del correo</h2>
          <label style={etiqueta}>Asunto del correo<input style={campo} maxLength={180} value={asunto} onChange={(e) => setAsunto(e.target.value)} /></label>
          <label style={etiqueta}>Título principal<input style={campo} maxLength={180} value={titulo} onChange={(e) => setTitulo(e.target.value)} /></label>
          <label style={etiqueta}>Mensaje introductorio<textarea style={campo} rows={2} maxLength={250} value={introduccion} onChange={(e) => setIntroduccion(e.target.value)} /></label>
        </section>

        <section style={caja}>
          <h2 style={{ marginTop: 0 }}>2. Seleccionar descuentos vigentes</h2>
          {cargando ? <p>Cargando promociones...</p> : disponibles.length === 0 ?
            <p>No hay promociones vigentes con productos activos en este momento.</p> :
            disponibles.map((p) => (
              <label key={p.idPromocion} style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 0", borderBottom: "1px solid #eee", cursor: "pointer" }}>
                <input type="checkbox" checked={seleccionadas.includes(Number(p.idPromocion))} onChange={() => alternar(p.idPromocion)} />
                {p.producto.imagenProducto && <img src={imagen(p.producto.imagenProducto)} alt="" style={{ width: 55, height: 55, objectFit: "cover", borderRadius: 8 }} />}
                <span><strong>{p.producto.nombreProducto}</strong><br /><small>{p.porcentajeDescuento}% de descuento · Hasta {fecha(p.fechaFin)}</small></span>
              </label>
            ))}
        </section>

        <section style={caja}>
          <h2 style={{ marginTop: 0 }}>3. Evento (opcional)</h2>
          <label style={etiqueta}>Nombre del evento<input style={campo} maxLength={180} value={evento.nombre} onChange={(e) => setEvento({ ...evento, nombre: e.target.value })} /></label>
          <label style={etiqueta}>Fecha y hora<input style={campo} type="datetime-local" value={evento.fecha} onChange={(e) => setEvento({ ...evento, fecha: e.target.value })} /></label>
          <label style={etiqueta}>Descripción<textarea style={campo} rows={2} maxLength={300} value={evento.descripcion} onChange={(e) => setEvento({ ...evento, descripcion: e.target.value })} /></label>
        </section>

        <section style={caja}>
          <h2 style={{ marginTop: 0 }}>4. Vista previa del formulario</h2>
          <div style={{ maxWidth: 590, margin: "0 auto", border: "1px solid #eee", borderRadius: 12, overflow: "hidden", background: "#fff" }}>
            <header style={{ background: "#f18a04", color: "#fff", textAlign: "center", padding: "18px 12px" }}>
              <strong style={{ fontSize: 25 }}>MesaClick</strong>
              <div style={{ fontSize: 12, letterSpacing: 2, marginTop: 5 }}>PROMOCIONES Y EVENTOS</div>
            </header>
            <div style={{ padding: 20 }}>
              <h2 style={{ margin: "0 0 8px", fontSize: 21, color: "#252525" }}>{titulo || "Tu título aquí"}</h2>
              <p style={{ color: "#666", marginTop: 0 }}>{introduccion}</p>
              {elegidas.map((p) => {
                const original = Number(p.producto.precioProducto);
                const nuevo = original * (1 - Number(p.porcentajeDescuento) / 100);
                return <article key={p.idPromocion} style={{ display: "flex", gap: 13, padding: "14px 0", borderBottom: "1px solid #eee" }}>
                  {p.producto.imagenProducto ? <img src={imagen(p.producto.imagenProducto)} alt={p.producto.nombreProducto} style={{ width: 90, height: 90, objectFit: "cover", borderRadius: 9, flexShrink: 0 }} /> :
                    <div style={{ width: 90, height: 90, borderRadius: 9, background: "#fff3e5", display: "grid", placeItems: "center", flexShrink: 0 }}>🍽️</div>}
                  <div style={{ minWidth: 0 }}>
                    <strong>{p.producto.nombreProducto}</strong>
                    <div style={{ color: "#888", textDecoration: "line-through", fontSize: 12 }}>{dinero(original)}</div>
                    <div><strong style={{ color: "#e87500", fontSize: 19 }}>{dinero(nuevo)}</strong> <span style={{ background: "#fff0e0", color: "#b45309", fontSize: 11, padding: "3px 5px", borderRadius: 5 }}>-{p.porcentajeDescuento}%</span></div>
                    <p style={{ color: "#666", fontSize: 12, margin: "5px 0" }}>{p.descripcionPromocion || p.producto.descripcionProducto}</p>
                    <small style={{ color: "#777" }}>Del {fecha(p.fechaInicio)} al {fecha(p.fechaFin)}</small>
                  </div>
                </article>;
              })}
              {elegidas.length === 0 && <p style={{ color: "#888", fontSize: 13 }}>Selecciona una promoción vigente para verla aquí.</p>}
              {evento.nombre.trim() && <div style={{ background: "#fff6e9", borderRadius: 9, padding: 14, marginTop: 18 }}>
                <strong style={{ color: "#a65a00" }}>📅 {evento.nombre}</strong>
                {evento.fecha && <p style={{ margin: "6px 0", fontSize: 13 }}>{fecha(evento.fecha)}</p>}
                <p style={{ margin: "5px 0", fontSize: 13 }}>{evento.descripcion}</p>
              </div>}
            </div>
            <footer style={{ textAlign: "center", background: "#fafafa", color: "#777", padding: 15, fontSize: 11 }}>
              MesaClick · Recibes este correo porque te suscribiste a promociones.<br />
              <span style={{ textDecoration: "underline" }}>Cancelar suscripción</span>
            </footer>
          </div>
          <p style={{ color: "#777", fontSize: 13, marginTop: 15 }}>Vista previa local. Para ver el HTML exacto del backend, guarda el borrador y usa «Ver correo HTML» en el historial.</p>
          <button type="button" style={{ ...boton, opacity: guardando || cargando || enviandoId !== null ? 0.6 : 1 }} onClick={guardarBorrador} disabled={guardando || cargando || enviandoId !== null}>
            {guardando ? "Guardando..." : "Guardar como borrador"}
          </button>
        </section>

        <section style={caja}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <h2 style={{ marginTop: 0 }}>5. Historial de campañas</h2>
            <button type="button" onClick={cargar} disabled={cargando || guardando || enviandoId !== null} style={botonSecundario}>↻ Actualizar</button>
          </div>
          <p style={{ color: "#777", fontSize: 13 }}>Solo se pueden enviar campañas en BORRADOR. Los envíos reales no se pueden deshacer.</p>
          {cargando ? <p>Cargando campañas...</p> : campanas.length === 0 ? <p>Todavía no hay campañas guardadas.</p> :
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead><tr>{["Campaña", "Creada", "Estado", "Promociones", "Enviados", "Fallidos / inciertos", "Acciones"].map((x) => <th key={x} style={{ padding: 10, borderBottom: "1px solid #ddd" }}>{x}</th>)}</tr></thead>
                <tbody>{campanas.map((c) => {
                  const puedeEnviar = c.estado === "BORRADOR" && enviandoId === null && !guardando && !cargando;
                  return <tr key={c.idCampana}>
                    <td style={{ padding: 10, borderBottom: "1px solid #eee" }}><strong>#{c.idCampana} · {c.titulo}</strong><br /><small>{c.asunto}</small></td>
                    <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>{fecha(c.fechaCreacion)}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #eee" }}><span style={{ display: "inline-block", padding: "5px 9px", borderRadius: 6, fontWeight: 700, fontSize: 12, ...(estiloEstado[c.estado] || estiloEstado.BORRADOR) }}>{c.estado || "DESCONOCIDO"}</span></td>
                    <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>{c.idsPromociones?.length || 0}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>{c.cantidadEnviados ?? 0}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>{c.cantidadFallidos ?? 0}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button type="button" onClick={() => cargarBorrador(c)} style={{ ...boton, padding: "8px 12px" }}>Ver contenido</button>
                        <button type="button" onClick={() => verVistaPreviaReal(c.idCampana)} disabled={cargandoVistaPrevia} style={{ ...botonSecundario, padding: "8px 12px", opacity: cargandoVistaPrevia ? 0.6 : 1 }}>{cargandoVistaPrevia ? "Cargando..." : "Ver correo HTML"}</button>
                        <button type="button" onClick={() => { setError(""); setMensaje(""); setConfirmarEnvio(c); }} disabled={!puedeEnviar} style={{ ...boton, padding: "8px 12px", opacity: puedeEnviar ? 1 : 0.45, cursor: puedeEnviar ? "pointer" : "not-allowed" }}>
                          {enviandoId === c.idCampana ? "Enviando..." : "Enviar campaña"}
                        </button>
                      </div>
                    </td>
                  </tr>;
                })}</tbody>
              </table>
            </div>}
          {campanaVista && <p style={{ color: "#777", fontSize: 12 }}>Campaña seleccionada: #{campanaVista.idCampana}. Guardar el formulario crea una campaña nueva, no modifica la seleccionada.</p>}
          <p style={{ color: "#8a5a00", fontSize: 12 }}>Nota: «Fallidos / inciertos» muestra el contador agregado que devuelve el backend. Para distinguir los estados individuales, consulta campana_envios en MySQL.</p>
        </section>

        {(cargandoVistaPrevia || errorVistaPrevia || htmlVistaPrevia) && <section style={caja}>
          <h2 style={{ marginTop: 0 }}>6. Vista previa HTML del backend {idVistaPrevia ? `· Campaña #${idVistaPrevia}` : ""}</h2>
          <p style={{ color: "#666", fontSize: 13 }}>Este correo utiliza los datos guardados en MySQL. No se enviará ningún mensaje.</p>
          {cargandoVistaPrevia && <p>Cargando correo HTML...</p>}
          {errorVistaPrevia && <p role="alert" style={{ color: "#b42318" }}>{errorVistaPrevia}</p>}
          {htmlVistaPrevia && <iframe title="Vista previa del correo MesaClick" srcDoc={htmlVistaPrevia} sandbox="" style={{ width: "100%", height: 650, border: "1px solid #eee", borderRadius: 10, background: "#fff" }} />}
        </section>}

        {confirmarEnvio && <div role="presentation" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", display: "grid", placeItems: "center", zIndex: 9999, padding: 16 }}>
          <div role="dialog" aria-modal="true" aria-labelledby="confirmar-campana-titulo" style={{ width: "100%", maxWidth: 480, background: "white", borderRadius: 14, padding: 26, boxShadow: "0 12px 40px rgba(0,0,0,.2)" }}>
            <h2 id="confirmar-campana-titulo" style={{ marginTop: 0 }}>Confirmar envío real</h2>
            <p>¿Quieres enviar la <strong>campaña #{confirmarEnvio.idCampana}</strong> a todos los suscriptores activos y confirmados?</p>
            <p><strong>Asunto:</strong> {confirmarEnvio.asunto}</p>
            <p style={{ color: "#9b4b00", fontSize: 13 }}>Esta acción enviará correos reales. No podrás volver a enviar esta misma campaña ni deshacer los correos enviados.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button type="button" onClick={() => setConfirmarEnvio(null)} style={botonSecundario}>Cancelar</button>
              <button type="button" onClick={enviarCampana} style={boton}>Sí, enviar campaña</button>
            </div>
          </div>
        </div>}
      </main>
    </div>
  );
}

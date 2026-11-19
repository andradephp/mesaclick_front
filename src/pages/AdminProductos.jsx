import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// Los estilos de este componente están en src/index.css (prefijo mc-ap-).
const API = import.meta.env.VITE_API_URL || "http://localhost:8080";
const productoVacio = { nombreProducto: "", descripcionProducto: "", ingredientesProducto: "", precioProducto: "", imagenProducto: "", idCategoria: "", estadoProducto: true };
const urlImagen = (ruta) => {
  if (!ruta) return "";
  if (/^https?:\/\//i.test(ruta)) return ruta;
  return `${API.replace(/\/$/, "")}/${ruta.replace(/^\//, "")}`;
};
const dinero = (valor) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(Number(valor) || 0);

export default function AdminProductos() {
  const navigate = useNavigate();
  const [pestana, setPestana] = useState("productos");
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todas");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [modalProducto, setModalProducto] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [formProducto, setFormProducto] = useState(productoVacio);
  const [archivoImagen, setArchivoImagen] = useState(null);
  const [vistaPrevia, setVistaPrevia] = useState("");
  useEffect(() => {
    if (!archivoImagen) { setVistaPrevia(""); return; }
    const url = URL.createObjectURL(archivoImagen);
    setVistaPrevia(url);
    return () => URL.revokeObjectURL(url);
  }, [archivoImagen]);
  const [modalCategoria, setModalCategoria] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [nombreCategoria, setNombreCategoria] = useState("");

  async function peticion(ruta, opciones = {}) {
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
      const detalle = typeof datos === "object" && datos !== null
        ? (datos.message || datos.error || datos.detail)
        : datos;
      throw new Error(respuesta.status === 401 || respuesta.status === 403
        ? "No tienes autorización. Inicia sesión con una cuenta ADMIN."
        : (detalle || `Error HTTP ${respuesta.status}`));
    }
    return datos;
  }

  async function cargarDatos() {
    setCargando(true);
    setError("");
    try {
      const [listaProductos, listaCategorias] = await Promise.all([
        peticion("/api/admin/productos"),
        peticion("/api/admin/categorias"),
      ]);
      setProductos(Array.isArray(listaProductos) ? listaProductos : []);
      setCategorias(Array.isArray(listaCategorias) ? listaCategorias : []);
    } catch (e) { setError(e.message); }
    finally { setCargando(false); }
  }

  useEffect(() => { cargarDatos(); }, []);

  const productosFiltrados = useMemo(() => productos.filter((p) => {
    const texto = `${p.nombreProducto || ""} ${p.descripcionProducto || ""} ${p.categoria?.nombreCategoria || ""}`.toLowerCase();
    return texto.includes(busqueda.trim().toLowerCase()) && (filtro === "todas" || String(p.categoria?.idCategoria) === filtro);
  }), [productos, busqueda, filtro]);

  function notificar(texto) { setMensaje(texto); setError(""); }
  function abrirProducto(producto = null) {
    setProductoEditando(producto);
    setArchivoImagen(null);
    setFormProducto(producto ? {
      nombreProducto: producto.nombreProducto || "",
      descripcionProducto: producto.descripcionProducto || "",
      ingredientesProducto: producto.ingredientesProducto || "",
      precioProducto: String(producto.precioProducto ?? ""),
      imagenProducto: producto.imagenProducto || "",
      idCategoria: String(producto.categoria?.idCategoria ?? ""),
      estadoProducto: producto.estadoProducto !== false,
    } : { ...productoVacio, idCategoria: String(categorias.find(c => c.estadoCategoria !== false)?.idCategoria || "") });
    setModalProducto(true);
    setError("");
  }

  function seleccionarImagen(evento) {
    const archivo = evento.target.files?.[0] || null;
    if (!archivo) { setArchivoImagen(null); return; }
    if (archivo.size > 5 * 1024 * 1024) {
      setError("La imagen no puede superar los 5 MB.");
      evento.target.value = "";
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(archivo.type)) {
      setError("Selecciona una imagen JPG, PNG o WEBP.");
      evento.target.value = "";
      return;
    }
    setError("");
    setArchivoImagen(archivo);
  }

  async function subirImagenProducto(id, archivo) {
    const datos = new FormData();
    datos.append("imagen", archivo);
    const token = localStorage.getItem("token");
    const respuesta = await fetch(`${API}/api/admin/productos/${id}/imagen`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: datos,
    });
    if (!respuesta.ok) {
      const texto = await respuesta.text();
      let detalle = texto;
      try { const json = JSON.parse(texto); detalle = json.message || json.detail || json.error || texto; } catch { /* texto sin JSON */ }
      throw new Error(`El producto se guardó, pero no se pudo subir la imagen (${respuesta.status}): ${detalle}`);
    }
    return respuesta.json();
  }

  async function guardarProducto(evento) {
    evento.preventDefault();
    if (!formProducto.nombreProducto.trim() || !formProducto.idCategoria || Number(formProducto.precioProducto) <= 0) {
      setError("Completa el nombre, la categoría y un precio mayor que cero."); return;
    }
    setGuardando(true); setError("");
    try {
      const cuerpo = {
        ...formProducto,
        nombreProducto: formProducto.nombreProducto.trim(),
        descripcionProducto: formProducto.descripcionProducto.trim(),
        ingredientesProducto: formProducto.ingredientesProducto.trim(),
        // La imagen subida se gestiona por su endpoint independiente.
        // En edición, null preserva la imagen almacenada.
        imagenProducto: productoEditando ? null : (formProducto.imagenProducto.trim() || null),
        precioProducto: Number(formProducto.precioProducto),
        idCategoria: Number(formProducto.idCategoria),
      };
      const productoGuardado = await peticion(productoEditando ? `/api/admin/productos/${productoEditando.idProducto}` : "/api/admin/productos", {
        method: productoEditando ? "PUT" : "POST", body: JSON.stringify(cuerpo),
      });
      const id = productoGuardado?.idProducto ?? productoEditando?.idProducto;
      if (archivoImagen) {
        if (!id) throw new Error("El producto se guardó, pero el servidor no devolvió su ID para subir la imagen.");
        await subirImagenProducto(id, archivoImagen);
      }
      setModalProducto(false);
      setArchivoImagen(null);
      await cargarDatos();
      notificar(productoEditando ? "Producto actualizado correctamente." : "Producto creado correctamente.");
    } catch (e) { setError(e.message); }
    finally { setGuardando(false); }
  }

  async function cambiarEstadoProducto(producto) {
    setError("");
    try {
      await peticion(`/api/admin/productos/${producto.idProducto}/estado`, {
        method: "PATCH", body: JSON.stringify({ estadoProducto: producto.estadoProducto === false }),
      });
      await cargarDatos();
      notificar("Estado del producto actualizado.");
    } catch (e) { setError(e.message); }
  }

  function abrirCategoria(categoria = null) {
    setCategoriaEditando(categoria);
    setNombreCategoria(categoria?.nombreCategoria || "");
    setModalCategoria(true);
    setError("");
  }

  async function guardarCategoria(evento) {
    evento.preventDefault();
    if (!nombreCategoria.trim()) { setError("Escribe el nombre de la categoría."); return; }
    setGuardando(true); setError("");
    try {
      await peticion(categoriaEditando ? `/api/admin/categorias/${categoriaEditando.idCategoria}` : "/api/admin/categorias", {
        method: categoriaEditando ? "PUT" : "POST",
        body: JSON.stringify({ nombreCategoria: nombreCategoria.trim(), estadoCategoria: categoriaEditando?.estadoCategoria ?? true }),
      });
      setModalCategoria(false);
      await cargarDatos();
      notificar(categoriaEditando ? "Categoría actualizada correctamente." : "Categoría creada correctamente.");
    } catch (e) { setError(e.message); }
    finally { setGuardando(false); }
  }

  async function cambiarEstadoCategoria(categoria) {
    setError("");
    try {
      await peticion(`/api/admin/categorias/${categoria.idCategoria}/estado`, {
        method: "PATCH", body: JSON.stringify({ estadoCategoria: categoria.estadoCategoria === false }),
      });
      await cargarDatos();
      notificar("Estado de la categoría actualizado.");
    } catch (e) { setError(e.message); }
  }

  const activos = productos.filter(p => p.estadoProducto !== false).length;
  const categoriasActivas = categorias.filter(c => c.estadoCategoria !== false).length;

  return (
    <div className="admin-dashboard">
      {/* SIDEBAR: mismo diseño y clases que AdminPersonal.jsx */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">Mesa<span>Click</span></div>
        <div className="admin-sidebar-divider"></div>
        <nav className="admin-navigation">
          <button className="admin-nav-item" onClick={() => navigate("/admin/dashboard")}><span>▦</span>Dashboard</button>
          <button className="admin-nav-item" onClick={() => navigate("/admin/personal")}><span>♙</span>Personal</button>
          <button className="admin-nav-item active" aria-current="page"><span>▣</span>Productos</button>
          <button className="admin-nav-item disabled"><span>▤</span>Pedidos<small>Próximamente</small></button>
          <button className="admin-nav-item disabled"><span>▥</span>Reportes<small>Próximamente</small></button>
          <button className="admin-nav-item disabled"><span>⚙</span>Configuración<small>Próximamente</small></button>
        </nav>
        <button className="admin-logout" onClick={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("rol");
          localStorage.removeItem("usuarioNombre");
          localStorage.removeItem("usuarioCorreo");
          navigate("/admin/login");
        }}><span>↪</span>Cerrar sesión</button>
      </aside>

      <main className="admin-main mc-ap-main">
        <div className="mc-ap-heading"><div><span className="mc-ap-eyebrow">ADMINISTRACIÓN DEL MENÚ</span><h1>Gestión de productos y categorías</h1><p>Organiza los productos que tus clientes encuentran al escanear el QR.</p></div><button className="mc-ap-btn mc-ap-btn-outline" onClick={cargarDatos} disabled={cargando}>↻ Actualizar</button></div>

        <div className="mc-ap-tabs" role="tablist" aria-label="Secciones del catálogo">
          <button type="button" role="tab" aria-selected={pestana === "productos"} className={pestana === "productos" ? "mc-ap-tab-active" : ""} onClick={() => { setPestana("productos"); setError(""); setMensaje(""); }}>▣ Productos</button>
          <button type="button" role="tab" aria-selected={pestana === "categorias"} className={pestana === "categorias" ? "mc-ap-tab-active" : ""} onClick={() => { setPestana("categorias"); setError(""); setMensaje(""); }}>▤ Categorías</button>
        </div>

        {error && <div className="mc-ap-alert mc-ap-alert-error" role="alert">{error}<button onClick={() => setError("")} aria-label="Cerrar error">×</button></div>}
        {mensaje && <div className="mc-ap-alert mc-ap-alert-ok" role="status">{mensaje}<button onClick={() => setMensaje("")} aria-label="Cerrar mensaje">×</button></div>}

        {pestana === "productos" ? <>
          <section className="mc-ap-stats" aria-label="Resumen de productos">
            <div className="mc-ap-stat"><span>Productos registrados</span><strong>{productos.length}</strong><small>En el catálogo</small></div>
            <div className="mc-ap-stat"><span>Productos activos</span><strong>{activos}</strong><small>Disponibles para la venta</small></div>
            <div className="mc-ap-stat"><span>Productos inactivos</span><strong>{productos.length - activos}</strong><small>No disponibles</small></div>
          </section>
          <section className="mc-ap-panel">
            <div className="mc-ap-panel-head"><div><h2>Lista de productos</h2><p>Consulta, edita o cambia su disponibilidad.</p></div><button className="mc-ap-btn mc-ap-btn-primary" onClick={() => abrirProducto()}>＋ Nuevo producto</button></div>
            <div className="mc-ap-filters"><input aria-label="Buscar productos" placeholder="Buscar por nombre, descripción o categoría..." value={busqueda} onChange={e => setBusqueda(e.target.value)} /><select aria-label="Filtrar por categoría" value={filtro} onChange={e => setFiltro(e.target.value)}><option value="todas">Todas las categorías</option>{categorias.map(c => <option key={c.idCategoria} value={String(c.idCategoria)}>{c.nombreCategoria}</option>)}</select></div>
            <div className="mc-ap-table-wrap"><table className="mc-ap-table"><thead><tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{productosFiltrados.map(p => <tr key={p.idProducto}><td><div className="mc-ap-product-cell">{p.imagenProducto ? <img src={urlImagen(p.imagenProducto)} alt="" onError={e => { e.currentTarget.style.display = "none"; }} /> : <span className="mc-ap-product-placeholder">🍔</span>}<div><strong>{p.nombreProducto}</strong><small>{p.descripcionProducto || "Sin descripción"}</small></div></div></td><td>{p.categoria?.nombreCategoria || "Sin categoría"}</td><td className="mc-ap-price">{dinero(p.precioProducto)}</td><td><span className={`mc-ap-status ${p.estadoProducto !== false ? "mc-ap-status-on" : "mc-ap-status-off"}`}>{p.estadoProducto !== false ? "Activo" : "Inactivo"}</span></td><td><div className="mc-ap-actions"><button onClick={() => abrirProducto(p)}>Editar</button><button onClick={() => cambiarEstadoProducto(p)}>{p.estadoProducto !== false ? "Desactivar" : "Activar"}</button></div></td></tr>)}</tbody></table>{!cargando && productosFiltrados.length === 0 && <div className="mc-ap-empty">No se encontraron productos.</div>}{cargando && <div className="mc-ap-empty">Cargando productos...</div>}</div>
          </section>
        </> : <>
          <section className="mc-ap-stats"><div className="mc-ap-stat"><span>Categorías registradas</span><strong>{categorias.length}</strong><small>En el catálogo</small></div><div className="mc-ap-stat"><span>Categorías activas</span><strong>{categoriasActivas}</strong><small>Habilitadas</small></div><div className="mc-ap-stat"><span>Categorías inactivas</span><strong>{categorias.length - categoriasActivas}</strong><small>Deshabilitadas</small></div></section>
          <section className="mc-ap-panel"><div className="mc-ap-panel-head"><div><h2>Categorías del menú</h2><p>Organiza tus productos por secciones.</p></div><button className="mc-ap-btn mc-ap-btn-primary" onClick={() => abrirCategoria()}>＋ Nueva categoría</button></div><div className="mc-ap-table-wrap"><table className="mc-ap-table"><thead><tr><th>ID</th><th>Categoría</th><th>Productos</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{categorias.map(c => <tr key={c.idCategoria}><td>#{c.idCategoria}</td><td><strong>{c.nombreCategoria}</strong></td><td>{productos.filter(p => p.categoria?.idCategoria === c.idCategoria).length}</td><td><span className={`mc-ap-status ${c.estadoCategoria !== false ? "mc-ap-status-on" : "mc-ap-status-off"}`}>{c.estadoCategoria !== false ? "Activa" : "Inactiva"}</span></td><td><div className="mc-ap-actions"><button onClick={() => abrirCategoria(c)}>Editar</button><button onClick={() => cambiarEstadoCategoria(c)}>{c.estadoCategoria !== false ? "Desactivar" : "Activar"}</button></div></td></tr>)}</tbody></table>{!cargando && categorias.length === 0 && <div className="mc-ap-empty">No hay categorías registradas.</div>}{cargando && <div className="mc-ap-empty">Cargando categorías...</div>}</div></section>
        </>}
      </main>

      {modalProducto && <div className="mc-ap-overlay" onMouseDown={e => { if (e.target === e.currentTarget && !guardando) setModalProducto(false); }}><div className="mc-ap-modal" role="dialog" aria-modal="true" aria-labelledby="mc-ap-product-title"><div className="mc-ap-modal-head"><h2 id="mc-ap-product-title">{productoEditando ? "Editar producto" : "Nuevo producto"}</h2><button type="button" aria-label="Cerrar" disabled={guardando} onClick={() => setModalProducto(false)}>×</button></div><form onSubmit={guardarProducto}>{error && <div className="mc-ap-alert mc-ap-alert-error" role="alert">{error}</div>}<div className="mc-ap-form-grid"><label>Nombre del producto *<input required maxLength={255} value={formProducto.nombreProducto} onChange={e => setFormProducto({ ...formProducto, nombreProducto: e.target.value })} /></label><label>Categoría *<select required value={formProducto.idCategoria} onChange={e => setFormProducto({ ...formProducto, idCategoria: e.target.value })}><option value="">Seleccionar categoría</option>{categorias.filter(c => c.estadoCategoria !== false || String(c.idCategoria) === formProducto.idCategoria).map(c => <option key={c.idCategoria} value={c.idCategoria}>{c.nombreCategoria}</option>)}</select></label><label>Precio (COP) *<input required type="number" min="1" step="any" value={formProducto.precioProducto} onChange={e => setFormProducto({ ...formProducto, precioProducto: e.target.value })} /></label><label className="mc-ap-full">Fotografía del producto (JPG, PNG o WEBP, máximo 5 MB)<input type="file" accept="image/jpeg,image/png,image/webp" onChange={seleccionarImagen} disabled={guardando} /></label><div className="mc-ap-full mc-ap-image-preview">{(vistaPrevia || formProducto.imagenProducto) ? <img src={vistaPrevia || urlImagen(formProducto.imagenProducto)} alt="Vista previa del producto" style={{ width: 160, height: 120, objectFit: "cover", borderRadius: 12, border: "1px solid #f2d6b0" }} /> : <span style={{ color: "#777" }}>Sin fotografía seleccionada</span>}</div><label className="mc-ap-full">Descripción<textarea rows={3} value={formProducto.descripcionProducto} onChange={e => setFormProducto({ ...formProducto, descripcionProducto: e.target.value })} /></label><label className="mc-ap-full">Ingredientes<textarea rows={3} value={formProducto.ingredientesProducto} onChange={e => setFormProducto({ ...formProducto, ingredientesProducto: e.target.value })} /></label><label className="mc-ap-check mc-ap-full"><input type="checkbox" checked={formProducto.estadoProducto} onChange={e => setFormProducto({ ...formProducto, estadoProducto: e.target.checked })} /> Producto activo</label></div><div className="mc-ap-modal-actions"><button type="button" className="mc-ap-btn mc-ap-btn-outline" onClick={() => setModalProducto(false)} disabled={guardando}>Cancelar</button><button type="submit" className="mc-ap-btn mc-ap-btn-primary" disabled={guardando}>{guardando ? "Guardando..." : "Guardar producto"}</button></div></form></div></div>}

      {modalCategoria && <div className="mc-ap-overlay" onMouseDown={e => { if (e.target === e.currentTarget && !guardando) setModalCategoria(false); }}><div className="mc-ap-modal mc-ap-modal-small" role="dialog" aria-modal="true" aria-labelledby="mc-ap-category-title"><div className="mc-ap-modal-head"><h2 id="mc-ap-category-title">{categoriaEditando ? "Editar categoría" : "Nueva categoría"}</h2><button type="button" aria-label="Cerrar" onClick={() => setModalCategoria(false)}>×</button></div><form onSubmit={guardarCategoria}><label className="mc-ap-category-label">Nombre de la categoría *<input required maxLength={255} autoFocus value={nombreCategoria} onChange={e => setNombreCategoria(e.target.value)} placeholder="Ej. Postres" /></label><div className="mc-ap-modal-actions"><button type="button" className="mc-ap-btn mc-ap-btn-outline" onClick={() => setModalCategoria(false)} disabled={guardando}>Cancelar</button><button type="submit" className="mc-ap-btn mc-ap-btn-primary" disabled={guardando}>{guardando ? "Guardando..." : "Guardar categoría"}</button></div></form></div></div>}
    </div>
  );
}

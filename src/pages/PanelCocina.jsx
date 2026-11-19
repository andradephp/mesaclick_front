import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function PanelCocina() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [pedidoActualizando, setPedidoActualizando] = useState(null);
  const navigate = useNavigate();

  const obtenerPedidos = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No hay sesión activa. Inicia sesión como Cocina.");
      const respuesta = await fetch("/api/pedidos/cocina", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!respuesta.ok) {
        if (respuesta.status === 401 || respuesta.status === 403) {
          throw new Error(`Acceso denegado (${respuesta.status}). Verifica que la sesión sea del rol COCINA y que SecurityConfig permita consultar pedidos.`);
        }
        throw new Error(`No se pudieron cargar los pedidos (${respuesta.status}).`);
      }
      const datos = await respuesta.json();
      if (!Array.isArray(datos)) throw new Error("El servidor no devolvió una lista de pedidos.");
      setPedidos(datos.filter((pedido) => (pedido.estadoPedido || "").trim().toUpperCase() === "EN_PREPARACION"));
      setError("");
    } catch (err) {
      setError(err.message || "Error al cargar los pedidos.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    obtenerPedidos();
    const intervalo = setInterval(obtenerPedidos, 5000);
    return () => clearInterval(intervalo);
  }, [obtenerPedidos]);

  const marcarComoListo = async (idPedido) => {
    try {
      setPedidoActualizando(idPedido);
      setError("");
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Tu sesión ha terminado. Vuelve a iniciar sesión.");
      const respuesta = await fetch(`/api/pedidos/${idPedido}/listo`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!respuesta.ok) {
        if (respuesta.status === 409) {
          await obtenerPedidos();
          throw new Error(`El pedido #${idPedido} ya cambió de estado. Se actualizó la lista.`);
        }
        if (respuesta.status === 401 || respuesta.status === 403) {
          throw new Error("No tienes permiso. Comprueba que has iniciado sesión como COCINA.");
        }
        throw new Error(`No se pudo actualizar el pedido (${respuesta.status}).`);
      }
      await obtenerPedidos();
    } catch (err) {
      setError(err.message || "Ocurrió un error.");
    } finally {
      setPedidoActualizando(null);
    }
  };

  const cerrarSesion = () => {
    ["token", "rol", "usuarioNombre", "usuarioCorreo"].forEach((clave) => localStorage.removeItem(clave));
    navigate("/personal/login");
  };

  const calcularMinutos = (fecha) => {
    if (!fecha) return 0;
    const tiempo = new Date(fecha).getTime();
    if (Number.isNaN(tiempo)) return 0;
    return Math.max(0, Math.floor((Date.now() - tiempo) / 60000));
  };

  return (
    <div className="cocina-layout">
      <aside className="cocina-sidebar">
        <div className="cocina-logo">Mesa<span>Click</span></div>
        <div className="cocina-menu-activo"><span>▦</span> Cocina</div>
        <button className="cocina-cerrar-sesion" onClick={cerrarSesion}>↪ Cerrar sesión</button>
      </aside>
      <main className="cocina-contenido">
        <header className="cocina-header">
          <div><h1>Cocina</h1><p>Pedidos en preparación</p></div>
          <div className="cocina-estado-conexion"><span className="cocina-punto-verde" /> Actualización automática</div>
        </header>
        {error && <div className="cocina-error" role="alert">{error} <button type="button" onClick={obtenerPedidos}>Reintentar</button></div>}
        {cargando ? <div className="cocina-mensaje">Cargando pedidos...</div> : error && pedidos.length === 0 ? null : pedidos.length === 0 ? (
          <div className="cocina-vacio">
            <div className="cocina-vacio-icono">✓</div>
            <h2>No hay pedidos en preparación</h2>
            <p>Los nuevos pedidos aparecerán automáticamente aquí.</p>
          </div>
        ) : (
          <div className="cocina-grid">
            {pedidos.map((pedido) => {
              const cantidades = new Map();
              (pedido.personas || []).forEach((persona) => {
                (persona.productos || []).forEach((producto) => {
                  const nombre = producto.nombreProducto || "Producto";
                  cantidades.set(nombre, (cantidades.get(nombre) || 0) + Number(producto.cantidad || 0));
                });
              });
              return (
                <article className="cocina-tarjeta" key={pedido.idPedido}>
                  <div className="cocina-tarjeta-header">
                    <div><h2>Pedido #{pedido.idPedido}</h2><p>Mesa {pedido.numeroMesa}</p></div>
                    <span className="cocina-badge">EN PREPARACIÓN</span>
                  </div>
                  <div className="cocina-productos">
                    <h3>Productos</h3>
                    {cantidades.size > 0 ? (
                      <ul>{[...cantidades.entries()].map(([nombre, cantidad]) => (
                        <li key={nombre}><span>{nombre}</span><strong>× {cantidad}</strong></li>
                      ))}</ul>
                    ) : <p className="cocina-sin-productos">Este pedido no tiene productos registrados.</p>}
                  </div>
                  <div className="cocina-tiempo"><span>◷</span> Hace {calcularMinutos(pedido.fechaPedido)} min</div>
                  <button className="cocina-boton-listo" onClick={() => marcarComoListo(pedido.idPedido)} disabled={pedidoActualizando !== null}>
                    {pedidoActualizando === pedido.idPedido ? "Actualizando..." : "✓ Marcar como listo"}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default PanelCocina;

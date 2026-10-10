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

            const respuesta = await fetch(
                "http://localhost:8080/api/pedidos/mesero",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!respuesta.ok) {
                throw new Error("No se pudieron cargar los pedidos.");
            }

            const datos = await respuesta.json();

            setPedidos(
    datos.filter(
        (pedido) => pedido.estadoPedido === "EN_PREPARACION"
    )
);

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

            const respuesta = await fetch(
                `http://localhost:8080/api/pedidos/${idPedido}/listo`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!respuesta.ok) {
                throw new Error(
                    respuesta.status === 403
                        ? "No tienes permiso para marcar este pedido como listo."
                        : "No se pudo actualizar el pedido."
                );
            }

            setPedidos((anteriores) =>
                anteriores.filter(
                    (pedido) => pedido.idPedido !== idPedido
                )
            );
        } catch (err) {
            setError(err.message || "Ocurrió un error.");
        } finally {
            setPedidoActualizando(null);
        }
    };

    const cerrarSesion = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("rol");
        localStorage.removeItem("usuarioNombre");
        localStorage.removeItem("usuarioCorreo");

        window.location.href = "/";
    };

    const calcularMinutos = (fecha) => {
        if (!fecha) return 0;

        const fechaPedido = new Date(fecha);
        const diferencia = Date.now() - fechaPedido.getTime();

        return Math.max(0, Math.floor(diferencia / 60000));
    };

    return (
        <div className="cocina-layout">
            <aside className="cocina-sidebar">
                <div className="cocina-logo">
                    Mesa<span>Click</span>
                </div>

                <div className="cocina-menu-activo">
                    <span>▦</span> Cocina
                </div>

                <button
                    className="cocina-cerrar-sesion"
                    onClick={cerrarSesion}
                >
                    ↪ Cerrar sesión
                </button>
            </aside>

            <main className="cocina-contenido">
                <header className="cocina-header">
                    <div>
                        <h1>Cocina</h1>
                        <p>Pedidos en preparación</p>
                    </div>

                    <div className="cocina-estado-conexion">
                        <span className="cocina-punto-verde"></span>
                        Actualización automática
                    </div>
                </header>

                {error && (
                    <div className="cocina-error" role="alert">
                        {error}
                    </div>
                )}

                {cargando ? (
                    <div className="cocina-mensaje">
                        Cargando pedidos...
                    </div>
                ) : pedidos.length === 0 ? (
                    <div className="cocina-vacio">
                        <div className="cocina-vacio-icono">✓</div>
                        <h2>No hay pedidos pendientes</h2>
                        <p>
                            Los nuevos pedidos aparecerán automáticamente aquí.
                        </p>
                    </div>
                ) : (
                    <div className="cocina-grid">
                        {pedidos.map((pedido) => (
                            <article
                                className="cocina-tarjeta"
                                key={pedido.idPedido}
                            >
                                <div className="cocina-tarjeta-header">
                                    <div>
                                        <h2>
                                            Pedido #{pedido.idPedido}
                                        </h2>
                                        <p>Mesa {pedido.numeroMesa}</p>
                                    </div>

                                    <span className="cocina-badge">
                                        EN PREPARACIÓN
                                    </span>
                                </div>

                                <div className="cocina-productos">
                                    <h3>Productos</h3>

                                    {
    (() => {
        const cantidades = new Map();

        (pedido.personas || []).forEach((persona) => {
            (persona.productos || []).forEach((producto) => {
                const nombre = producto.nombreProducto || "Producto";
                const cantidad = Number(producto.cantidad || 0);

                cantidades.set(
                    nombre,
                    (cantidades.get(nombre) || 0) + cantidad
                );
            });
        });

        return cantidades.size > 0 ? (
            <ul>
                {[...cantidades.entries()].map(([nombre, cantidad]) => (
                    <li key={nombre}>
                        <span>{nombre}</span>
                        <strong>× {cantidad}</strong>
                    </li>
                ))}
            </ul>
        ) : (
            <p className="cocina-sin-productos">
                Este pedido no tiene productos registrados.
            </p>
        );
    })()
}
                                </div>

                                <div className="cocina-tiempo">
                                    <span>◷</span>
                                    Hace{" "}
                                    {calcularMinutos(pedido.fechaPedido)} min
                                </div>

                                <button
                                    className="cocina-boton-listo"
                                    onClick={() =>
                                        marcarComoListo(pedido.idPedido)
                                    }
                                    disabled={
                                        pedidoActualizando === pedido.idPedido
                                    }
                                >
                                    {pedidoActualizando === pedido.idPedido
                                        ? "Actualizando..."
                                        : "✓ Marcar como listo"}
                                </button>
                            </article>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default PanelCocina;
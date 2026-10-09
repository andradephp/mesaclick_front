import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import NuevoPedidoModal from "./NuevoPedidoModal";

const API_URL = "http://localhost:8080/api/pedidos/mesero";

function MeseroDashboard() {
    const navigate = useNavigate();
    const nombre = localStorage.getItem("usuarioNombre") || "Mesero";

    const [pedidos, setPedidos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [entregando, setEntregando] = useState(null);

    // Modal para registrar un nuevo pedido
    const [mostrarModal, setMostrarModal] = useState(false);

    // Modal para confirmar la entrega de un pedido
    const [mostrarModalEntrega, setMostrarModalEntrega] = useState(null);

    const [vista, setVista] = useState("activos");

    const cerrarSesion = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("rol");
        localStorage.removeItem("usuarioNombre");
        localStorage.removeItem("usuarioCorreo");
        navigate("/personal/login");
    };

    const cargarPedidos = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");

            const respuesta = await fetch(API_URL, {
                headers: token
                    ? { Authorization: `Bearer ${token}` }
                    : {},
            });

            if (!respuesta.ok) {
                throw new Error(
                    `Error al consultar pedidos (${respuesta.status})`
                );
            }

            const datos = await respuesta.json();

            setPedidos(Array.isArray(datos) ? datos : []);
            setError("");
        } catch (e) {
            setError(e.message || "No fue posible cargar los pedidos.");
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        cargarPedidos();

        const intervalo = setInterval(cargarPedidos, 5000);

        return () => clearInterval(intervalo);
    }, [cargarPedidos]);

    // Marcar como entregado únicamente después de confirmar en el modal
    const entregarPedido = async () => {
        if (!mostrarModalEntrega || entregando !== null) {
            return;
        }

        const idPedido = mostrarModalEntrega.idPedido;

        try {
            setEntregando(idPedido);

            const token = localStorage.getItem("token");

            const respuesta = await fetch(
                `http://localhost:8080/api/pedidos/${idPedido}/entregado`,
                {
                    method: "PATCH",
                    headers: {
                        ...(token
                            ? { Authorization: `Bearer ${token}` }
                            : {}),
                    },
                }
            );

            if (!respuesta.ok) {
                throw new Error(
                    `No se pudo entregar el pedido. Código: ${respuesta.status}`
                );
            }

            // Cerrar el modal después de confirmar la operación
            setMostrarModalEntrega(null);

            // Actualizar los pedidos y el historial sin recargar la página
            await cargarPedidos();
        } catch (error) {
            console.error("Error al entregar el pedido:", error);
            window.alert(
                error.message || "Ocurrió un error al entregar el pedido."
            );
        } finally {
            setEntregando(null);
        }
    };

    const formatoPrecio = (valor) =>
        new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0,
        }).format(valor ?? 0);

    const formatoFecha = (fecha) => {
        if (!fecha) return "Hora no disponible";

        const fechaPedido = new Date(fecha);

        if (Number.isNaN(fechaPedido.getTime())) return fecha;

        return fechaPedido.toLocaleString("es-CO", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    const nombreEstado = (estado) =>
        ({
            PENDIENTE: "Pendiente",
            EN_PREPARACION: "En preparación",
            LISTO: "Listo para entregar",
            ENTREGADO: "Entregado",
        }[estado] || estado || "Sin estado");

    const pedidosActivos = useMemo(() => {
        return pedidos
            .filter((pedido) => pedido.estadoPedido !== "ENTREGADO")
            .sort((a, b) => {
                const prioridad = (estado) => {
                    if (estado === "LISTO") return 0;
                    if (estado === "PENDIENTE") return 1;
                    if (estado === "EN_PREPARACION") return 2;
                    return 3;
                };

                return (
                    prioridad(a.estadoPedido) - prioridad(b.estadoPedido) ||
                    new Date(b.fechaPedido || 0) -
                        new Date(a.fechaPedido || 0)
                );
            });
    }, [pedidos]);

    const pedidosEntregados = useMemo(() => {
        return pedidos
            .filter((pedido) => pedido.estadoPedido === "ENTREGADO")
            .sort(
                (a, b) =>
                    new Date(b.fechaPedido || 0) -
                    new Date(a.fechaPedido || 0)
            );
    }, [pedidos]);

    const contarEstado = (estado) =>
        pedidos.filter((pedido) => pedido.estadoPedido === estado).length;

    const listaVisible =
        vista === "activos" ? pedidosActivos : pedidosEntregados;

    const renderPedido = (pedido) => (
        <article
            key={pedido.idPedido}
            className={`mesero-nuevo-pedido ${
                pedido.estadoPedido === "LISTO"
                    ? "mesero-nuevo-pedido-listo"
                    : ""
            }`}
        >
            <div className="mesero-nuevo-pedido-top">
                <div>
                    <span className="mesero-nuevo-id">
                        PEDIDO #{pedido.idPedido}
                    </span>

                    <h3>Mesa {pedido.numeroMesa}</h3>

                    <span className="mesero-nuevo-fecha">
                        {formatoFecha(pedido.fechaPedido)}
                    </span>
                </div>

                <span
                    className={`mesero-nuevo-estado estado-${(
                        pedido.estadoPedido || "pendiente"
                    ).toLowerCase()}`}
                >
                    {nombreEstado(pedido.estadoPedido)}
                </span>
            </div>

            <div className="mesero-nuevo-productos">
                {(pedido.personas || []).map((persona, indice) => (
                    <div
                        className="mesero-nuevo-persona"
                        key={`${pedido.idPedido}-${indice}`}
                    >
                        {persona.nombrePersona &&
                            persona.nombrePersona !== "Pedido general" && (
                                <h4>{persona.nombrePersona}</h4>
                            )}

                        <ul>
                            {(persona.productos || []).map(
                                (producto, index) => (
                                    <li
                                        key={`${pedido.idPedido}-${indice}-${index}`}
                                    >
                                        <span className="mesero-nuevo-cantidad">
                                            {producto.cantidad} ×
                                        </span>

                                        <span>
                                            {producto.nombreProducto}
                                        </span>
                                    </li>
                                )
                            )}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="mesero-nuevo-pie">
                <div>
                    <span>Total del pedido</span>
                    <strong>{formatoPrecio(pedido.totalPedido)}</strong>
                </div>

                {vista === "historial" ? (
                    <span className="mesero-nuevo-entregado">
                        Entrega confirmada
                    </span>
                ) : (
                    <button
                        type="button"
                        className="mesero-nuevo-btn-entregar"
                        onClick={() => setMostrarModalEntrega(pedido)}
                        disabled={entregando !== null}
                    >
                        {entregando === pedido.idPedido
                            ? "Procesando..."
                            : "Entregado"}
                    </button>
                )}
            </div>
        </article>
    );

    return (
        <main className="mesero-nuevo-dashboard">
            <header className="mesero-nuevo-header">
                <div className="mesero-nuevo-logo">
                    Mesa<span>Click</span>
                    <p>Panel de atención</p>
                </div>

                <div className="mesero-nuevo-usuario">
                    <div className="mesero-nuevo-avatar">
                        {nombre.charAt(0).toUpperCase()}
                    </div>

                    <div className="mesero-nuevo-datos-usuario">
                        <strong>{nombre}</strong>
                        <span>Personal de atención</span>
                    </div>

                    <button
                        type="button"
                        className="mesero-nuevo-cerrar-sesion"
                        onClick={cerrarSesion}
                    >
                        Cerrar sesión
                    </button>
                </div>
            </header>

            <section className="mesero-nuevo-bienvenida">
                <div>
                    <span className="mesero-nuevo-etiqueta">
                        CENTRO DE ATENCIÓN
                    </span>

                    <h1>Panel de mesero</h1>

                    <p>
                        Gestiona los pedidos y atiende a tus mesas desde un
                        solo lugar.
                    </p>
                </div>

                <button
                    type="button"
                    className="mesero-nuevo-btn-principal"
                    onClick={() => setMostrarModal(true)}
                >
                    <span className="mesero-nuevo-mas">+</span>
                    Nuevo pedido
                </button>
            </section>

            <section className="mesero-nuevo-resumen">
                <article className="mesero-nuevo-resumen-card">
                    <span className="mesero-nuevo-resumen-icono">01</span>
                    <div>
                        <p>Pedidos activos</p>
                        <strong>{pedidosActivos.length}</strong>
                    </div>
                </article>

                <article className="mesero-nuevo-resumen-card resumen-listos">
                    <span className="mesero-nuevo-resumen-icono">02</span>
                    <div>
                        <p>Listos para entregar</p>
                        <strong>{contarEstado("LISTO")}</strong>
                    </div>
                </article>

                <article className="mesero-nuevo-resumen-card">
                    <span className="mesero-nuevo-resumen-icono">03</span>
                    <div>
                        <p>En preparación</p>
                        <strong>{contarEstado("EN_PREPARACION")}</strong>
                    </div>
                </article>

                <article className="mesero-nuevo-resumen-card">
                    <span className="mesero-nuevo-resumen-icono">04</span>
                    <div>
                        <p>Entregados</p>
                        <strong>{pedidosEntregados.length}</strong>
                    </div>
                </article>
            </section>

            <section className="mesero-nuevo-contenedor">
                <div className="mesero-nuevo-barra">
                    <div>
                        <h2>
                            {vista === "activos"
                                ? "Pedidos activos"
                                : "Historial de entregas"}
                        </h2>

                        <p>
                            {vista === "activos"
                                ? "Prioriza los pedidos que ya están listos."
                                : "Consulta los pedidos cuya entrega fue confirmada."}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="mesero-nuevo-actualizar"
                        onClick={cargarPedidos}
                    >
                        Actualizar
                    </button>
                </div>

                <nav className="mesero-nuevo-pestanas">
                    <button
                        type="button"
                        className={
                            vista === "activos"
                                ? "mesero-nuevo-pestana seleccionada"
                                : "mesero-nuevo-pestana"
                        }
                        onClick={() => setVista("activos")}
                    >
                        Pedidos activos
                        <span>{pedidosActivos.length}</span>
                    </button>

                    <button
                        type="button"
                        className={
                            vista === "historial"
                                ? "mesero-nuevo-pestana seleccionada"
                                : "mesero-nuevo-pestana"
                        }
                        onClick={() => setVista("historial")}
                    >
                        Historial
                        <span>{pedidosEntregados.length}</span>
                    </button>
                </nav>

                {cargando && (
                    <div className="mesero-nuevo-vacio">
                        Cargando pedidos...
                    </div>
                )}

                {!cargando && error && (
                    <div className="mesero-nuevo-error">
                        <p>{error}</p>
                        <button type="button" onClick={cargarPedidos}>
                            Intentar de nuevo
                        </button>
                    </div>
                )}

                {!cargando && !error && listaVisible.length === 0 && (
                    <div className="mesero-nuevo-vacio">
                        <div className="mesero-nuevo-vacio-icono">
                            {vista === "activos" ? "—" : "✓"}
                        </div>

                        <h3>
                            {vista === "activos"
                                ? "No hay pedidos activos"
                                : "Aún no hay entregas registradas"}
                        </h3>

                        <p>
                            {vista === "activos"
                                ? "Puedes registrar un nuevo pedido con el botón superior."
                                : "Los pedidos aparecerán aquí cuando confirmes su entrega."}
                        </p>

                        {vista === "activos" && (
                            <button
                                type="button"
                                className="mesero-nuevo-btn-secundario"
                                onClick={() => setMostrarModal(true)}
                            >
                                Registrar pedido
                            </button>
                        )}
                    </div>
                )}

                {!cargando && !error && listaVisible.length > 0 && (
                    <div className="mesero-nuevo-lista">
                        {listaVisible.map(renderPedido)}
                    </div>
                )}

                <div className="mesero-nuevo-nota">
                    <span className="mesero-nuevo-punto-vivo" />
                    Los pedidos se actualizan automáticamente cada 5 segundos.
                </div>
            </section>

            <footer className="mesero-nuevo-footer">
                MesaClick · Sistema de gestión para restaurantes
            </footer>

            {/* Modal para registrar un nuevo pedido */}
            {mostrarModal && (
                <NuevoPedidoModal
                    onCerrar={() => setMostrarModal(false)}
                    onPedidoCreado={cargarPedidos}
                />
            )}

            {/* Modal personalizado para confirmar la entrega */}
            {mostrarModalEntrega && (
                <div
                    className="confirmacion-entrega-fondo"
                    onClick={() => {
                        if (entregando === null) {
                            setMostrarModalEntrega(null);
                        }
                    }}
                >
                    <div
                        className="confirmacion-entrega-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="titulo-confirmacion-entrega"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="confirmacion-entrega-icono">
                            !
                        </div>

                        <h2
                            id="titulo-confirmacion-entrega"
                            className="confirmacion-entrega-titulo"
                        >
                            ¿Confirmar entrega?
                        </h2>

                        <p className="confirmacion-entrega-mensaje">
                            ¿Estás seguro de que deseas marcar como entregado
                            este pedido?
                        </p>

                        <div className="confirmacion-entrega-datos">
                            <p>
                                <span>Pedido</span>
                                <strong>
                                    #{mostrarModalEntrega.idPedido}
                                </strong>
                            </p>

                            <p>
                                <span>Mesa</span>
                                <strong>
                                    {mostrarModalEntrega.numeroMesa}
                                </strong>
                            </p>

                            <p>
                                <span>Estado actual</span>
                                <strong>
                                    {nombreEstado(
                                        mostrarModalEntrega.estadoPedido
                                    )}
                                </strong>
                            </p>
                        </div>

                        <div className="confirmacion-entrega-botones">
                            <button
                                type="button"
                                className="confirmacion-entrega-boton confirmacion-entrega-cancelar"
                                onClick={() =>
                                    setMostrarModalEntrega(null)
                                }
                                disabled={entregando !== null}
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                className="confirmacion-entrega-boton confirmacion-entrega-confirmar"
                                onClick={entregarPedido}
                                disabled={entregando !== null}
                            >
                                {entregando ===
                                mostrarModalEntrega.idPedido
                                    ? "Procesando..."
                                    : "Sí, entregar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

export default MeseroDashboard;


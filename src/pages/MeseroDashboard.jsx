
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:8080/api/pedidos/mesero";

function MeseroDashboard() {
    const navigate = useNavigate();
    const nombre = localStorage.getItem("usuarioNombre") || "Mesero";
    const [pedidos, setPedidos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [entregando, setEntregando] = useState(null);

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
                throw new Error(`Error al consultar pedidos (${respuesta.status})`);
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

    const entregarPedido = async (idPedido) => {
        const confirmar = window.confirm(
            `¿Confirmas que el pedido #${idPedido} fue entregado a la mesa?`
        );

        if (!confirmar) return;

        setEntregando(idPedido);

        try {
            const token = localStorage.getItem("token");

            const respuesta = await fetch(
                `http://localhost:8080/api/pedidos/${idPedido}/entregado`,
                {
                    method: "PATCH",
                    headers: token
                        ? { Authorization: `Bearer ${token}` }
                        : {},
                }
            );

            if (!respuesta.ok) {
                const mensaje = await respuesta.text();
                throw new Error(
                    mensaje || `No se pudo entregar el pedido (${respuesta.status}).`
                );
            }

            await cargarPedidos();
        } catch (e) {
            alert(e.message || "No se pudo actualizar el pedido.");
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

    const contarEstado = (estado) =>
        pedidos.filter((pedido) => pedido.estadoPedido === estado).length;

    const pedidosOrdenados = [...pedidos].sort((a, b) => {
        const prioridad = (estado) => {
            if (estado === "LISTO") return 0;
            if (estado === "EN_PREPARACION") return 1;
            if (estado === "PENDIENTE") return 2;
            if (estado === "ENTREGADO") return 3;
            return 4;
        };

        return prioridad(a.estadoPedido) - prioridad(b.estadoPedido);
    });

    const nombreEstado = (estado) => {
        const estados = {
            PENDIENTE: "Pendiente",
            EN_PREPARACION: "En preparación",
            LISTO: "Listo para entregar",
            ENTREGADO: "Entregado",
        };

        return estados[estado] || estado || "Sin estado";
    };

    return (
        <main className="mesero-dashboard">
            <header className="mesero-header">
                <div className="mesero-logo">
                    Mesa<span>Click</span>
                    <p>Panel de atención</p>
                </div>

                <div className="mesero-header-actions">
                    <span className="mesero-user-name">{nombre}</span>
                    <button
                        className="mesero-logout"
                        onClick={cerrarSesion}
                    >
                        Cerrar sesión
                    </button>
                </div>
            </header>

            <section className="mesero-welcome">
                <div>
                    <span className="mesero-label">ÁREA DE TRABAJO</span>
                    <h1>Pedidos del restaurante</h1>
                    <p>
                        Consulta los pedidos y entrega los que estén listos.
                    </p>
                </div>

                <button
                    type="button"
                    className="mesero-refresh"
                    onClick={cargarPedidos}
                >
                    Actualizar pedidos
                </button>
            </section>

            <section className="mesero-resumen">
                <article className="mesero-resumen-item">
                    <span>En preparación</span>
                    <strong>{contarEstado("EN_PREPARACION")}</strong>
                </article>

                <article className="mesero-resumen-item mesero-resumen-listo">
                    <span>Listos para entregar</span>
                    <strong>{contarEstado("LISTO")}</strong>
                </article>

                <article className="mesero-resumen-item">
                    <span>Entregados</span>
                    <strong>{contarEstado("ENTREGADO")}</strong>
                </article>
            </section>

            <section className="mesero-pedidos-section">
                <div className="mesero-section-heading">
                    <div>
                        <h2>Pedidos recibidos</h2>
                        <p>
                            {pedidos.length} pedido(s) registrados ·
                            actualización automática cada 5 segundos
                        </p>
                    </div>
                    <span className="mesero-live-indicator">
                        <span /> En seguimiento
                    </span>
                </div>

                {cargando && (
                    <div className="mesero-mensaje">
                        Cargando pedidos...
                    </div>
                )}

                {!cargando && error && (
                    <div className="mesero-mensaje mesero-error">
                        <p>{error}</p>
                        <button onClick={cargarPedidos}>
                            Intentar de nuevo
                        </button>
                    </div>
                )}

                {!cargando && !error && pedidosOrdenados.length === 0 && (
                    <div className="mesero-mensaje">
                        <h3>No hay pedidos registrados</h3>
                        <p>
                            Los nuevos pedidos aparecerán aquí automáticamente.
                        </p>
                    </div>
                )}

                {!error && pedidosOrdenados.length > 0 && (
                    <div className="mesero-pedidos-lista">
                        {pedidosOrdenados.map((pedido) => (
                            <article
                                key={pedido.idPedido}
                                className={`mesero-pedido ${
                                    pedido.estadoPedido === "LISTO"
                                        ? "mesero-pedido-listo"
                                        : ""
                                }`}
                            >
                                <div className="mesero-pedido-cabecera">
                                    <div className="mesero-pedido-identidad">
                                        <span className="mesero-pedido-numero">
                                            Pedido #{pedido.idPedido}
                                        </span>
                                        <h3>
                                            Mesa {pedido.numeroMesa}
                                        </h3>
                                        <span className="mesero-pedido-fecha">
                                            {formatoFecha(pedido.fechaPedido)}
                                        </span>
                                    </div>

                                    <span
                                        className={`mesero-estado mesero-estado-${(
                                            pedido.estadoPedido || "pendiente"
                                        ).toLowerCase()}`}
                                    >
                                        {nombreEstado(pedido.estadoPedido)}
                                    </span>
                                </div>

                                <div className="mesero-pedido-contenido">
                                    {(pedido.personas || []).map(
                                        (persona, indice) => (
                                            <div
                                                className="mesero-persona"
                                                key={`${pedido.idPedido}-${indice}`}
                                            >
                                                <h4>{persona.nombrePersona}</h4>

                                                <ul>
                                                    {(persona.productos || []).map(
                                                        (producto, index) => (
                                                            <li
                                                                key={`${pedido.idPedido}-${indice}-${index}`}
                                                            >
                                                                <span>
                                                                    <strong>
                                                                        {producto.cantidad}×
                                                                    </strong>{" "}
                                                                    {producto.nombreProducto}
                                                                </span>
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            </div>
                                        )
                                    )}
                                </div>

                                <div className="mesero-pedido-pie">
                                    <div>
                                        <span>Total del pedido</span>
                                        <strong>
                                            {formatoPrecio(pedido.totalPedido)}
                                        </strong>
                                    </div>

                                    {pedido.estadoPedido === "LISTO" ? (
                                        <button
                                            className="mesero-entregar"
                                            onClick={() =>
                                                entregarPedido(pedido.idPedido)
                                            }
                                            disabled={
                                                entregando === pedido.idPedido
                                            }
                                        >
                                            {entregando === pedido.idPedido
                                                ? "Entregando..."
                                                : "Confirmar entrega"}
                                        </button>
                                    ) : pedido.estadoPedido === "ENTREGADO" ? (
                                        <span className="mesero-entregado">
                                            Entrega confirmada
                                        </span>
                                    ) : (
                                        <span className="mesero-espera">
                                            Pendiente de cocina
                                        </span>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            <footer className="mesero-footer">
                MesaClick · Sistema de gestión para restaurantes
            </footer>
        </main>
    );
}

export default MeseroDashboard;
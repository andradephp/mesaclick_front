
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

const formatearPrecio = (valor) =>
    Number(valor || 0).toLocaleString("es-CO");

const nombresEstado = {
    EN_PREPARACION: "En preparación en cocina",
    LISTO: "Platos listos para servir",
    ENTREGADO: "Pedido entregado",
    PAGADO: "Pedido pagado"
};

function PedidoEnviado() {
    const { codigo } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const idPedidoInicial = location.state?.idPedido ?? null;

    const [mesa, setMesa] = useState(null);
    const [pedidos, setPedidos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [pagoConfirmado, setPagoConfirmado] = useState(false);

    const tuvoPedidosActivos = useRef(false);
    const idPedidoReferencia = useRef(idPedidoInicial);

    useEffect(() => {
        let activo = true;
        let intervalo;

        // Reiniciar el seguimiento cuando cambia el QR.
        tuvoPedidosActivos.current = false;
        idPedidoReferencia.current = idPedidoInicial;

        setCargando(true);
        setPagoConfirmado(false);
        setPedidos([]);
        setMesa(null);
        setError("");

        const iniciarSeguimiento = async () => {
            try {
                const respuestaMesa = await fetch(
                    `/api/mesas/codigo/${encodeURIComponent(codigo)}`
                );

                if (!respuestaMesa.ok) {
                    throw new Error("No se encontró la mesa");
                }

                const datosMesa = await respuestaMesa.json();

                if (!activo) return;

                setMesa(datosMesa);

                const consultarPedidos = async () => {
                    try {
                        const respuesta = await fetch(
                            `/api/pedidos/mesa/${datosMesa.id_mesa}`,
                            { cache: "no-store" }
                        );

                        if (!respuesta.ok) {
                            throw new Error(
                                "No se pudo consultar el historial"
                            );
                        }

                        const datos = await respuesta.json();

                        if (!activo) return;

                        setError("");

                        if (datos.length > 0) {
                            tuvoPedidosActivos.current = true;
                            setPedidos(datos);

                            // Si ya tenemos un pedido de referencia,
                            // verificamos si sigue en la atención.
                            if (
                                idPedidoReferencia.current !== null &&
                                !datos.some(
                                    (pedido) =>
                                        Number(pedido.idPedido) ===
                                        Number(idPedidoReferencia.current)
                                )
                            ) {
                                // No mostramos pedidos de otra atención.
                                setPedidos([]);
                                setPagoConfirmado(true);
                            }
                        } else {
                            setPedidos([]);

                            // Solo consideramos que terminó una atención
                            // si antes vimos pedidos activos.
                            if (tuvoPedidosActivos.current) {
                                setPagoConfirmado(true);
                            }
                        }
                    } catch (err) {
                        if (activo) {
                            console.error(err);
                            setError("No fue posible actualizar los pedidos.");
                        }
                    } finally {
                        if (activo) setCargando(false);
                    }
                };

                await consultarPedidos();

                if (activo) {
                    intervalo = setInterval(consultarPedidos, 5000);
                }
            } catch (err) {
                if (activo) {
                    console.error(err);
                    setError(err.message);
                    setCargando(false);
                }
            }
        };

        iniciarSeguimiento();

        return () => {
            activo = false;
            clearInterval(intervalo);
        };
    }, [codigo, idPedidoInicial]);

    useEffect(() => {
        if (!pagoConfirmado) return;

        const temporizador = setTimeout(() => {
            navigate(`/mesa/${codigo}`, { replace: true });
        }, 3000);

        return () => clearTimeout(temporizador);
    }, [pagoConfirmado, codigo, navigate]);

    const pedidoActual = pedidos.find(
        (pedido) =>
            Number(pedido.idPedido) ===
            Number(idPedidoReferencia.current)
    );

    const estadoOrden = pedidoActual?.estadoPedido ??
        pedidos[pedidos.length - 1]?.estadoPedido ??
        "EN_PREPARACION";

    const totalAtencion = pedidos.reduce(
        (total, pedido) => total + Number(pedido.totalPedido || 0),
        0
    );

    if (cargando) {
        return (
            <div
                className="mc-landing"
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "100vh"
                }}
            >
                <p style={{ color: "#64748b" }}>
                    Sincronizando estado de tu mesa...
                </p>
            </div>
        );
    }

    return (
        <div
            className="mc-landing"
            style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
            }}
        >
            <header className="mc-header">
                <div
                    className="mc-logo"
                    onClick={() => navigate("/")}
                    style={{ cursor: "pointer" }}
                >
                    Mesa<span>Click</span>
                </div>

                <div
                    style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#64748b"
                    }}
                >
                    Mesa N° {mesa?.numero_mesa ?? codigo}
                </div>
            </header>

            <main className="mc-section mc-text-center">
                <div
                    className="mc-container"
                    style={{ maxWidth: "650px" }}
                >
                    {pagoConfirmado ? (
                        <div
                            className="mc-card mc-animate mc-visible mc-zoom-in"
                            style={{ padding: "40px" }}
                        >
                            <div
                                style={{
                                    width: "48px",
                                    height: "48px",
                                    background: "rgba(16,185,129,0.1)",
                                    color: "#10b981",
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto 16px",
                                    fontSize: "24px"
                                }}
                            >
                                ✓
                            </div>

                            <span className="mc-tag-sub">
                                Atención finalizada
                            </span>

                            <h2>¡Tu atención ha finalizado!</h2>

                            <p className="mc-section-subtitle">
                                La atención anterior de esta mesa ya
                                está cerrada. Te llevaremos al menú
                                para comenzar una nueva.
                            </p>

                            <button
                                className="mc-btn-primary"
                                onClick={() =>
                                    navigate(`/mesa/${codigo}`, {
                                        replace: true
                                    })
                                }
                                style={{ width: "100%" }}
                            >
                                Volver al menú
                            </button>
                        </div>
                    ) : (
                        <div
                            className="mc-card mc-animate mc-visible"
                            style={{ textAlign: "left" }}
                        >
                            <div
                                className="mc-text-center"
                                style={{ marginBottom: "25px" }}
                            >
                                <span className="mc-tag-sub">
                                    Seguimiento en vivo
                                </span>

                                <h2>Resumen de tu pedido</h2>

                                <p className="mc-section-subtitle">
                                    Consulta el estado de los pedidos
                                    de tu mesa.
                                </p>
                            </div>

                            {error && (
                                <p
                                    style={{
                                        color: "#dc2626",
                                        marginBottom: "15px"
                                    }}
                                >
                                    {error}
                                </p>
                            )}

                            {pedidos.length === 0 ? (
                                <div
                                    style={{
                                        padding: "20px",
                                        textAlign: "center",
                                        color: "#64748b"
                                    }}
                                >
                                    No hay pedidos activos en esta mesa.
                                </div>
                            ) : (
                                <>
                                    <div
                                        style={{
                                            background: "#f8fafc",
                                            border: "1px solid #e2e8f0",
                                            padding: "16px 20px",
                                            borderRadius: "6px",
                                            marginBottom: "25px"
                                        }}
                                    >
                                        <p
                                            style={{
                                                fontSize: "12.5px",
                                                color: "#64748b",
                                                margin: "0 0 6px",
                                                fontWeight: "600"
                                            }}
                                        >
                                            ESTADO DEL PEDIDO
                                        </p>

                                        <strong
                                            style={{
                                                color: "#f18a04"
                                            }}
                                        >
                                            {nombresEstado[estadoOrden] ??
                                                estadoOrden}
                                        </strong>
                                    </div>

                                    {pedidos.map((pedido) => (
                                        <div
                                            key={pedido.idPedido}
                                            style={{
                                                border: "1px solid #e2e8f0",
                                                borderRadius: "6px",
                                                padding: "16px",
                                                marginBottom: "12px"
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    gap: "10px",
                                                    marginBottom: "10px"
                                                }}
                                            >
                                                <strong>
                                                    Pedido #{pedido.idPedido}
                                                </strong>

                                                <span
                                                    style={{
                                                        color: "#f18a04",
                                                        fontSize: "12px",
                                                        fontWeight: "600"
                                                    }}
                                                >
                                                    {nombresEstado[
                                                        pedido.estadoPedido
                                                    ] ?? pedido.estadoPedido}
                                                </span>
                                            </div>

                                            {/* Productos agrupados por persona */}
                                            {(pedido.personas ?? []).map((persona, indicePersona) => (
                                                <div
                                                    key={`${pedido.idPedido}-persona-${indicePersona}`}
                                                    style={{
                                                        background: "#f8fafc",
                                                        borderRadius: "8px",
                                                        padding: "14px",
                                                        marginBottom: "12px"
                                                    }}
                                                >
                                                    <strong style={{ display: "block", marginBottom: "12px", color: "#334155", fontSize: "14px" }}>
                                                        {persona.nombrePersona || `Persona ${indicePersona + 1}`}
                                                    </strong>

                                                    {(persona.productos ?? []).map((producto, indiceProducto) => (
                                                        <div
                                                            key={`${pedido.idPedido}-${indicePersona}-${indiceProducto}`}
                                                            style={{
                                                                display: "flex",
                                                                justifyContent: "space-between",
                                                                alignItems: "flex-start",
                                                                gap: "12px",
                                                                marginBottom: "10px"
                                                            }}
                                                        >
                                                            <div>
                                                                <div style={{ fontWeight: "600", fontSize: "13px", color: "#0f172a" }}>
                                                                    {producto.nombreProducto}
                                                                </div>
                                                                <div style={{ color: "#64748b", fontSize: "12px", marginTop: "3px" }}>
                                                                    {producto.cantidad} × ${formatearPrecio(producto.precioUnitario)}
                                                                </div>
                                                            </div>
                                                            <strong style={{ fontSize: "13px", whiteSpace: "nowrap" }}>
                                                                ${formatearPrecio(producto.subtotal)}
                                                            </strong>
                                                        </div>
                                                    ))}

                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            borderTop: "1px solid #e2e8f0",
                                                            paddingTop: "10px",
                                                            marginTop: "4px",
                                                            fontSize: "13px",
                                                            fontWeight: "600"
                                                        }}
                                                    >
                                                        <span>Subtotal de {persona.nombrePersona || `Persona ${indicePersona + 1}`}</span>
                                                        <span>${formatearPrecio(persona.subtotal)}</span>
                                                    </div>
                                                </div>
                                            ))}

                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    fontWeight: "700",
                                                    fontSize: "14px",
                                                    paddingTop: "8px",
                                                    borderTop: "1px solid #e2e8f0"
                                                }}
                                            >
                                                <span>Total del pedido</span>
                                                <span>${formatearPrecio(pedido.totalPedido)}</span>
                                            </div>
                                        </div>
                                    ))}

                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent:
                                                "space-between",
                                            padding: "16px 0",
                                            fontWeight: "700"
                                        }}
                                    >
                                        <span>Total de la atención</span>
                                        <span>
                                            ${formatearPrecio(totalAtencion)}
                                        </span>
                                    </div>
                                </>
                            )}

                            <button
                                className="mc-btn-outline"
                                onClick={() =>
                                    navigate(`/mesa/${codigo}`)
                                }
                                style={{
                                    width: "100%",
                                    padding: "12px"
                                }}
                            >
                                + Ordenar algo más
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <footer
                className="mc-footer"
                style={{ textAlign: "center" }}
            >
                <p
                    style={{
                        margin: 0,
                        fontSize: "12.5px",
                        color: "#94a3b8"
                    }}
                >
                    © 2026 MesaClick. Gestión gastronómica
                    en tiempo real.
                </p>
            </footer>
        </div>
    );
}

export default PedidoEnviado;

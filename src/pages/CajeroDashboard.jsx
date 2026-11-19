
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const dinero = (valor) =>
    Number(valor || 0).toLocaleString("es-CO");

function CajeroDashboard() {
    const navigate = useNavigate();

    const [atenciones, setAtenciones] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [actualizando, setActualizando] = useState(false);
    const [error, setError] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [atencionExpandida, setAtencionExpandida] = useState(null);
    const [detalles, setDetalles] = useState({});

    const [atencionSeleccionada, setAtencionSeleccionada] = useState(null);
    const [metodoPago, setMetodoPago] = useState("EFECTIVO");
    const [montoRecibido, setMontoRecibido] = useState("");
    const [procesandoPago, setProcesandoPago] = useState(false);

    const nombreUsuario =
        localStorage.getItem("usuarioNombre") || "Cajero";

    const cerrarSesion = useCallback(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("rol");
        localStorage.removeItem("usuarioNombre");
        localStorage.removeItem("usuarioCorreo");
        navigate("/roles/login", { replace: true });
    }, [navigate]);

    const consultarAtenciones = useCallback(async (manual = false) => {
        const token = localStorage.getItem("token");
        const rol = localStorage.getItem("rol");

        if (!token || rol !== "CAJERO") {
            navigate("/roles/login", { replace: true });
            return;
        }

        if (manual) setActualizando(true);

        try {
            const respuesta = await fetch("/api/atenciones/activas", {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                cache: "no-store"
            });

            if (respuesta.status === 401 ||
                respuesta.status === 403) {
                cerrarSesion();
                return;
            }

            if (!respuesta.ok) {
                throw new Error("No se pudieron consultar las atenciones.");
            }

            const datos = await respuesta.json();

            if (!Array.isArray(datos)) {
                throw new Error("Formato de respuesta inesperado.");
            }

            setAtenciones(datos);
            setError("");
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setCargando(false);
            setActualizando(false);
        }
    }, [cerrarSesion, navigate]);

    useEffect(() => {
        consultarAtenciones();

        const intervalo = setInterval(() => {
            consultarAtenciones();
        }, 5000);

        return () => clearInterval(intervalo);
    }, [consultarAtenciones]);

    const consultarDetalle = async (idAtencion) => {
        if (atencionExpandida === idAtencion) {
            setAtencionExpandida(null);
            return;
        }

        try {
            const token = localStorage.getItem("token");

            const respuesta = await fetch(
                `/api/atenciones/${idAtencion}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    cache: "no-store"
                }
            );

            if (!respuesta.ok) {
                throw new Error("No se pudo cargar el detalle.");
            }

            const datos = await respuesta.json();

            setDetalles((actual) => ({
                ...actual,
                [idAtencion]: datos
            }));

            setAtencionExpandida(idAtencion);
        } catch (err) {
            setError(err.message);
        }
    };

    const abrirModalCobro = async (atencion) => {
        if (!atencion.puedeCobrar) return;

        setError("");

        try {
            const token = localStorage.getItem("token");

            const respuesta = await fetch(
                `/api/atenciones/${atencion.idAtencion}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    cache: "no-store"
                }
            );

            if (!respuesta.ok) {
                throw new Error("No se pudo verificar la atención.");
            }

            const datos = await respuesta.json();

            if (!datos.puedeCobrar) {
                await consultarAtenciones();
                throw new Error(
                    "Esta atención todavía no está lista para cobrar."
                );
            }

            setAtencionSeleccionada(datos);
            setMetodoPago("EFECTIVO");
            setMontoRecibido("");
        } catch (err) {
            setError(err.message);
        }
    };

    const confirmarPago = async () => {
        if (!atencionSeleccionada || procesandoPago) return;

        const total = Number(atencionSeleccionada.total || 0);
        const recibido = Number(montoRecibido || 0);

        if (metodoPago === "EFECTIVO" && recibido < total) {
            setError("El dinero recibido es menor al total.");
            return;
        }

        setProcesandoPago(true);
        setError("");

        try {
            const token = localStorage.getItem("token");

            const respuesta = await fetch(
                `/api/atenciones/${atencionSeleccionada.idAtencion}/pagar`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ metodoPago })
                }
            );

            if (!respuesta.ok) {
                const mensaje = await respuesta.text();
                throw new Error(
                    mensaje || "No se pudo registrar el pago."
                );
            }

            setAtencionSeleccionada(null);
            setAtencionExpandida(null);
            await consultarAtenciones();

            alert("Pago registrado. La mesa fue liberada.");
        } catch (err) {
            console.error(err);
            setError(
                "No se pudo confirmar el cobro. Consulta el estado de la atención antes de reintentar. " +
                err.message
            );
        } finally {
            setProcesandoPago(false);
        }
    };

    const totalSeleccionado =
        Number(atencionSeleccionada?.total || 0);

    const recibido = Number(montoRecibido || 0);
    const devuelta = Math.max(0, recibido - totalSeleccionado);

    const atencionesFiltradas = atenciones.filter((atencion) => {
        const texto = busqueda.toLowerCase().trim();

        return (
            String(atencion.numeroMesa ?? "").includes(texto) ||
            String(atencion.idAtencion ?? "").includes(texto)
        );
    });

    const listasParaCobro =
        atenciones.filter((atencion) => atencion.puedeCobrar).length;

    return (
        <div className="cajero-dashboard">
            <header className="cajero-header">
                <div className="cajero-logo">
                    Mesa<span>Click</span>
                    <p>Terminal de Caja y Cobranza</p>
                </div>

                <div className="cajero-header-actions">
                    <div className="cajero-user-badge">
                        <span className="cajero-status-dot"></span>
                        {nombreUsuario}
                    </div>

                    <button
                        className="cajero-refresh"
                        disabled={actualizando}
                        onClick={() => consultarAtenciones(true)}
                    >
                        {actualizando ? "Actualizando..." : "Actualizar 🔄"}
                    </button>

                    <button
                        className="cajero-logout"
                        onClick={cerrarSesion}
                    >
                        Cerrar sesión
                    </button>
                </div>
            </header>

            <section className="cajero-welcome-formal">
                <div>
                    <span className="cajero-label">
                        CONTROL FINANCIERO Y DE MESAS
                    </span>

                    <h1>Gestión de Atenciones</h1>

                    <p>
                        Consulta las mesas ocupadas, revisa sus pedidos
                        y registra el pago cuando todos estén entregados.
                    </p>
                </div>

                <div className="cajero-search-container">
                    <input
                        type="text"
                        placeholder="Buscar por mesa o atención..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="cajero-search-input"
                    />
                    <span className="cajero-search-icon">🔍</span>
                </div>
            </section>

            <div className="cajero-resumen">
                <div className="cajero-resumen-item">
                    <div>
                        <span>Atenciones activas</span>
                        <strong>{atenciones.length}</strong>
                    </div>
                </div>

                <div className="cajero-resumen-item cajero-resumen-listo">
                    <div>
                        <span>Listas para cobrar</span>
                        <strong>{listasParaCobro}</strong>
                    </div>
                </div>
            </div>

            {error && (
                <div
                    role="alert"
                    style={{
                        margin: "16px",
                        padding: "12px",
                        background: "#fef2f2",
                        color: "#b91c1c",
                        borderRadius: "8px"
                    }}
                >
                    {error}
                </div>
            )}

            <section className="cajero-pedidos-section">
                <div className="cajero-section-heading">
                    <h2>Mesas ocupadas</h2>
                    <span className="cajero-count-badge">
                        Mostrando {atencionesFiltradas.length} atenciones
                    </span>
                </div>

                {cargando ? (
                    <div className="cajero-mensaje">
                        Consultando atenciones...
                    </div>
                ) : atencionesFiltradas.length === 0 ? (
                    <div className="cajero-mensaje">
                        No hay atenciones que coincidan con la búsqueda.
                    </div>
                ) : (
                    <div className="cajero-grid-pedidos">
                        {atencionesFiltradas.map((atencion) => {
                            const expandida =
                                atencionExpandida === atencion.idAtencion;

                            const detalle =
                                detalles[atencion.idAtencion];

                            return (
                                <div
                                    key={atencion.idAtencion}
                                    className="cajero-card-formal"
                                >
                                    <div>
                                        <div className="cajero-card-header-formal">
                                            <div>
                                                <span className="cajero-invoice-label">
                                                    ATENCIÓN
                                                </span>
                                                <h3>#{atencion.idAtencion}</h3>
                                            </div>

                                            <span className="cajero-badge-estado">
                                                {atencion.puedeCobrar
                                                    ? "LISTA PARA COBRAR"
                                                    : "EN SERVICIO"}
                                            </span>
                                        </div>

                                        <div className="cajero-card-body-formal">
                                            <div className="cajero-info-row">
                                                <span>Mesa asignada:</span>
                                                <strong>
                                                    Mesa #{atencion.numeroMesa}
                                                </strong>
                                            </div>

                                            <div className="cajero-info-row">
                                                <span>Estado:</span>
                                                <strong>
                                                    {atencion.estadoAtencion ??
                                                        "ACTIVA"}
                                                </strong>
                                            </div>

                                            <button
                                                className="cajero-btn-toggle-detalles"
                                                onClick={() =>
                                                    consultarDetalle(
                                                        atencion.idAtencion
                                                    )
                                                }
                                            >
                                                {expandida
                                                    ? "Ocultar detalles ▲"
                                                    : "Ver pedidos ▼"}
                                            </button>

                                            {expandida && (
                                                <div className="cajero-detalles-container">
                                                    <h4 className="cajero-detalles-titulo">
                                                        Pedidos de la atención
                                                    </h4>

                                                    {detalle?.pedidos?.length ? (
                                                        detalle.pedidos.map((pedido) => (
                                                            <div
                                                                key={pedido.idPedido}
                                                                className="cajero-detalle-item"
                                                                style={{ display: "block", marginBottom: "16px" }}
                                                            >
                                                                <div
                                                                    className="cajero-detalle-info"
                                                                    style={{ display: "flex", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}
                                                                >
                                                                    <strong>Pedido #{pedido.idPedido}</strong>
                                                                    <span>{pedido.estadoPedido}</span>
                                                                </div>

                                                                {pedido.personas?.length ? (
                                                                    pedido.personas.map((persona, indicePersona) => (
                                                                        <div
                                                                            key={`${pedido.idPedido}-persona-${indicePersona}`}
                                                                            style={{ padding: "12px", marginTop: "10px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                                                                        >
                                                                            <strong style={{ display: "block", marginBottom: "10px" }}>
                                                                                {persona.nombrePersona || `Persona ${indicePersona + 1}`}
                                                                            </strong>

                                                                            {persona.productos?.length ? (
                                                                                persona.productos.map((producto, indiceProducto) => (
                                                                                    <div
                                                                                        key={`${pedido.idPedido}-${indicePersona}-${indiceProducto}`}
                                                                                        style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginBottom: "9px", alignItems: "flex-start" }}
                                                                                    >
                                                                                        <div>
                                                                                            <div style={{ fontWeight: 600 }}>
                                                                                                {producto.cantidad} × {producto.nombreProducto}
                                                                                            </div>
                                                                                            {producto.precioUnitario != null && (
                                                                                                <small style={{ color: "#64748b" }}>
                                                                                                    Precio unitario: ${dinero(producto.precioUnitario)}
                                                                                                </small>
                                                                                            )}
                                                                                        </div>
                                                                                        {producto.subtotal != null && (
                                                                                            <strong>${dinero(producto.subtotal)}</strong>
                                                                                        )}
                                                                                    </div>
                                                                                ))
                                                                            ) : (
                                                                                <p style={{ color: "#64748b" }}>Sin productos disponibles.</p>
                                                                            )}

                                                                            {persona.subtotal != null && (
                                                                                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #e2e8f0", paddingTop: "10px", marginTop: "8px" }}>
                                                                                    <span>Subtotal de la persona</span>
                                                                                    <strong>${dinero(persona.subtotal)}</strong>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <p style={{ color: "#64748b", marginTop: "10px" }}>
                                                                        No hay información de personas o productos.
                                                                    </p>
                                                                )}

                                                                {pedido.totalPedido != null && (
                                                                    <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "12px", fontWeight: 700 }}>
                                                                        <span>Total del pedido</span>
                                                                        <span>${dinero(pedido.totalPedido)}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p>Sin detalles disponibles.</p>
                                                    )}
                                                </div>
                                            )}

                                            <div className="cajero-total-box-formal">
                                                <span>Total consumido</span>
                                                <h2>
                                                    ${dinero(atencion.total)}
                                                </h2>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        className="cajero-btn-cobrar-formal"
                                        disabled={!atencion.puedeCobrar}
                                        onClick={() =>
                                            abrirModalCobro(atencion)
                                        }
                                    >
                                        {atencion.puedeCobrar
                                            ? "Procesar cobro y liberar 💳"
                                            : "Esperando entrega de pedidos"}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {atencionSeleccionada && (
                <div className="cajero-modal-overlay">
                    <div className="cajero-modal-content">
                        <div className="cajero-modal-header">
                            <h3>
                                Cobrar atención #{atencionSeleccionada.idAtencion}
                            </h3>

                            <button
                                className="cajero-modal-close"
                                disabled={procesandoPago}
                                onClick={() => setAtencionSeleccionada(null)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="cajero-modal-body">
                            <div className="cajero-modal-total-display">
                                <span>Total a pagar:</span>
                                <h1>${dinero(totalSeleccionado)}</h1>
                            </div>

                            <div className="cajero-form-group">
                                <label>Método de pago:</label>
                                <select
                                    className="cajero-select"
                                    value={metodoPago}
                                    disabled={procesandoPago}
                                    onChange={(e) =>
                                        setMetodoPago(e.target.value)
                                    }
                                >
                                    <option value="EFECTIVO">Efectivo</option>
                                    <option value="TARJETA">Tarjeta</option>
                                    <option value="TRANSFERENCIA">
                                        Transferencia
                                    </option>
                                </select>
                            </div>

                            {metodoPago === "EFECTIVO" && (
                                <>
                                    <div className="cajero-form-group">
                                        <label>Dinero recibido ($):</label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            className="cajero-input-num"
                                            value={montoRecibido
                                                ? dinero(montoRecibido)
                                                : ""}
                                            onChange={(e) =>
                                                setMontoRecibido(
                                                    e.target.value.replace(
                                                        /\D/g,
                                                        ""
                                                    )
                                                )
                                            }
                                            placeholder="Ej: 50.000"
                                        />
                                    </div>

                                    <div className="cajero-cambio-box">
                                        <span>Cambio a entregar:</span>
                                        <h2>${dinero(devuelta)}</h2>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="cajero-modal-footer">
                            <button
                                className="cajero-btn-cancelar"
                                disabled={procesandoPago}
                                onClick={() =>
                                    setAtencionSeleccionada(null)
                                }
                            >
                                Cancelar
                            </button>

                            <button
                                className="cajero-btn-confirmar"
                                disabled={
                                    procesandoPago ||
                                    (metodoPago === "EFECTIVO" &&
                                        recibido < totalSeleccionado)
                                }
                                onClick={confirmarPago}
                            >
                                {procesandoPago
                                    ? "Procesando..."
                                    : "Confirmar pago y liberar mesa"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CajeroDashboard;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function CajeroDashboard() {
    const navigate = useNavigate();
    const [pedidosCajero, setPedidosCajero] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState("");
    
    // Estado para controlar qué tarjeta tiene los detalles abiertos
    const [pedidoExpandido, setPedidoExpandido] = useState(null);

    // Estados para el flujo del modal de cobro y cambio
    const [modalPagoAbierto, setModalPagoAbierto] = useState(false);
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
    const [metodoPago, setMetodoPago] = useState("EFECTIVO");
    const [montoRecibido, setMontoRecibido] = useState("");

    const cargarPedidosPendientes = async () => {
        try {
            setCargando(true);
            const token = localStorage.getItem("token");

            // Petición real al backend conectada con el DTO del cajero
            const respuesta = await fetch("http://localhost:8080/api/pedidos/cajero/activos", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!respuesta.ok) {
                throw new Error("Error al obtener los pedidos entregados para cobro");
            }

            const data = await respuesta.json();
            setPedidosCajero(data);
        } catch (error) {
            console.error("Error al conectar con el backend:", error);
            setPedidosCajero([]);
        } finally {
            setCargando(false);
        }
    };

    // Carga inicial al montar el componente (Actualización Manual)
    useEffect(() => {
        cargarPedidosPendientes();
    }, []);

    const abrirModalCobro = (pedido) => {
        setPedidoSeleccionado(pedido);
        setMetodoPago("EFECTIVO");
        setMontoRecibido("");
        setModalPagoAbierto(true);
    };

    // Formatear números con puntos de miles (Ej: 50000 -> 50.000)
    const formatearConPuntos = (valor) => {
        if (!valor) return "";
        const numeroLimpio = valor.toString().replace(/\D/g, "");
        return numeroLimpio.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const handleMontoChange = (e) => {
        const valorCrudo = e.target.value.replace(/\./g, "");
        setMontoRecibido(valorCrudo);
    };

    const confirmarPago = async () => {
        if (!pedidoSeleccionado) return;

        const total = pedidoSeleccionado.totalPedido;
        const recibidoNum = parseFloat(montoRecibido) || 0;

        if (metodoPago === "EFECTIVO" && recibidoNum < total) {
            alert("El monto recibido en efectivo es menor al total a pagar.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const respuesta = await fetch(`http://localhost:8080/api/pedidos/${pedidoSeleccionado.idPedido}/pagar`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    estadoPedido: "PAGADO",
                    metodoPago: metodoPago,
                    montoRecibido: recibidoNum
                })
            });

            if (!respuesta.ok) throw new Error("No se pudo procesar el pago en el servidor");

            // Remover el pedido pagado de la lista activa (libera la mesa)
            setPedidosCajero(prev => prev.filter(p => p.idPedido !== pedidoSeleccionado.idPedido));
            setModalPagoAbierto(false);
            setPedidoSeleccionado(null);
            alert("¡Pago registrado con éxito! La mesa ha quedado liberada para el siguiente cliente.");
        } catch (error) {
            console.error("Error al registrar el pago:", error);
            alert("Hubo un error al procesar el pago con el servidor.");
        }
    };

    const cerrarSesion = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("rol");
        navigate("/personal/login");
    };

    const toggleDetalles = (idPedido) => {
        setPedidoExpandido(pedidoExpandido === idPedido ? null : idPedido);
    };

    // Cálculo automático de la devuelta
    const devuelta = pedidoSeleccionado && metodoPago === "EFECTIVO" 
        ? Math.max(0, (parseFloat(montoRecibido) || 0) - pedidoSeleccionado.totalPedido) 
        : 0;

    // Filtrar pedidos por número de mesa o ID de pedido
    const pedidosFiltrados = pedidosCajero.filter(p => {
        const query = busqueda.toLowerCase();
        const idPedidoStr = p.idPedido?.toString().toLowerCase() || "";
        const numeroMesaStr = p.numeroMesa?.toString().toLowerCase() || "";

        return (
            idPedidoStr.includes(query) ||
            numeroMesaStr.includes(query)
        );
    });

    return (
        <div className="cajero-dashboard">
            {/* ENCABEZADO */}
            <header className="cajero-header">
                <div className="cajero-logo">
                    Mesa<span>Click</span>
                    <p>Terminal de Caja y Cobranza</p>
                </div>
                <div className="cajero-header-actions">
                    <div className="cajero-user-badge">
                        <span className="cajero-status-dot"></span>
                        Cajero Principal
                    </div>
                    <button className="cajero-refresh" onClick={cargarPedidosPendientes}>
                        Actualizar Manual 🔄
                    </button>
                    <button className="cajero-logout" onClick={cerrarSesion}>
                        Cerrar sesión
                    </button>
                </div>
            </header>

            {/* SECCIÓN DE BIENVENIDA Y BÚSQUEDA */}
            <section className="cajero-welcome-formal">
                <div>
                    <span className="cajero-label">CONTROL FINANCIERO Y DE MESAS</span>
                    <h1>Cuentas Listas para Cobro (Entregadas)</h1>
                    <p>Busque la cuenta por número de mesa o factura, verifique el detalle y procese el cobro para liberar el servicio.</p>
                </div>
                
                <div className="cajero-search-container">
                    <input 
                        type="text" 
                        placeholder="Buscar por mesa o factura..." 
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="cajero-search-input"
                    />
                    <span className="cajero-search-icon">🔍</span>
                </div>
            </section>

            {/* TARJETAS DE MÉTRICAS */}
            <div className="cajero-resumen">
                <div className="cajero-resumen-item cajero-resumen-listo">
                    <div>
                        <span>Cuentas por Cobrar (Entregadas)</span>
                        <strong>{pedidosCajero.length}</strong>
                    </div>
                </div>
                <div className="cajero-resumen-item">
                    <div>
                        <span>Estado del Sistema</span>
                        <strong style={{ fontSize: "15px", color: "#16a34a" }}>Conectado (API Real)</strong>
                    </div>
                </div>
            </div>

            {/* LISTADO DE PEDIDOS */}
            <section className="cajero-pedidos-section">
                <div className="cajero-section-heading">
                    <h2>Mesas Ocupadas en Curso</h2>
                    <span className="cajero-count-badge">Mostrando {pedidosFiltrados.length} cuentas</span>
                </div>

                {cargando ? (
                    <div className="cajero-mensaje">Consultando cuentas entregadas...</div>
                ) : pedidosFiltrados.length === 0 ? (
                    <div className="cajero-mensaje">
                        <p style={{ margin: 0, color: "#666" }}>
                            {busqueda ? "No se encontraron coincidencias." : "No hay pedidos en estado 'ENTREGADO' pendientes de cobro."}
                        </p>
                    </div>
                ) : (
                    <div className="cajero-grid-pedidos">
                        {pedidosFiltrados.map((pedido) => {
                            const estaExpandido = pedidoExpandido === pedido.idPedido;

                            return (
                                <div key={pedido.idPedido} className="cajero-card-formal">
                                    <div>
                                        <div className="cajero-card-header-formal">
                                            <div>
                                                <span className="cajero-invoice-label">FACTURA / PEDIDO</span>
                                                <h3>#{pedido.idPedido}</h3>
                                            </div>
                                            <span className="cajero-badge-estado" style={{ background: "#dcfce7", color: "#166534", borderColor: "#bbf7d0" }}>
                                                {pedido.estadoPedido}
                                            </span>
                                        </div>

                                        <div className="cajero-card-body-formal">
                                            <div className="cajero-info-row">
                                                <span>Mesa Asignada:</span>
                                                <strong>Mesa #{pedido.numeroMesa}</strong>
                                            </div>
                                            <div className="cajero-info-row">
                                                <span>Hora:</span>
                                                <span>{new Date(pedido.fechaPedido).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>

                                            <button 
                                                className="cajero-btn-toggle-detalles"
                                                onClick={() => toggleDetalles(pedido.idPedido)}
                                            >
                                                {estaExpandido ? "Ocultar detalles del pedido ▲" : "Ver qué pidió la mesa ▼"}
                                            </button>

                                            {estaExpandido && (
                                                <div className="cajero-detalles-container">
                                                    <h4 className="cajero-detalles-titulo">Productos por Persona:</h4>
                                                    {pedido.personas && pedido.personas.length > 0 ? (
                                                        pedido.personas.map((persona, idx) => (
                                                            <div key={idx} style={{ marginBottom: "8px" }}>
                                                                <span style={{ fontSize: "11px", fontWeight: "700", color: "#f18a04" }}>
                                                                    👤 {persona.nombrePersona}
                                                                </span>
                                                                <ul className="cajero-detalles-lista">
                                                                    {persona.productos.map((prod, pIdx) => (
                                                                        <li key={pIdx} className="cajero-detalle-item">
                                                                            <div className="cajero-detalle-info">
                                                                                <span className="cajero-detalle-cant">{prod.cantidad}x</span>
                                                                                <span className="cajero-detalle-nombre">{prod.nombreProducto}</span>
                                                                            </div>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p style={{ fontSize: "12px", color: "#888", textAlign: "center", margin: "5px 0" }}>
                                                            No hay detalles registrados.
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            <div className="cajero-total-box-formal">
                                                <span>Total Consumido</span>
                                                <h2>${pedido.totalPedido?.toLocaleString("es-CO")}</h2>
                                            </div>
                                        </div>
                                    </div>

                                    <button 
                                        className="cajero-btn-cobrar-formal"
                                        onClick={() => abrirModalCobro(pedido)}
                                    >
                                        Procesar Cobro y Liberar 💳
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* MODAL DE COBRO Y CÁLCULO DE CAMBIO */}
            {modalPagoAbierto && pedidoSeleccionado && (
                <div className="cajero-modal-overlay">
                    <div className="cajero-modal-content">
                        <div className="cajero-modal-header">
                            <h3>Procesar Pago - Pedido #{pedidoSeleccionado.idPedido}</h3>
                            <button className="cajero-modal-close" onClick={() => setModalPagoAbierto(false)}>✕</button>
                        </div>

                        <div className="cajero-modal-body">
                            <div className="cajero-modal-total-display">
                                <span>Total a Pagar:</span>
                                <h1>${pedidoSeleccionado.totalPedido?.toLocaleString("es-CO")}</h1>
                            </div>

                            <div className="cajero-form-group">
                                <label>Método de Pago:</label>
                                <select 
                                    value={metodoPago} 
                                    onChange={(e) => setMetodoPago(e.target.value)}
                                    className="cajero-select"
                                >
                                    <option value="EFECTIVO">Efectivo</option>
                                    <option value="TARJETA">Tarjeta Débito / Crédito</option>
                                    <option value="TRANSFERENCIA">Transferencia (Nequi / Daviplata)</option>
                                </select>
                            </div>

                            {metodoPago === "EFECTIVO" && (
                                <>
                                    <div className="cajero-form-group">
                                        <label>Dinero Recibido del Cliente ($):</label>
                                        <input 
                                            type="text" 
                                            placeholder="Ej: 50.000" 
                                            value={formatearConPuntos(montoRecibido)}
                                            onChange={handleMontoChange}
                                            className="cajero-input-num"
                                            autoFocus
                                        />
                                    </div>

                                    <div className="cajero-cambio-box">
                                        <span>Cambio / Devuelta a Entregar:</span>
                                        <h2 style={{ color: devuelta >= 0 ? "#16a34a" : "#dc2626" }}>
                                            ${devuelta.toLocaleString("es-CO")}
                                        </h2>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="cajero-modal-footer">
                            <button className="cajero-btn-cancelar" onClick={() => setModalPagoAbierto(false)}>
                                Cancelar
                            </button>
                            <button className="cajero-btn-confirmar" onClick={confirmarPago}>
                                Confirmar Pago y Liberar Mesa 💳
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CajeroDashboard;
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function PedidoEnviado() {
    const { codigo } = useParams();
    const navigate = useNavigate();
    const [estadoOrden, setEstadoOrden] = useState("ENVIADO"); // "ENVIADO", "PREPARACION", "LISTO", "PAGADO"
    const [detallePedido, setDetallePedido] = useState([]);
    const [cargando, setCargando] = useState(false);

    // Sondeo periódico para consultar el estado en tu backend de Spring Boot
    useEffect(() => {
        const verificarEstadoYPedido = async () => {
            try {
                // ==========================================
                // DESCOMENTA CUANDO CONECTES TU BACKEND:
                // const res = await fetch(`http://localhost:8080/api/mesas/${codigo}/estado`);
                // const data = await res.json();
                // if (data.estado) setEstadoOrden(data.estado);
                // ==========================================
            } catch (error) {
                console.error("Error al sincronizar con el servidor:", error);
            }
        };

        const intervalo = setInterval(verificarEstadoYPedido, 4000);
        return () => clearInterval(intervalo);
    }, [codigo]);

    // Efecto para redirigir automáticamente al Home cuando el estado sea "PAGADO"
    useEffect(() => {
        if (estadoOrden === "PAGADO") {
            const timer = setTimeout(() => {
                navigate("/"); // Te lleva a HomeMesaClick de forma automática
            }, 3000); // 3 segundos de espera para que el cliente lea el mensaje
            return () => clearTimeout(timer);
        }
    }, [estadoOrden, navigate]);

    if (cargando) {
        return (
            <div className="mc-landing" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <p style={{ color: "#64748b", fontSize: "14px" }}>Sincronizando estado de su mesa...</p>
            </div>
        );
    }

    return (
        <div className="mc-landing" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            {/* ENCABEZADO */}
            <header className="mc-header">
                <div className="mc-logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
                    Mesa<span>Click</span>
                </div>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "#64748b" }}>
                    Mesa N° {codigo}
                </div>
            </header>

            {/* CUERPO PRINCIPAL */}
            <main className="mc-section mc-text-center">
                <div className="mc-container" style={{ maxWidth: "650px" }}>
                    
                    {/* PANEL DE PRUEBA MANUAL (Para que puedas verificar el estado pagado al instante haciendo clic) */}
                    <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "12px", borderRadius: "6px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "12.5px", color: "#64748b" }}>Estado actual simulado: <strong>{estadoOrden}</strong></span>
                        <button 
                            className="mc-btn-outline" 
                            style={{ width: "auto", padding: "6px 12px", fontSize: "12px" }}
                            onClick={() => setEstadoOrden(estadoOrden === "PAGADO" ? "ENVIADO" : "PAGADO")}
                        >
                            Cambiar a {estadoOrden === "PAGADO" ? "Enviado" : "PAGADO 🚀"}
                        </button>
                    </div>

                    {/* SI EL ESTADO ES PAGADO */}
                    {estadoOrden === "PAGADO" ? (
                        <div className="mc-card mc-animate mc-visible mc-zoom-in" style={{ padding: "40px" }}>
                            <div style={{ width: "48px", height: "48px", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto", fontSize: "20px", fontWeight: "bold" }}>
                                ✓
                            </div>
                            <span className="mc-tag-sub">Cuenta Cancelada</span>
                            <h2 style={{ fontSize: "24px", marginBottom: "10px" }}>¡Pago Confirmado en Caja!</h2>
                            <p className="mc-section-subtitle" style={{ marginBottom: "25px" }}>
                                Su cuenta de la mesa <strong>{codigo}</strong> ha sido cerrada con éxito. Redirigiendo a la página principal...
                            </p>
                            <button className="mc-btn-primary" onClick={() => navigate("/")} style={{ width: "100%" }}>
                                Volver al Inicio Ahora
                            </button>
                        </div>
                    ) : (
                        /* SI EL PEDIDO ESTÁ EN CURSO / PREPARACIÓN */
                        <div className="mc-card mc-animate mc-visible" style={{ textAlign: "left" }}>
                            <div className="mc-text-center" style={{ marginBottom: "25px" }}>
                                <span className="mc-tag-sub">Seguimiento en Vivo</span>
                                <h2>Resumen de su Pedido</h2>
                                <p className="mc-section-subtitle">
                                    Su comanda está siendo atendida por el personal del establecimiento.
                                </p>
                            </div>

                            {/* ESTADO ACTUAL DE LA ORDEN */}
                            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "16px 20px", borderRadius: "6px", marginBottom: "25px" }}>
                                <p style={{ fontSize: "12.5px", color: "#64748b", margin: "0 0 6px 0", fontWeight: "600", textTransform: "uppercase" }}>Estado actual:</p>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#f18a04", fontWeight: "600" }}>
                                    <span style={{ width: "8px", height: "8px", background: "#f18a04", borderRadius: "50%", display: "inline-block" }}></span>
                                    {estadoOrden === "ENVIADO" && "Orden recibida por el sistema"}
                                    {estadoOrden === "PREPARACION" && "En preparación en cocina"}
                                    {estadoOrden === "LISTO" && "Platos listos para servir o servidos"}
                                </div>
                            </div>

                            {/* LISTADO DE LO QUE ACABA DE PEDIR */}
                            <h4 style={{ fontSize: "15px", fontWeight: "600", color: "#0f172a", marginBottom: "12px" }}>Artículos solicitados:</h4>
                            <div style={{ border: "1px solid #e2e8f0", borderRadius: "6px", overflow: "hidden", marginBottom: "30px" }}>
                                {detallePedido.length > 0 ? (
                                    detallePedido.map((item, index) => (
                                        <div key={index} style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", borderBottom: index < detallePedido.length - 1 ? "1px solid #e2e8f0" : "none", fontSize: "13.5px" }}>
                                            <span>{item.cantidad}x {item.nombrePlato}</span>
                                            <span style={{ fontWeight: "600", color: "#0f172a" }}>${(item.precio * item.cantidad).toLocaleString()}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ padding: "16px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
                                        Visualizando comanda enviada a cocina.
                                    </div>
                                )}
                            </div>

                            {/* ACCIONES PARA EL CLIENTE: MANTENER SESIÓN Y ORDENAR MÁS */}
                            <div style={{ display: "flex", gap: "12px" }}>
                                <button 
                                    className="mc-btn-outline" 
                                    onClick={() => navigate(`/mesa/${codigo}`)}
                                    style={{ flex: 1, textAlign: "center", padding: "12px" }}
                                >
                                    + Ordenar algo más (Mantener Mesa)
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </main>

            {/* FOOTER */}
            <footer className="mc-footer" style={{ textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: "12.5px", color: "#94a3b8" }}>© 2026 MesaClick. Gestión gastronómica en tiempo real.</p>
            </footer>
        </div>
    );
}

export default PedidoEnviado;
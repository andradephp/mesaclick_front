
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerResumenEstadisticas } from "../services/estadisticasService";
import GraficoVentas from "../components/admin/GraficoVentas";
import ProductosMasVendidos from "../components/admin/ProductosMasVendidos";

function AdminDashboard() {
    const navigate = useNavigate();

    const [estadisticas, setEstadisticas] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    
useEffect(() => {
    let activo = true;
    let consultando = false;

    const cargarEstadisticas = async () => {
        if (consultando) return;

        consultando = true;

        try {
            const datos = await obtenerResumenEstadisticas();

            if (activo) {
                setEstadisticas(datos);
                setError("");
            }

        } catch (err) {

            if (activo) {
                setError(err.message);
            }

        } finally {

            consultando = false;

            if (activo) {
                setCargando(false);
            }
        }
    };

    // Cargar al abrir el Dashboard
    cargarEstadisticas();

    // Actualizar cada 10 segundos
    const intervalo = setInterval(
        cargarEstadisticas,
        10000
    );

    // Detener las consultas al salir
    return () => {
        activo = false;
        clearInterval(intervalo);
    };

}, []);


    const formatearDinero = (valor) =>
        new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0,
        }).format(valor ?? 0);

    const nombre =
        localStorage.getItem("usuarioNombre") || "Administrador";

    const cerrarSesion = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("rol");
        localStorage.removeItem("usuarioNombre");
        localStorage.removeItem("usuarioCorreo");

        navigate("/admin/login");
    };

    return (
        <div className="admin-dashboard">

            {/* BARRA LATERAL */}
            <aside className="admin-sidebar">

                <div className="admin-sidebar-logo">
                    Mesa<span>Click</span>
                </div>

                <div className="admin-sidebar-divider"></div>

                <nav className="admin-navigation">

                    <button className="admin-nav-item active">
                        <span>▦</span>
                        Dashboard
                    </button>

                    <button
                        className="admin-nav-item"
                        onClick={() => navigate("/admin/personal")}
                    >
                        <span>♙</span>
                        Personal
                    </button>

                    <button
                        className="admin-nav-item"
                        onClick={() => navigate("/admin/productos")}
                    >
                        <span>▣</span>
                        Productos
                    </button>

                    <button className="admin-nav-item disabled">
                        <span>▤</span>
                        Pedidos
                        <small>Próximamente</small>
                    </button>

                    <button className="admin-nav-item disabled">
                        <span>▥</span>
                        Reportes
                        <small>Próximamente</small>
                    </button>

                    <button className="admin-nav-item disabled">
                        <span>⚙</span>
                        Configuración
                        <small>Próximamente</small>
                    </button>

                </nav>

                <button
                    className="admin-logout"
                    onClick={cerrarSesion}
                >
                    <span>↪</span>
                    Cerrar sesión
                </button>

            </aside>

            {/* CONTENIDO PRINCIPAL */}
            <main className="admin-main">

                {/* ENCABEZADO */}
                <header className="admin-header">

                    <div>
                        <p className="admin-header-label">
                            Panel administrativo
                        </p>

                        <h1>Bienvenido, {nombre}</h1>
                    </div>

                    <div className="admin-user">

                        <div className="admin-user-icon">
                            A
                        </div>

                        <div>
                            <strong>{nombre}</strong>
                            <span>Administrador</span>
                        </div>

                    </div>

                </header>

                {/* ESTADÍSTICAS GENERALES */}
                <section className="admin-stats">

                    {cargando && (
                        <p>Cargando estadísticas...</p>
                    )}

                    {error && (
                        <p style={{ color: "red" }}>
                            {error}
                        </p>
                    )}

                    {!cargando && !error && estadisticas && (
                        <>
                            <div className="admin-stat-card">
                                <div className="admin-stat-icon">#</div>
                                <div>
                                    <span>Pedidos registrados</span>
                                    <strong>
                                        {estadisticas.totalPedidos}
                                    </strong>
                                </div>
                            </div>

                            <div className="admin-stat-card">
                                <div className="admin-stat-icon">$</div>
                                <div>
                                    <span>Ventas confirmadas</span>
                                    <strong>
                                        {formatearDinero(
                                            estadisticas.totalVentas
                                        )}
                                    </strong>
                                </div>
                            </div>

                            <div className="admin-stat-card">
                                <div className="admin-stat-icon">P</div>
                                <div>
                                    <span>Ticket promedio</span>
                                    <strong>
                                        {formatearDinero(
                                            estadisticas.ticketPromedio
                                        )}
                                    </strong>
                                </div>
                            </div>

                            <div className="admin-stat-card">
                                <div className="admin-stat-icon">✓</div>
                                <div>
                                    <span>Atenciones cerradas</span>
                                    <strong>
                                        {estadisticas.atencionesCerradas}
                                    </strong>
                                </div>
                            </div>

                            <div className="admin-stat-card">
                                <div className="admin-stat-icon">◷</div>
                                <div>
                                    <span>Atenciones activas</span>
                                    <strong>
                                        {estadisticas.atencionesActivas}
                                    </strong>
                                </div>
                            </div>

                            <div className="admin-stat-card">
                                <div className="admin-stat-icon">✓</div>
                                <div>
                                    <span>Pedidos entregados</span>
                                    <strong>
                                        {estadisticas.pedidosEntregados}
                                    </strong>
                                </div>
                            </div>
                        </>
                    )}

                </section>

                {/* GRÁFICO DE VENTAS */}
                <GraficoVentas />

                {/* PRODUCTOS MÁS VENDIDOS */}
                <ProductosMasVendidos />

                {/* GESTIÓN DE PERSONAL */}
                <section className="admin-management-card">

                    <div className="admin-management-content">

                        <div className="admin-management-icon">
                            P
                        </div>

                        <div>
                            <h2>Gestión de personal</h2>

                            <p>
                                Crea y administra los usuarios que
                                forman parte del personal de MesaClick.
                            </p>

                            <div className="admin-role-tags">
                                <span>Cocina</span>
                                <span>Mesero</span>
                                <span>Cajero</span>
                            </div>

                        </div>

                    </div>

                    <button
                        className="admin-primary-button"
                        onClick={() => navigate("/admin/personal")}
                    >
                        Gestionar personal
                    </button>

                </section>

                {/* PRÓXIMAS FUNCIONALIDADES */}
                <section className="admin-coming-soon">

                    <h2>Más funciones próximamente</h2>

                    <p>
                        Pedidos, reportes y configuración
                        estarán disponibles en futuras versiones.
                    </p>

                </section>

            </main>

        </div>
    );
}

export default AdminDashboard;

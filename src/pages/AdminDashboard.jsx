import { useNavigate } from "react-router-dom";

function AdminDashboard() {

    const navigate = useNavigate();

    const nombre = localStorage.getItem("usuarioNombre") || "Administrador";

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

                    <button className="admin-nav-item disabled">
                        <span>▣</span>
                        Productos
                        <small>Próximamente</small>
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

                <header className="admin-header">

                    <div>
                        <p className="admin-header-label">
                            Panel administrativo
                        </p>

                        <h1>
                            Bienvenido, {nombre}
                        </h1>
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


                {/* ESTADÍSTICAS */}
                <section className="admin-stats">

                    <div className="admin-stat-card">

                        <div className="admin-stat-icon">
                            #
                        </div>

                        <div>
                            <span>Pedidos registrados</span>
                            <strong>0</strong>
                        </div>

                    </div>


                    <div className="admin-stat-card">

                        <div className="admin-stat-icon">
                            U
                        </div>

                        <div>
                            <span>Clientes registrados</span>
                            <strong>0</strong>
                        </div>

                    </div>

                </section>


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


                {/* AVISO */}
                <section className="admin-coming-soon">

                    <h2>Más funciones próximamente</h2>

                    <p>
                        Productos, pedidos, reportes y configuración
                        estarán disponibles en futuras versiones.
                    </p>

                </section>

            </main>

        </div>
    );
}

export default AdminDashboard;



import { useNavigate, useLocation } from "react-router-dom";

export default function AdminSidebar() {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const opciones = [
        { nombre: "Dashboard", icono: "▦", ruta: "/admin/dashboard" },
        { nombre: "Personal", icono: "♙", ruta: "/admin/personal" },
        { nombre: "Productos", icono: "▣", ruta: "/admin/productos" },
        { nombre: "Promociones y eventos", icono: "🎉", ruta: "/admin/promociones" },
        { nombre: "Campañas de correo", icono: "✉", ruta: "/admin/campanas" },
        { nombre: "Pedidos", icono: "▤", disabled: true },
        { nombre: "Reportes", icono: "▥", disabled: true },
        { nombre: "Configuración", icono: "⚙", disabled: true },
    ];

    const cerrarSesion = () => {
        ["token", "rol", "usuarioNombre", "usuarioCorreo"].forEach(
            (clave) => localStorage.removeItem(clave)
        );

        navigate("/admin/login");
    };

    return (
        <aside className="admin-sidebar">
            <div className="admin-sidebar-logo">
                Mesa<span>Click</span>
            </div>

            <div className="admin-sidebar-divider"></div>

            <nav
                className="admin-navigation"
                aria-label="Administración"
            >
                {opciones.map(
                    ({ nombre, icono, ruta, disabled }) => {
                        const activo =
                            ruta &&
                            (
                                pathname === ruta ||
                                pathname.startsWith(`${ruta}/`)
                            );

                        return (
                            <button
                                key={nombre}
                                type="button"
                                className={`admin-nav-item${activo ? " active" : ""}${disabled ? " disabled" : ""}`}
                                onClick={
                                    ruta
                                        ? () => navigate(ruta)
                                        : undefined
                                }
                                disabled={Boolean(disabled)}
                                aria-current={
                                    activo ? "page" : undefined
                                }
                            >
                                <span>{icono}</span>

                                {nombre}

                                {disabled && (
                                    <small>Próximamente</small>
                                )}
                            </button>
                        );
                    }
                )}
            </nav>

            <button
                type="button"
                className="admin-logout"
                onClick={cerrarSesion}
            >
                <span>↪</span>
                Cerrar sesión
            </button>
        </aside>
    );
}

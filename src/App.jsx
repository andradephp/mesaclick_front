import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import HomeMesaClick from "./pages/HomeMesaClick";
import Mesa from "./pages/Mesa";
import PedidoEnviado from "./pages/PedidoEnviado";
import IniciarSesion from "./pages/IniciarSesion";
import RegistrarseServicio from "./pages/RegistrarseServicio"; // Vista de afiliación comercial (Natural / Jurídica)
import Error404 from "./pages/Error404";

import LoginPersonal from "./pages/LoginPersonal";
import LoginAdmin from "./pages/LoginAdmin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPersonal from "./pages/AdminPersonal";
import AdminProductos from "./pages/AdminProductos";

import MeseroDashboard from "./pages/MeseroDashboard";
import PanelCocina from "./pages/PanelCocina";
import CajeroDashboard from "./pages/CajeroDashboard";

/* Protege las rutas privadas del personal y administrador */
function RutaProtegida({
    rolPermitido,
    loginPath,
    children,
}) {
    const token = localStorage.getItem("token");
    const rol = localStorage.getItem("rol");

    // Si no hay sesión, enviar al login correspondiente.
    if (!token || !rol) {
        return <Navigate to={loginPath} replace />;
    }

    // Si el usuario no tiene el rol requerido, enviarlo a su propia área.
    if (rol !== rolPermitido) {
        const rutasPorRol = {
            ADMIN: "/admin/dashboard",
            COCINA: "/personal/cocina",
            MESERO: "/personal/mesero",
            CAJERO: "/personal/cajero",
        };

        return (
            <Navigate
                to={rutasPorRol[rol] || "/"}
                replace
            />
        );
    }

    return children;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Página principal corporativa / Landing Page de MesaClick */}
                <Route path="/" element={<HomeMesaClick />} />

                {/* Flujo de clientes (Mesas y pedidos por QR) */}
                <Route
                    path="/mesa/:codigo"
                    element={<Mesa />}
                />

                <Route
                    path="/pedido-enviado/:codigo"
                    element={<PedidoEnviado />}
                />

                {/* Rutas de autenticación y registro comercial de servicios */}
                <Route
                    path="/iniciar-sesion"
                    element={<IniciarSesion />}
                />

                <Route
                    path="/registrarse"
                    element={<RegistrarseServicio />}
                />

                {/* Login del personal */}
                <Route
                    path="/personal/login"
                    element={<LoginPersonal />}
                />

                {/* Panel de Cocina */}
                <Route
                    path="/personal/cocina"
                    element={
                        <RutaProtegida
                            rolPermitido="COCINA"
                            loginPath="/personal/login"
                        >
                            <PanelCocina />
                        </RutaProtegida>
                    }
                />

                {/* Panel del Mesero */}
                <Route
                    path="/personal/mesero"
                    element={
                        <RutaProtegida
                            rolPermitido="MESERO"
                            loginPath="/personal/login"
                        >
                            <MeseroDashboard />
                        </RutaProtegida>
                    }
                />

                {/* Panel del Cajero */}
                <Route
                    path="/personal/cajero"
                    element={
                        <RutaProtegida
                            rolPermitido="CAJERO"
                            loginPath="/personal/login"
                        >
                            <CajeroDashboard />
                        </RutaProtegida>
                    }
                />

                {/* Login del administrador */}
                <Route
                    path="/admin/login"
                    element={<LoginAdmin />}
                />

                {/* Dashboard del administrador protegido */}
                <Route
                    path="/admin/dashboard"
                    element={
                        <RutaProtegida
                            rolPermitido="ADMIN"
                            loginPath="/admin/login"
                        >
                            <AdminDashboard />
                        </RutaProtegida>
                    }
                />

                {/* Gestión de personal protegida */}
                <Route
                    path="/admin/personal"
                    element={
                        <RutaProtegida
                            rolPermitido="ADMIN"
                            loginPath="/admin/login"
                        >
                            <AdminPersonal />
                        </RutaProtegida>
                    }
                />

                {/* Gestión de productos protegida */}
<Route
    path="/admin/productos"
    element={
        <RutaProtegida
            rolPermitido="ADMIN"
            loginPath="/admin/login"
        >
            <AdminProductos />
        </RutaProtegida>
    }
/>

                {/* Página no encontrada */}
                <Route
                    path="*"
                    element={<Error404 />}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
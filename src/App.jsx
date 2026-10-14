
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Mesa from "./pages/Mesa";
import PedidoEnviado from "./pages/PedidoEnviado";
import IniciarSesion from "./pages/IniciarSesion";
import Registrarse from "./pages/Registrarse";
import Error404 from "./pages/Error404";

import LoginPersonal from "./pages/LoginPersonal";
import LoginAdmin from "./pages/LoginAdmin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPersonal from "./pages/AdminPersonal";

import MeseroDashboard from "./pages/MeseroDashboard";
import PanelCocina from "./pages/PanelCocina";

function Inicio() {
    return (
        <div>
            <h1>MesaClick</h1>
            <p>Escanea el código QR de tu mesa para comenzar.</p>
        </div>
    );
}

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

    // Si el usuario no tiene el rol requerido,
    // enviarlo a su propia área.
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

function PanelCajero() {
    return (
        <main>
            <h1>Panel del Cajero</h1>
            <p>Bienvenido a tu área de trabajo en MesaClick.</p>
        </main>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Cliente */}
                <Route path="/" element={<Inicio />} />

                <Route
                    path="/mesa/:codigo"
                    element={<Mesa />}
                />

                <Route
                    path="/pedido-enviado/:codigo"
                    element={<PedidoEnviado />}
                />

                <Route
                    path="/iniciar-sesion"
                    element={<IniciarSesion />}
                />

                <Route
                    path="/registrarse"
                    element={<Registrarse />}
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
                            <PanelCajero />
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


import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import HomeMesaClick from "./pages/HomeMesaClick";
import Mesa from "./pages/Mesa";
import PedidoEnviado from "./pages/PedidoEnviado";
import RegistrarseServicio from "./pages/RegistrarseServicio";
import Error404 from "./pages/Error404";

import LoginPersonal from "./pages/LoginPersonal";
import LoginAdmin from "./pages/LoginAdmin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPersonal from "./pages/AdminPersonal";
import AdminProductos from "./pages/AdminProductos";
import AdminPromociones from "./pages/AdminPromociones";
import AdminCampanas from "./pages/AdminCampanas";

import MeseroDashboard from "./pages/MeseroDashboard";
import PanelCocina from "./pages/PanelCocina";
import CajeroDashboard from "./pages/CajeroDashboard";

import CancelarSuscripcion from "./pages/CancelarSuscripcion";

function RutaProtegida({ rolPermitido, loginPath, children }) {
    const token = localStorage.getItem("token");
    const rol = localStorage.getItem("rol");

    if (!token || !rol) {
        return <Navigate to={loginPath} replace />;
    }

    if (rol !== rolPermitido) {
        const rutasPorRol = {
            ADMIN: "/admin/dashboard",
            COCINA: "/personal/cocina",
            MESERO: "/personal/mesero",
            CAJERO: "/personal/cajero",
        };

        return <Navigate to={rutasPorRol[rol] || "/"} replace />;
    }

    return children;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomeMesaClick />} />

                <Route
                    path="/mesa/:codigo"
                    element={<Mesa />}
                />

                <Route
                    path="/pedido-enviado/:codigo"
                    element={<PedidoEnviado />}
                />

                <Route
                    path="/registrarse"
                    element={<RegistrarseServicio />}
                />

                {/* PERSONAL */}
                <Route
                    path="/personal/login"
                    element={<LoginPersonal />}
                />

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

                {/* ADMINISTRADOR */}
                <Route
                    path="/admin/login"
                    element={<LoginAdmin />}
                />

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

                <Route
                    path="/admin/promociones"
                    element={
                        <RutaProtegida
                            rolPermitido="ADMIN"
                            loginPath="/admin/login"
                        >
                            <AdminPromociones />
                        </RutaProtegida>
                    }
                />

                {/* CAMPAÑAS DE CORREO */}
                <Route
                    path="/admin/campanas"
                    element={
                        <RutaProtegida
                            rolPermitido="ADMIN"
                            loginPath="/admin/login"
                        >
                            <AdminCampanas />
                        </RutaProtegida>
                    }
                />

                {/* SUSCRIPCIONES */}
                <Route
                    path="/cancelar-suscripcion"
                    element={<CancelarSuscripcion />}
                />

                {/* ERROR 404 */}
                <Route
                    path="*"
                    element={<Error404 />}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;

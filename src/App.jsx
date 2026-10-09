
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


function Inicio() {
    return (
        <div>
            <h1>MesaClick</h1>
            <p>Escanea el código QR de tu mesa para comenzar.</p>
        </div>
    );
}

/* Protege las páginas del personal */
function RutaPersonal({ rolPermitido, children }) {
    const token = localStorage.getItem("token");
    const rol = localStorage.getItem("rol");

    if (!token || !rol) {
        return <Navigate to="/personal/login" replace />;
    }

    if (rol !== rolPermitido) {
        const rutas = {
            MESERO: "/personal/mesero",
            CAJERO: "/personal/cajero",
            COCINA: "/personal/cocina",
        };

        if (rutas[rol]) {
            return <Navigate to={rutas[rol]} replace />;
        }

        return <Navigate to="/personal/login" replace />;
    }

    return children;
}

/* Paneles provisionales: luego agregaremos sus funciones */
function PanelMesero() {
    return (
        <main>
            <h1>Panel del Mesero</h1>
            <p>Bienvenido a tu área de trabajo en MesaClick.</p>
        </main>
    );
}

function PanelCajero() {
    return (
        <main>
            <h1>Panel del Cajero</h1>
            <p>Bienvenido a tu área de trabajo en MesaClick.</p>
        </main>
    );
}

function PanelCocina() {
    return (
        <main>
            <h1>Panel de Cocina</h1>
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
                <Route path="/mesa/:codigo" element={<Mesa />} />
                <Route
                    path="/pedido-enviado/:codigo"
                    element={<PedidoEnviado />}
                />
                <Route
                    path="/iniciar-sesion"
                    element={<IniciarSesion />}
                />
                <Route path="/registrarse" element={<Registrarse />} />

                {/* Personal */}
                <Route
                    path="/personal/login"
                    element={<LoginPersonal />}
                />

                <Route
                    path="/personal/mesero"
                    element={<MeseroDashboard />}
                />

                <Route
                    path="/personal/cajero"
                    element={
                        <RutaPersonal rolPermitido="CAJERO">
                            <PanelCajero />
                        </RutaPersonal>
                    }
                />

                <Route
                    path="/personal/cocina"
                    element={
                        <RutaPersonal rolPermitido="COCINA">
                            <PanelCocina />
                        </RutaPersonal>
                    }
                />

                {/* Administrador */}
                <Route path="/admin/login" element={<LoginAdmin />} />
                <Route
                    path="/admin/dashboard"
                    element={<AdminDashboard />}
                />
                <Route
                    path="/admin/personal"
                    element={<AdminPersonal />}
                />


                {/* Página no encontrada */}
                <Route path="*" element={<Error404 />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;


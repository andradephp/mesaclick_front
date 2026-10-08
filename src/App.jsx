import { BrowserRouter, Routes, Route } from "react-router-dom";

import Mesa from "./pages/Mesa";
import PedidoEnviado from "./pages/PedidoEnviado";
import IniciarSesion from "./pages/IniciarSesion";
import Registrarse from "./pages/Registrarse";
import Error404 from "./pages/Error404";
import LoginPersonal from "./pages/LoginPersonal";
import LoginAdmin from "./pages/LoginAdmin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPersonal from "./pages/AdminPersonal";


function Inicio() {

    return (
        <div>

            <h1>MesaClick</h1>

            <p>
                Escanea el código QR de tu mesa para comenzar.
            </p>

        </div>
    );

}


function App() {

    return (

        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<Inicio />}
                />

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

<Route
    path="*"
    element={<Error404 />}
/>

<Route path="/personal/login" element={<LoginPersonal />} />

<Route path="/admin/login" element={<LoginAdmin />} />

<Route
    path="/admin/dashboard"
    element={<AdminDashboard />}
/>

<Route
    path="/admin/personal"
    element={<AdminPersonal />}
/>

            </Routes>

        </BrowserRouter>

    );

}


export default App;
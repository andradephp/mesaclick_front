import { BrowserRouter, Routes, Route } from "react-router-dom";

import Mesa from "./pages/Mesa";
import PedidoEnviado from "./pages/PedidoEnviado";


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

            </Routes>

        </BrowserRouter>

    );

}


export default App;
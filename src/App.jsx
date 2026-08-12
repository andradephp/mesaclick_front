import { BrowserRouter, Routes, Route } from "react-router-dom";

import Mesa from "./pages/Mesa";

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

            </Routes>

        </BrowserRouter>

    );
}

export default App;
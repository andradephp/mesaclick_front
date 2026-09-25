import { useNavigate } from "react-router-dom";

function Error404() {

    const navigate = useNavigate();

    return (

        <main className="error-page">

            <div className="error-container">

                <div className="error-logo">
                    Mesa<span>Click</span>
                </div>

                <div className="error-card">

                    <div className="error-icon">
                        !
                    </div>

                    <span className="error-number">
                        404
                    </span>

                    <h1>
                        Página no encontrada
                    </h1>

                    <p>
                        Lo sentimos, no pudimos encontrar
                        la página o mesa que estás buscando.
                    </p>

                    <button
                        className="error-button"
                        onClick={() => navigate("/")}
                    >
                        Volver al inicio
                    </button>

                </div>

            </div>

        </main>

    );

}

export default Error404;
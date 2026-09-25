import { useState } from "react";
import {
    useNavigate,
    useSearchParams
} from "react-router-dom";

function IniciarSesion() {

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const codigo = searchParams.get("codigo");

    const [correo, setCorreo] = useState("");
    const [password, setPassword] = useState("");


    function iniciarSesion(e) {

        e.preventDefault();

        console.log("Correo:", correo);
        console.log("Contraseña:", password);

        // Aquí posteriormente conectaremos el backend

    }


    function irARegistro() {

        if (codigo) {

            navigate(`/registrarse?codigo=${codigo}`);

        } else {

            navigate("/registrarse");

        }

    }


    function volverAlMenu() {

        if (codigo) {

            navigate(`/mesa/${codigo}`);

        } else {

            navigate("/");

        }

    }


    return (

        <main className="login-page">

            <div className="login-container">

                {/* LOGO */}

                <div className="login-logo">
                    Mesa<span>Click</span>
                </div>

                <p className="login-subtitle">
                    Tu experiencia, más fácil.
                </p>


                {/* TARJETA */}

                <div className="login-card">

                    <h1>
                        Iniciar sesión
                    </h1>

                    <p className="login-description">
                        Ingresa a tu cuenta para disfrutar
                        de una experiencia personalizada.
                    </p>


                    <form onSubmit={iniciarSesion}>

                        {/* CORREO */}

                        <div className="login-form-group">

                            <label htmlFor="correo">
                                Correo electrónico
                            </label>

                            <input
                                id="correo"
                                type="email"
                                placeholder="ejemplo@correo.com"
                                value={correo}
                                onChange={(e) =>
                                    setCorreo(e.target.value)
                                }
                                required
                            />

                        </div>


                        {/* CONTRASEÑA */}

                        <div className="login-form-group">

                            <label htmlFor="password">
                                Contraseña
                            </label>

                            <input
                                id="password"
                                type="password"
                                placeholder="Ingresa tu contraseña"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                required
                            />

                        </div>


                        {/* BOTÓN */}

                        <button
                            type="submit"
                            className="login-button"
                        >
                            Iniciar sesión
                        </button>

                    </form>


                    {/* REGISTRO */}

                    <div className="login-register">

                        <span>
                            ¿No tienes una cuenta?
                        </span>

                        <button
                            type="button"
                            onClick={irARegistro}
                        >
                            Crear una cuenta
                        </button>

                    </div>


                    {/* VOLVER */}

                    <button
                        type="button"
                        className="login-back"
                        onClick={volverAlMenu}
                    >
                        ← Volver al menú
                    </button>

                </div>

            </div>

        </main>

    );

}

export default IniciarSesion;
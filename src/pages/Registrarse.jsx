import { useState } from "react";
import {
    useNavigate,
    useSearchParams
} from "react-router-dom";

function Registrarse() {

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const codigo = searchParams.get("codigo");


    const [nombre, setNombre] = useState("");
    const [correo, setCorreo] = useState("");
    const [password, setPassword] = useState("");
    const [telefono, setTelefono] = useState("");
    const [edad, setEdad] = useState("");


    function registrarse(e) {

        e.preventDefault();

        console.log("Nombre:", nombre);
        console.log("Correo:", correo);
        console.log("Contraseña:", password);
        console.log("Teléfono:", telefono);
        console.log("Edad:", edad);

        // Aquí posteriormente conectaremos el registro con el backend

    }


    function volverLogin() {

        if (codigo) {

            navigate(`/iniciar-sesion?codigo=${codigo}`);

        } else {

            navigate("/iniciar-sesion");

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

        <main className="registro-page">

            <div className="registro-container">

                {/* LOGO */}

                <div className="registro-logo">
                    Mesa<span>Click</span>
                </div>

                <p className="registro-subtitle">
                    Crea tu cuenta y disfruta de una mejor experiencia.
                </p>


                {/* TARJETA */}

                <div className="registro-card">

                    <h1>
                        Crear cuenta
                    </h1>

                    <p className="registro-description">
                        Regístrate para guardar tu información
                        y disfrutar de una experiencia personalizada.
                    </p>


                    <form onSubmit={registrarse}>

                        {/* NOMBRE */}

                        <div className="registro-form-group">

                            <label htmlFor="nombre">
                                Nombre
                            </label>

                            <input
                                id="nombre"
                                type="text"
                                placeholder="Ingresa tu nombre"
                                value={nombre}
                                onChange={(e) =>
                                    setNombre(e.target.value)
                                }
                                required
                            />

                        </div>


                        {/* CORREO */}

                        <div className="registro-form-group">

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

                        <div className="registro-form-group">

                            <label htmlFor="password">
                                Contraseña
                            </label>

                            <input
                                id="password"
                                type="password"
                                placeholder="Crea una contraseña"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                required
                                minLength="6"
                            />

                        </div>


                        {/* TELÉFONO */}

                        <div className="registro-form-group">

                            <label htmlFor="telefono">
                                Teléfono
                            </label>

                            <input
                                id="telefono"
                                type="tel"
                                placeholder="Ej: 3001234567"
                                value={telefono}
                                onChange={(e) =>
                                    setTelefono(e.target.value)
                                }
                                required
                            />

                        </div>


                        {/* EDAD */}

                        <div className="registro-form-group">

                            <label htmlFor="edad">
                                Edad
                            </label>

                            <input
                                id="edad"
                                type="number"
                                placeholder="Ingresa tu edad"
                                value={edad}
                                onChange={(e) =>
                                    setEdad(e.target.value)
                                }
                                min="1"
                                max="120"
                                required
                            />

                        </div>


                        {/* BOTÓN */}

                        <button
                            type="submit"
                            className="registro-button"
                        >
                            Crear cuenta
                        </button>

                    </form>


                    {/* LOGIN */}

                    <div className="registro-login">

                        <span>
                            ¿Ya tienes una cuenta?
                        </span>

                        <button
                            type="button"
                            onClick={volverLogin}
                        >
                            Iniciar sesión
                        </button>

                    </div>


                    {/* VOLVER */}

                    <button
                        type="button"
                        className="registro-back"
                        onClick={volverAlMenu}
                    >
                        ← Volver al menú
                    </button>

                </div>

            </div>

        </main>

    );

}

export default Registrarse;
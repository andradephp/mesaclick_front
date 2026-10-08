
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginAdmin() {

    const navigate = useNavigate();

    const [correo, setCorreo] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");

        if (!correo || !password) {
            setError("Por favor, completa todos los campos.");
            return;
        }

        setCargando(true);

        try {

            const respuesta = await fetch(
                "http://localhost:8080/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        correo,
                        password
                    })
                }
            );

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                setError(
                    datos.error || "No se pudo iniciar sesión."
                );
                return;
            }

            /*
             * El backend devuelve el JWT.
             */
            const token = datos.token;

            if (!token) {
                setError("No se recibió el token de autenticación.");
                return;
            }

            /*
             * Decodificamos el JWT para obtener el rol.
             */
            const partePayload = token.split(".")[1];

            const payload = JSON.parse(
                atob(
                    partePayload
                        .replace(/-/g, "+")
                        .replace(/_/g, "/")
                )
            );

            const rol = payload.rol;

            /*
             * Este login es EXCLUSIVAMENTE para ADMIN.
             */
            if (rol !== "ADMIN") {
                setError(
                    "Este acceso es exclusivo para administradores."
                );
                return;
            }

            /*
             * Guardamos la información de sesión.
             */
            localStorage.setItem("token", token);
            localStorage.setItem("rol", rol);
            localStorage.setItem(
                "usuarioNombre",
                datos.nombre
            );
            localStorage.setItem(
                "usuarioCorreo",
                datos.correo
            );

            /*
             * Entramos al panel administrativo.
             */
            navigate("/admin/dashboard");

        } catch (error) {

            console.error(error);

            setError(
                "No se pudo conectar con el servidor."
            );

        } finally {

            setCargando(false);

        }
    };

    return (
        <div className="admin-login">

            <div className="admin-login-card">

                <div className="admin-logo">
                    Mesa<span>Click</span>
                </div>

                <p className="admin-subtitle">
                    Administración del sistema
                </p>

                <div className="admin-divider"></div>

                <div className="admin-icon-container">
                    <div className="admin-icon">
                        <div className="admin-head"></div>
                        <div className="admin-body"></div>
                    </div>
                </div>

                <h1>Acceso administrativo</h1>

                <p className="admin-description">
                    Ingresa tus credenciales para continuar
                </p>

                <form onSubmit={handleSubmit}>

                    <div className="admin-input-group">

                        <label>
                            Correo electrónico
                        </label>

                        <input
                            type="email"
                            placeholder="admin@mesaclick.com"
                            value={correo}
                            onChange={(e) =>
                                setCorreo(e.target.value)
                            }
                        />

                    </div>

                    <div className="admin-input-group">

                        <label>
                            Contraseña
                        </label>

                        <input
                            type="password"
                            placeholder="Ingresa tu contraseña"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                        />

                    </div>

                    {error && (
                        <div className="admin-error">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="admin-login-button"
                        disabled={cargando}
                    >
                        {cargando
                            ? "Iniciando sesión..."
                            : "Iniciar sesión"
                        }
                    </button>

                </form>

                <button
                    className="admin-back-button"
                    onClick={() => navigate("/personal/login")}
                >
                    Volver
                </button>

                <p className="admin-footer">
                    Acceso exclusivo para administradores de MesaClick
                </p>

            </div>

        </div>
    );
}

export default LoginAdmin;


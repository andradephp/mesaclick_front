
import { useState } from "react";
import { useNavigate } from "react-router-dom";


function LoginPersonal() {
    const navigate = useNavigate();

    const [correo, setCorreo] = useState("");
    const [password, setPassword] = useState("");
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");

    const iniciarSesion = async (e) => {
        e.preventDefault();
        setError("");
        setCargando(true);

        try {
            const respuesta = await fetch(
                "http://localhost:8080/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        correo: correo.trim().toLowerCase(),
                        password,
                    }),
                }
            );

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                setError(
                    datos.error || "Correo o contraseña incorrectos."
                );
                return;
            }

            if (!datos.token) {
                setError("No se recibió el token de autenticación.");
                return;
            }

            const partes = datos.token.split(".");
            const payload = JSON.parse(
                atob(
                    partes[1]
                        .replace(/-/g, "+")
                        .replace(/_/g, "/")
                )
            );

            const rutas = {
                CAJERO: "/personal/cajero",
                COCINA: "/personal/cocina",
                MESERO: "/personal/mesero",
            };

            const rol = payload.rol;

if (!rutas[rol]) {
    setError(
        "No tienes permisos para acceder al portal del personal."
    );
    return;
}

if (rol !== "COCINA" && rol !== "MESERO" && rol !== "CAJERO") {
    setError("No tienes permisos para acceder al portal del personal.");
    return;
}

            localStorage.setItem("token", datos.token);
            localStorage.setItem("rol", rol);
            localStorage.setItem(
                "usuarioNombre",
                datos.nombre || ""
            );
            localStorage.setItem(
                "usuarioCorreo",
                datos.correo || correo
            );

            navigate(rutas[rol]);
        } catch (error) {
            setError(
                "No se pudo conectar con el servidor. Inténtalo nuevamente."
            );
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="personal-login">
            <div className="personal-login-card">

                <div className="personal-logo">
                    Mesa<span>Click</span>
                </div>

                <p className="personal-subtitle">
                    Tu experiencia, más fácil.
                </p>

                <div className="personal-divider"></div>

                <div className="personal-icon-container">
                    <div className="personal-icon">
                        <div className="personal-head"></div>
                        <div className="personal-body"></div>
                    </div>
                </div>

                <h1>Acceso al personal</h1>

                <p className="personal-description">
                    Ingresa tus credenciales para acceder a tu área de trabajo.
                </p>

                <form onSubmit={iniciarSesion}>
                    <div className="personal-input-group">
                        <label htmlFor="correo">
                            Correo electrónico
                        </label>

                        <input
                            id="correo"
                            type="email"
                            placeholder="Ingresa tu correo"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            autoComplete="username"
                            maxLength={150}
                            required
                        />
                    </div>

                    <div className="personal-input-group">
                        <label htmlFor="password">
                            Contraseña
                        </label>

                        <div className="personal-password-wrapper">
                            <input
                                id="password"
                                type={mostrarPassword ? "text" : "password"}
                                placeholder="Ingresa tu contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                required
                            />

                            <button
                                type="button"
                                className="personal-password-toggle"
                                onClick={() =>
                                    setMostrarPassword(!mostrarPassword)
                                }
                            >
                                {mostrarPassword ? "Ocultar" : "Mostrar"}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="personal-error" role="alert">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="personal-login-button"
                        disabled={cargando}
                    >
                        {cargando ? "Verificando..." : "Iniciar sesión"}
                    </button>
                </form>

                <p className="personal-footer">
                    Acceso exclusivo para personal autorizado de MesaClick.
                </p>
            </div>
        </div>
    );
}

export default LoginPersonal;


import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminPersonal() {

    const navigate = useNavigate();

    const [mostrarModal, setMostrarModal] = useState(false);

    const [busqueda, setBusqueda] = useState("");
    const [rolFiltro, setRolFiltro] = useState("TODOS");

    const [usuarios, setUsuarios] = useState([]);
    const [cargandoUsuarios, setCargandoUsuarios] = useState(true);
    const [erroresFormulario, setErroresFormulario] = useState({});

    const [mostrarPassword, setMostrarPassword] = useState(false);

    // Datos del formulario
    const [formulario, setFormulario] = useState({
        nombre: "",
        correo: "",
        telefono: "",
        edad: "",
        password: "",
        rol: ""
    });

    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");
    const [creando, setCreando] = useState(false);

    useEffect(() => {
    cargarUsuarios();
}, []);


const cargarUsuarios = async () => {

    try {

        setCargandoUsuarios(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/admin/login");
            return;
        }

        const respuesta = await fetch(
            "http://localhost:8080/api/admin/usuarios",
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (respuesta.status === 401 || respuesta.status === 403) {

            localStorage.removeItem("token");
            localStorage.removeItem("rol");

            navigate("/admin/login");
            return;
        }

        const datos = await respuesta.json();

if (!respuesta.ok) {
    throw new Error(
        datos.error ||
        datos.message ||
        "No fue posible cargar el personal."
    );
}

setUsuarios(datos);


    } catch (error) {

        console.error(error);
        setError(error.message);

    } finally {

        setCargandoUsuarios(false);
    }
};

    // Cambiar campos del formulario
    const manejarCambio = (e) => {

        const { name, value } = e.target;
        let nuevoValor = value;

        if (name === "telefono") {
            nuevoValor = value.replace(/\D/g, "").slice(0, 15);
        }

        if (name === "edad") {
            nuevoValor = value.replace(/\D/g, "").slice(0, 3);
        }

        setFormulario((anterior) => ({
            ...anterior,
            [name]: nuevoValor
        }));

        setErroresFormulario((anteriores) => ({
            ...anteriores,
            [name]: ""
        }));

        setError("");
    };

    const validarFormulario = () => {

        const errores = {};
        const nombre = formulario.nombre.trim();
        const correo = formulario.correo.trim();
        const telefono = formulario.telefono.trim();
        const edad = Number(formulario.edad);
        const password = formulario.password;

        if (!nombre) errores.nombre = "El nombre completo es obligatorio.";
        else if (nombre.length < 2) errores.nombre = "El nombre debe tener al menos 2 caracteres.";
        else if (nombre.length > 100) errores.nombre = "El nombre no puede superar los 100 caracteres.";

        if (!correo) errores.correo = "El correo electrónico es obligatorio.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) errores.correo = "Ingresa un correo electrónico válido.";
        else if (correo.length > 150) errores.correo = "El correo no puede superar los 150 caracteres.";

        if (!formulario.telefono.trim()) {
    errores.telefono = "El teléfono es obligatorio.";
  } else if (!/^\d{10}$/.test(formulario.telefono)) {
    errores.telefono = "El teléfono debe tener exactamente 10 números.";
  }

  if (!String(formulario.edad).trim()) {
    errores.edad = "La edad es obligatoria.";
  } else {
    const edad = Number(formulario.edad);
    if (edad < 18 || edad > 100) {
      errores.edad = "La edad debe estar entre 18 y 100 años.";
    }
  }

  

        if (!password) errores.password = "La contraseña es obligatoria.";
        else if (password.length < 8) errores.password = "La contraseña debe tener mínimo 8 caracteres.";
        else if (password.length > 100) errores.password = "La contraseña no puede superar los 100 caracteres.";
        else if (!/[a-z]/.test(password)) errores.password = "La contraseña debe contener al menos una letra minúscula.";
        else if (!/[A-Z]/.test(password)) errores.password = "La contraseña debe contener al menos una letra mayúscula.";
        else if (!/\d/.test(password)) errores.password = "La contraseña debe contener al menos un número.";

        if (!formulario.rol) errores.rol = "Debes seleccionar un rol.";

        setErroresFormulario(errores);
        return Object.keys(errores).length === 0;
    };

    const obtenerErroresBackend = (datos) => {
        const errores = {};

        if (datos?.errors && typeof datos.errors === "object" && !Array.isArray(datos.errors)) {
            Object.entries(datos.errors).forEach(([campo, mensaje]) => {
                errores[campo] = Array.isArray(mensaje) ? mensaje.join(" ") : String(mensaje);
            });
        } else if (Array.isArray(datos?.errors)) {
            datos.errors.forEach((item) => {
                const campo = item.field || item.campo;
                const mensaje = item.defaultMessage || item.message || item.error;
                if (campo && mensaje) errores[campo] = mensaje;
            });
        }

        return errores;
    };

    // Crear usuario
    const crearUsuario = async (e) => {

        e.preventDefault();
        setMensaje("");
        setError("");

        if (!validarFormulario()) return;

        setCreando(true);

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                setError("No hay una sesión de administrador activa.");
                navigate("/admin/login");
                return;
            }

            const respuesta = await fetch(
                "http://localhost:8080/api/admin/usuarios",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        nombre: formulario.nombre.trim(),
                        correo: formulario.correo.trim().toLowerCase(),
                        telefono: formulario.telefono,
                        edad: Number(formulario.edad),
                        password: formulario.password,
                        rol: formulario.rol
                    })
                }
            );

            let datos = {};
            try { datos = await respuesta.json(); } catch { datos = {}; }

            if (respuesta.status === 401 || respuesta.status === 403) {
                localStorage.removeItem("token");
                localStorage.removeItem("rol");
                localStorage.removeItem("usuarioNombre");
                localStorage.removeItem("usuarioCorreo");
                setError(respuesta.status === 401
                    ? "La sesión de administrador ha expirado. Inicia sesión nuevamente."
                    : "No tienes permisos para crear usuarios.");
                navigate("/admin/login");
                return;
            }

            if (respuesta.status === 409) {
                const mensajeDuplicado = datos.error || "El correo electrónico ya está registrado.";
                setError(mensajeDuplicado);
                setErroresFormulario((anteriores) => ({ ...anteriores, correo: mensajeDuplicado }));
                return;
            }

            if (respuesta.status === 400) {
                const erroresBackend = obtenerErroresBackend(datos);
                if (Object.keys(erroresBackend).length > 0) {
                    setErroresFormulario((anteriores) => ({ ...anteriores, ...erroresBackend }));
                    setError("Revisa los campos marcados. Hay información diligenciada incorrectamente.");
                } else {
                    setError(datos.error || datos.message || "Revisa los datos ingresados. Hay uno o más campos diligenciados incorrectamente.");
                }
                return;
            }

            if (!respuesta.ok) {
                setError(datos.error || datos.message || `No fue posible crear el usuario. Error ${respuesta.status}.`);
                return;
            }

            setMensaje(datos.mensaje || "Usuario creado correctamente.");
            await cargarUsuarios();

            setFormulario({ nombre: "", correo: "", telefono: "", edad: "", password: "", rol: "" });
            setErroresFormulario({});
            setMostrarPassword(false);

            setTimeout(() => {
                setMostrarModal(false);
                setMensaje("");
            }, 1200);

        } catch (error) {
            console.error(error);
            setError("No fue posible conectar con el servidor. Verifica que el backend de MesaClick esté ejecutándose.");
        } finally {
            setCreando(false);
        }
    };

    // Filtrar usuarios
    const usuariosFiltrados = usuarios.filter((usuario) => {

        const textoBusqueda = busqueda.toLowerCase();

        const coincideBusqueda =
            usuario.nombre.toLowerCase().includes(textoBusqueda) ||
            usuario.correo.toLowerCase().includes(textoBusqueda);

        const coincideRol =
            rolFiltro === "TODOS" ||
            usuario.rol === rolFiltro;

        return coincideBusqueda && coincideRol;
    });

    // Cerrar sesión
    const cerrarSesion = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("rol");
        localStorage.removeItem("usuarioNombre");
        localStorage.removeItem("usuarioCorreo");

        navigate("/admin/login");
    };

    return (
        <div className="admin-dashboard">

            {/* SIDEBAR */}

            <aside className="admin-sidebar">

                <div className="admin-sidebar-logo">
                    Mesa<span>Click</span>
                </div>

                <div className="admin-sidebar-divider"></div>

                <nav className="admin-navigation">

                    <button
                        className="admin-nav-item"
                        onClick={() => navigate("/admin/dashboard")}
                    >
                        <span>▦</span>
                        Dashboard
                    </button>

                    <button className="admin-nav-item active">
                        <span>♙</span>
                        Personal
                    </button>

                    <button className="admin-nav-item disabled">
                        <span>▣</span>
                        Productos
                        <small>Próximamente</small>
                    </button>

                    <button className="admin-nav-item disabled">
                        <span>▤</span>
                        Pedidos
                        <small>Próximamente</small>
                    </button>

                    <button className="admin-nav-item disabled">
                        <span>▥</span>
                        Reportes
                        <small>Próximamente</small>
                    </button>

                    <button className="admin-nav-item disabled">
                        <span>⚙</span>
                        Configuración
                        <small>Próximamente</small>
                    </button>

                </nav>

                <button
                    className="admin-logout"
                    onClick={cerrarSesion}
                >
                    <span>↪</span>
                    Cerrar sesión
                </button>

            </aside>


            {/* CONTENIDO PRINCIPAL */}

            <main className="admin-main">

                <header className="admin-header">

                    <div>

                        <p className="admin-header-label">
                            Administración
                        </p>

                        <h1>
                            Gestión de personal
                        </h1>

                    </div>

                    <button
                        className="admin-primary-button"
                        onClick={() => {
                            setError("");
                            setMensaje("");
                            setErroresFormulario({});
                            setMostrarPassword(false);
                            setMostrarModal(true);
                        }}
                    >
                        + Crear usuario
                    </button>

                </header>


                {/* ESTADÍSTICAS */}

                <section className="personal-stats">

                    <div className="personal-stat-card">

                        <div className="personal-stat-icon">
                            P
                        </div>

                        <div>
                            <span>Total personal</span>
                            <strong>{usuarios.length}</strong>
                        </div>

                    </div>


                    <div className="personal-stat-card">

                        <div className="personal-stat-icon">
                            C
                        </div>

                        <div>
                            <span>Cocina</span>

                            <strong>
                                {
                                    usuarios.filter(
                                        u => u.rol === "COCINA"
                                    ).length
                                }
                            </strong>
                        </div>

                    </div>


                    <div className="personal-stat-card">

                        <div className="personal-stat-icon">
                            M
                        </div>

                        <div>
                            <span>Meseros</span>

                            <strong>
                                {
                                    usuarios.filter(
                                        u => u.rol === "MESERO"
                                    ).length
                                }
                            </strong>
                        </div>

                    </div>


                    <div className="personal-stat-card">

                        <div className="personal-stat-icon">
                            $
                        </div>

                        <div>
                            <span>Cajeros</span>

                            <strong>
                                {
                                    usuarios.filter(
                                        u => u.rol === "CAJERO"
                                    ).length
                                }
                            </strong>
                        </div>

                    </div>

                </section>


                {/* TABLA */}

                <section className="personal-table-card">

                    <div className="personal-table-header">

                        <div>

                            <h2>
                                Usuarios del personal
                            </h2>

                            <p>
                                Administra los usuarios que tienen
                                acceso al sistema.
                            </p>

                        </div>

                    </div>


                    {/* FILTROS */}

                    <div className="personal-filters">

                        <div className="personal-search">

                            <span>⌕</span>

                            <input
                                type="text"
                                placeholder="Buscar por nombre o correo..."
                                value={busqueda}
                                onChange={(e) =>
                                    setBusqueda(e.target.value)
                                }
                            />

                        </div>


                        <select
                            value={rolFiltro}
                            onChange={(e) =>
                                setRolFiltro(e.target.value)
                            }
                        >

                            <option value="TODOS">
                                Todos los roles
                            </option>

                            <option value="COCINA">
                                Cocina
                            </option>

                            <option value="MESERO">
                                Mesero
                            </option>

                            <option value="CAJERO">
                                Cajero
                            </option>

                        </select>

                    </div>


                    {/* TABLA */}

                    <div className="personal-table-container">

                        <table className="personal-table">

                            <thead>

                                <tr>
                                    <th>Usuario</th>
                                    <th>Correo</th>
                                    <th>Teléfono</th>
                                    <th>Rol</th>
                                    <th>Estado</th>
                                    <th></th>
                                </tr>

                            </thead>


                            <tbody>

                                {cargandoUsuarios ? (

                                    <tr>
                                        <td colSpan="6" className="personal-table-message">
                                            Cargando usuarios...
                                        </td>
                                    </tr>

                                ) : usuariosFiltrados.length === 0 ? (

                                    <tr>
                                        <td colSpan="6" className="personal-table-message">
                                            {usuarios.length === 0
                                                ? "No hay usuarios de personal registrados."
                                                : "No se encontraron usuarios con los filtros seleccionados."}
                                        </td>
                                    </tr>

                                ) : (

                                usuariosFiltrados.map((usuario) => (

                                    <tr key={usuario.idUsuario}>

                                        <td>

                                            <div className="personal-user">

                                                <div className="personal-avatar">

                                                    {usuario.nombre
                                                        .charAt(0)
                                                        .toUpperCase()}

                                                </div>

                                                <strong>
                                                    {usuario.nombre}
                                                </strong>

                                            </div>

                                        </td>


                                        <td>
                                            {usuario.correo}
                                        </td>


                                        <td>
                                            {usuario.telefono}
                                        </td>


                                        <td>

                                            <span
                                                className={`personal-role role-${usuario.rol.toLowerCase()}`}
                                            >
                                                {usuario.rol}
                                            </span>

                                        </td>


                                        <td>

                                            <span className="personal-status">

                                                <span></span>

                                                Activo

                                            </span>

                                        </td>


                                        <td>

                                            <button
                                                className="personal-more"
                                                title="Opciones"
                                            >
                                                ⋮
                                            </button>

                                        </td>

                                    </tr>

                                ))

                                )}

                            </tbody>

                        </table>

                    </div>

                </section>

            </main>


            {/* MODAL CREAR USUARIO */}

            {mostrarModal && (

                <div className="personal-modal-overlay">

                    <div
                        className="personal-modal"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="personal-modal-header">

                            <div>

                                <h2>
                                    Crear usuario
                                </h2>

                                <p>
                                    Registra un nuevo miembro del personal.
                                </p>

                            </div>


                            <button
                                className="personal-modal-close"
                                onClick={() => setMostrarModal(false)}
                            >
                                ×
                            </button>

                        </div>


                        <form
                            className="personal-form"
                            onSubmit={crearUsuario}
                            noValidate
                        >

                            {/* MENSAJE DE ERROR */}

                            {error && (

                                <div className="personal-error-message">
                                    {error}
                                </div>

                            )}


                            {/* MENSAJE DE ÉXITO */}

                            {mensaje && (

                                <div className="personal-success-message">
                                    {mensaje}
                                </div>

                            )}


                            <div className="personal-form-group">

                                <label>
                                    Nombre completo
                                </label>

                                <input
                                    type="text"
                                    name="nombre"
                                    placeholder="Ej. Carlos Pérez"
                                    value={formulario.nombre}
                                    onChange={manejarCambio}
                                    required
                                />

                                {erroresFormulario.nombre && (
                                    <small className="personal-field-error">
                                        {erroresFormulario.nombre}
                                    </small>
                                )}

                            </div>


                            <div className="personal-form-group">

                                <label>
                                    Correo electrónico
                                </label>

                                <input
                                    type="email"
                                    name="correo"
                                    placeholder="correo@mesaclick.com"
                                    value={formulario.correo}
                                    onChange={manejarCambio}
                                    required
                                />

                                {erroresFormulario.correo && (
                                    <small className="personal-field-error">
                                        {erroresFormulario.correo}
                                    </small>
                                )}

                            </div>


                            <div className="personal-form-row">

                                <div className="personal-form-group">

                                    <label>
                                        Teléfono
                                    </label>

                                    <input
                                        type="text"
                                        name="telefono"
                                        placeholder="3001234567"
                                        value={formulario.telefono}
                                        onChange={manejarCambio}
                                        required
                                    />

                                    {/* <-- AGREGA ESTO DEBAJO DEL INPUT DE TELÉFONO */}
    {erroresFormulario.telefono && (
      <small className="personal-field-error">
        {erroresFormulario.telefono}
      </small>
    )}

                                </div>


                                <div className="personal-form-group">

                                    <label>
                                        Edad
                                    </label>

                                    <input
                                        type="number"
                                        name="edad"
                                        placeholder="25"
                                        min="18"
                                        max="100"
                                        value={formulario.edad}
                                        onChange={manejarCambio}
                                        required
                                    />

                                    {/* <-- AGREGA ESTO DEBAJO DEL INPUT DE EDAD */}
    {erroresFormulario.edad && (
      <small className="personal-field-error">
        {erroresFormulario.edad}
      </small>
    )}

                                </div>

                            </div>


                            <div className="personal-form-group">

    <label>
        Contraseña
    </label>

    <div className="password-input-container">

        <input
            type={mostrarPassword ? "text" : "password"}
            name="password"
            placeholder="Contraseña inicial"
            value={formulario.password}
            onChange={manejarCambio}
            required
        />

        <button
            type="button"
            className="password-toggle-button"
            onClick={() => setMostrarPassword(!mostrarPassword)}
        >
            {mostrarPassword ? "Ocultar" : "Mostrar"}
        </button>

    </div>

    {erroresFormulario.password ? (
        <small className="personal-field-error">
            {erroresFormulario.password}
        </small>
    ) : formulario.password &&
        !(
            formulario.password.length >= 8 &&
            /[a-z]/.test(formulario.password) &&
            /[A-Z]/.test(formulario.password) &&
            /\d/.test(formulario.password)
        ) ? (
            <small className="personal-field-error">
                Mínimo 8 caracteres, con mayúscula, minúscula y número.
            </small>
        ) : null}

</div>


                            <div className="personal-form-group">

                                <label>
                                    Rol
                                </label>

                                <select
                                    name="rol"
                                    value={formulario.rol}
                                    onChange={manejarCambio}
                                    required
                                >

                                    <option value="">
                                        Seleccionar rol
                                    </option>

                                    <option value="COCINA">
                                        Cocina
                                    </option>

                                    <option value="MESERO">
                                        Mesero
                                    </option>

                                    <option value="CAJERO">
                                        Cajero
                                    </option>

                                </select>

                                {erroresFormulario.rol && (
                                    <small className="personal-field-error">
                                        {erroresFormulario.rol}
                                    </small>
                                )}

                            </div>


                            <div className="personal-modal-footer">

                                <button
                                    type="button"
                                    className="personal-cancel-button"
                                    onClick={() =>
                                        setMostrarModal(false)
                                    }
                                >
                                    Cancelar
                                </button>


                                <button
                                    type="submit"
                                    className="admin-primary-button"
                                    disabled={creando}
                                >

                                    {creando
                                        ? "Creando..."
                                        : "Crear usuario"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}

export default AdminPersonal;
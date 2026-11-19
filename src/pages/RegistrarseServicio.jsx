import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function RegistrarseServicio() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    const tipoInicial = searchParams.get("tipo") || "natural";
    const [tipoCliente, setTipoCliente] = useState(tipoInicial);
    const [paso, setPaso] = useState(1);

    const [formData, setFormData] = useState({
        correo: "",
        password: "",
        confirmPassword: "",
        nombreEstablecimiento: "",
        telefono: "",
        planSeleccionado: "Profesional",
        nombreCompleto: "",
        cedula: "",
        razonSocial: "",
        nit: "",
        representanteLegal: "",
        direccionFiscal: ""
    });

    useEffect(() => {
        const tipoUrl = searchParams.get("tipo");
        if (tipoUrl) {
            setTipoCliente(tipoUrl);
        }
    }, [searchParams]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("Las contraseñas no coinciden.");
            return;
        }

        try {
            console.log("Datos de registro enviados:", { tipoCliente, ...formData });
            alert(`¡Registro exitoso como Persona ${tipoCliente.toUpperCase()}! Redirigiendo al login...`);
            navigate("/personal/login");
        } catch (error) {
            console.error("Error al registrar:", error);
            alert("No se pudo completar el registro. Intenta nuevamente.");
        }
    };

    return (
        <div className="reg-container-principal">
            <div className="reg-sidebar">
                <div className="reg-sidebar-content">
                    <div className="reg-logo" onClick={() => navigate("/")}>
                        Mesa<span>Click</span>
                    </div>
                    <h1>Digitalice y potencie su restaurante hoy</h1>
                    <p>
                        Únase a la red de establecimientos gastronómicos que operan en tiempo real 
                        con precisión financiera y comandas automatizadas.
                    </p>

                    <div className="reg-beneficios-lista">
                        <div className="reg-beneficio-item">
                            <span>⚡</span> Configuración inmediata de mesas y QR
                        </div>
                        <div className="reg-beneficio-item">
                            <span>👥</span> Sincronización Total (Cocina, Meseros, Caja)
                        </div>
                        <div className="reg-beneficio-item">
                            <span>🔒</span> Plataforma 100% segura con cifrado comercial
                        </div>
                    </div>
                </div>
                <div className="reg-footer-back">
                    <button onClick={() => navigate("/")}>← Volver a la página principal</button>
                </div>
            </div>

            <div className="reg-form-container">
                <div className="reg-form-wrapper">
                    
                    <div className="reg-header-form">
                        <h2>Cree su cuenta comercial</h2>
                        <p>Seleccione su tipo de afiliación para continuar con la suscripción.</p>
                    </div>

                    <div className="reg-tipo-selector">
                        <button 
                            type="button" 
                            className={`reg-tipo-btn ${tipoCliente === "natural" ? "active" : ""}`}
                            onClick={() => { setTipoCliente("natural"); setPaso(1); }}
                        >
                            👤 Persona Natural
                        </button>
                        <button 
                            type="button" 
                            className={`reg-tipo-btn ${tipoCliente === "juridica" ? "active" : ""}`}
                            onClick={() => { setTipoCliente("juridica"); setPaso(1); }}
                        >
                            🏢 Persona Jurídica / Empresa
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="reg-form">
                        
                        {paso === 1 && (
                            <div className="reg-paso-content animate-fade">
                                <h3>Paso 1: Información del Establecimiento</h3>
                                
                                <div className="reg-input-group">
                                    <label>Nombre del Restaurante / Establecimiento</label>
                                    <input 
                                        type="text" 
                                        name="nombreEstablecimiento" 
                                        placeholder="Ej: Sabor y Sazón Gourmet" 
                                        value={formData.nombreEstablecimiento}
                                        onChange={handleChange}
                                        required 
                                    />
                                </div>

                                <div className="reg-grid-2">
                                    <div className="reg-input-group">
                                        <label>Teléfono de Contacto / WhatsApp</label>
                                        <input 
                                            type="tel" 
                                            name="telefono" 
                                            placeholder="Ej: 300 123 4567" 
                                            value={formData.telefono}
                                            onChange={handleChange}
                                            required 
                                        />
                                    </div>

                                    <div className="reg-input-group">
                                        <label>Plan Seleccionado</label>
                                        <select 
                                            name="planSeleccionado" 
                                            value={formData.planSeleccionado}
                                            onChange={handleChange}
                                        >
                                            <option value="Basico">Plan Emprendedor ($79.000 / mes)</option>
                                            <option value="Profesional">Plan Profesional ($149.000 / mes)</option>
                                            <option value="Corporativo">Plan Corporativo (A Convenir)</option>
                                        </select>
                                    </div>
                                </div>

                                <button type="button" className="reg-btn-siguiente" onClick={() => setPaso(2)}>
                                    Siguiente: Datos de {tipoCliente === "natural" ? "Identidad" : "Empresa"} →
                                </button>
                            </div>
                        )}

                        {paso === 2 && (
                            <div className="reg-paso-content animate-fade">
                                <h3>Paso 2: Datos de {tipoCliente === "natural" ? "Persona Natural" : "Persona Jurídica"}</h3>

                                {tipoCliente === "natural" ? (
                                    <>
                                        <div className="reg-input-group">
                                            <label>Nombre Completo del Propietario</label>
                                            <input 
                                                type="text" 
                                                name="nombreCompleto" 
                                                placeholder="Ej: Carlos Andrés Pérez" 
                                                value={formData.nombreCompleto}
                                                onChange={handleChange}
                                                required 
                                            />
                                        </div>
                                        <div className="reg-input-group">
                                            <label>Cédula de Ciudadanía (C.C.)</label>
                                            <input 
                                                type="text" 
                                                name="cedula" 
                                                placeholder="Ej: 1098765432" 
                                                value={formData.cedula}
                                                onChange={handleChange}
                                                required 
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="reg-input-group">
                                            <label>Razón Social (Nombre de la Empresa)</label>
                                            <input 
                                                type="text" 
                                                name="razonSocial" 
                                                placeholder="Ej: Gastronomía SAS" 
                                                value={formData.razonSocial}
                                                onChange={handleChange}
                                                required 
                                            />
                                        </div>
                                        <div className="reg-grid-2">
                                            <div className="reg-input-group">
                                                <label>NIT de la Empresa</label>
                                                <input 
                                                    type="text" 
                                                    name="nit" 
                                                    placeholder="Ej: 900.123.456-1" 
                                                    value={formData.nit}
                                                    onChange={handleChange}
                                                    required 
                                                />
                                            </div>
                                            <div className="reg-input-group">
                                                <label>Representante Legal</label>
                                                <input 
                                                    type="text" 
                                                    name="representanteLegal" 
                                                    placeholder="Nombre del representante" 
                                                    value={formData.representanteLegal}
                                                    onChange={handleChange}
                                                    required 
                                                />
                                            </div>
                                        </div>
                                        <div className="reg-input-group">
                                            <label>Dirección Fiscal</label>
                                            <input 
                                                type="text" 
                                                name="direccionFiscal" 
                                                placeholder="Calle Principal # 45-12, Ciudad" 
                                                value={formData.direccionFiscal}
                                                onChange={handleChange}
                                                required 
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="reg-flex-buttons">
                                    <button type="button" className="reg-btn-atras" onClick={() => setPaso(1)}>
                                        ← Atrás
                                    </button>
                                    <button type="button" className="reg-btn-siguiente" onClick={() => setPaso(3)}>
                                        Siguiente: Credenciales →
                                    </button>
                                </div>
                            </div>
                        )}

                        {paso === 3 && (
                            <div className="reg-paso-content animate-fade">
                                <h3>Paso 3: Credenciales de Acceso al Sistema</h3>
                                <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>
                                    Con estos datos accederá el administrador para configurar su menú, mesas y personal.
                                </p>

                                <div className="reg-input-group">
                                    <label>Correo Electrónico (Usuario Administrador)</label>
                                    <input 
                                        type="email" 
                                        name="correo" 
                                        placeholder="admin@restaurante.com" 
                                        value={formData.correo}
                                        onChange={handleChange}
                                        required 
                                    />
                                </div>

                                <div className="reg-grid-2">
                                    <div className="reg-input-group">
                                        <label>Contraseña</label>
                                        <input 
                                            type="password" 
                                            name="password" 
                                            placeholder="••••••••" 
                                            value={formData.password}
                                            onChange={handleChange}
                                            required 
                                        />
                                    </div>
                                    <div className="reg-input-group">
                                        <label>Confirmar Contraseña</label>
                                        <input 
                                            type="password" 
                                            name="confirmPassword" 
                                            placeholder="••••••••" 
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required 
                                        />
                                    </div>
                                </div>

                                <div className="reg-flex-buttons">
                                    <button type="button" className="reg-btn-atras" onClick={() => setPaso(2)}>
                                        ← Atrás
                                    </button>
                                    <button type="submit" className="reg-btn-submit">
                                        Completar Suscripción y Registrarse 🚀
                                    </button>
                                </div>
                            </div>
                        )}

                    </form>

                </div>
            </div>
        </div>
    );
}

export default RegistrarseServicio;
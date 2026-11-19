import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function HomeMesaClick() {
    const navigate = useNavigate();

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("mc-visible");
                    }
                });
            },
            { threshold: 0.1 }
        );

        const elementosAnimados = document.querySelectorAll(".mc-animate");
        elementosAnimados.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    const manejarSeleccionPlan = (tipoPersona) => {
        navigate(`/registrarse?tipo=${tipoPersona}`);
    };

    return (
        <div className="mc-landing">
            {/* ENCABEZADO CORPORATIVO */}
            <header className="mc-header">
                <div className="mc-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    Mesa<span>Click</span>
                </div>
                <nav className="mc-nav">
                    <button onClick={() => scrollToSection("quienes-somos")}>Quiénes somos</button>
                    <button onClick={() => scrollToSection("solucion")}>Nuestra solución</button>
                    <button onClick={() => scrollToSection("planes")}>Planes</button>
                    <button onClick={() => scrollToSection("politicas")}>Políticas</button>
                </nav>
                <div className="mc-actions">
                    <button className="mc-btn-primary" onClick={() => scrollToSection("planes")}>
                        Adquirir Servicio
                    </button>
                </div>
            </header>

            {/* SECCIÓN HERO */}
            <section className="mc-hero">
                <div className="mc-container mc-text-center mc-animate mc-fade-down">
                    <span className="mc-tag">Plataforma Gastronómica Profesional</span>
                    <h1>El ecosistema digital inteligente para la gestión de su restaurante</h1>
                    <p className="mc-hero-desc">
                        Optimice cada interacción operativa de su establecimiento. Sincronizamos en tiempo real 
                        las comandas del salón, las estaciones de cocina, el servicio de meseros y el control financiero de caja.
                    </p>
                    <div className="mc-hero-buttons">
                        <button className="mc-btn-primary" onClick={() => scrollToSection("planes")}>
                            Ver Planes y Tarifas
                        </button>
                        <button className="mc-btn-secondary" onClick={() => scrollToSection("quienes-somos")}>
                            Conocer Más
                        </button>
                    </div>
                </div>
            </section>

            {/* QUIÉNES SOMOS */}
            <section id="quienes-somos" className="mc-section mc-bg-white">
                <div className="mc-container">
                    <div className="mc-text-center mc-animate mc-fade-up" style={{ marginBottom: "60px" }}>
                        <span className="mc-tag-sub">Institucional</span>
                        <h2>¿Quiénes Somos?</h2>
                        <p className="mc-section-subtitle">
                            Desarrollamos tecnología de alta disponibilidad orientada a transformar los procesos operativos del sector HORECA.
                        </p>
                    </div>

                    <div className="mc-about-grid">
                        <div className="mc-card mc-animate mc-fade-left">
                            <h3>Nuestra Misión</h3>
                            <p>
                                Proveer a la industria gastronómica una solución SaaS robusta que elimine los cuellos de botella 
                                operativos, minimice los márgenes de error humano en la toma de pedidos y maximice 
                                la rentabilidad financiera mediante la automatización de procesos.
                            </p>
                        </div>
                        <div className="mc-card mc-animate mc-fade-right">
                            <h3>Nuestra Visión</h3>
                            <p>
                                Consolidarnos como la infraestructura tecnológica de referencia en la automatización de establecimientos 
                                gastronómicos a nivel nacional, reconocidos por la estabilidad de nuestra arquitectura en tiempo real 
                                y nuestro estándar de seguridad transaccional.
                            </p>
                        </div>
                    </div>

                    <div className="mc-about-details mc-animate mc-zoom-in">
                        <h3>Arquitectura orientada a resultados</h3>
                        <p>
                            Digitalizamos la experiencia integral del restaurante mediante un flujo sincronizado. Los comensales acceden 
                            a la carta digital vía código QR único por mesa, enviando sus requerimientos de manera directa. 
                            Paralelamente, el personal opera bajo interfaces segregadas y altamente eficientes: visualización de prioridades 
                            en cocina, control de entrega de comandas en salón y auditoría financiera automatizada en caja.
                        </p>
                    </div>
                </div>
            </section>

            {/* NUESTRA SOLUCIÓN */}
            <section id="solucion" className="mc-section mc-bg-light">
                <div className="mc-container">
                    <div className="mc-text-center mc-animate mc-fade-down" style={{ marginBottom: "60px" }}>
                        <span className="mc-tag-sub">Operatividad</span>
                        <h2>Eficiencia en Cuatro Frentes</h2>
                        <p className="mc-section-subtitle">Módulos especializados diseñados específicamente para cada eslabón del negocio.</p>
                    </div>

                    <div className="mc-features-grid">
                        <div className="mc-feature-box mc-animate mc-fade-up">
                            <h4>Comensales</h4>
                            <p>Experiencia de pedido autónoma y transparente mediante menús interactivos optimizados para dispositivos móviles.</p>
                        </div>
                        <div className="mc-feature-box mc-animate mc-fade-up" style={{ animationDelay: "0.1s" }}>
                            <h4>Cocina (KDS)</h4>
                            <p>Gestión electrónica de comandas que sustituye los tickets impresos, organizando prioridades y tiempos de preparación.</p>
                        </div>
                        <div className="mc-feature-box mc-animate mc-fade-up" style={{ animationDelay: "0.2s" }}>
                            <h4>Meseros</h4>
                            <p>Control visual del estado de las mesas en tiempo real con notificaciones automáticas de platos listos para entrega.</p>
                        </div>
                        <div className="mc-feature-box mc-animate mc-fade-up" style={{ animationDelay: "0.3s" }}>
                            <div className="mc-f-indicator"></div>
                            <h4>Caja & Administración</h4>
                            <p>Control de ingresos, cálculo exacto de cuentas y devueltas, cierres de caja automatizados y auditoría completa.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* PLANES Y TARIFAS */}
            <section id="planes" className="mc-section mc-bg-white">
                <div className="mc-container">
                    <div className="mc-text-center mc-animate mc-fade-down" style={{ marginBottom: "60px" }}>
                        <span className="mc-tag-sub">Inversión</span>
                        <h2>Planes y Tarifas Comerciales</h2>
                        <p className="mc-section-subtitle">
                            Seleccione la modalidad de infraestructura adecuada para su modelo de negocio (Persona Natural o Persona Jurídica).
                        </p>
                    </div>

                    <div className="mc-pricing-grid">
                        {/* Plan Básico */}
                        <div className="mc-price-card mc-animate mc-fade-left">
                            <div className="mc-price-header">
                                <h3>Plan Emprendedor</h3>
                                <p>Para cafés, bares y establecimientos independientes de menor escala.</p>
                                <div className="mc-price">
                                    <strong>$79.000</strong> <span>COP / mes</span>
                                </div>
                            </div>
                            <ul className="mc-price-list">
                                <li>Hasta 15 mesas configuradas</li>
                                <li>Módulos de Cocina y Salón</li>
                                <li>Órdenes en tiempo real por código QR</li>
                                <li className="disabled">Caja Financiera Avanzada</li>
                                <li className="disabled">Multi-sede y Franquicias</li>
                            </ul>
                            <div className="mc-price-actions">
                                <button className="mc-btn-outline" onClick={() => manejarSeleccionPlan("natural")}>
                                    Afiliar como Persona Natural
                                </button>
                                <button className="mc-btn-outline" onClick={() => manejarSeleccionPlan("juridica")}>
                                    Afiliar como Persona Jurídica
                                </button>
                            </div>
                        </div>

                        {/* Plan Profesional */}
                        <div className="mc-price-card mc-featured mc-animate mc-zoom-in">
                            <div className="mc-badge-pop">Recomendado</div>
                            <div className="mc-price-header">
                                <h3>Plan Profesional</h3>
                                <p>Para restaurantes establecidos con alto volumen operativo diario.</p>
                                <div className="mc-price">
                                    <strong>$149.000</strong> <span>COP / mes</span>
                                </div>
                            </div>
                            <ul className="mc-price-list">
                                <li>Mesas y capacidad ilimitadas</li>
                                <li>Acceso total (Admin, Caja, Cocina, Meseros)</li>
                                <li>Control financiero, pagos y devueltas</li>
                                <li>Historial diario y reportes analíticos</li>
                                <li>Soporte técnico prioritario</li>
                            </ul>
                            <div className="mc-price-actions">
                                <button className="mc-btn-primary" onClick={() => manejarSeleccionPlan("natural")}>
                                    Afiliar como Persona Natural
                                </button>
                                <button className="mc-btn-primary" onClick={() => manejarSeleccionPlan("juridica")}>
                                    Afiliar como Persona Jurídica
                                </button>
                            </div>
                        </div>

                        {/* Plan Corporativo */}
                        <div className="mc-price-card mc-animate mc-fade-right">
                            <div className="mc-price-header">
                                <h3>Plan Corporativo</h3>
                                <p>Infraestructura a medida orientada a cadenas y franquicias.</p>
                                <div className="mc-price">
                                    <strong>A Convenir</strong>
                                </div>
                            </div>
                            <ul className="mc-price-list">
                                <li>Gestión centralizada multi-sucursal</li>
                                <li>Base de datos dedicada en la nube</li>
                                <li>Integración con pasarelas de pago externas</li>
                                <li>Capacitación presencial al personal</li>
                                <li>Gerente de cuenta corporativa asignado</li>
                            </ul>
                            <div className="mc-price-actions">
                                <button className="mc-btn-outline" onClick={() => manejarSeleccionPlan("juridica")}>
                                    Contactar Departamento Comercial
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* POLÍTICAS */}
            <section id="politicas" className="mc-section mc-bg-light">
                <div className="mc-container" style={{ maxWidth: "800px" }}>
                    <div className="mc-text-center mc-animate mc-fade-down" style={{ marginBottom: "50px" }}>
                        <span className="mc-tag-sub">Marco Legal</span>
                        <h2>Políticas y Privacidad</h2>
                        <p className="mc-section-subtitle">Compromiso institucional con la seguridad y confidencialidad de la información.</p>
                    </div>

                    <div className="mc-policy-box mc-animate mc-fade-up">
                        <h4>1. Tratamiento y Protección de Datos</h4>
                        <p>Dando estricto cumplimiento a la normatividad vigente sobre protección de datos personales, MesaClick garantiza la confidencialidad absoluta de la información transaccional y de los comensales finales.</p>
                        
                        <h4>2. Infraestructura y Disponibilidad de Servidores</h4>
                        <p>Aseguramos un nivel de disponibilidad del 99.9%, respaldado por protocolos de cifrado de extremo a extremo y autenticación corporativa mediante tokens seguros (JWT) para mitigar accesos no autorizados.</p>

                        <h4>3. Condiciones de Facturación</h4>
                        <p>Los planes comerciales se facturan de forma prepago mensual. El establecimiento afiliado conserva el derecho de actualizar, migrar o suspender su suscripción en cualquier momento desde el panel de administración corporativo.</p>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="mc-footer">
                <div className="mc-container mc-footer-content">
                    <div>
                        <div className="mc-logo" style={{ color: "#ffffff", marginBottom: "8px" }}>
                            Mesa<span>Click</span>
                        </div>
                        <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0 }}>
                            Solución tecnológica institucional para la gestión operativa y financiera del sector HORECA.
                        </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <p style={{ margin: "0 0 4px 0", fontSize: "13px" }}>© 2026 MesaClick. Todos los derechos reservados.</p>
                        <span style={{ color: "#64748b", fontSize: "12px" }}>Infraestructura en la nube certificada.</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default HomeMesaClick;
function LoginPersonal() {

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

                <h1>Acceso del personal</h1>

                <p className="personal-description">
                    Selecciona el área a la que deseas ingresar
                </p>

                <div className="roles-container">

                    {/* ADMINISTRADOR */}
                    <button className="role-button">

                        <div className="role-icon">
                            <div className="admin-icon">
                                <div className="admin-head"></div>
                                <div className="admin-body"></div>
                            </div>
                        </div>

                        <div className="role-info">
                            <strong>Administrador</strong>
                            <span>Gestión del sistema</span>
                        </div>

                        <div className="role-arrow">
                            →
                        </div>

                    </button>


                    {/* COCINA */}
                    <button className="role-button">

                        <div className="role-icon">
                            <div className="kitchen-icon">
                                <div className="knife"></div>
                                <div className="fork"></div>
                            </div>
                        </div>

                        <div className="role-info">
                            <strong>Cocina</strong>
                            <span>Gestión de pedidos</span>
                        </div>

                        <div className="role-arrow">
                            →
                        </div>

                    </button>


                    {/* MESERO */}
                    <button className="role-button">

                        <div className="role-icon">
                            <div className="waiter-icon">
                                <div className="waiter-head"></div>
                                <div className="waiter-body"></div>
                            </div>
                        </div>

                        <div className="role-info">
                            <strong>Mesero</strong>
                            <span>Atención y pedidos</span>
                        </div>

                        <div className="role-arrow">
                            →
                        </div>

                    </button>

                </div>

                <p className="personal-footer">
                    Acceso exclusivo para personal de MesaClick
                </p>

            </div>

        </div>
    );
}

export default LoginPersonal;
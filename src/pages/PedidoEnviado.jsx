import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function PedidoEnviado() {

    const navigate = useNavigate();
    const { codigo } = useParams();

    const [mesa, setMesa] = useState(null);
    const [historialPedidos, setHistorialPedidos] = useState([]);

    useEffect(() => {

        async function cargarHistorial() {

            try {

                // ==========================================
                // 1. OBTENER LA MESA MEDIANTE EL QR
                // ==========================================

                const respuestaMesa = await fetch(
                    `http://localhost:8080/api/mesas/codigo/${codigo}`
                );

                if (!respuestaMesa.ok) {
                    throw new Error("No se pudo encontrar la mesa");
                }

                const mesaData = await respuestaMesa.json();

                setMesa(mesaData);


                // ==========================================
                // 2. OBTENER PEDIDOS DE ESA MESA
                // ==========================================

                const respuestaPedidos = await fetch(
                    `http://localhost:8080/api/pedidos/mesa/${mesaData.id_mesa}`
                );

                if (!respuestaPedidos.ok) {
                    throw new Error(
                        "No se pudo obtener el historial"
                    );
                }

                const pedidos = await respuestaPedidos.json();

                setHistorialPedidos(pedidos);

                console.log(
                    "HISTORIAL EN PEDIDO ENVIADO:",
                    pedidos
                );

            } catch (error) {

                console.error(
                    "Error cargando historial:",
                    error
                );

            }

        }

        cargarHistorial();

    }, [codigo]);


    function hacerNuevoPedido() {

        navigate(`/mesa/${codigo}`);

    }


    return (

        <div className="pedido-enviado">

            <div className="pedido-enviado-card">

                <div className="pedido-enviado-icon">
                    ✓
                </div>


                <h1>
                    ¡Pedido enviado!
                </h1>


                <p>
                    Tu pedido fue recibido correctamente.
                </p>


                <p>
                    El restaurante ya recibió tu solicitud
                    y comenzará a prepararla.
                </p>


                {/* =====================================
                    HISTORIAL
                ====================================== */}

                <div className="historial-pedidos">

    <div className="historial-header">
        <h2>
            Pedidos de esta mesa
        </h2>

        <span>
            {historialPedidos.length} pedidos
        </span>
    </div>

    <div className="historial-lista">

        {historialPedidos
            .slice()
            .reverse()
            .map((pedido) => (

                <div
                    className="historial-pedido"
                    key={pedido.idPedido}
                >

                    <div className="historial-pedido-info">

                        <div className="historial-pedido-titulo">

                            <strong>
                                Pedido #{pedido.idPedido}
                            </strong>

                            <span className="estado-pedido">
                                {pedido.estadoPedido}
                            </span>

                        </div>

                        <span className="fecha-pedido">
                            {new Date(
                                pedido.fechaPedido
                            ).toLocaleString("es-CO")}
                        </span>

                    </div>

                    <strong className="historial-pedido-total">

                        $
                        {pedido.totalPedido.toLocaleString(
                            "es-CO"
                        )}

                    </strong>

                </div>

            ))}

    </div>

</div>


                {/* =====================================
                    NUEVO PEDIDO
                ====================================== */}

                <button
                    onClick={hacerNuevoPedido}
                >
                    Hacer un nuevo pedido
                </button>


            </div>

        </div>

    );

}

export default PedidoEnviado;
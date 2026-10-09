
import { useEffect, useState } from "react";

const API = "http://localhost:8080/api";

function NuevoPedidoModal({ onCerrar, onPedidoCreado }) {
    const [mesas, setMesas] = useState([]);
    const [productos, setProductos] = useState([]);
    const [idMesa, setIdMesa] = useState("");
    const [cantidades, setCantidades] = useState({});
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const token = localStorage.getItem("token");
                const headers = token
                    ? { Authorization: `Bearer ${token}` }
                    : {};

                const [respuestaMesas, respuestaProductos] = await Promise.all([
                    fetch(`${API}/mesas`, { headers }),
                    fetch(`${API}/productos`, { headers }),
                ]);

                if (!respuestaMesas.ok || !respuestaProductos.ok) {
                    throw new Error("No fue posible cargar las mesas o el menú.");
                }

                const datosMesas = await respuestaMesas.json();
                const datosProductos = await respuestaProductos.json();

                setMesas(Array.isArray(datosMesas) ? datosMesas : []);
                setProductos(Array.isArray(datosProductos) ? datosProductos : []);
            } catch (e) {
                setError(e.message || "Error al cargar los datos.");
            } finally {
                setCargando(false);
            }
        };

        cargarDatos();
    }, []);

    const cambiarCantidad = (idProducto, cambio) => {
        setCantidades((actuales) => {
            const nuevaCantidad = Math.max(
                0,
                (actuales[idProducto] || 0) + cambio
            );

            return {
                ...actuales,
                [idProducto]: nuevaCantidad,
            };
        });
    };

    const precio = (producto) =>
        Number(producto.precioProducto ?? producto.precio_producto ?? 0);

    const total = productos.reduce((suma, producto) => {
        return suma + precio(producto) * (cantidades[producto.idProducto] || 0);
    }, 0);

    const formatoPrecio = (valor) =>
        new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0,
        }).format(valor);

    const crearPedido = async (e) => {
        e.preventDefault();
        setError("");

        if (!idMesa) {
            setError("Selecciona una mesa.");
            return;
        }

        const productosSeleccionados = productos
            .filter((producto) => (cantidades[producto.idProducto] || 0) > 0)
            .map((producto) => ({
                idProducto: producto.idProducto,
                cantidad: cantidades[producto.idProducto],
            }));

        if (productosSeleccionados.length === 0) {
            setError("Agrega al menos un producto al pedido.");
            return;
        }

        setGuardando(true);

        try {
            const token = localStorage.getItem("token");

            const respuesta = await fetch(`${API}/pedidos`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    idMesa: Number(idMesa),
                    personas: [
                        {
                            nombre: "Pedido general",
                            productos: productosSeleccionados,
                        },
                    ],
                }),
            });

            if (!respuesta.ok) {
                const mensaje = await respuesta.text();
                throw new Error(
                    mensaje || `No se pudo crear el pedido (${respuesta.status}).`
                );
            }

            onPedidoCreado();
            onCerrar();
        } catch (e) {
            setError(e.message || "No se pudo registrar el pedido.");
        } finally {
            setGuardando(false);
        }
    };

    if (cargando) {
        return (
            <div className="nuevo-pedido-overlay">
                <section className="nuevo-pedido-modal">
                    <p>Cargando mesas y menú...</p>
                </section>
            </div>
        );
    }

    return (
        <div className="nuevo-pedido-overlay" onClick={onCerrar}>
            <section
                className="nuevo-pedido-modal"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="nuevo-pedido-titulo"
            >
                <header className="nuevo-pedido-header">
                    <div>
                        <span className="nuevo-pedido-etiqueta">
                            ATENCIÓN EN MESA
                        </span>
                        <h2 id="nuevo-pedido-titulo">Registrar pedido</h2>
                        <p>Selecciona la mesa y los productos del cliente.</p>
                    </div>

                    <button
                        type="button"
                        className="nuevo-pedido-cerrar"
                        onClick={onCerrar}
                        aria-label="Cerrar ventana"
                    >
                        ×
                    </button>
                </header>

                <form onSubmit={crearPedido}>
                    {error && (
                        <div className="nuevo-pedido-error">{error}</div>
                    )}

                    <label className="nuevo-pedido-label" htmlFor="mesa-pedido">
                        Seleccionar mesa
                    </label>

                    <select
                        id="mesa-pedido"
                        className="nuevo-pedido-select"
                        value={idMesa}
                        onChange={(e) => setIdMesa(e.target.value)}
                        required
                    >
                        <option value="">Elige una mesa</option>
                        {mesas.map((mesa) => (
                            <option key={mesa.id_mesa} value={mesa.id_mesa}>
                                Mesa {mesa.numero_mesa}
                                {mesa.estado_mesa
                                    ? ` · ${mesa.estado_mesa}`
                                    : ""}
                            </option>
                        ))}
                    </select>

                    <div className="nuevo-pedido-menu-titulo">
                        <div>
                            <h3>Menú</h3>
                            <p>Usa + y − para indicar las cantidades.</p>
                        </div>
                        <span>{productos.length} productos</span>
                    </div>

                    <div className="nuevo-pedido-productos">
                        {productos.map((producto) => {
                            const cantidad =
                                cantidades[producto.idProducto] || 0;

                            return (
                                <article
                                    className="nuevo-pedido-producto"
                                    key={producto.idProducto}
                                >
                                    <div className="nuevo-pedido-producto-info">
                                        <strong>{producto.nombreProducto}</strong>
                                        <span>{formatoPrecio(precio(producto))}</span>
                                    </div>

                                    <div className="nuevo-pedido-cantidad">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                cambiarCantidad(
                                                    producto.idProducto,
                                                    -1
                                                )
                                            }
                                            disabled={cantidad === 0}
                                            aria-label={`Quitar ${producto.nombreProducto}`}
                                        >
                                            −
                                        </button>

                                        <strong>{cantidad}</strong>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                cambiarCantidad(
                                                    producto.idProducto,
                                                    1
                                                )
                                            }
                                            aria-label={`Agregar ${producto.nombreProducto}`}
                                        >
                                            +
                                        </button>
                                    </div>
                                </article>
                            );
                        })}

                        {productos.length === 0 && (
                            <p>No hay productos disponibles en el menú.</p>
                        )}
                    </div>

                    <footer className="nuevo-pedido-footer">
                        <div className="nuevo-pedido-total">
                            <span>Total del pedido</span>
                            <strong>{formatoPrecio(total)}</strong>
                        </div>

                        <button
                            type="submit"
                            className="nuevo-pedido-guardar"
                            disabled={guardando || productos.length === 0}
                        >
                            {guardando ? "Guardando..." : "Registrar pedido"}
                        </button>
                    </footer>
                </form>
            </section>
        </div>
    );
}

export default NuevoPedidoModal;
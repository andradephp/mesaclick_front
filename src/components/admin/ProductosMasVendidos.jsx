
import { useEffect, useState } from "react";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Cell
} from "recharts";

function ProductosMasVendidos() {

    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    
useEffect(() => {
    let activo = true;
    let consultando = false;
    let controller = null;

    const cargarProductos = async () => {
        if (consultando) return;

        consultando = true;
        controller = new AbortController();

        try {
            const token = localStorage.getItem("token");

            const API_URL =
                import.meta.env.VITE_API_URL ||
                "http://localhost:8080";

            const respuesta = await fetch(
                `${API_URL}/api/admin/estadisticas/productos-mas-vendidos`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    signal: controller.signal
                }
            );

            if (!respuesta.ok) {
                throw new Error(
                    "No se pudieron cargar los productos"
                );
            }

            const datos = await respuesta.json();

            if (activo) {
                setProductos(
                    datos
                        .sort(
                            (a, b) =>
                                b.cantidadVendida -
                                a.cantidadVendida
                        )
                        .slice(0, 5)
                );

                setError("");
            }

        } catch (err) {
            if (activo && err.name !== "AbortError") {
                setError(err.message);
            }

        } finally {
            consultando = false;

            if (activo) {
                setCargando(false);
            }
        }
    };

    // Primera consulta al abrir el componente
    cargarProductos();

    // Actualizar automáticamente cada 10 segundos
    const intervalo = setInterval(
        cargarProductos,
        10000
    );

    // Limpiar al salir del Dashboard
    return () => {
        activo = false;
        clearInterval(intervalo);
        controller?.abort();
    };

}, []);


    const formatoCOP = (valor) =>
        new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0
        }).format(valor || 0);

    const colores = [
        "#f18a04",
        "#f5a623",
        "#f7b955",
        "#facb83",
        "#fce0b2"
    ];

    return (
        <section className="admin-productos-vendidos">

            <div className="admin-productos-header">
                <h2>Productos más vendidos</h2>
                <p>
                    Top 5 productos por unidades vendidas
                </p>
            </div>

            {cargando && <p>Cargando productos...</p>}

            {error && (
                <p style={{ color: "#dc2626" }}>
                    {error}
                </p>
            )}

            {!cargando && !error && (
                productos.length === 0 ? (

                    <p>
                        Todavía no hay productos vendidos
                        en atenciones cerradas.
                    </p>

                ) : (

                    <div className="admin-productos-grafico">

                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >
                            <BarChart
                                data={productos}
                                layout="vertical"
                                margin={{
                                    top: 10,
                                    right: 35,
                                    left: 15,
                                    bottom: 10
                                }}
                            >

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    horizontal={false}
                                />

                                <XAxis
                                    type="number"
                                    allowDecimals={false}
                                />

                                <YAxis
                                    type="category"
                                    dataKey="nombreProducto"
                                    width={145}
                                    tick={{
                                        fontSize: 12
                                    }}
                                />

                                <Tooltip
                                    formatter={(valor, nombre, props) => {
                                        if (nombre === "Unidades vendidas") {
                                            return [
                                                valor,
                                                "Unidades vendidas"
                                            ];
                                        }

                                        return [valor, nombre];
                                    }}
                                    labelFormatter={(nombre) => nombre}
                                />

                                <Bar
                                    dataKey="cantidadVendida"
                                    name="Unidades vendidas"
                                    radius={[0, 8, 8, 0]}
                                    barSize={26}
                                >
                                    {productos.map((producto, index) => (
                                        <Cell
                                            key={producto.idProducto}
                                            fill={
                                                colores[
                                                    index % colores.length
                                                ]
                                            }
                                        />
                                    ))}
                                </Bar>

                            </BarChart>
                        </ResponsiveContainer>

                    </div>
                )
            )}

            {!cargando && !error && productos.length > 0 && (

                <div className="admin-productos-lista">

                    {productos.map((producto, index) => (

                        <div
                            className="admin-productos-fila"
                            key={producto.idProducto}
                        >
                            <span>
                                {index + 1}. {producto.nombreProducto}
                            </span>

                            <span>
                                {producto.cantidadVendida} unidades
                            </span>

                            <strong>
                                {formatoCOP(producto.totalGenerado)}
                            </strong>
                        </div>

                    ))}

                </div>

            )}

        </section>
    );
}

export default ProductosMasVendidos;

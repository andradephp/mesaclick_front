import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { obtenerProductos } from "../services/productoService";
import { obtenerCategorias } from "../services/categoriaService";
import { useNavigate } from "react-router-dom";

function Mesa() {

    const [historialPedidos, setHistorialPedidos] = useState([]);

    const navigate = useNavigate();

    const { codigo } = useParams();

    const [mesa, setMesa] = useState(null);

    const [productos, setProductos] = useState([]);

    const [categorias, setCategorias] = useState([]);

    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);

    const [personas, setPersonas] = useState([
    {
        id: 1,
        nombre: "Persona 1",
        productos: []
    }
]);

    const [carritoAbierto, setCarritoAbierto] = useState(false);

    const [personaSeleccionada, setPersonaSeleccionada] = useState(1);

    const [mostrarAgregarPersona, setMostrarAgregarPersona] =
    useState(false);

    const [personaAEliminar, setPersonaAEliminar] =
    useState(null);

    const [confirmacionAbierta, setConfirmacionAbierta] = useState(false);

    const [cargando, setCargando] = useState(true);

    const [error, setError] = useState(false);

    const [productoAEliminar, setProductoAEliminar] = useState(null);

    const [nombreNuevaPersona, setNombreNuevaPersona] = useState("");

    const productosFiltrados = categoriaSeleccionada === null
    ? productos
    : productos.filter(
        (producto) =>
            producto.categoria.idCategoria === categoriaSeleccionada
    );

    const personaActual = personas.find(
    (persona) => persona.id === personaSeleccionada
);


async function obtenerHistorialPedidos() {

    try {

        const respuesta = await fetch(
            `http://localhost:8080/api/pedidos/mesa/${mesa.id_mesa}`
        );

        if (!respuesta.ok) {
            throw new Error("No se pudo obtener el historial");
        }

        const pedidos = await respuesta.json();

        setHistorialPedidos(pedidos);

        console.log("=================================");
        console.log("HISTORIAL DE PEDIDOS");
        console.log(pedidos);
        console.log("=================================");

    } catch (error) {

        console.error(
            "Error obteniendo historial:",
            error
        );

    }

}


function confirmarEliminacionPersona() {

    if (!personaAEliminar) {
        return;
    }

    const idPersonaEliminar = personaAEliminar.id;

    setPersonas((personasActuales) => {

        const personasRestantes = personasActuales.filter(
            (persona) => persona.id !== idPersonaEliminar
        );

        return personasRestantes;

    });

    // Si estábamos viendo la persona eliminada,
    // seleccionamos otra persona.
    if (personaSeleccionada === idPersonaEliminar) {

        const otraPersona = personas.find(
            (persona) => persona.id !== idPersonaEliminar
        );

        if (otraPersona) {
            setPersonaSeleccionada(otraPersona.id);
        }

    }

    setPersonaAEliminar(null);

}

function solicitarEliminarPersona(persona) {

    setPersonaAEliminar(persona);

}

    function agregarAlCarrito(producto) {

    setPersonas((personasActuales) => {

        return personasActuales.map((persona) => {

            if (persona.id !== personaSeleccionada) {
                return persona;
            }

            const productoExistente = persona.productos.find(
                (item) => item.idProducto === producto.idProducto
            );

            if (productoExistente) {

                return {
                    ...persona,
                    productos: persona.productos.map((item) =>
                        item.idProducto === producto.idProducto
                            ? {
                                ...item,
                                cantidad: item.cantidad + 1
                            }
                            : item
                    )
                };

            }

            return {
                ...persona,
                productos: [
                    ...persona.productos,
                    {
                        ...producto,
                        cantidad: 1
                    }
                ]
            };

        });

    });

}

function cambiarCantidad(idProducto, cambio) {

    const persona = personas.find(
        (persona) => persona.id === personaSeleccionada
    );

    if (!persona) {
        return;
    }

    const producto = persona.productos.find(
        (item) => item.idProducto === idProducto
    );

    if (!producto) {
        return;
    }

    // Si intenta bajar de 1 a 0
    if (producto.cantidad === 1 && cambio === -1) {

        setProductoAEliminar(producto);

        return;
    }

    setPersonas((personasActuales) =>
        personasActuales.map((persona) => {

            if (persona.id !== personaSeleccionada) {
                return persona;
            }

            return {
                ...persona,

                productos: persona.productos.map((item) =>
                    item.idProducto === idProducto
                        ? {
                            ...item,
                            cantidad: item.cantidad + cambio
                        }
                        : item
                )
            };

        })
    );
}

function confirmarEliminacion() {

    if (!productoAEliminar) {
        return;
    }

    // Guardamos el ID antes de modificar el estado
    const idProductoEliminar = productoAEliminar.idProducto;

    setPersonas((personasActuales) =>
        personasActuales.map((persona) => {

            if (persona.id !== personaSeleccionada) {
                return persona;
            }

            return {
                ...persona,

                productos: persona.productos.filter(
                    (producto) =>
                        producto.idProducto !== idProductoEliminar
                )
            };

        })
    );

    // Cerramos el modal
    setProductoAEliminar(null);
}

function cancelarEliminacion() {

    setProductoAEliminar(null);

}

function agregarPersona(nombre) {

    const nuevaPersona = {
        id: Date.now(),
        nombre: nombre,
        productos: []
    };

    setPersonas((personasActuales) => [
        ...personasActuales,
        nuevaPersona
    ]);

    setPersonaSeleccionada(nuevaPersona.id);
}

function solicitarEliminarPersona() {

    if (!personaActual) {
        return;
    }

    // No permitimos eliminar la última persona
    if (personas.length === 1) {
        return;
    }

    setPersonaAEliminar(personaActual);
}


async function enviarPedido() {

    try {

        const pedidoRequest = {

            idMesa: mesa.id_mesa,

            personas: personas
                .filter(
                    (persona) => persona.productos.length > 0
                )
                .map((persona) => ({

                    nombre: persona.nombre,

                    productos: persona.productos.map((producto) => ({

                        idProducto: producto.idProducto,

                        cantidad: producto.cantidad

                    }))

                }))

        };


        console.log("=================================");
        console.log("ENVIANDO PEDIDO");
        console.log(pedidoRequest);
        console.log("=================================");


        const respuesta = await fetch(
            "http://localhost:8080/api/pedidos",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(pedidoRequest)
            }
        );


        if (!respuesta.ok) {

            throw new Error(
                "No se pudo guardar el pedido"
            );

        }


        // ==========================================
        // RECIBIR RESPUESTA DE SPRING BOOT
        // ==========================================

        const pedidoGuardado = await respuesta.json();


        console.log("=================================");
        console.log("PEDIDO GUARDADO CORRECTAMENTE");
        console.log(pedidoGuardado);
        console.log("ID PEDIDO:", pedidoGuardado.idPedido);
        console.log("TOTAL:", pedidoGuardado.totalPedido);
        console.log("ESTADO:", pedidoGuardado.estadoPedido);
        console.log("=================================");


        // ==========================================
        // CERRAR CONFIRMACIÓN
        // ==========================================

        setConfirmacionAbierta(false);


        // ==========================================
        // IR A PÁGINA PEDIDO ENVIADO
        // ==========================================

        navigate(`/pedido-enviado/${codigo}`, {
    state: {
        idPedido: pedidoGuardado.idPedido,
        total: pedidoGuardado.totalPedido,
        estado: pedidoGuardado.estadoPedido
    }
});


    } catch (error) {

        console.error(
            "ERROR AL ENVIAR EL PEDIDO:",
            error
        );

    }

}

    useEffect(() => {

        fetch(`http://localhost:8080/api/mesas/codigo/${codigo}`)
            .then(response => {

                if (!response.ok) {
                    throw new Error("Mesa no encontrada");
                }

                return response.json();

            })
            .then(data => {

                setMesa(data);
                setCargando(false);

            })
            .catch(error => {

                console.error(error);
                setError(true);
                setCargando(false);

            });

    }, [codigo]);

    useEffect(() => {

    if (!mesa) {
        return;
    }

    obtenerHistorialPedidos();

}, [mesa]);

    useEffect(() => {

    async function cargarMenu() {

        try {

            const productosData = await obtenerProductos();
            const categoriasData = await obtenerCategorias();

            setProductos(productosData);
            setCategorias(categoriasData);

        } catch (error) {

            console.error("Error cargando el menú:", error);

        }

    }

    cargarMenu();

}, []);

    if (cargando) {
        return (
            <div className="loading-screen">
                <div className="loading-circle"></div>
                <p>Preparando tu mesa...</p>
            </div>
        );
    }


    if (error || !mesa) {
        return (
            <div className="error-screen">
                <div className="error-icon">!</div>

                <h2>Mesa no encontrada</h2>

                <p>
                    El código de esta mesa no es válido.
                </p>
            </div>
        );
    }

    return (
        <main className="cliente">

            {/* ENCABEZADO */}

            <header className="cliente-header">

                <div>
                    <span className="logo">
                        Mesa<span>Click</span>
                    </span>

                    <p className="restaurant-text">
                        Tu experiencia, más fácil.
                    </p>
                </div>

                <div className="mesa-badge">
                    Mesa {mesa.numero_mesa}
                </div>

            </header>


            {/* BIENVENIDA */}

            <section className="welcome">

                <span className="welcome-small">
                    ¡Hola! 👋
                </span>

                <h1>
                    ¿Qué te gustaría<br />
                    pedir hoy?
                </h1>

                <p>
                    Explora nuestro menú y disfruta tu comida.
                </p>

            </section>


            {/* CATEGORÍAS */}

            <section className="categories">

    <button
    className={`category ${
        categoriaSeleccionada === null ? "active" : ""
    }`}
    onClick={() => setCategoriaSeleccionada(null)}
>
    Todo
</button>

    {categorias.map((categoria) => (

    <button
        key={categoria.idCategoria}
        className={`category ${
            categoriaSeleccionada === categoria.idCategoria
                ? "active"
                : ""
        }`}
        onClick={() => setCategoriaSeleccionada(categoria.idCategoria)}
    >
        {categoria.nombreCategoria}
    </button>

))}

</section>


            {/* PRODUCTOS */}

            <section className="products">

    <div className="section-title">

        <h2>
            Nuestro menú
        </h2>

    </div>

    <div className="product-grid">

        {productosFiltrados.map((producto) => (

            <article
                className="product-card"
                key={producto.idProducto}
            >

                <div className="product-image">

                    🍽️

                </div>

                <div className="product-info">

                    <h3>
                        {producto.nombreProducto}
                    </h3>

                    <p>
                        {producto.descripcionProducto}
                    </p>

                    <div className="product-bottom">

                        <strong>
                            ${producto.precioProducto.toLocaleString("es-CO")}
                        </strong>

                        <button
    className="add-button"
    onClick={() => agregarAlCarrito(producto)}
>
    +
</button>

                    </div>

                </div>

            </article>

        ))}

    </div>

</section>


            {/* CARRITO */}

<button
    className="cart-button"
    onClick={() => setCarritoAbierto(true)}
>
    <span className="cart-icon">
        🛒
    </span>

    <span>
        Ver pedido
    </span>

    <span className="cart-count">
        {personas.reduce(
            (total, persona) =>
                total +
                persona.productos.reduce(
                    (subtotal, producto) =>
                        subtotal + producto.cantidad,
                    0
                ),
            0
        )}
    </span>
</button>


{carritoAbierto && (

    <div className="cart-overlay">

        <div className="cart-modal">

            {/* ENCABEZADO */}

            <div className="cart-header">

                <button
                    className="cart-close"
                    onClick={() => setCarritoAbierto(false)}
                >
                    ✕
                </button>

                <h2>
                    Tu pedido
                </h2>

                <div className="cart-header-space"></div>

            </div>


            {/* PERSONA ACTUAL */}

            {personaActual && (

                <div className="person-selector">

                    <button
                        className="person-arrow"
                        onClick={() => {

                            const indiceActual =
                                personas.findIndex(
                                    (persona) =>
                                        persona.id === personaSeleccionada
                                );

                            const anterior =
                                indiceActual === 0
                                    ? personas.length - 1
                                    : indiceActual - 1;

                            setPersonaSeleccionada(
                                personas[anterior].id
                            );

                        }}
                    >
                        ←
                    </button>


                    <div className="person-name">

                        <span>
                            Pedido de
                        </span>

                        <strong>
                            {personaActual.nombre}
                        </strong>

                    </div>


                    <button
                        className="person-arrow"
                        onClick={() => {

                            const indiceActual =
                                personas.findIndex(
                                    (persona) =>
                                        persona.id === personaSeleccionada
                                );

                            const siguiente =
                                indiceActual === personas.length - 1
                                    ? 0
                                    : indiceActual + 1;

                            setPersonaSeleccionada(
                                personas[siguiente].id
                            );

                        }}
                    >
                        →
                    </button>

                </div>

            )}


            {/* PRODUCTOS DE LA PERSONA */}

            <div className="cart-items">

                {!personaActual ||
                personaActual.productos.length === 0 ? (

                    <p className="empty-cart">
                        {personaActual
                            ? `${personaActual.nombre} todavía no tiene productos.`
                            : "No hay personas."
                        }
                    </p>

                ) : (

                    personaActual.productos.map((item) => (

                        <div
                            className="cart-item"
                            key={item.idProducto}
                        >

                            <div className="cart-item-info">

                                <h3>
                                    {item.nombreProducto}
                                </h3>

                                <p>
                                    ${item.precioProducto.toLocaleString("es-CO")}
                                </p>

                            </div>


                            <div className="quantity">

                                <button
                                    onClick={() =>
                                        cambiarCantidad(
                                            item.idProducto,
                                            -1
                                        )
                                    }
                                >
                                    −
                                </button>


                                <span>
                                    {item.cantidad}
                                </span>


                                <button
                                    onClick={() =>
                                        cambiarCantidad(
                                            item.idProducto,
                                            1
                                        )
                                    }
                                >
                                    +
                                </button>

                            </div>

                        </div>

                    ))

                )}

            </div>


            {/* SUBTOTAL DE LA PERSONA */}

            <div className="person-subtotal">

                <span>
                    Subtotal
                </span>

                <strong>
                    $
                    {personaActual?.productos
                        .reduce(
                            (total, item) =>
                                total +
                                item.precioProducto * item.cantidad,
                            0
                        )
                        .toLocaleString("es-CO")
                    }
                </strong>

            </div>


            {/* AGREGAR PERSONA */}

            <button
                className="add-person-button"
                onClick={() => setMostrarAgregarPersona(true)}
            >
                ＋ Agregar persona
            </button>


            {/* ELIMINAR PERSONA */}

            {personas.length > 1 && (

                <button
                    className="delete-person-button"
                    onClick={solicitarEliminarPersona}
                >
                    🗑 Eliminar {personaActual?.nombre}
                </button>

            )}


            {/* TOTAL GENERAL */}

            <div className="cart-footer">

                <div className="cart-total">

                    <span>
                        Total
                    </span>

                    <strong>
                        $
                        {personas
                            .reduce(
                                (totalPersonas, persona) =>
                                    totalPersonas +
                                    persona.productos.reduce(
                                        (totalProductos, item) =>
                                            totalProductos +
                                            item.precioProducto *
                                            item.cantidad,
                                        0
                                    ),
                                0
                            )
                            .toLocaleString("es-CO")
                        }
                    </strong>

                </div>


                <button
    className="confirm-order"
    disabled={
        !personas.some(
            (persona) => persona.productos.length > 0
        )
    }
    onClick={() => setConfirmacionAbierta(true)}
>
    Confirmar pedido
</button>

            </div>

        </div>

    </div>

)}

{confirmacionAbierta && (
    <div className="confirm-overlay">

        <div className="confirm-modal">

            {/* ENCABEZADO */}

            <div className="confirm-header">

                <div className="confirm-icon">
                    ✓
                </div>

                <h2>
                    Confirmar pedido
                </h2>

                <p>
                    Revisa tu pedido antes de enviarlo.
                </p>

            </div>


            {/* PEDIDOS DE LAS PERSONAS */}

            <div className="confirm-persons">

                {personas
                    .filter(
                        (persona) =>
                            persona.productos.length > 0
                    )
                    .map((persona) => {

                        const subtotalPersona =
                            persona.productos.reduce(
                                (total, item) =>
                                    total +
                                    item.precioProducto *
                                    item.cantidad,
                                0
                            );

                        return (

                            <div
                                className="confirm-person"
                                key={persona.id}
                            >

                                {/* NOMBRE DE LA PERSONA */}

                                <div className="confirm-person-header">

                                    <div className="confirm-person-name">

                                        <span>
                                            Pedido de
                                        </span>

                                        <strong>
                                            {persona.nombre}
                                        </strong>

                                    </div>

                                </div>


                                {/* PRODUCTOS */}

                                <div className="confirm-products">

                                    {persona.productos.map((item) => (

                                        <div
                                            className="confirm-product"
                                            key={item.idProducto}
                                        >

                                            <span>
                                                {item.cantidad} ×{" "}
                                                {item.nombreProducto}
                                            </span>

                                            <strong>
                                                $
                                                {(
                                                    item.precioProducto *
                                                    item.cantidad
                                                ).toLocaleString(
                                                    "es-CO"
                                                )}
                                            </strong>

                                        </div>

                                    ))}

                                </div>


                                {/* SUBTOTAL PERSONA */}

                                <div className="confirm-subtotal">

                                    <span>
                                        Subtotal
                                    </span>

                                    <strong>
                                        $
                                        {subtotalPersona.toLocaleString(
                                            "es-CO"
                                        )}
                                    </strong>

                                </div>

                            </div>

                        );

                    })}

            </div>


            {/* TOTAL GENERAL */}

            <div className="confirm-total">

                <div>

                    <span>
                        Total del pedido
                    </span>

                    <small>
                        Incluye todos los pedidos
                    </small>

                </div>

                <strong>
                    $
                    {personas
                        .reduce(
                            (totalPersonas, persona) =>
                                totalPersonas +
                                persona.productos.reduce(
                                    (totalProductos, item) =>
                                        totalProductos +
                                        item.precioProducto *
                                        item.cantidad,
                                    0
                                ),
                            0
                        )
                        .toLocaleString("es-CO")}
                </strong>

            </div>


            {/* BOTONES FINALES */}

            <div className="confirm-actions">

                <button
                    className="confirm-back"
                    onClick={() =>
                        setConfirmacionAbierta(false)
                    }
                >
                    ← Volver a editar
                </button>


                <button
    className="confirm-final"
    onClick={enviarPedido}
>
    Confirmar pedido ✓
</button>

            </div>

        </div>

    </div>
)}

{mostrarAgregarPersona && (

    <div className="delete-overlay">

        <div className="delete-modal">

            <div className="delete-icon">
                👤
            </div>

            <h2>
                Agregar persona
            </h2>

            <p>
                ¿Cómo se llama esta persona?
            </p>

            <input
    type="text"
    className="person-name-input"
    placeholder="Ej. María"
    value={nombreNuevaPersona}
    onChange={(e) => setNombreNuevaPersona(e.target.value)}
/>

            <div className="delete-actions">

                <button
                    className="cancel-delete"
                    onClick={() =>
                        setMostrarAgregarPersona(false)
                    }
                >
                    Cancelar
                </button>

                <button
    className="confirm-delete"
    onClick={() => {

        const nombre = nombreNuevaPersona.trim();

        if (!nombre) {
            return;
        }

        agregarPersona(nombre);

        setNombreNuevaPersona("");

        setMostrarAgregarPersona(false);

    }}
>
    Agregar
</button>

            </div>

        </div>

    </div>

)}

{mostrarAgregarPersona && (

    <div className="delete-overlay">

        <div className="delete-modal">

            <div className="delete-icon">
                👤
            </div>

            <h2>
                Agregar persona
            </h2>

            <p>
                ¿Cómo se llama esta persona?
            </p>

            <input
                type="text"
                className="person-name-input"
                placeholder="Ej. María"
                id="nombrePersona"
            />

            <div className="delete-actions">

                <button
                    className="cancel-delete"
                    onClick={() =>
                        setMostrarAgregarPersona(false)
                    }
                >
                    Cancelar
                </button>

                <button
                    className="confirm-delete"
                    onClick={() => {

                        const input =
                            document.getElementById("nombrePersona");

                        const nombre =
                            input.value.trim();

                        if (!nombre) {
                            return;
                        }

                        agregarPersona(nombre);

                        setMostrarAgregarPersona(false);

                    }}
                >
                    Agregar
                </button>

            </div>

        </div>

    </div>

)}

{productoAEliminar && (

    <div className="delete-overlay">

        <div className="delete-modal">

            <div className="delete-icon">
                !
            </div>

            <h2>
                ¿Eliminar producto?
            </h2>

            <p>
                ¿Estás seguro de que quieres eliminar
                <strong>
                    {" "}{productoAEliminar.nombreProducto}
                </strong>
                {" "}de tu pedido?
            </p>

            <div className="delete-actions">

                <button
                    className="cancel-delete"
                    onClick={cancelarEliminacion}
                >
                    Cancelar
                </button>

                <button
                    className="confirm-delete"
                    onClick={confirmarEliminacion}
                >
                    Sí, eliminar
                </button>

            </div>

        </div>

    </div>

)}

{personaAEliminar && (
    <div className="delete-overlay">

        <div className="delete-modal">

            <div className="delete-icon">
                !
            </div>

            <h2>
                ¿Eliminar persona?
            </h2>

            <p>
                ¿Seguro que quieres eliminar a{" "}
                <strong>
                    {personaAEliminar.nombre}
                </strong>
                ?
            </p>

            <p>
                También se eliminarán todos los productos
                asociados a esta persona.
            </p>

            <div className="delete-actions">

                <button
                    className="cancel-delete"
                    onClick={() => setPersonaAEliminar(null)}
                >
                    Cancelar
                </button>

                <button
                    className="confirm-delete"
                    onClick={confirmarEliminacionPersona}
                >
                    Sí, eliminar
                </button>

            </div>

        </div>

    </div>
)}

        </main>
    );
}

export default Mesa;
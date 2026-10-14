const API_URL = "/api/productos";

export async function obtenerProductos() {

    const response = await fetch(API_URL);

    if (!response.ok) {
        throw new Error("No se pudieron obtener los productos");
    }

    return await response.json();
}
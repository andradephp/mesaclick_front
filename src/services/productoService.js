const API_URL = "http://localhost:8080/api/productos";

export async function obtenerProductos() {

    const response = await fetch(API_URL);

    if (!response.ok) {
        throw new Error("No se pudieron obtener los productos");
    }

    return await response.json();
}
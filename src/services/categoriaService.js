const API_URL = "/api/categorias";

export async function obtenerCategorias() {

    const response = await fetch(API_URL);

    if (!response.ok) {
        throw new Error("No se pudieron obtener las categorías");
    }

    return await response.json();
}
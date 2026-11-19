const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:8080";

export async function obtenerResumenEstadisticas() {
    const token = localStorage.getItem("token");

    const respuesta = await fetch(
        `${API_URL}/api/admin/estadisticas/resumen`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!respuesta.ok) {
        throw new Error(
            `Error al consultar estadísticas: ${respuesta.status}`
        );
    }

    return respuesta.json();
}

import { useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function CancelarSuscripcion() {
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [cancelada, setCancelada] = useState(false);

  const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:8080";

  const cancelarSuscripcion = async () => {
    if (!token || cargando) return;

    setCargando(true);
    setMensaje("");

    try {
      const respuesta = await fetch(
        `${API_URL}/api/suscripciones/cancelar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.mensaje || "No se pudo cancelar la suscripción."
        );
      }

      setCancelada(true);
      setMensaje(datos.mensaje);
    } catch (error) {
      setMensaje(
        error.message || "Ocurrió un error. Inténtalo nuevamente."
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#fff8ef",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "#ffffff",
          borderRadius: "16px",
          padding: "32px",
          textAlign: "center",
          boxShadow: "0 8px 28px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ color: "#f18a04" }}>MesaClick</h1>

        <h2>
          {cancelada
            ? "Suscripción cancelada"
            : "Cancelar suscripción"}
        </h2>

        {!token ? (
          <p>El enlace de cancelación no es válido.</p>
        ) : cancelada ? (
          <p>{mensaje}</p>
        ) : (
          <>
            <p>
              ¿Deseas dejar de recibir promociones y novedades
              de MesaClick en tu correo electrónico?
            </p>

            <button
              onClick={cancelarSuscripcion}
              disabled={cargando}
              style={{
                width: "100%",
                padding: "14px",
                background: "#f18a04",
                color: "#ffffff",
                border: "none",
                borderRadius: "10px",
                cursor: cargando ? "wait" : "pointer",
                fontSize: "16px",
                fontWeight: "bold",
              }}
            >
              {cargando
                ? "Cancelando..."
                : "Cancelar mi suscripción"}
            </button>

            {mensaje && (
              <p style={{ color: "#b42318", marginTop: "16px" }}>
                {mensaje}
              </p>
            )}
          </>
        )}
      </section>
    </main>
  );
}

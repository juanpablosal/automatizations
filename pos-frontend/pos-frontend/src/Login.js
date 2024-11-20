import "./Login.css";
import { useState } from "react";

export function Login({ setUser }) {
  // Declaración de estados
  const [nombre, setNombre] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [error, setError] = useState(""); // Ahora el error es un mensaje dinámico

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (nombre === "" || contraseña === "") {
      setError("Todos los campos son obligatorios");
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: nombre, password: contraseña }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message); // Mostramos el error desde el backend
        return;
      }

      setUser(data.token); // Guarda el token o inicia la sesión
      setError(""); // Limpia cualquier mensaje de error
    } catch (error) {
      setError("Ocurrió un problema al conectar con el servidor");
    }
  };

  return (
    <section>
      <h1>Log in</h1>

      <form className="Login" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nombre de usuario"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={contraseña}
          onChange={(e) => setContraseña(e.target.value)}
        />
        <button>Iniciar sesión</button>
      </form>

      {/* Mostrar el error si existe */}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </section>
  );
}

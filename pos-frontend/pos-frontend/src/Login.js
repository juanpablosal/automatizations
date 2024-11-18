import "./Login.css";
import { useState } from 'react';

export function Login({setUser}) {
    //declaracion de estados 

    const [nombre, setNombre] = useState("")
    const [contraseña, setContraseña] = useState("")
    const [error, setError] = useState(false);
    const handleSubmit = (e) => {
        // logica de verificacion de contenido en los campos del formulario
        e.preventDefault()

        if (nombre === "" || contraseña === "") {
            setError(true)
            return
        }
        setError(false);

        setUser([nombre])
    }
    return (
        <section>
            <h1>Log in</h1>

            <form className="Login" onSubmit={handleSubmit}>
                <input type="text"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                />
                <input type="password"
                    value={contraseña}
                    onChange={e => setContraseña(e.target.value)}
                />
                <button>Iniciar sesión</button>
            </form>
            {error && <p>todos los campos son obligatorios</p>}
        </section>
    )
}
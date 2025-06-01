
'use client';
import React, { useState } from 'react';
import AnimatedBackground from './background';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            if (!res.ok) {
                throw new Error('Credenciales incorrectas');
            }
            // Redirigir o manejar login exitoso
            window.location.href = '/dashboard';
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f5f5f5',
            position: 'relative',
            zIndex: 0
        }}>
            <AnimatedBackground />
            <form
                onSubmit={handleSubmit}
                style={{
                    background: '#fff',
                    padding: '2rem',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    minWidth: '320px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    position: 'relative',
                    zIndex: 1
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <img src="/assets/Simbol.png" alt="Logo" style={{ marginRight: '0.75rem', height: '50px' }} />
                    <h1 style={{ textAlign: 'center', fontSize: '1.75rem', fontWeight: 'bold' }}>
                        Inicio de Sesión
                    </h1>
                </div>
                <input
                    type="email"
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}
                <button
                    type="submit"
                    style={{
                        padding: '0.75rem',
                        borderRadius: '4px',
                        border: 'none',
                        background: '#0070f3',
                        color: '#fff',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    Entrar
                </button>
            </form>
        </div>
    );
}
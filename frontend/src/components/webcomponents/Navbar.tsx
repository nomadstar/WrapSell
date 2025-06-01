import React from 'react';

interface NavbarProps {
    isLoggedIn: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ isLoggedIn }) => {
    return (
        <nav style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 2rem',
            background: 'linear-gradient(90deg,rgb(197, 52, 219) 0%,rgb(68, 101, 173) 100%)',
            color: '#fff'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold', fontSize: '1.5rem' }}>
                <img src="/assets/Simbol.png" alt="Logo" style={{ height: '2rem', marginRight: '0.75rem' }} />
                WrapSell
            </div>
            <ul style={{
                listStyle: 'none',
                display: 'flex',
                gap: '1.5rem',
                margin: 0,
                padding: 0
            }}>
                {isLoggedIn ? (
                    <>
                        <li><a href="/cuenta" style={{ color: '#fff', textDecoration: 'none' }}>Cuenta</a></li>
                        <li><a href="/transferencias" style={{ color: '#fff', textDecoration: 'none' }}>Transferencias</a></li>
                        <li><a href="/logout" style={{ color: '#fff', textDecoration: 'none' }}>Cerrar sesión</a></li>
                    </>
                ) : (
                    <>
                        <li>
                            <a
                                href="/login"
                                style={{
                                    color: '#fff',
                                    textDecoration: 'none',
                                    background: 'rgba(21, 160, 224, 0.9)',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '0.5rem 1.2rem',
                                    fontWeight: 'bold',
                                    transition: 'background 0.2s, transform 0.2s, box-shadow 0.2s',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                                    display: 'inline-block'
                                }}
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(21, 160, 224, 1)';
                                    (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px) scale(1.04)';
                                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.13)';
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(21, 160, 224, 0.9)';
                                    (e.currentTarget as HTMLAnchorElement).style.transform = 'none';
                                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
                                }}
                            >
                                Login
                            </a>
                        </li>
                        <li>
                            <a
                                href="/register"
                                style={{
                                    color: '#fff',
                                    textDecoration: 'none',
                                    background: 'rgba(197, 52, 219, 0.9)',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '0.5rem 1.2rem',
                                    fontWeight: 'bold',
                                    transition: 'background 0.2s, transform 0.2s, box-shadow 0.2s',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                                    display: 'inline-block'
                                }}
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(197, 52, 219, 1)';
                                    (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px) scale(1.04)';
                                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.13)';
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(197, 52, 219, 0.9)';
                                    (e.currentTarget as HTMLAnchorElement).style.transform = 'none';
                                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
                                }}
                            >
                                Register
                            </a>
                        </li></>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;
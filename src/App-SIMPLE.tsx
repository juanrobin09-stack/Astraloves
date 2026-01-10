import { useState } from 'react';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        padding: '3rem',
        borderRadius: '20px',
        width: '400px',
        maxWidth: '90%'
      }}>
        <h1 style={{
          fontSize: '3rem',
          textAlign: 'center',
          marginBottom: '2rem',
          color: 'white'
        }}>
          ⭐ ASTRALOVES
        </h1>
        
        <p style={{
          textAlign: 'center',
          color: 'rgba(255,255,255,0.9)',
          marginBottom: '2rem'
        }}>
          Connexion cosmique
        </p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: '100%',
            padding: '1rem',
            marginBottom: '1rem',
            borderRadius: '10px',
            border: 'none',
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            fontSize: '1rem'
          }}
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: '100%',
            padding: '1rem',
            marginBottom: '1.5rem',
            borderRadius: '10px',
            border: 'none',
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            fontSize: '1rem'
          }}
        />

        <button
          onClick={() => alert('Site en construction - Bientôt disponible !')}
          style={{
            width: '100%',
            padding: '1rem',
            borderRadius: '10px',
            border: 'none',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Se connecter
        </button>

        <p style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          color: 'rgba(255,255,255,0.7)',
          fontSize: '0.9rem'
        }}>
          Pas encore de compte ?{' '}
          <a 
            href="#"
            onClick={(e) => {
              e.preventDefault();
              alert('Inscription bientôt disponible !');
            }}
            style={{ color: 'white', textDecoration: 'underline' }}
          >
            S'inscrire
          </a>
        </p>
      </div>
    </div>
  );
}

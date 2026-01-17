

import React, {useState} from 'react';

import { registerClient, registerDietitian } from '../services/authService';

const roleButtonStyles ={
    active: {
        backgroundColor: 'rgb(125, 153, 92)', 
    color: 'white',
    padding: '8px 24px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  inactive: {
    backgroundColor: '#f0f0f0', 
    color: 'black',
    padding: '8px 24px',
    borderRadius: '20px',
    cursor: 'pointer',
  }
};

const SignUpPage = () => {
    const [role, setRole] = useState('danisan'); 
    const [name, setName] = React.useState('');
    const [surname, setSurname] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');

    const [clinicName, setClinicName] = React.useState('');
    const [invitationCode, setInvitationCode] = React.useState('');

    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        let result;

        if(role === 'danisan'){
            result = await registerClient(name, surname, email, password, invitationCode);
        } else {
            result = await registerDietitian(name, surname, email, password, clinicName);
        }

        setIsLoading(false);

        if (result && result.success) {
            console.log('Kayıt başarılı:', result.data);
            window.location.reload(); 
        } else {
            console.error('Kayıt hatası:', result.error || result.message);
            setError(result.error || result.message);
        }
    };

    const inputStyle = {
      width: '100%',
      padding: '10px 12px',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      backgroundColor: '#ffffff',
      fontSize: '14px',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box'
    };

    const labelStyle = {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '500',
      fontSize: '13px',
      color: '#374151'
    };

    return(
    <div>
      {/* Rol Seçimi */}
      <div style={{ 
        display: 'flex', 
        gap: '8px',
        marginBottom: '20px',
        padding: '4px',
        backgroundColor: '#f3f4f6',
        borderRadius: '8px'
      }}>
        <button
          type="button"
          onClick={() => setRole('danisan')}
          style={{
            flex: 1,
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '14px',
            transition: 'all 0.2s ease',
            backgroundColor: role === 'danisan' ? '#5d8347' : 'transparent',
            color: 'white'
          }}
          onMouseEnter={(e) => {
            if (role !== 'danisan') {
              e.target.style.backgroundColor = 'rgba(93, 131, 71, 0.2)';
            }
          }}
          onMouseLeave={(e) => {
            if (role !== 'danisan') {
              e.target.style.backgroundColor = 'transparent';
            }
          }}
        >
          Danışan
        </button>
        <button
          type="button"
          onClick={() => setRole('diyetisyen')}
          style={{
            flex: 1,
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '14px',
            transition: 'all 0.2s ease',
            backgroundColor: role === 'diyetisyen' ? '#5d8347' : 'transparent',
            color: 'white'
          }}
          onMouseEnter={(e) => {
            if (role !== 'diyetisyen') {
              e.target.style.backgroundColor = 'rgba(93, 131, 71, 0.2)';
            }
          }}
          onMouseLeave={(e) => {
            if (role !== 'diyetisyen') {
              e.target.style.backgroundColor = 'transparent';
            }
          }}
        >
          Diyetisyen
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
  
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div className="login-form">
            <label htmlFor='name' style={labelStyle}>Ad</label>
            <input 
              type='text' 
              id='name' 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required
              placeholder='Ad'
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = '#5d8347';
                e.target.style.boxShadow = '0 0 0 3px rgba(91, 124, 90, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          
          <div className="login-form">
            <label htmlFor='surname' style={labelStyle}>Soyad</label>
            <input 
              type='text' 
              id='surname' 
              value={surname} 
              onChange={(e) => setSurname(e.target.value)} 
              required
              placeholder='Soyad'
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = '#5d8347';
                e.target.style.boxShadow = '0 0 0 3px rgba(91, 124, 90, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>
        
        <div className="login-form" style={{ marginBottom: '16px' }}>
          <label htmlFor='email' style={labelStyle}>E-posta Adresi</label>
          <input 
            type='email' 
            id='email' 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required
            placeholder='ornek@email.com'
            style={inputStyle}
            onFocus={(e) => {
              e.target.style.borderColor = '#5b7c5a';
              e.target.style.boxShadow = '0 0 0 3px rgba(91, 124, 90, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#d1d5db';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
        
        <div className="login-form" style={{ marginBottom: '16px' }}>
          <label htmlFor='password' style={labelStyle}>Şifre</label>
          <input 
            type='password' 
            id='password' 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required
            placeholder='Şifrenizi girin'
            style={inputStyle}
            onFocus={(e) => {
              e.target.style.borderColor = '#5b7c5a';
              e.target.style.boxShadow = '0 0 0 3px rgba(91, 124, 90, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#d1d5db';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {role === 'danisan' && (
          <div className="login-form" style={{ marginBottom: '16px' }}>
            <label htmlFor='invitationCode' style={labelStyle}>Davet Kodu</label>
            <input 
              type='text' 
              id='invitationCode' 
              value={invitationCode} 
              onChange={(e) => setInvitationCode(e.target.value)} 
              required
              placeholder='Davet kodunu girin'
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = '#5d8347';
                e.target.style.boxShadow = '0 0 0 3px rgba(91, 124, 90, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        )}

        {role === 'diyetisyen' && (
          <div className="login-form" style={{ marginBottom: '16px' }}>
            <label htmlFor='clinic' style={labelStyle}>Klinik / Hastane Adı</label>
            <input 
              type='text' 
              id='clinic' 
              value={clinicName} 
              onChange={(e) => setClinicName(e.target.value)} 
              required
              placeholder='Klinik adını girin'
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = '#5d8347';
                e.target.style.boxShadow = '0 0 0 3px rgba(91, 124, 90, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        )}
        
        {error && (
          <div className="login-form-error" style={{
            marginBottom: '16px',
            padding: '10px',
            backgroundColor: '#fef2f2',
            borderRadius: '8px',
            border: '1px solid #fecaca',
            fontSize: '13px',
            fontWeight: '400',
            color: '#dc2626'
          }}>
            {error}
          </div>
        )}
        
        <button 
          type='submit' 
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '12px',
            background: isLoading ? '#9ca3af' : '#5d8347',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            marginTop: '2px'
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.target.style.backgroundColor = '#4a6a38';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              e.target.style.backgroundColor = '#5d8347';
            }
          }}
        >
          {isLoading ? 'Kayıt Olunuyor...' : 'Kayıt Ol'}
        </button>
      </form>
    </div>
    );
};

export default SignUpPage;   
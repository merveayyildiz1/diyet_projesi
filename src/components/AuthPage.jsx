import React, { useState, useEffect } from 'react'; 
import LoginPage from './LoginPage'; 
import SignUpPage from './signUpPage'; 

const AuthPage = () => {
   const [activeTab, setActiveTab] = useState('login');
   const [isMobile, setIsMobile] = useState(window.innerWidth < 968);

   useEffect(() => {
     const handleResize = () => {
       setIsMobile(window.innerWidth < 968);
     };
     window.addEventListener('resize', handleResize);
     return () => window.removeEventListener('resize', handleResize);
   }, []);

   return ( 
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      background: '#ffffff'
    }}>

      <div style={{
        flex: 1,
        background: 'linear-gradient(135deg, #6b9554 0%, #5d8347 100%)',
        display: isMobile ? 'none' : 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '60px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Dekoratif Şekiller */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          filter: 'blur(60px)'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-150px',
          left: '-150px',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.08)',
          filter: 'blur(60px)'
        }}></div>
        
        <div style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          color: 'white',
          maxWidth: '600px',
          width: '100%'
        }}>
          <div style={{
            fontSize: '72px',
            marginBottom: '24px',
            opacity: 0.95
          }}>🥗</div>
          <h1 style={{
            fontSize: '42px',
            fontWeight: '700',
            margin: '0 0 20px 0',
            letterSpacing: '-0.5px'
          }}>
            Diyet Takip Sistemi
          </h1>
          <p style={{
            fontSize: '18px',
            margin: '0 0 40px 0',
            opacity: 0.95,
            lineHeight: '1.7',
            padding: '0 20px'
          }}>
            Sağlıklı yaşam yolculuğunuzda yanınızdayız. Beslenme alışkanlıklarınızı takip edin, hedeflerinize ulaşın.
          </p>
          
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '20px',
            marginBottom: '40px',
            padding: '0 20px'
          }}>
            <div style={{
              textAlign: 'center',
              padding: '24px 20px',
              background: 'rgba(255, 255, 255, 0.12)',
              borderRadius: '16px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              transition: 'transform 0.3s ease'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📊</div>
              <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>Detaylı İstatistikler</div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>Günlük, haftalık ve aylık analizler</div>
            </div>
            <div style={{
              textAlign: 'center',
              padding: '24px 20px',
              background: 'rgba(255, 255, 255, 0.12)',
              borderRadius: '16px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              transition: 'transform 0.3s ease'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🍽️</div>
              <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>Beslenme Takibi</div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>Öğünlerinizi kaydedin ve analiz edin</div>
            </div>
            <div style={{
              textAlign: 'center',
              padding: '24px 20px',
              background: 'rgba(255, 255, 255, 0.12)',
              borderRadius: '16px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              transition: 'transform 0.3s ease'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>👨‍⚕️</div>
              <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>Uzman Desteği</div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>Diyetisyeninizle iletişim kurun</div>
            </div>
            <div style={{
              textAlign: 'center',
              padding: '24px 20px',
              background: 'rgba(255, 255, 255, 0.12)',
              borderRadius: '16px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              transition: 'transform 0.3s ease'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚖️</div>
              <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>Kilo Takibi</div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>Kilonuzu düzenli olarak kaydedin</div>
            </div>
          </div>
        </div>
      </div>

    
      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px',
        background: '#f4f6fb',
        position: 'relative'
      }}>
    
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '30px',
          background: 'linear-gradient(to right, rgba(93, 131, 71, 0.15), transparent)',
          pointerEvents: 'none'
        }}></div>
        <div className="auth-container" style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}> 
         
          <div style={{
            textAlign: 'center',
            padding: '32px 32px 24px 32px',
            background: '#ffffff',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <h2 style={{ 
              margin: 0, 
              fontSize: '24px', 
              fontWeight: '600',
              color: '#1f2937',
              letterSpacing: '-0.3px'
            }}>
              {activeTab === 'login' ? 'Hoş Geldiniz' : 'Hesap Oluştur'}
            </h2>
            <p style={{ 
              margin: '8px 0 0 0', 
              fontSize: '14px', 
              color: '#6b7280',
              fontWeight: '400'
            }}>
              {activeTab === 'login' 
                ? 'Hesabınıza giriş yapın' 
                : 'Yeni hesap oluşturun ve başlayın'}
            </p>
          </div>
        
          <div className="auth-tabs" style={{
            display: 'flex',
            borderBottom: '1px solid #e5e7eb',
            background: '#ffffff'
          }}> 
            <button 
              className={activeTab === 'login' ? 'auth-tab active' : 'auth-tab'} 
              onClick={() => setActiveTab('login')}
              style={{
                flex: 1,
                padding: '16px',
                fontWeight: '600',
                fontSize: '15px',
                background: activeTab === 'login' ? '#ffffff' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: activeTab === 'login' ? '#5d8347' : '#6b7280',
                borderBottom: activeTab === 'login' ? '2px solid #5d8347' : '2px solid transparent',
                transition: 'all 0.2s ease'
              }}
            > 
              Giriş Yap 
            </button> 
            <button 
              className={activeTab === 'signup' ? 'auth-tab active' : 'auth-tab'} 
              onClick={() => setActiveTab('signup')}
              style={{
                flex: 1,
                padding: '16px',
                fontWeight: '600',
                fontSize: '15px',
                background: activeTab === 'signup' ? '#ffffff' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: activeTab === 'signup' ? '#5d8347' : '#6b7280',
                borderBottom: activeTab === 'signup' ? '2px solid #5d8347' : '2px solid transparent',
                transition: 'all 0.2s ease'
              }}
            >
              Kayıt Ol 
            </button> 
          </div> 
          
          <div className="auth-form-container" style={{
            padding: '28px'
          }}> 
            {activeTab === 'login' ? (
              <LoginPage /> 
            ) : ( 
              <SignUpPage /> 
            )} 
          </div> 
        </div>
      </div>
    </div>
   );
};

export default AuthPage;
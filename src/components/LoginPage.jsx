import React, { useState } from 'react';

import {login} from '../services/authService';
import {useNavigate} from 'react-router-dom';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); 

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        const result = await login(email, password);

        setIsLoading(false);

        if (result.success) {
            console.log('Giriş başarılı:', result.data);
            
           
            const userData = result.data.data || result.data;
            
            console.log('Kullanıcı verisi:', userData);
            
           
            const userId = userData.UserID || userData.userId || userData.id || userData.ID;
            console.log('UserID:', userId);
            
           
            const role = userData.Role || userData.role || userData.UserRole || userData.userRole || '';
            const roleString = role.toString().trim();
            const roleLower = roleString.toLowerCase();
            
            console.log('Rol değeri:', roleString);
            console.log('Normalize edilmiş rol:', roleLower);
            
           
            localStorage.setItem('loggedInUserId', userId);
            localStorage.setItem('loggedInUserRole', roleString);
            
          
            if (userData.FirstName || userData.LastName || userData.Email) {
                localStorage.setItem('userInfo', JSON.stringify({
                    FirstName: userData.FirstName || '',
                    LastName: userData.LastName || '',
                    Email: userData.Email || ''
                }));
            }

         
            if (roleLower === "diyetisyen" || roleLower === "dietitian") {
                navigate('/diyetisyen-paneli');
            } else if (roleLower === "danisan" || roleLower === "client" || roleLower === "danışan") {
                navigate('/danisan-paneli');
            } else {
                console.error('❌ Bilinmeyen rol değeri:', roleString);
                setError(`Bilinmeyen bir kullanıcı rolü döndü: "${roleString}". Lütfen backend'i kontrol edin.`);
            }
          } else {
            console.error('Giriş hatası:', result.message);
            setError(result.message || 'Giriş başarısız oldu.');
          }
        }
        return (
        <div>
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <div className='login-form' style={{ marginBottom: '20px' }}>
                <label htmlFor='email' style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  fontSize: '14px',
                  color: '#374151'
                }}>
                  E-posta Adresi
                </label>
                <input
                    type='email'
                    id='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder='ornek@email.com'
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      backgroundColor: '#ffffff',
                      fontSize: '15px',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#5d8347';
                      e.target.style.boxShadow = '0 0 0 3px rgba(93, 131, 71, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                />
              </div>
              
              <div className='login-form' style={{ marginBottom: '24px' }}>
                <label htmlFor='password' style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  fontSize: '14px',
                  color: '#374151'
                }}>
                  Şifre
                </label>
                <input
                    type='password'
                    id='password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder='Şifrenizi girin'
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      backgroundColor: '#ffffff',
                      fontSize: '15px',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#5d8347';
                      e.target.style.boxShadow = '0 0 0 3px rgba(93, 131, 71, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                />
              </div>
              
              {error && (
                <div className='login-form-error' style={{ 
                  color: '#dc2626',
                  marginBottom: '20px',
                  padding: '12px',
                  backgroundColor: '#fef2f2',
                  borderRadius: '8px',
                  border: '1px solid #fecaca',
                  fontSize: '14px',
                  fontWeight: '400'
                }}>
                  {error}
                </div>
              )}
              
              <button 
                type='submit' 
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: isLoading ? '#9ca3af' : '#5d8347',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease'
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
                {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
              </button>
            </form>
        </div>
    );
};

export default LoginPage;
      
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword, deleteAccount } from '../services/authService';

const HesapAyarlari = () => {
    const userId = localStorage.getItem('loggedInUserId');
    const navigate = useNavigate();
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    
   
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    
 
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'light';
    });
    
    
    useEffect(() => {
        const root = document.documentElement;
        const mainContent = document.querySelector('.layout-main');
        
        if (theme === 'dark') {
          
            root.style.setProperty('--bg-main', '#1a1a1a');
            root.style.setProperty('--bg-card', '#2d2d2d');
            root.style.setProperty('--text-main', '#ffffff');
            root.style.setProperty('--text-muted', '#b0b0b0');
            root.style.setProperty('--border-soft', '#404040');
            
            if (document.body) {
                document.body.style.backgroundColor = '#1a1a1a';
                document.body.style.color = '#ffffff';
            }
            
            if (mainContent) {
                mainContent.style.backgroundColor = '#1a1a1a';
                mainContent.style.color = '#ffffff';
            }
        } else {
            
            root.style.setProperty('--bg-main', '#f4f6fb');
            root.style.setProperty('--bg-card', '#ffffff');
            root.style.setProperty('--text-main', '#1f2937');
            root.style.setProperty('--text-muted', '#6b7280');
            root.style.setProperty('--border-soft', '#e5e7eb');
            
            if (document.body) {
                document.body.style.backgroundColor = '#f4f6fb';
                document.body.style.color = '#1f2937';
            }
            
            if (mainContent) {
                mainContent.style.backgroundColor = '#f4f6fb';
                mainContent.style.color = '#1f2937';
            }
        }
    }, [theme]);
    
 
    const [successMessage, setSuccessMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    
    useEffect(() => {
        const root = document.documentElement;
        const mainContent = document.querySelector('.layout-main');
        
        if (theme === 'dark') {
            // Koyu tema
            root.style.setProperty('--bg-main', '#1a1a1a');
            root.style.setProperty('--bg-card', '#2d2d2d');
            root.style.setProperty('--text-main', '#ffffff');
            root.style.setProperty('--text-muted', '#b0b0b0');
            root.style.setProperty('--border-soft', '#404040');
            
            if (document.body) {
                document.body.style.backgroundColor = '#1a1a1a';
                document.body.style.color = '#ffffff';
            }
            
            if (mainContent) {
                mainContent.style.backgroundColor = '#1a1a1a';
                mainContent.style.color = '#ffffff';
            }
        } else {
           
            root.style.setProperty('--bg-main', '#f4f6fb');
            root.style.setProperty('--bg-card', '#ffffff');
            root.style.setProperty('--text-main', '#1f2937');
            root.style.setProperty('--text-muted', '#6b7280');
            root.style.setProperty('--border-soft', '#e5e7eb');
            
            if (document.body) {
                document.body.style.backgroundColor = '#f4f6fb';
                document.body.style.color = '#1f2937';
            }
            
            if (mainContent) {
                mainContent.style.backgroundColor = '#f4f6fb';
                mainContent.style.color = '#1f2937';
            }
        }
    }, [theme]);

   
    const handleChangePassword = async (e) => {
        e.preventDefault();
        setIsChangingPassword(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setErrorMessage('Lütfen tüm alanları doldurun.');
            setIsChangingPassword(false);
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setErrorMessage('Yeni şifreler eşleşmiyor.');
            setIsChangingPassword(false);
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setErrorMessage('Şifre en az 6 karakter olmalıdır.');
            setIsChangingPassword(false);
            return;
        }

        console.log('Şifre değiştirme başlatılıyor - userId:', userId);
        console.log('Gönderilecek data:', {
            OldPassword: passwordData.currentPassword,
            NewPassword: passwordData.newPassword
        });

        try {
            const result = await changePassword(
                parseInt(userId), 
                passwordData.currentPassword, 
                passwordData.newPassword
            );

            console.log('Şifre değiştirme sonucu:', result);

            if (result.success) {
                setSuccessMessage('Şifreniz başarıyla değiştirildi!');
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                setTimeout(() => setSuccessMessage(null), 5000);
            } else {
                setErrorMessage(result.message || 'Şifre değiştirilirken bir hata oluştu.');
            }
        } catch (error) {
            console.error('Şifre değiştirme hatası:', error);
            setErrorMessage('Şifre değiştirilirken bir hata oluştu: ' + error.message);
        } finally {
            setIsChangingPassword(false);
        }
    };

    // Tema değiştir
    const handleThemeChange = (newTheme) => {
        try {
            setTheme(newTheme);
            localStorage.setItem('theme', newTheme);
            console.log('Tema değiştirildi:', newTheme); // Debug
        } catch (error) {
            console.error('Tema değiştirilirken hata:', error);
            setErrorMessage('Tema değiştirilemedi.');
        }
    };

    const handleDeleteAccount = async () => {
        if (!deletePassword) {
            setErrorMessage('Lütfen şifrenizi girin.');
            return;
        }

        console.log('=== HESAP SİLME BUTONUNA TIKLANDI ===');
        console.log('userId:', userId, 'type:', typeof userId);
        console.log('deletePassword length:', deletePassword.length);

        setIsDeleting(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            const result = await deleteAccount(parseInt(userId), deletePassword);
            
            console.log('=== HESAP SİLME SONUCU ===');
            console.log('result:', result);

            if (result.success) {
                console.log('✅ Hesap silme başarılı, çıkış yapılıyor...');
                // Başarılı - tüm local storage'ı temizle ve çıkış yap
                localStorage.clear();
                setSuccessMessage('Hesabınız başarıyla silindi. Çıkış yapılıyor...');
                
                // 2 saniye bekle ve login sayfasına yönlendir
                setTimeout(() => {
                    navigate('/');
                }, 2000);
            } else {
                console.error('❌ Hesap silme başarısız:', result.message);
                setErrorMessage(result.message || 'Hesap silinirken bir hata oluştu.');
                setIsDeleting(false);
            }
        } catch (error) {
            console.error('❌ Hesap silme catch hatası:', error);
            console.error('❌ Error details:', error.message, error.stack);
            setErrorMessage('Hesap silinirken bir hata oluştu: ' + error.message);
            setIsDeleting(false);
        }
    };


    const themeColors = theme === 'dark' ? {
        bgMain: '#1a1a1a',
        bgCard: '#2d2d2d',
        textMain: '#ffffff',
        textMuted: '#b0b0b0',
        border: '#404040'
    } : {
        bgMain: '#f4f6fb',
        bgCard: '#ffffff',
        textMain: '#1f2937',
        textMuted: '#666',
        border: '#e5e7eb'
    };

    return (
        <div style={{ 
            maxWidth: '700px', 
            margin: '0 auto', 
            padding: '15px',
            backgroundColor: themeColors.bgMain,
            minHeight: '100vh'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 className="page-title" style={{ margin: 0, fontSize: '24px', color: themeColors.textMain }}>⚙️ Hesap Ayarları</h1>
            </div>

        
            {successMessage && (
                <div style={{
                    padding: '12px 16px',
                    backgroundColor: '#e8f5e9',
                    color: '#2e7d32',
                    borderRadius: '10px',
                    border: '2px solid #4caf50',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: '600',
                    fontSize: '14px'
                }}>
                    <span style={{ fontSize: '18px' }}>✅</span>
                    <span>{successMessage}</span>
                </div>
            )}

            {errorMessage && (
                <div style={{
                    padding: '12px 16px',
                    backgroundColor: '#ffebee',
                    color: '#c62828',
                    borderRadius: '10px',
                    border: '2px solid #ef5350',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: '600',
                    fontSize: '14px'
                }}>
                    <span style={{ fontSize: '18px' }}>⚠️</span>
                    <span>{errorMessage}</span>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
               
                <div style={{
                    backgroundColor: themeColors.bgCard,
                    padding: '20px',
                    borderRadius: '15px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                    border: `1px solid ${themeColors.border}`
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <span style={{ fontSize: '24px' }}>🔒</span>
                        <h2 style={{ margin: 0, color: themeColors.textMain, fontSize: '20px' }}>Şifre Değiştir</h2>
                    </div>

                    <form onSubmit={handleChangePassword}>
                        <div className="login-form" style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: themeColors.textMuted, fontSize: '14px' }}>
                                Mevcut Şifre:
                            </label>
                            <input
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '10px',
                                    border: `2px solid ${themeColors.border}`,
                                    backgroundColor: theme === 'dark' ? '#3d3d3d' : '#f9fafb',
                                    color: themeColors.textMain,
                                    fontSize: '14px',
                                    transition: 'all 0.3s'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#5d8347';
                                    e.target.style.backgroundColor = theme === 'dark' ? '#4d4d4d' : '#fff';
                                    e.target.style.boxShadow = '0 0 0 4px rgba(87, 130, 95, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = themeColors.border;
                                    e.target.style.backgroundColor = theme === 'dark' ? '#3d3d3d' : '#f9fafb';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                            <div className="login-form">
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: themeColors.textMuted, fontSize: '14px' }}>
                                    Yeni Şifre:
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    required
                                    minLength={6}
                                    style={{
                                        width: '100%',
                                        padding: '14px',
                                        borderRadius: '12px',
                                        border: `2px solid ${themeColors.border}`,
                                        backgroundColor: theme === 'dark' ? '#3d3d3d' : '#f9fafb',
                                        color: themeColors.textMain,
                                        fontSize: '15px',
                                        transition: 'all 0.3s'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#5d8347';
                                        e.target.style.backgroundColor = theme === 'dark' ? '#4d4d4d' : '#fff';
                                        e.target.style.boxShadow = '0 0 0 4px rgba(87, 130, 95, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = themeColors.border;
                                        e.target.style.backgroundColor = theme === 'dark' ? '#3d3d3d' : '#f9fafb';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                                <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                                    En az 6 karakter olmalıdır
                                </small>
                            </div>

                            <div className="login-form">
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: themeColors.textMuted, fontSize: '14px' }}>
                                    Yeni Şifre (Tekrar):
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    required
                                    minLength={6}
                                    style={{
                                        width: '100%',
                                        padding: '14px',
                                        borderRadius: '12px',
                                        border: `2px solid ${themeColors.border}`,
                                        backgroundColor: theme === 'dark' ? '#3d3d3d' : '#f9fafb',
                                        color: themeColors.textMain,
                                        fontSize: '15px',
                                        transition: 'all 0.3s'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#5d8347';
                                        e.target.style.backgroundColor = theme === 'dark' ? '#4d4d4d' : '#fff';
                                        e.target.style.boxShadow = '0 0 0 4px rgba(87, 130, 95, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = themeColors.border;
                                        e.target.style.backgroundColor = theme === 'dark' ? '#3d3d3d' : '#f9fafb';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isChangingPassword}
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: isChangingPassword ? '#9e9e9e' : '#d32f2f',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontWeight: 'bold',
                                fontSize: '15px',
                                cursor: isChangingPassword ? 'not-allowed' : 'pointer',
                                boxShadow: isChangingPassword ? 'none' : '0 4px 15px rgba(211, 47, 47, 0.3)',
                                transition: 'all 0.3s'
                            }}
                            onMouseEnter={(e) => {
                                if (!isChangingPassword) {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 8px 25px rgba(211, 47, 47, 0.4)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isChangingPassword) {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 6px 20px rgba(211, 47, 47, 0.3)';
                                }
                            }}
                        >
                            {isChangingPassword ? '⏳ Değiştiriliyor...' : '🔐 Şifreyi Değiştir'}
                        </button>
                    </form>
                </div>

             
                <div style={{
                    backgroundColor: themeColors.bgCard,
                    padding: '20px',
                    borderRadius: '15px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                    border: `1px solid ${themeColors.border}`
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <span style={{ fontSize: '24px' }}>🎨</span>
                        <h2 style={{ margin: 0, color: themeColors.textMain, fontSize: '20px' }}>Tema Tercihi</h2>
                    </div>

                    <div style={{ display: 'flex', gap: '15px' }}>
                        {['light', 'dark'].map((themeOption) => (
                            <button
                                key={themeOption}
                                type="button"
                                onClick={() => handleThemeChange(themeOption)}
                                style={{
                                    flex: 1,
                                    padding: '15px',
                                    borderRadius: '10px',
                                    border: theme === themeOption ? '2px solid #5d8347' : `2px solid ${themeColors.border}`,
                                    backgroundColor: theme === themeOption ? '#e8f5e9' : (theme === 'dark' ? '#3d3d3d' : '#f9fafb'),
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: theme === themeOption ? 'bold' : 'normal',
                                    transition: 'all 0.3s',
                                    fontSize: '14px'
                                }}
                                onMouseEnter={(e) => {
                                    if (theme !== themeOption) {
                                        e.target.style.borderColor = '#5d8347';
                                        e.target.style.backgroundColor = theme === 'dark' ? '#4d4d4d' : '#f0f0f0';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (theme !== themeOption) {
                                        e.target.style.borderColor = themeColors.border;
                                        e.target.style.backgroundColor = theme === 'dark' ? '#3d3d3d' : '#f9fafb';
                                    }
                                }}
                            >
                                {themeOption === 'light' && '☀️ Açık Tema'}
                                {themeOption === 'dark' && '🌙 Koyu Tema'}
                            </button>
                        ))}
                    </div>
                </div>

             
                <div style={{
                    backgroundColor: themeColors.bgCard,
                    padding: '20px',
                    borderRadius: '15px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                    border: `1px solid ${themeColors.border}`
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <span style={{ fontSize: '24px' }}>🗑️</span>
                        <h2 style={{ margin: 0, color: themeColors.textMain, fontSize: '20px' }}>Hesabı Sil</h2>
                    </div>

                    <p style={{ 
                        color: themeColors.textMuted, 
                        fontSize: '14px', 
                        marginBottom: '20px',
                        lineHeight: '1.6'
                    }}>
                        Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz. 
                        Tüm verileriniz kalıcı olarak silinecektir.
                    </p>

                    <button
                        type="button"
                        onClick={() => setShowDeleteModal(true)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: '#d32f2f',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontWeight: 'bold',
                            fontSize: '15px',
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(211, 47, 47, 0.3)',
                            transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 8px 25px rgba(211, 47, 47, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 15px rgba(211, 47, 47, 0.3)';
                        }}
                    >
                        🗑️ Hesabı Sil
                    </button>
                </div>

            </div>

         
            {showDeleteModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,
                    padding: '20px'
                }} onClick={() => !isDeleting && setShowDeleteModal(false)}>
                    <div style={{
                        backgroundColor: themeColors.bgCard,
                        padding: '30px',
                        borderRadius: '15px',
                        maxWidth: '500px',
                        width: '100%',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                        border: `1px solid ${themeColors.border}`
                    }} onClick={(e) => e.stopPropagation()}>
                        <h2 style={{ 
                            margin: '0 0 20px 0', 
                            color: themeColors.textMain, 
                            fontSize: '22px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            ⚠️ Hesabı Sil
                        </h2>

                        <p style={{ 
                            color: themeColors.textMuted, 
                            fontSize: '14px', 
                            marginBottom: '20px',
                            lineHeight: '1.6'
                        }}>
                            Hesabınızı silmek için şifrenizi girin. Bu işlem geri alınamaz ve tüm verileriniz kalıcı olarak silinecektir.
                        </p>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                fontWeight: '600', 
                                color: themeColors.textMuted, 
                                fontSize: '14px' 
                            }}>
                                Şifre:
                            </label>
                            <input
                                type="password"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                placeholder="Şifrenizi girin"
                                disabled={isDeleting}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '10px',
                                    border: `2px solid ${themeColors.border}`,
                                    backgroundColor: theme === 'dark' ? '#3d3d3d' : '#f9fafb',
                                    color: themeColors.textMain,
                                    fontSize: '15px',
                                    transition: 'all 0.3s',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#d32f2f';
                                    e.target.style.backgroundColor = theme === 'dark' ? '#4d4d4d' : '#fff';
                                    e.target.style.boxShadow = '0 0 0 4px rgba(211, 47, 47, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = themeColors.border;
                                    e.target.style.backgroundColor = theme === 'dark' ? '#3d3d3d' : '#f9fafb';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeletePassword('');
                                    setErrorMessage(null);
                                }}
                                disabled={isDeleting}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: theme === 'dark' ? '#3d3d3d' : '#f9fafb',
                                    color: themeColors.textMain,
                                    border: `2px solid ${themeColors.border}`,
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                                    opacity: isDeleting ? 0.5 : 1,
                                    transition: 'all 0.3s'
                                }}
                            >
                                İptal
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteAccount}
                                disabled={isDeleting || !deletePassword}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: isDeleting ? '#9e9e9e' : '#d32f2f',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    cursor: (isDeleting || !deletePassword) ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.3s'
                                }}
                            >
                                {isDeleting ? '⏳ Siliniyor...' : '🗑️ Hesabı Sil'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HesapAyarlari;


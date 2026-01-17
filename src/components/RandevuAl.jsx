import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestAppointment, getMyDietitian, getAppointmentsForClient, changeDietitian } from '../services/dataService';

const RandevuAl = () => {

    const [appointmentDate, setAppointmentDate] = useState('');
    const [appointmentTime, setAppointmentTime] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

 
    const [dietitianInfo, setDietitianInfo] = useState(null);
    const [isLoadingDietitian, setIsLoadingDietitian] = useState(true);
    const [dietitianError, setDietitianError] = useState(null);
    
    
    const [appointments, setAppointments] = useState([]);
    const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);

   
    const [showChangeDietitianModal, setShowChangeDietitianModal] = useState(false);
    const [invitationCode, setInvitationCode] = useState('');
    const [isChangingDietitian, setIsChangingDietitian] = useState(false);
    const [changeDietitianError, setChangeDietitianError] = useState(null);
    const [changeDietitianSuccess, setChangeDietitianSuccess] = useState(null);

    const navigate = useNavigate();
    const clientUserId = localStorage.getItem('loggedInUserId');

    useEffect(() => {
        const fetchData = async () => {
            if (clientUserId) {
              
                setIsLoadingDietitian(true);
                setDietitianError(null);
                const dietitianResult = await getMyDietitian(clientUserId);
                console.log('Diyetisyen API Response:', dietitianResult); 
                if (dietitianResult.success && dietitianResult.data) {
                    
                    const dietitianData = Array.isArray(dietitianResult.data) 
                        ? dietitianResult.data[0] 
                        : dietitianResult.data;
                    if (dietitianData && (dietitianData.FullName || dietitianData.Email)) {
                        setDietitianInfo(dietitianData);
                    } else {
                        setDietitianError('Size atanmış bir diyetisyen bulunamadı.');
                    }
                } else {
                    setDietitianError(dietitianResult.message || 'Diyetisyen bilgisi alınamadı.');
                    console.error('Diyetisyen bilgisi alınamadı:', dietitianResult.message);
                }
                setIsLoadingDietitian(false);

                setIsLoadingAppointments(true);
                const appointmentsResult = await getAppointmentsForClient(clientUserId);
                if (appointmentsResult.success) {

                    const now = new Date();
                    const futureAppointments = appointmentsResult.data
                        .filter(apt => new Date(apt.AppointmentDate) > now)
                        .sort((a, b) => new Date(a.AppointmentDate) - new Date(b.AppointmentDate));
                    setAppointments(futureAppointments);
                }
                setIsLoadingAppointments(false);
            }
        };
        fetchData();
    }, [clientUserId]);

    const getMinDate = () => {
        const today = new Date();
        today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
        return today.toISOString().slice(0, 10); // Sadece tarih
    };

    const getStatusBadgeStyle = (status) => {
        const styles = {
            'Onaylandı': { bg: '#e8f5e9', color: '#2e7d32', icon: '✅' },
            'Bekleniyor': { bg: '#fff3e0', color: '#e65100', icon: '⏳' }, 
            'Beklemede': { bg: '#fff3e0', color: '#e65100', icon: '⏳' }, 
            'Reddedildi': { bg: '#ffebee', color: '#c62828', icon: '❌' }
        };
        return styles[status] || styles['Bekleniyor'];
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        
        const combinedDateTime = appointmentDate && appointmentTime 
            ? `${appointmentDate}T${appointmentTime}:00`
            : appointmentDate;

        if (!combinedDateTime) {
            setError('Lütfen tarih ve saat seçin.');
            setIsSubmitting(false);
            return;
        }

       
        const appointmentDateObj = new Date(combinedDateTime);
        const appointmentDateISO = appointmentDateObj.toISOString();

       
        let dietitianId = null;
        if (dietitianInfo) {
            console.log('Diyetisyen Bilgisi:', dietitianInfo); // Debug
            dietitianId = dietitianInfo.DietitianId 
                || dietitianInfo.DietitianID 
                || dietitianInfo.UserID 
                || dietitianInfo.Id 
                || dietitianInfo.ID
                || dietitianInfo.userId
                || dietitianInfo.DietitianUserId;
        }

       
        let finalDietitianId = dietitianId;
        
        
        if (!finalDietitianId) {
            try {
                const clientDetailsResponse = await fetch(`${API_BASE_URL}/client-details/${clientUserId}`);
                if (clientDetailsResponse.ok) {
                    const clientDetails = await clientDetailsResponse.json();
                    finalDietitianId = clientDetails.AssignedDietitianID;
                    console.log('Client details\'den diyetisyen ID alındı:', finalDietitianId);
                }
            } catch (e) {
                console.warn('Client details alınamadı:', e);
            }
        }

        if (!finalDietitianId) {
            setError('Diyetisyen bilgisi bulunamadı. Lütfen sayfayı yenileyin veya yöneticinizle iletişime geçin.');
            setIsSubmitting(false);
            return;
        }


        const requestData = {
            ClientUserID: parseInt(clientUserId), 
            DietitianUserID: parseInt(finalDietitianId), 
            AppointmentDate: appointmentDateISO, 
            Notes: notes || ''
        };

        console.log('Randevu Talebi (Backend formatında):', requestData);

        console.log('Randevu Talebi Gönderiliyor:', requestData); 
        console.log('Diyetisyen Bilgisi Durumu:', { 
            dietitianInfo, 
            isLoadingDietitian, 
            dietitianError 
        }); 

        const result = await requestAppointment(requestData);

        console.log('Randevu API Response:', result); 

        const isSuccess = result.success 
            || result.Message === 'Randevu talebiniz başarıyla alındı.'
            || result.Message === 'Randevu başarıyla oluşturuldu'
            || result.message === 'Randevu talebiniz başarıyla alındı.'
            || result.message === 'Randevu başarıyla oluşturuldu'
            || (result.data && (result.data.AppointmentID || result.data.AppointmentId));

        if (isSuccess) {
            setSuccess('Randevu talebiniz başarıyla gönderildi! Diyetisyeniniz onayladığında size bildirim gönderilecektir.');
            setAppointmentDate('');
            setAppointmentTime('');
            setNotes('');
            
            // Randevuları yeniden yükle
            setTimeout(async () => {
                const appointmentsResult = await getAppointmentsForClient(clientUserId);
                if (appointmentsResult.success) {
                    const now = new Date();
                    const futureAppointments = appointmentsResult.data
                        .filter(apt => new Date(apt.AppointmentDate) > now)
                        .sort((a, b) => new Date(a.AppointmentDate) - new Date(b.AppointmentDate));
                    setAppointments(futureAppointments);
                }
            }, 500);
        } else {
            setError(result.message || result.Message || 'Randevu oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
        }
        setIsSubmitting(false);
    };

    const handleChangeDietitian = async (e) => {
        e.preventDefault();
        setIsChangingDietitian(true);
        setChangeDietitianError(null);
        setChangeDietitianSuccess(null);

        if (!invitationCode || invitationCode.trim().length === 0) {
            setChangeDietitianError('Lütfen davet kodunu girin.');
            setIsChangingDietitian(false);
            return;
        }

        console.log('=== DİYETİSYEN DEĞİŞTİRME İŞLEMİ ===');
        console.log('clientUserId:', clientUserId);
        console.log('invitationCode:', invitationCode);

        const result = await changeDietitian(clientUserId, invitationCode);
        console.log('changeDietitian sonucu:', result);

        if (result.success) {
            setChangeDietitianSuccess(result.message || 'Diyetisyeniniz başarıyla değiştirildi!');
            setInvitationCode('');
            
            // Diyetisyen bilgilerini yeniden yükle
            setTimeout(async () => {
                setIsLoadingDietitian(true);
                setDietitianError(null);
                const dietitianResult = await getMyDietitian(clientUserId);
                console.log('Yeniden yüklenen diyetisyen bilgisi:', dietitianResult);
                
                if (dietitianResult.success && dietitianResult.data) {
                    const dietitianData = Array.isArray(dietitianResult.data) 
                        ? dietitianResult.data[0] 
                        : dietitianResult.data;
                    if (dietitianData && (dietitianData.FullName || dietitianData.Email)) {
                        setDietitianInfo(dietitianData);
                    } else {
                        setDietitianError('Size atanmış bir diyetisyen bulunamadı.');
                    }
                } else {
                    setDietitianError(dietitianResult.message || 'Diyetisyen bilgisi alınamadı.');
                }
                setIsLoadingDietitian(false);
            }, 1000);

           
            setTimeout(() => {
                setShowChangeDietitianModal(false);
                setChangeDietitianSuccess(null);
            }, 2000);
        } else {
            setChangeDietitianError(result.message || 'Diyetisyen değiştirilemedi. Lütfen tekrar deneyin.');
        }

        setIsChangingDietitian(false);
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
                <h1 className="page-title" style={{ margin: 0 }}>📅 Randevu Yönetimi</h1>
            </div>
            
            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start' }}>

                
                <div style={{ flex: 2, minWidth: '320px' }}>
                    <div style={{ 
                        backgroundColor: 'white', 
                        padding: '30px', 
                        borderRadius: '20px', 
                        boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
                        marginBottom: '25px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                            <span style={{ fontSize: '28px' }}>✨</span>
                            <h2 style={{ margin: 0, color: '#2c3e50', fontSize: '24px' }}>Yeni Randevu Talep Et</h2>
                        </div>
                        <p style={{ color: '#7f8c8d', marginBottom: '25px', fontSize: '15px' }}>
                            Uygun olduğunuz tarih ve saati seçerek randevu talebinizi oluşturun.
                        </p>

                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                <div className="login-form">
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555', fontSize: '14px' }}>
                                        📆 Tarih:
                                </label>
                                <input
                                        type="date"
                                    value={appointmentDate}
                                    onChange={(e) => setAppointmentDate(e.target.value)}
                                    min={getMinDate()}
                                    required
                                        style={{ 
                                            width: '100%', 
                                            padding: '14px', 
                                            borderRadius: '12px', 
                                            border: '2px solid #e5e7eb',
                                            backgroundColor: '#f9fafb',
                                            fontSize: '15px',
                                            transition: 'all 0.3s'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#5d8347';
                                            e.target.style.backgroundColor = '#fff';
                                            e.target.style.boxShadow = '0 0 0 4px rgba(87, 130, 95, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#e5e7eb';
                                            e.target.style.backgroundColor = '#f9fafb';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                </div>

                                <div className="login-form">
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555', fontSize: '14px' }}>
                                        🕐 Saat:
                                    </label>
                                    <input
                                        type="time"
                                        value={appointmentTime}
                                        onChange={(e) => setAppointmentTime(e.target.value)}
                                        required
                                        style={{ 
                                            width: '100%', 
                                            padding: '14px', 
                                            borderRadius: '12px', 
                                            border: '2px solid #e5e7eb',
                                            backgroundColor: '#f9fafb',
                                            fontSize: '15px',
                                            transition: 'all 0.3s'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#5d8347';
                                            e.target.style.backgroundColor = '#fff';
                                            e.target.style.boxShadow = '0 0 0 4px rgba(87, 130, 95, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#e5e7eb';
                                            e.target.style.backgroundColor = '#f9fafb';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="login-form" style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555', fontSize: '14px' }}>
                                    📝 Notunuz (Opsiyonel):
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Örn: Görüşme nedeniniz, özel durumlarınız veya sorularınız..."
                                    rows="4"
                                    style={{ 
                                        width: '100%', 
                                        padding: '14px', 
                                        borderRadius: '12px', 
                                        border: '2px solid #e5e7eb',
                                        backgroundColor: '#f9fafb',
                                        fontSize: '15px',
                                        fontFamily: 'inherit',
                                        resize: 'vertical',
                                        transition: 'all 0.3s'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#5d8347';
                                        e.target.style.backgroundColor = '#fff';
                                        e.target.style.boxShadow = '0 0 0 4px rgba(87, 130, 95, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e5e7eb';
                                        e.target.style.backgroundColor = '#f9fafb';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSubmitting} 
                                style={{ 
                                    width: '100%', 
                                    padding: '16px', 
                                    backgroundColor: isSubmitting ? '#9e9e9e' : '#5d8347', 
                                    color: 'white', 
                                    border: 'none', 
                                    borderRadius: '12px', 
                                    fontWeight: 'bold',
                                    fontSize: '16px',
                                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                    boxShadow: isSubmitting ? 'none' : '0 6px 20px rgba(87, 130, 95, 0.3)',
                                    transition: 'all 0.3s',
                                    transform: isSubmitting ? 'none' : 'translateY(0)'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isSubmitting) {
                                        e.target.style.transform = 'translateY(-2px)';
                                        e.target.style.boxShadow = '0 8px 25px rgba(87, 130, 95, 0.4)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isSubmitting) {
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = '0 6px 20px rgba(87, 130, 95, 0.3)';
                                    }
                                }}
                            >
                                {isSubmitting ? '⏳ İşleniyor...' : '✅ Randevu Talebi Oluştur'}
                            </button>

                            {success && (
                                <div style={{ 
                                    marginTop: '20px', 
                                    padding: '15px 20px',
                                    backgroundColor: '#e8f5e9',
                                    color: '#2e7d32',
                                    borderRadius: '12px',
                                    border: '2px solid #4caf50',
                                    fontWeight: '600',
                                    fontSize: '15px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    animation: 'slideIn 0.3s ease-out'
                                }}>
                                    <span style={{ fontSize: '20px' }}>✅</span>
                                    <span>{success}</span>
                                </div>
                            )}
                            {error && (
                                <div style={{ 
                                    marginTop: '20px', 
                                    padding: '15px 20px',
                                    backgroundColor: '#ffebee',
                                    color: '#c62828',
                                    borderRadius: '12px',
                                    border: '2px solid #ef5350',
                                    fontWeight: '600',
                                    fontSize: '15px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    animation: 'slideIn 0.3s ease-out'
                                }}>
                                    <span style={{ fontSize: '20px' }}>⚠️</span>
                                    <span>{error}</span>
                                </div>
                            )}
                        </form>
                    </div>

                    
                    <div style={{ 
                        backgroundColor: 'white', 
                        padding: '30px', 
                        borderRadius: '20px', 
                        boxShadow: '0 8px 25px rgba(0,0,0,0.08)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <span style={{ fontSize: '24px' }}>📋</span>
                            <h3 style={{ margin: 0, color: '#2c3e50', fontSize: '20px' }}>Mevcut Randevularım</h3>
                        </div>

                        {isLoadingAppointments ? (
                            <div style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                                <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
                                Yükleniyor...
                            </div>
                        ) : appointments.length === 0 ? (
                            <div style={{ 
                                textAlign: 'center', 
                                padding: '40px 20px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '12px',
                                border: '2px dashed #ddd'
                            }}>
                                <div style={{ fontSize: '48px', marginBottom: '15px' }}>📅</div>
                                <p style={{ color: '#888', margin: 0, fontSize: '15px' }}>
                                    Henüz aktif randevunuz bulunmuyor.
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {appointments.map((apt) => {
                                    const statusStyle = getStatusBadgeStyle(apt.Status);
                                    return (
                                        <div 
                                            key={apt.AppointmentID}
                                            style={{
                                                padding: '20px',
                                                backgroundColor: '#f9fafb',
                                                borderRadius: '15px',
                                                border: '2px solid #e5e7eb',
                                                transition: 'all 0.3s',
                                                cursor: 'pointer'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                                                e.currentTarget.style.borderColor = '#5d8347';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = 'none';
                                                e.currentTarget.style.borderColor = '#e5e7eb';
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                                                <div>
                                                    <div style={{ 
                                                        display: 'inline-block',
                                                        padding: '6px 14px',
                                                        borderRadius: '20px',
                                                        backgroundColor: statusStyle.bg,
                                                        color: statusStyle.color,
                                                        fontSize: '12px',
                                                        fontWeight: '700',
                                                        marginBottom: '10px'
                                                    }}>
                                                        {statusStyle.icon} {apt.Status}
                                                    </div>
                                                    <div style={{ 
                                                        fontSize: '16px', 
                                                        fontWeight: '600', 
                                                        color: '#2c3e50',
                                                        marginBottom: '8px'
                                                    }}>
                                                        {formatDate(apt.AppointmentDate)}
                                                    </div>
                                                </div>
                                            </div>
                                            {apt.Notes && (
                                                <div style={{ 
                                                    padding: '12px',
                                                    backgroundColor: 'white',
                                                    borderRadius: '8px',
                                                    fontSize: '14px',
                                                    color: '#555',
                                                    marginTop: '10px',
                                                    borderLeft: '3px solid #5d8347'
                                                }}>
                                                    <strong>Not:</strong> {apt.Notes}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

            
                <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                   
                    <div style={{ 
                        backgroundColor: 'white', 
                        padding: '25px', 
                        borderRadius: '20px', 
                        boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
                        textAlign: 'center'
                    }}>
                        <div style={{ 
                            width: '90px', 
                            height: '90px', 
                            backgroundColor: 'linear-gradient(135deg, #5d8347, #4a6a38)',
                            background: 'linear-gradient(135deg, #5d8347, #4a6a38)',
                            borderRadius: '50%', 
                            margin: '0 auto 20px auto', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            fontSize: '40px',
                            boxShadow: '0 4px 15px rgba(87, 130, 95, 0.3)'
                        }}>
                            👩‍⚕️
                        </div>
                        
                        {isLoadingDietitian ? (
                            <div style={{ padding: '20px', color: '#999' }}>
                                <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
                                Diyetisyen bilgileri yükleniyor...
                            </div>
                        ) : dietitianError ? (
                            <div style={{ padding: '20px' }}>
                                <div style={{ fontSize: '32px', marginBottom: '15px' }}>⚠️</div>
                                <p style={{ color: '#d32f2f', fontSize: '14px', margin: 0, fontWeight: '600' }}>
                                    {dietitianError}
                                </p>
                                <p style={{ color: '#666', fontSize: '13px', marginTop: '10px', marginBottom: 0 }}>
                                    Lütfen yöneticinizle iletişime geçin.
                                </p>
                            </div>
                        ) : dietitianInfo ? (
                            <>
                                <h3 style={{ margin: '0 0 8px 0', color: '#2c3e50', fontSize: '20px' }}>
                                    {dietitianInfo.FullName || 'Diyetisyen'}
                                </h3>
                                <p style={{ color: '#7f8c8d', fontSize: '14px', margin: '0 0 20px 0', fontWeight: '500' }}>
                                    {dietitianInfo.Title || 'Diyetisyen'}
                                </p>
                                <hr style={{ margin: '20px 0', border: 'none', borderTop: '2px solid #f0f0f0' }} />
                                <div style={{ textAlign: 'left', fontSize: '14px', color: '#555', marginBottom: '20px' }}>
                                    {dietitianInfo.Email && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                            <span style={{ fontSize: '18px' }}>📧</span>
                                            <span>{dietitianInfo.Email}</span>
                                        </div>
                                    )}
                                    {dietitianInfo.Phone && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                            <span style={{ fontSize: '18px' }}>📞</span>
                                            <span>{dietitianInfo.Phone}</span>
                                        </div>
                                    )}
                                </div>
                                
        
                                <button
                                    onClick={() => setShowChangeDietitianModal(true)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 20px',
                                        backgroundColor: '#5d8347',
                                        color: 'white',
                                        border: '2px solid #5d8347',
                                        borderRadius: '10px',
                                        fontWeight: '600',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = '#4a6a38';
                                        e.target.style.borderColor = '#4a6a38';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = '#5d8347';
                                        e.target.style.borderColor = '#5d8347';
                                    }}
                                >
                                    Diyetisyen Değiştir
                                </button>
                            </>
                        ) : (
                            <div style={{ padding: '20px', color: '#999' }}>
                                <div style={{ fontSize: '32px', marginBottom: '10px' }}>👤</div>
                                <p style={{ margin: 0, fontSize: '14px' }}>
                                    Size atanmış bir diyetisyen bulunamadı.
                                </p>
                            </div>
                        )}
                    </div>

                
                    <div style={{ 
                        backgroundColor: '#fff8e1', 
                        padding: '25px', 
                        borderRadius: '20px', 
                        border: '2px solid #ffd54f',
                        boxShadow: '0 4px 15px rgba(255, 193, 7, 0.2)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                            <span style={{ fontSize: '24px' }}>ℹ️</span>
                            <h4 style={{ margin: 0, color: '#f57f17', fontSize: '18px' }}>Önemli Bilgiler</h4>
                        </div>
                        <ul style={{ 
                            paddingLeft: '25px', 
                            fontSize: '14px', 
                            color: '#5d4037', 
                            lineHeight: '1.8',
                            margin: 0
                        }}>
                            <li style={{ marginBottom: '10px' }}>
                                Randevu süresi ortalama <strong>45 dakikadır.</strong>
                            </li>
                            <li style={{ marginBottom: '10px' }}>
                                Lütfen randevu saatine <strong>5 dakika önceden</strong> hazır olun.
                            </li>
                            <li style={{ marginBottom: '10px' }}>
                                Randevu talebiniz diyetisyeniniz tarafından <strong>onaylandığında</strong> size bildirim gönderilecektir.
                            </li>
                            <li>
                                Acil durumlarda diyetisyeninizle <strong>doğrudan iletişime</strong> geçebilirsiniz.
                            </li>
                        </ul>
                    </div>

                  
                    <div style={{ 
                        backgroundColor: '#e3f2fd', 
                        padding: '25px', 
                        borderRadius: '20px', 
                        border: '2px solid #64b5f6'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                            <span style={{ fontSize: '24px' }}>💡</span>
                            <h4 style={{ margin: 0, color: '#1565c0', fontSize: '18px' }}>Hızlı İpuçları</h4>
                        </div>
                        <ul style={{ 
                            paddingLeft: '25px', 
                            fontSize: '14px', 
                            color: '#0d47a1', 
                            lineHeight: '1.8',
                            margin: 0
                        }}>
                            <li style={{ marginBottom: '10px' }}>
                                Randevu öncesi <strong>beslenme günlüğünüzü</strong> güncelleyin.
                            </li>
                            <li style={{ marginBottom: '10px' }}>
                            Daha verimli bir görüşme için <strong>sorularınızı</strong> önceden hazırlayınız.
                            </li>
                            
                        </ul>
                    </div>

                </div>
            </div>

    
            {showChangeDietitianModal && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '20px'
                    }}
                    onClick={() => {
                        if (!isChangingDietitian) {
                            setShowChangeDietitianModal(false);
                            setInvitationCode('');
                            setChangeDietitianError(null);
                            setChangeDietitianSuccess(null);
                        }
                    }}
                >
                    <div
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '20px',
                            padding: '30px',
                            maxWidth: '500px',
                            width: '100%',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                            position: 'relative'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => {
                                if (!isChangingDietitian) {
                                    setShowChangeDietitianModal(false);
                                    setInvitationCode('');
                                    setChangeDietitianError(null);
                                    setChangeDietitianSuccess(null);
                                }
                            }}
                            disabled={isChangingDietitian}
                            style={{
                                position: 'absolute',
                                top: '15px',
                                right: '15px',
                                background: 'none',
                                border: 'none',
                                fontSize: '24px',
                                cursor: isChangingDietitian ? 'not-allowed' : 'pointer',
                                color: '#999',
                                width: '30px',
                                height: '30px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '50%',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                if (!isChangingDietitian) {
                                    e.target.style.backgroundColor = '#f0f0f0';
                                    e.target.style.color = '#333';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isChangingDietitian) {
                                    e.target.style.backgroundColor = 'transparent';
                                    e.target.style.color = '#999';
                                }
                            }}
                        >
                            ×
                        </button>

                        <div style={{ marginBottom: '25px' }}>
                            <h2 style={{ 
                                margin: '0 0 10px 0', 
                                color: '#2c3e50', 
                                fontSize: '24px'
                            }}>
                                Diyetisyen Değiştir
                            </h2>
                            <p style={{ 
                                margin: 0, 
                                color: '#7f8c8d', 
                                fontSize: '14px' 
                            }}>
                                Yeni diyetisyeninizin davet kodunu girin.
                            </p>
                        </div>

                        <form onSubmit={handleChangeDietitian}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ 
                                    display: 'block', 
                                    marginBottom: '8px', 
                                    fontWeight: '600', 
                                    color: '#555', 
                                    fontSize: '14px' 
                                }}>
                                    📝 Davet Kodu:
                                </label>
                                <input
                                    type="text"
                                    value={invitationCode}
                                    onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                                    placeholder="Örn: E46F2B64"
                                    required
                                    disabled={isChangingDietitian}
                                    style={{ 
                                        width: '100%', 
                                        padding: '14px', 
                                        borderRadius: '12px', 
                                        border: '2px solid #e5e7eb',
                                        backgroundColor: isChangingDietitian ? '#f5f5f5' : '#f9fafb',
                                        fontSize: '15px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '2px',
                                        transition: 'all 0.3s',
                                        boxSizing: 'border-box'
                                    }}
                                    onFocus={(e) => {
                                        if (!isChangingDietitian) {
                                            e.target.style.borderColor = '#5d8347';
                                            e.target.style.backgroundColor = '#fff';
                                            e.target.style.boxShadow = '0 0 0 4px rgba(93, 131, 71, 0.1)';
                                        }
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e5e7eb';
                                        e.target.style.backgroundColor = isChangingDietitian ? '#f5f5f5' : '#f9fafb';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>

                            {changeDietitianError && (
                                <div style={{ 
                                    marginBottom: '20px', 
                                    padding: '12px 16px',
                                    backgroundColor: '#ffebee',
                                    color: '#c62828',
                                    borderRadius: '10px',
                                    border: '2px solid #ef5350',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                }}>
                                    ⚠️ {changeDietitianError}
                                </div>
                            )}

                            {changeDietitianSuccess && (
                                <div style={{ 
                                    marginBottom: '20px', 
                                    padding: '12px 16px',
                                    backgroundColor: '#e8f5e9',
                                    color: '#2e7d32',
                                    borderRadius: '10px',
                                    border: '2px solid #4caf50',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                }}>
                                    ✅ {changeDietitianSuccess}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!isChangingDietitian) {
                                            setShowChangeDietitianModal(false);
                                            setInvitationCode('');
                                            setChangeDietitianError(null);
                                            setChangeDietitianSuccess(null);
                                        }
                                    }}
                                    disabled={isChangingDietitian}
                                    style={{
                                        flex: 1,
                                        padding: '14px',
                                        backgroundColor: '#6c757d',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontWeight: '600',
                                        fontSize: '15px',
                                        cursor: isChangingDietitian ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.3s'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isChangingDietitian) {
                                            e.target.style.backgroundColor = '#5a6268';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isChangingDietitian) {
                                            e.target.style.backgroundColor = '#6c757d';
                                        }
                                    }}
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isChangingDietitian}
                                    style={{
                                        flex: 2,
                                        padding: '14px',
                                        backgroundColor: isChangingDietitian ? '#9e9e9e' : '#5d8347',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontWeight: '600',
                                        fontSize: '15px',
                                        cursor: isChangingDietitian ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.3s',
                                        boxShadow: isChangingDietitian ? 'none' : '0 4px 15px rgba(93, 131, 71, 0.3)'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isChangingDietitian) {
                                            e.target.style.transform = 'translateY(-2px)';
                                            e.target.style.boxShadow = '0 6px 20px rgba(93, 131, 71, 0.4)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isChangingDietitian) {
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = '0 4px 15px rgba(93, 131, 71, 0.3)';
                                        }
                                    }}
                                >
                                    {isChangingDietitian ? 'İşleniyor...' : 'Değiştir'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default RandevuAl;
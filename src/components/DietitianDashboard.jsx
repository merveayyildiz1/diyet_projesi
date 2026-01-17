import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTodayAppointments, getClientsForDietitian, getAppointmentDetails, getDietitianInfo } from "../services/dataService";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const DietitianDashboard = () => {
  const dietitianId = localStorage.getItem("loggedInUserId");
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [clientsCount, setClientsCount] = useState(0);
  const [invitationCode, setInvitationCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
    
      const todayResult = await getTodayAppointments(dietitianId);
      if (todayResult.success) {
        setTodayAppointments(todayResult.data || []);
      }

     
      const pendingResult = await getAppointmentDetails(dietitianId);
      if (pendingResult.success) {
        setPendingAppointments(pendingResult.data || []);
      }

    
      const clientsResult = await getClientsForDietitian(dietitianId);
      if (clientsResult.success) {
        setClientsCount(clientsResult.data?.length || 0);
      }

      const dietitianInfoResult = await getDietitianInfo(dietitianId);
      console.log('=== DİYETİSYEN BİLGİLERİ DEBUG ===');
      console.log('Sonuç:', dietitianInfoResult);
      console.log('Success:', dietitianInfoResult.success);
      console.log('Data:', dietitianInfoResult.data);
      
      if (dietitianInfoResult.success && dietitianInfoResult.data) {
        const data = dietitianInfoResult.data;
        console.log('Tüm data alanları:', Object.keys(data));
        console.log('InvitationCode değeri (raw):', data.InvitationCode);
        console.log('InvitationCode tipi:', typeof data.InvitationCode);
        
     
        const code = data.InvitationCode || 
                     data.invitationCode || 
                     data.Code ||
                     data.code ||
                     data.InviteCode ||
                     data.inviteCode ||
                     data.DavetKodu ||
                     data.davetKodu || '';
        
        console.log('Bulunan kod:', code);
        console.log('Kod uzunluğu:', code ? code.length : 0);
        console.log('Kod null mu?', code === null);
        console.log('Kod undefined mu?', code === undefined);
        
       
        if (code && code !== null && code !== undefined && code !== 'null' && code.trim() !== '') {
          setInvitationCode(String(code).trim());
          console.log(' Davet kodu başarıyla ayarlandı:', String(code).trim());
        } else {
          console.warn('Davet kodu bulunamadı, NULL veya boş. Tüm data:', JSON.stringify(data, null, 2));
          console.warn(' Bu diyetisyen için InvitationCode NULL olabilir. Veritabanında kontrol edin.');
        }
      } else {
        console.error(' Diyetisyen bilgileri alınamadı:', dietitianInfoResult.message);
        console.error(' Response:', dietitianInfoResult);
      }

      setIsLoading(false);
    };

    if (dietitianId) {
      fetchData();
    }
  }, [dietitianId]);

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
        <p>Yükleniyor...</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="page-title">Ana Sayfa</h1>

      <div className="dashboard-grid">
        {/* SOL TARAF */}
        <div>
          {/* Bugünkü Randevular */}
          <div className="card">
            <h3>📅 Bugünkü Randevular</h3>
            {todayAppointments.length === 0 ? (
              <div className="empty-box">Bugün için randevunuz bulunmuyor.</div>
            ) : (
              <div className="appointment-grid">
                {todayAppointments.map((app, index) => (
                  <div key={index} className="appointment-card">
                    <h4>{app.ClientName}</h4>
                    <p className="appointment-date">
                      {format(new Date(app.AppoinmentTime), "HH:mm", { locale: tr })}
                    </p>
                    <span className="status-badge">Onaylandı</span>
                  </div>
                ))}
              </div>
            )}
          </div>

         
          <div className="card" style={{ marginTop: '20px' }}>
            <h3>⏳ Bekleyen Randevu Talepleri</h3>
            {pendingAppointments.length === 0 ? (
              <div className="empty-box">Bekleyen randevu talebi bulunmuyor.</div>
            ) : (
              <div className="appointment-grid">
                {pendingAppointments.map((app) => (
                  <div key={app.AppointmentID} className="appointment-card">
                    <h4>{app.ClientName}</h4>
                    <p className="appointment-date">
                      {format(new Date(app.AppointmentDate), "dd MMMM yyyy - HH:mm", { locale: tr })}
                    </p>
                    {app.Notes && (
                      <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                        {app.Notes}
                      </p>
                    )}
                    <span className="status-badge" style={{ backgroundColor: '#ff9800' }}>
                      Bekleniyor
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

    
        <div className="dashboard-side">
         
          <div className="card" style={{ 
            marginBottom: '20px',
            backgroundColor: invitationCode ? '#e3f2fd' : '#fff3e0',
            border: invitationCode ? '2px solid #2196F3' : '2px solid #ff9800'
          }}>
            <h4 style={{ margin: '0 0 12px 0', color: invitationCode ? '#1976d2' : '#e65100' }}>
              🔑 Davet Kodunuz
            </h4>
            {invitationCode ? (
              <>
                <div style={{
                  padding: '15px',
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  border: '1px solid #90caf9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px'
                }}>
                  <code style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#1976d2',
                    letterSpacing: '2px',
                    flex: 1,
                    textAlign: 'center'
                  }}>
                    {invitationCode}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(invitationCode);
                      alert('Kod panoya kopyalandı!');
                    }}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#2196F3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#1976d2';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#2196F3';
                    }}
                  >
                    Kopyala
                  </button>
                </div>
                <p style={{ 
                  margin: '12px 0 0 0', 
                  fontSize: '12px', 
                  color: '#666',
                  fontStyle: 'italic'
                }}>
                  Bu kodu danışanlarınızla paylaşın. Kayıt olurken bu kodu kullanacaklar.
                </p>
              </>
            ) : (
              <div style={{
                padding: '15px',
                backgroundColor: '#fff',
                borderRadius: '8px',
                border: '1px solid #ffcc80',
                textAlign: 'center'
              }}>
                <p style={{ 
                  margin: 0, 
                  fontSize: '14px', 
                  color: '#e65100',
                  fontWeight: '500'
                }}>
                  ⚠️ Davet Kodu Yüklenemedi
                </p>
                <p style={{ 
                  margin: '8px 0 0 0', 
                  fontSize: '12px', 
                  color: '#999'
                }}>
                  Backend endpoint'i çalışmıyor veya CORS hatası var.
                </p>
                <p style={{ 
                  margin: '8px 0 0 0', 
                  fontSize: '11px', 
                  color: '#d32f2f',
                  fontWeight: '600'
                }}>
                  🔧 Backend'de şu endpoint'i kontrol edin:
                </p>
                <code style={{
                  display: 'block',
                  margin: '8px 0',
                  padding: '8px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px',
                  fontSize: '11px',
                  color: '#333',
                  wordBreak: 'break-all'
                }}>
                  GET /api/data/dietitian-info/{dietitianId}
                </code>
                <p style={{ 
                  margin: '8px 0 0 0', 
                  fontSize: '11px', 
                  color: '#666'
                }}>
                  Backend'i yeniden başlatın ve CORS ayarlarını kontrol edin.
                </p>
              </div>
            )}
          </div>

       
          <div className="summary-card">
            <h4>📊 İstatistikler</h4>
            <div style={{ marginTop: '15px' }}>
              <p style={{ fontSize: '16px', marginBottom: '10px' }}>
                👥 Toplam Danışan: <strong>{clientsCount}</strong>
              </p>
              <p style={{ fontSize: '16px', marginBottom: '10px' }}>
                📅 Bugünkü Randevular: <strong>{todayAppointments.length}</strong>
              </p>
              <p style={{ fontSize: '16px' }}>
                ⏳ Bekleyen Talepler: <strong>{pendingAppointments.length}</strong>
              </p>
            </div>
          </div>

          <div className="progress-card">
            <h4>⚡ Hızlı Erişim</h4>
            <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link 
                to="/diyetisyen-paneli/danisanlar" 
                style={{ 
                  padding: '12px', 
                  backgroundColor: '#e8f5e9', 
                  borderRadius: '8px', 
                  textDecoration: 'none',
                  color: '#2e7d32',
                  fontWeight: '600',
                  textAlign: 'center',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#c8e6c9';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#e8f5e9';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                👥 Danışanları Görüntüle
              </Link>
              <Link 
                to="/diyetisyen-paneli/randevular" 
                style={{ 
                  padding: '12px', 
                  backgroundColor: '#fff3e0', 
                  borderRadius: '8px', 
                  textDecoration: 'none',
                  color: '#e65100',
                  fontWeight: '600',
                  textAlign: 'center',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#ffe0b2';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#fff3e0';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                📅 Randevuları Yönet
              </Link>
            </div>
          </div>

        
          <div className="tip-card">
            <h4>💡 İpucu</h4>
            <p>Danışanlarınızın günlük beslenme kayıtlarını takip ederek daha etkili diyet planları oluşturabilirsiniz.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default DietitianDashboard;

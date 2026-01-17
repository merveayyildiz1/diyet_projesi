import React, { useState, useEffect } from 'react';
import { getAppointmentDetails, updateAppointmentStatus } from '../services/dataService';
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const RandevularListesi = () => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const diyetisyenId = localStorage.getItem('loggedInUserId');

  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true);
      setError(null);

      const result = await getAppointmentDetails(diyetisyenId);

      if (result.success) {
        setAppointments(result.data);
      } else {
        setError(result.message);
      }
      setIsLoading(false);
    };

    if (diyetisyenId) {
      fetchAppointments();
    } else {
      setError('Diyetisyen ID bulunamadı.');
      setIsLoading(false);
    }
  }, [diyetisyenId]);

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    setProcessingId(appointmentId);
    setSuccessMessage(null);
    setError(null);

    try {
      const result = await updateAppointmentStatus({
        AppointmentID: appointmentId,
        NewStatus: newStatus
      });

      if (result.success) {
        setSuccessMessage(`Randevu ${newStatus === 'Onaylandı' ? 'onaylandı' : 'reddedildi'}.`);
        
        // Listeyi güncelle
        const updatedResult = await getAppointmentDetails(diyetisyenId);
        if (updatedResult.success) {
          setAppointments(updatedResult.data);
        }

        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(result.message || 'Randevu durumu güncellenirken bir hata oluştu.');
        setTimeout(() => setError(null), 5000);
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
        <p>Yükleniyor...</p>
      </div>
    );
  }

  if (error && appointments.length === 0) {
    return (
      <div className="card" style={{ backgroundColor: '#ffebee', border: '2px solid #ef5350' }}>
        <p style={{ color: '#c62828', fontWeight: '600' }}>⚠️ Hata: {error}</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="page-title">Randevu Talepleri</h1>

      {successMessage && (
        <div className="card" style={{ 
          backgroundColor: '#e8f5e9', 
          border: '2px solid #4caf50',
          marginBottom: '20px'
        }}>
          <p style={{ color: '#2e7d32', fontWeight: '600' }}>✅ {successMessage}</p>
        </div>
      )}

      {error && (
        <div className="card" style={{ 
          backgroundColor: '#ffebee', 
          border: '2px solid #ef5350',
          marginBottom: '20px'
        }}>
          <p style={{ color: '#c62828', fontWeight: '600' }}>⚠️ {error}</p>
        </div>
      )}

      {appointments.length === 0 ? (
        <div className="card">
          <div className="empty-box">
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>📅</div>
            <p>Bekleyen yeni randevu talebi bulunmuyor.</p>
          </div>
        </div>
      ) : (
        <div className="dashboard-grid">
          {appointments.map((app) => (
            <div key={app.AppointmentID} className="card">
              <div style={{ marginBottom: '15px' }}>
                <h3 style={{ margin: '0 0 10px 0', color: 'var(--primary-dark)' }}>
                  {app.ClientName}
                </h3>
                <p className="appointment-date" style={{ margin: '5px 0' }}>
                  📅 {format(new Date(app.AppointmentDate), "dd MMMM yyyy - HH:mm", { locale: tr })}
                </p>
                {app.Notes && (
                  <p style={{ 
                    margin: '10px 0', 
                    color: 'var(--text-muted)', 
                    fontSize: '14px',
                    padding: '10px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px'
                  }}>
                    <strong>Not:</strong> {app.Notes}
                  </p>
                )}
                <span 
                  className="status-badge" 
                  style={{ 
                    backgroundColor: '#ff9800',
                    display: 'inline-block',
                    marginTop: '10px'
                  }}
                >
                  {app.Status || 'Bekleniyor'}
                </span>
              </div>

              <div style={{ 
                display: 'flex', 
                gap: '10px', 
                marginTop: '15px',
                paddingTop: '15px',
                borderTop: '1px solid var(--border-soft)'
              }}>
                <button
                  onClick={() => handleStatusUpdate(app.AppointmentID, 'Onaylandı')}
                  disabled={processingId === app.AppointmentID}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: processingId === app.AppointmentID ? '#9e9e9e' : '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: processingId === app.AppointmentID ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    if (processingId !== app.AppointmentID) {
                      e.target.style.backgroundColor = '#45a049';
                      e.target.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (processingId !== app.AppointmentID) {
                      e.target.style.backgroundColor = '#4caf50';
                      e.target.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {processingId === app.AppointmentID ? '⏳ İşleniyor...' : '✅ Onayla'}
                </button>

                <button
                  onClick={() => handleStatusUpdate(app.AppointmentID, 'Reddedildi')}
                  disabled={processingId === app.AppointmentID}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: processingId === app.AppointmentID ? '#9e9e9e' : '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: processingId === app.AppointmentID ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    if (processingId !== app.AppointmentID) {
                      e.target.style.backgroundColor = '#da190b';
                      e.target.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (processingId !== app.AppointmentID) {
                      e.target.style.backgroundColor = '#f44336';
                      e.target.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {processingId === app.AppointmentID ? '⏳ İşleniyor...' : '❌ Reddet'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default RandevularListesi;

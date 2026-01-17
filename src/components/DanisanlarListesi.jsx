import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getClientsForDietitian } from '../services/dataService';

const DanisanlarListesi = () => {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const diyetisyenId = localStorage.getItem('loggedInUserId');

  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true);
      setError(null);
      const result = await getClientsForDietitian(diyetisyenId);
      if (result.success) {
        setClients(result.data);
      } else {
        setError(result.message || 'Danışanlar yüklenirken bir hata oluştu.');
      }
      setIsLoading(false);
    };
    if (diyetisyenId) {
      fetchClients();
    } else {
      setError('Diyetisyen ID bulunamadı.');
      setIsLoading(false);
    }
  }, [diyetisyenId]);

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
        <p>Yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ backgroundColor: '#ffebee', border: '2px solid #ef5350' }}>
        <p style={{ color: '#c62828', fontWeight: '600' }}>⚠️ Hata: {error}</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="page-title">Danışanlar</h1>

      {error && (
        <div className="card" style={{ 
          backgroundColor: '#ffebee', 
          border: '2px solid #ef5350',
          marginBottom: '20px'
        }}>
          <p style={{ color: '#c62828', fontWeight: '600' }}>⚠️ {error}</p>
        </div>
      )}

      {clients.length === 0 ? (
        <div className="card">
          <div className="empty-box">
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>👥</div>
            <p>Size atanmış danışan bulunmuyor.</p>
          </div>
        </div>
      ) : (
        <div className="dashboard-grid">
          {clients.map((client) => (
            <div key={client.UserID} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 10px 0', color: 'var(--primary-dark)' }}>
                    {client.ClientName}
                  </h3>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>
                    Danışan ID: {client.UserID}
                  </p>
                </div>
                <Link
                  to={`/diyetisyen-paneli/danisan/${client.UserID}`}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'var(--primary-dark)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'var(--primary)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  👁️ Detayları Gör
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default DanisanlarListesi;

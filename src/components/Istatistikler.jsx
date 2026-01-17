

import React, { useState, useEffect } from 'react';
import { addWeight, getWeightHistory } from '../services/dataService';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Istatistikler = () => {
  const [weightHistory, setWeightHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state
  const [weight, setWeight] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userId = localStorage.getItem('loggedInUserId');

  // --- HESAPLAMA MANTIĞI İÇİN DEĞİŞKENLER ---
  const [stats, setStats] = useState({
    current: 0,
    start: 0,
    change: 0,
    isLoss: false // Kilo verdiyse true, aldıysa false
  });

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    console.log('=== KİLO GEÇMİŞİ ÇEKİLİYOR ===');
    console.log('userId:', userId);
    
    const result = await getWeightHistory(userId);
    console.log('getWeightHistory sonucu:', result);
    
    if (result.success) {
      console.log('✅ Veri başarıyla alındı');
      console.log('Raw data:', result.data);
      console.log('Data length:', result.data?.length);
      
     
      const sortedData = result.data.sort((a, b) => {
        const dateA = new Date(a.DateRecorded || a.dateRecorded || a.Date);
        const dateB = new Date(b.DateRecorded || b.dateRecorded || b.Date);
        return dateA - dateB;
      });
      
      console.log('Sıralanmış data:', sortedData);
      setWeightHistory(sortedData);

   
      if (sortedData.length > 0) {
        const startWeight = sortedData[0].Weight || sortedData[0].weight;
        const currentWeight = sortedData[sortedData.length - 1].Weight || sortedData[sortedData.length - 1].weight;
        const change = currentWeight - startWeight;

        console.log('İlk kilo:', startWeight, 'Son kilo:', currentWeight, 'Değişim:', change);

        setStats({
          current: currentWeight,
          start: startWeight,
          change: change,
          isLoss: change < 0 
        });
      }
    } else {
      console.error('❌ Veri alınamadı:', result.message);
      setError(result.message);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (userId) fetchHistory();
  }, [userId]);

  const handleAddWeight = async (e) => {
    e.preventDefault();
    const newWeight = parseFloat(weight);
    if (!newWeight || newWeight <= 0) {
      alert("Lütfen geçerli bir kilo girin.");
      return;
    }

    setIsSubmitting(true);
    const result = await addWeight({
      UserID: parseInt(userId),
      Weight: newWeight
    });

    if (result.success) {
      alert('Kilo başarıyla eklendi!');
      setWeight('');
      fetchHistory(); 
    } else {
      alert('Hata: ' + (result.Message || result.message || 'Kilo eklenemedi.'));
    }
    setIsSubmitting(false);
  };


  const chartData = {
    labels: weightHistory.map(entry => {
      const date = entry.DateRecorded || entry.dateRecorded || entry.Date;
      return new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    }),
    datasets: [
      {
        label: 'Kilo (kg)',
        data: weightHistory.map(entry => entry.Weight || entry.weight),
        fill: true, 
        backgroundColor: 'rgba(93, 131, 71, 0.2)', 
        borderColor: 'rgb(93, 131, 71)', 
        tension: 0.3, 
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: 'rgb(93, 131, 71)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }
    ]
  };


  console.log('=== GRAFİK VERİSİ ===');
  console.log('weightHistory:', weightHistory);
  console.log('chartData labels:', chartData.labels);
  console.log('chartData data:', chartData.datasets[0].data);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 className="page-title">İstatistikler & Analiz</h2>
      
      
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        
        
        <div style={{ flex: 2, minWidth: '300px' }}>
     
          <form onSubmit={handleAddWeight} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
            <h3 style={{marginTop:0}}>Yeni Ölçüm Ekle</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Örn: 75.5"
                required
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
              />
              <button type="submit" disabled={isSubmitting} style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                {isSubmitting ? '...' : 'Kaydet'}
              </button>
            </div>
          </form>

          
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <h3 style={{marginTop:0}}>Değişim Grafiği</h3>
            {isLoading ? (
              <p>Veriler yükleniyor...</p>
            ) : error ? (
              <p style={{color:'#c62828'}}>⚠️ Hata: {error}</p>
            ) : weightHistory.length === 0 ? (
              <p style={{color:'#666'}}>Grafiği görmek için ilk kilonuzu ekleyin.</p>
            ) : (
              <div>
                <Line 
                  data={chartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                      legend: {
                        display: true,
                        position: 'top',
                      },
                      tooltip: {
                        enabled: true,
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: false,
                        title: {
                          display: true,
                          text: 'Kilo (kg)'
                        }
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Tarih'
                        }
                      }
                    }
                  }}
                />
             
                <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
                  {weightHistory.length} kayıt gösteriliyor
                </p>
              </div>
            )}
          </div>
        </div>

      
        <div style={{ flex: 1, minWidth: '250px' }}>
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'sticky', top: '20px' }}>
            <h3 style={{ marginTop: 0, color: '#333', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              📊 Genel Özet
            </h3>

            {weightHistory.length === 0 ? (
              <p style={{color:'#999'}}>Veri yok.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
               
                <div>
                  <span style={{ fontSize: '14px', color: '#666' }}>Güncel Kilo</span>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#333' }}>
                    {stats.current} <span style={{fontSize:'16px'}}>kg</span>
                  </div>
                </div>

              
                <div>
                  <span style={{ fontSize: '14px', color: '#666' }}>Başlangıç</span>
                  <div style={{ fontSize: '20px', fontWeight: '600', color: '#555' }}>
                    {stats.start} kg
                  </div>
                </div>

               
                <div style={{ backgroundColor: stats.isLoss ? '#e8f5e9' : '#ffebee', padding: '15px', borderRadius: '10px' }}>
                  <span style={{ fontSize: '14px', color: stats.isLoss ? '#2e7d32' : '#c62828', fontWeight:'bold' }}>
                    Toplam Değişim
                  </span>
                  <div style={{ 
                    fontSize: '28px', 
                    fontWeight: 'bold', 
                    color: stats.isLoss ? '#2e7d32' : '#c62828', // Yeşil (Verdi) veya Kırmızı (Aldı)
                    marginTop: '5px'
                  }}>
                 
                    {stats.change > 0 ? '+' : ''}{stats.change.toFixed(1)} kg
                  </div>
                  <small style={{ color: stats.isLoss ? '#2e7d32' : '#c62828' }}>
                    {stats.isLoss ? 'Harika gidiyorsun! 🎉' : 'Dikkat etmelisin.'}
                  </small>
                </div>

              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Istatistikler;
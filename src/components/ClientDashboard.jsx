import React, { useEffect, useState } from "react";
import { getAppointmentsForClient } from "../services/dataService";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const ClientDashboard = () => {
  const clientUserId = localStorage.getItem("loggedInUserId");
  const [appointments, setAppointments] = useState([]);
  

  const [waterCount, setWaterCount] = useState(() => {
    const savedWater = localStorage.getItem("dailyWaterCount");
    const savedDate = localStorage.getItem("waterDate");
    const today = new Date().toDateString();
    if (savedDate === today && savedWater) return parseInt(savedWater);
    return 0; 
  });


  const [dailyMood, setDailyMood] = useState(() => {
    const savedMood = localStorage.getItem("dailyMood");
    const savedDate = localStorage.getItem("moodDate");
    const today = new Date().toDateString();
    if (savedDate === today && savedMood) return savedMood;
    return null;
  });


  const [goals, setGoals] = useState(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const saved = localStorage.getItem("dailyGoals_v5_" + todayStr);
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, text: "Güne 1 bardak suyla başla 💧", completed: false },
      { id: 2, text: "En az bir öğünde sebze ye 🥦", completed: false },
      { id: 3, text: "Yemeği yavaş ye ve çiğne 🐢", completed: false },
      { id: 4, text: "Paketli gıdadan uzak dur 🚫", completed: false },
      { id: 5, text: "Akşam 8'den sonra yeme 🌙", completed: false },
    ];
  });


  useEffect(() => {
    const fetchData = async () => {
      const result = await getAppointmentsForClient(clientUserId);
      if (result.success) {
        const now = new Date();
        const activeAppointments = result.data.filter(a => {
            const appDate = new Date(a.AppointmentDate);
            return a.Status === "Onaylandı" && appDate > now;
        });
        activeAppointments.sort((a, b) => new Date(a.AppointmentDate) - new Date(b.AppointmentDate));
        setAppointments(activeAppointments);
      }
    };
    fetchData();

  
    const todayStr = new Date().toISOString().split("T")[0];
    const dateKey = "dailyGoals_v5_" + todayStr;
    const savedGoals = localStorage.getItem(dateKey);
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    } else {
      setGoals([
        { id: 1, text: "Güne 1 bardak suyla başla 💧", completed: false },
        { id: 2, text: "En az bir öğünde sebze ye 🥦", completed: false },
        { id: 3, text: "Yemeği yavaş ye ve çiğne 🐢", completed: false },
        { id: 4, text: "Paketli gıdadan uzak dur 🚫", completed: false },
        { id: 5, text: "Akşam 8'den sonra yeme 🌙", completed: false },
      ]);
    }
  }, [clientUserId]);

  
  useEffect(() => {
    const today = new Date().toDateString();
    localStorage.setItem("dailyWaterCount", waterCount);
    localStorage.setItem("waterDate", today);
  }, [waterCount]);

 
  const handleMoodSelect = (mood) => {
    const today = new Date().toDateString();
    setDailyMood(mood);
    localStorage.setItem("dailyMood", mood);
    localStorage.setItem("moodDate", today);
  };

  const increaseWater = () => { setWaterCount(prev => prev + 1); };
  const decreaseWater = () => { if (waterCount > 0) setWaterCount(prev => prev - 1); };

  return (
    <>
      <h1 className="page-title">Ana Sayfa</h1>

      <div className="dashboard-grid">
    
        <div>
          <div className="card">
            <h3>Aktif Randevular</h3>
            {appointments.length === 0 ? (
              <div className="empty-box">Gelecek tarihli onaylanmış randevunuz bulunmuyor.</div>
            ) : (
              <div className="appointment-grid">
                {appointments.map(app => (
                  <div key={app.AppointmentID} className="appointment-card">
                    <h4>{app.DietitianName}</h4>
                    <p className="appointment-date">
                      {format(new Date(app.AppointmentDate), "dd MMMM yyyy - HH:mm", { locale: tr })}
                    </p>
                    <span className="status-badge">Onaylandı</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      
        <div className="dashboard-side">
          <div className="summary-card">
            <h4>📌 Günlük Özet</h4>
            
          
            <div className="mood-section" style={{marginBottom: '15px'}}>
               <p style={{marginBottom: '5px', fontSize:'14px'}}>⚡ Bugün nasıl hissediyorsun?</p>
               <div className="mood-buttons" style={{display:'flex', gap:'10px'}}>
                  {['😫', '😐', '🙂', '🤩'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleMoodSelect(emoji)}
                      style={{
                        fontSize: '24px',
                        background: dailyMood === emoji ? '#e8f5e9' : 'transparent',
                        border: dailyMood === emoji ? '2px solid #4CAF50' : '1px solid #ddd',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        width: '45px',
                        height: '45px',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0'
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
               </div>
            </div>

         
            <div className="water-section">
              <p>💧 Su: <strong>{waterCount} bardak</strong></p>
              <div className="water-controls">
                <button onClick={decreaseWater} className="water-btn minus" disabled={waterCount === 0}>-</button>
                <button onClick={increaseWater} className="water-btn plus">+</button>
              </div>
            </div>
          </div>

          <div className="progress-card">
            <h4>🎯 Günlük Hedef</h4>
            {(() => {
              const completedCount = goals.filter(g => g.completed).length;
              const totalCount = goals.length;
              const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
              
              return (
                <>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${percentage}%`, transition: 'width 0.3s ease' }} />
                  </div>
                  <small>{percentage}% tamamlandı ({completedCount} / {totalCount})</small>
                </>
              );
            })()}
          </div>

          <div className="tip-card">
            <h4>💡 Günün Önerisi</h4>
            <p>Açlık hissettiğinde önce bir bardak su içmeyi dene, bazen susuzluk açlıkla karışabilir.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClientDashboard;
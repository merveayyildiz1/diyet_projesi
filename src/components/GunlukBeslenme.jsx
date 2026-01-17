import React, { useState, useEffect } from "react";
import { getMealsForDay, addMeal } from "../services/dataService";

const GunlukBeslenme = () => {
  const [meals, setMeals] = useState([]);
  const [mealType, setMealType] = useState("Kahvaltı");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  

  const [selectedDateStr, setSelectedDateStr] = useState(new Date().toISOString().split("T")[0]);

  // Günün Hedefleri
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

  const userId = localStorage.getItem("loggedInUserId");

  const mealIcons = {
    "Kahvaltı": "🍳",
    "Öğle Yemeği": "🥗",
    "Akşam Yemeği": "🍲",
    "Ara Öğün": "🍎"
  };

  useEffect(() => {
    if(userId) fetchMeals();
    
    // Hedefleri yönet
    const dateKey = "dailyGoals_v5_" + selectedDateStr;
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
  }, [selectedDateStr, userId]);

  const toggleGoal = (id) => {
    const newGoals = goals.map(goal => 
      goal.id === id ? { ...goal, completed: !goal.completed } : goal
    );
    setGoals(newGoals);
    localStorage.setItem("dailyGoals_v5_" + selectedDateStr, JSON.stringify(newGoals));
  };

  const fetchMeals = async () => {
    setIsLoading(true);
   
    const dateObj = new Date(selectedDateStr + "T00:00:00Z"); 
    
    const result = await getMealsForDay(userId, dateObj);
    if (result && result.success) {
        const reversedMeals = [...result.data].reverse();
        setMeals(reversedMeals);
    } else {
        setMeals([]);
    }
    setIsLoading(false);
  };

  const handleAddMeal = async (e) => {
    e.preventDefault();
    if (!description) return;

    setIsSubmitting(true);

    const now = new Date();

    const timePart = now.toTimeString().split(' ')[0]; 
  
    const localDateTime = `${selectedDateStr}T${timePart}`;

    try {
        const result = await addMeal(parseInt(userId), description, mealType, localDateTime);

        if (result && (result.success || result.Message)) {
            setDescription("");
            setTimeout(() => fetchMeals(), 200);
        } else {
            alert("Ekleme başarısız: " + (result?.message || "Bilinmeyen hata"));
        }
    } catch (error) {
        console.error(error); 
        alert("Bir hata oluştu. Lütfen konsolu kontrol edin.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const setToday = () => {
  
    const today = new Date();

    const offset = today.getTimezoneOffset();
    const localToday = new Date(today.getTime() - (offset*60*1000));
    setSelectedDateStr(localToday.toISOString().split("T")[0]);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <h1 className="page-title" style={{ margin: 0 }}>🍽 Günlük Beslenme</h1>
        
        <div style={{ display: 'flex', gap: '10px', backgroundColor: 'white', padding: '10px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
           <input
              type="date"
              value={selectedDateStr}
              onChange={(e) => setSelectedDateStr(e.target.value)}
              style={{ border: 'none', outline: 'none', fontSize: '16px', fontFamily: 'inherit', color: '#555', cursor: 'pointer' }}
            />
            <button 
              onClick={setToday}
              style={{ padding: '5px 15px', borderRadius: '8px', border: '1px solid #4CAF50', background: 'transparent', color: '#4CAF50', cursor: 'pointer', fontSize: '14px' }}
            >
              Bugün
            </button>
        </div>
      </div>

      <div className="dashboard-grid" style={{ display: 'flex', gap: '25px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        
        {/* SOL TARAF - FORM VE LİSTE */}
        <div style={{ flex: 2, minWidth: '320px' }}>
          
          <div className="card" style={{ marginBottom: '25px', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', backgroundColor: 'white' }}>
            <h3 style={{ marginTop: 0, color: '#2c3e50', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>✨ Yeni Öğün Ekle</h3>
            
            <form onSubmit={handleAddMeal}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '14px', color: '#666' }}>Öğün Tipi</label>
                  <select
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', backgroundColor: '#f9f9f9', fontSize: '15px' }}
                  >
                    <option>Kahvaltı</option>
                    <option>Öğle Yemeği</option>
                    <option>Akşam Yemeği</option>
                    <option>Ara Öğün</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '14px', color: '#666' }}>Neler Yedin?</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Örn: Izgara tavuk, bol salata..."
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', backgroundColor: '#f9f9f9', fontSize: '15px' }}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  backgroundColor: '#5d8347', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '10px', 
                  fontWeight: 'bold', 
                  fontSize: '16px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: '0.3s'
                }}
              >
                {isSubmitting ? 'Ekleniyor...' : '+ Tabağıma Ekle'}
              </button>
            </form>
          </div>

          <div>
            <h3 style={{ color: '#444', marginBottom: '15px' }}>📅 Günün Menüsü</h3>
            
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>Yükleniyor...</div>
            ) : meals.length === 0 ? (
              <div className="empty-box" style={{ padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '15px', border: '2px dashed #ddd', textAlign: 'center', color: '#888' }}>
                <span style={{ fontSize: '30px', display: 'block', marginBottom: '10px' }}>🍽️</span>
                Henüz bu tarihe ait bir kayıt yok.
              </div>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {meals.map((meal, i) => (
                  <li key={i} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    backgroundColor: 'white', 
                    padding: '15px 20px', 
                    borderRadius: '12px', 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    borderLeft: `5px solid ${meal.MealType.toLowerCase().includes('kahvalt') ? '#FFC107' : meal.MealType.toLowerCase().includes('öğle') || meal.MealType.toLowerCase().includes('ogle') ? '#4CAF50' : meal.MealType.toLowerCase().includes('akşam') || meal.MealType.toLowerCase().includes('aksam') ? '#3F51B5' : '#FF5722'}`
                  }}>
                    <div style={{ fontSize: '24px', marginRight: '15px', backgroundColor: '#f0f0f0', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                      {mealIcons[meal.MealType.trim()] || '🍴'}
                    </div>
                    <div>
                      <strong style={{ display: 'block', color: '#333', fontSize: '16px' }}>{meal.MealType}</strong>
                      <span style={{ color: '#666', fontSize: '14px' }}>{meal.FoodName}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* SAĞ TARAF - GÜNÜN HEDEFLERİ */}
        <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <h4 style={{ marginTop: 0, color: '#333', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              ✅ Günün Hedefleri
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {goals.map((goal) => (
                <div 
                  key={goal.id} 
                  onClick={() => toggleGoal(goal.id)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    cursor: 'pointer',
                    padding: '10px',
                    borderRadius: '8px',
                    backgroundColor: goal.completed ? '#e8f5e9' : 'transparent',
                    transition: '0.2s'
                  }}
                >
                  <div style={{ 
                    width: '24px', 
                    height: '24px', 
                    borderRadius: '6px', 
                    border: goal.completed ? 'none' : '2px solid #ddd',
                    backgroundColor: goal.completed ? '#4CAF50' : 'white',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold'
                  }}>
                    {goal.completed && '✓'}
                  </div>
                  <span style={{ 
                    fontSize: '15px', 
                    color: goal.completed ? '#888' : '#333',
                    textDecoration: goal.completed ? 'line-through' : 'none',
                    flex: 1
                  }}>
                    {goal.text}
                  </span>
                </div>
              ))}
            </div>
            
            <p style={{ fontSize: '12px', color: '#999', marginTop: '20px', textAlign: 'center' }}>
              * Hedefler her gün sıfırlanır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GunlukBeslenme;  
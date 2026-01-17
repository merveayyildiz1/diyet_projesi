import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMealsForDay, getWeightHistory, getUserInfo, getClientsForDietitian } from '../services/dataService';
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const DanisanDetay = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();

    const [meals, setMeals] = useState([]);
    const [weightHistory, setWeightHistory] = useState([]);
    const [clientInfo, setClientInfo] = useState(null);
    const [clientName, setClientName] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date()); 
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('beslenme'); 
    
    useEffect(() => {
        if (!id) {
            setError('Danışan ID bulunamadı.');
            setIsLoading(false);
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            
            try {
              
                const userResult = await getUserInfo(id);
                if (userResult.success) {
                    setClientInfo(userResult.data);
                    // İsmi ayarla
                    const firstName = userResult.data.FirstName || userResult.data.firstName || '';
                    const lastName = userResult.data.LastName || userResult.data.lastName || '';
                    const fullName = (firstName + ' ' + lastName).trim();
                    if (fullName) {
                        setClientName(fullName);
                    }
                }

             
                if (!clientName) {
                    const dietitianId = localStorage.getItem('loggedInUserId');
                    if (dietitianId) {
                        const clientsResult = await getClientsForDietitian(dietitianId);
                        if (clientsResult.success && clientsResult.data) {
                            const client = clientsResult.data.find(c => c.UserID == id);
                            if (client && client.ClientName) {
                                setClientName(client.ClientName);
                            }
                        }
                    }
                }

                const weightResult = await getWeightHistory(id);
                if (weightResult.success) {
                    setWeightHistory(weightResult.data || []);
                }

            
                const mealsResult = await getMealsForDay(id, selectedDate);
                if (mealsResult.success) {
                    setMeals(mealsResult.data || []);
                } else {
                    setMeals([]);
                }
            } catch (err) {
                console.error("Veri çekme hatası:", err);
                setError('Veri çekilirken bir hata oluştu.');
            }
            
            setIsLoading(false);
        };

        fetchData();
    }, [id]); 

    useEffect(() => {
        if (!id) return;

        const fetchMeals = async () => {
            try {
                const result = await getMealsForDay(id, selectedDate);
                if (result.success) {
                    setMeals(result.data || []);
                } else {
                    setMeals([]);
                }
            } catch (err) {
                console.error("Öğün çekme hatası:", err);
            }
        };

        fetchMeals();
    }, [id, selectedDate]);

    const handleDateChange = (e) => {
        try {
            setSelectedDate(new Date(e.target.value));
        } catch (err) {
            console.error('Tarih değiştirme hatası:', err);
        }
    };

    const getFoodContent = (item) => {
        if (!item) return "İçerik girilmemiş";
        return item.FoodName || item.foodName || item.Description || item.description || item.Name || item.name || "İçerik girilmemiş";
    };

    const getMealTitle = (item) => {
        if (!item) return "Öğün";
        return item.MealType || item.mealType || item.MealName || item.mealName || "Öğün";
    };

    const getClientName = () => {
        if (clientName) {
            return clientName;
        }
        if (!clientInfo) {
            return '';
        }
        const firstName = clientInfo.FirstName || clientInfo.firstName || '';
        const lastName = clientInfo.LastName || clientInfo.lastName || '';
        const fullName = (firstName + ' ' + lastName).trim();
        return fullName || '';
    };

    if (isLoading) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
                <p>Yükleniyor...</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
         
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
                <button 
                    onClick={() => navigate(-1)} 
                    style={{
                        padding: '6px 10px',
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '14px',
                        transition: 'all 0.3s',
                        height: '32px',
                        width: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'var(--primary-dark)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'var(--primary)';
                    }}
                >
                    ←
                </button>
                <h1 className="page-title" style={{ margin: 0, fontSize: '22px' }}>
                    👤 {getClientName() || `Danışan #${id}`}
                </h1>
            </div>

            {error && (
                <div className="card" style={{ 
                    backgroundColor: '#ffebee', 
                    border: '2px solid #ef5350',
                    marginBottom: '20px'
                }}>
                    <p style={{ color: '#c62828', fontWeight: '600' }}>⚠️ {error}</p>
                </div>
            )}

          
            {clientInfo && (
                <div className="card" style={{ marginBottom: '20px', padding: '18px' }}>
                    <h3 style={{ margin: '0 0 12px 0', color: 'var(--primary-dark)', fontSize: '16px' }}>📋 Kişisel Bilgiler</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                        <div>
                            <p style={{ margin: '0 0 4px 0', color: 'var(--text-muted)', fontSize: '12px' }}>Ad Soyad</p>
                            <p style={{ margin: 0, fontWeight: '600', fontSize: '14px' }}>
                                {getClientName()}
                            </p>
                        </div>
                        {clientInfo.Email && (
                            <div>
                                <p style={{ margin: '0 0 4px 0', color: 'var(--text-muted)', fontSize: '12px' }}>E-posta</p>
                                <p style={{ margin: 0, fontWeight: '600', fontSize: '14px' }}>
                                    {clientInfo.Email || clientInfo.email}
                                </p>
                            </div>
                        )}
                        <div>
                            <p style={{ margin: '0 0 4px 0', color: 'var(--text-muted)', fontSize: '12px' }}>Danışan ID</p>
                            <p style={{ margin: 0, fontWeight: '600', fontSize: '14px' }}>#{id}</p>
                        </div>
                    </div>
                </div>
            )}

          
            <div style={{ 
                display: 'flex', 
                gap: '8px', 
                marginBottom: '20px',
                borderBottom: '2px solid var(--border-soft)'
            }}>
                <button
                    onClick={() => setActiveTab('beslenme')}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: activeTab === 'beslenme' ? 'var(--primary)' : 'var(--primary-dark)',
                        color: 'white',
                        border: 'none',
                        borderBottom: activeTab === 'beslenme' ? '3px solid var(--primary)' : '3px solid transparent',
                        borderRadius: '8px 8px 0 0',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '14px',
                        transition: 'all 0.3s'
                    }}
                >
                    🍽️ Beslenme
                </button>
                <button
                    onClick={() => setActiveTab('kilo')}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: activeTab === 'kilo' ? 'var(--primary)' : 'var(--primary-dark)',
                        color: 'white',
                        border: 'none',
                        borderBottom: activeTab === 'kilo' ? '3px solid var(--primary)' : '3px solid transparent',
                        borderRadius: '8px 8px 0 0',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '14px',
                        transition: 'all 0.3s'
                    }}
                >
                    ⚖️ Kilo Takibi
                </button>
            </div>

         
            {activeTab === 'beslenme' && (
                <>
                    <div className="card" style={{ marginBottom: '20px', padding: '18px' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '8px', 
                            fontWeight: '600',
                            fontSize: '14px',
                            color: 'var(--text-main)'
                        }}>
                            📅 Tarih Seçiniz:
                        </label>
                        <input 
                            type="date" 
                            value={selectedDate.toISOString().split('T')[0]} 
                            onChange={handleDateChange}
                            style={{
                                width: '100%',
                                maxWidth: '250px',
                                padding: '10px',
                                borderRadius: '8px',
                                border: '2px solid var(--border-soft)',
                                backgroundColor: '#f9fafb',
                                fontSize: '14px',
                                transition: 'all 0.3s'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = 'var(--primary)';
                                e.target.style.backgroundColor = '#fff';
                                e.target.style.boxShadow = '0 0 0 4px rgba(91, 124, 90, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'var(--border-soft)';
                                e.target.style.backgroundColor = '#f9fafb';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                    </div>

                    {meals.length === 0 ? (
                        <div className="card" style={{ padding: '40px' }}>
                            <div className="empty-box">
                                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🍽️</div>
                                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                                    {format(selectedDate, "dd MMMM yyyy", { locale: tr })} tarihinde kayıtlı bir öğün bulunmuyor.
                                </p>
                            </div>
                        </div>
                    ) : (() => {
                        
                        const groupedMeals = meals.reduce((acc, meal) => {
                            const mealType = getMealTitle(meal);
                            if (!acc[mealType]) {
                                acc[mealType] = [];
                            }
                            acc[mealType].push(meal);
                            return acc;
                        }, {});

                        return (
                            <div style={{ 
                                display: 'flex', 
                                flexDirection: 'column',
                                gap: '15px' 
                            }}>
                                {Object.entries(groupedMeals).map(([mealType, mealItems]) => (
                                    <div key={mealType} className="card" style={{ padding: '18px' }}>
                                        <h3 style={{ 
                                            margin: '0 0 12px 0', 
                                            color: 'var(--primary-dark)',
                                            fontSize: '18px',
                                            fontWeight: '600'
                                        }}>
                                            {mealType}
                                        </h3>
                                        <div style={{ 
                                            display: 'flex', 
                                            flexDirection: 'column',
                                            gap: '8px'
                                        }}>
                                            {mealItems.map((meal, index) => (
                                                <div key={index} style={{
                                                    padding: '10px 12px',
                                                    backgroundColor: '#f9fafb',
                                                    borderRadius: '8px',
                                                    border: '1px solid var(--border-soft)',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}>
                                                    <p style={{ 
                                                        margin: 0, 
                                                        color: 'var(--text-main)',
                                                        fontSize: '14px',
                                                        flex: 1
                                                    }}>
                                                        {getFoodContent(meal)}
                                                    </p>
                                                    {meal.Calories && (
                                                        <span style={{
                                                            padding: '4px 10px',
                                                            backgroundColor: '#e8f5e9',
                                                            color: '#2e7d32',
                                                            borderRadius: '12px',
                                                            fontSize: '12px',
                                                            fontWeight: '600',
                                                            marginLeft: '10px'
                                                        }}>
                                                            {meal.Calories} kcal
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })()}
                </>
            )}

     
            {activeTab === 'kilo' && (
                <>
                    {weightHistory.length === 0 ? (
                        <div className="card" style={{ padding: '40px' }}>
                            <div className="empty-box">
                                <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚖️</div>
                                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Henüz kilo kaydı bulunmuyor.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="card" style={{ padding: '18px' }}>
                            <h3 style={{ margin: '0 0 15px 0', color: 'var(--primary-dark)', fontSize: '16px' }}>📊 Kilo Geçmişi</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {weightHistory.map((entry, index) => (
                                    <div 
                                        key={index}
                                        style={{
                                            padding: '12px 15px',
                                            backgroundColor: '#f9fafb',
                                            borderRadius: '8px',
                                            border: '1px solid var(--border-soft)',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <div>
                                            <p style={{ margin: '0 0 4px 0', color: 'var(--text-muted)', fontSize: '12px' }}>
                                                {format(new Date(entry.DateRecorded), "dd MMMM yyyy", { locale: tr })}
                                            </p>
                                            <p style={{ margin: 0, fontWeight: '600', fontSize: '16px', color: 'var(--primary-dark)' }}>
                                                {entry.Weight} kg
                                            </p>
                                        </div>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            backgroundColor: 'var(--primary)',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 'bold',
                                            fontSize: '16px'
                                        }}>
                                            ⚖️
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default DanisanDetay;

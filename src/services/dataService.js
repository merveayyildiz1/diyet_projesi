const API_BASE_URL = 'http://localhost:12346/api/data';

/**
 * @param {Response} response
 * @returns {string}
 */

const getErrorMessage = async (response) => {
    try{
        const ErrorData = await response.json();
        return ErrorData.Message || 'Bilinmeyen bir hata.';
    } catch (e) {
        return response.statusText;
    }
};

/** 
 * @param {string} url
 * @param {object} options
 */

const apiFetch = async (url, options = {}) => {
    try {
    const response = await fetch(url, options);

    if (response.ok) {
      // .NET API'miz { success: true, data: [...] } formatında döndürüyor
      const data = await response.json(); 
      if (data.success) {
        return { success: true, data: data.data }; // Sadece 'data' kısmını al
      } else {
        // .NET { success: false, Message: "..." } döndürürse
        return { success: false, message: data.Message || 'Sunucuda bir hata oluştu.' };
      }
    } else {
      // 404, 500 gibi HTTP hataları
      const message = await getErrorMessage(response);
      return { success: false, message: message };
    }
  } catch (error) {
    // Sunucuya hiç ulaşılamazsa (örn: .NET çalışmıyorsa)
    console.error("API Fetch Hatası:", error);
    return { success: false, message: `Sunucuya bağlanılamadı: ${error.message}` };
  }
};



export const getAppointmentDetails = async (dietitianId) => {
    return await apiFetch(`${API_BASE_URL}/appointments-for-dietitian/${dietitianId}`);
};

export const updateAppointmentStatus = async (data) => {
    try {
        const response = await fetch(`${API_BASE_URL}/update-appointment-status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            const result = await response.json();
            return { success: true, message: result.Message || 'Randevu durumu güncellendi.' };
        } else {
            const message = await getErrorMessage(response);
            return { success: false, message: message || 'Randevu durumu güncellenirken bir hata oluştu.' };
        }
    } catch (error) {
        console.error('updateAppointmentStatus hatası:', error);
        return { success: false, message: `Sunucuya bağlanırken hata oluştu: ${error.message}` };
    }
};

// Danışan silme fonksiyonu
export const deleteClient = async (clientId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/delete-client/${clientId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const result = await response.json();
            return { success: true, message: result.Message || 'Danışan başarıyla silindi.' };
        } else {
            const message = await getErrorMessage(response);
            return { success: false, message: message || 'Danışan silinirken bir hata oluştu.' };
        }
    } catch (error) {
        console.error('deleteClient hatası:', error);
        return { success: false, message: `Sunucuya bağlanırken hata oluştu: ${error.message}` };
    }
};

export const getTodayAppointments = async (dietitianId) => {
    return await apiFetch(`${API_BASE_URL}/todays-appointments/${dietitianId}`);
};
export const getMealsForDay = async (userId, date) => {
    const isoDate = date.toISOString().split('T')[0]; // 'YYYY-MM-DD' formatı
    return await apiFetch(`${API_BASE_URL}/get-meals-for-day/${userId}?date=${isoDate}`);
}
export const getClientsForDietitian = async (dietitianId) => {
    return await apiFetch(`${API_BASE_URL}/clients-for-dietitian/${dietitianId}`);
};
export const getAppointmentsForClient = async (userId) => {
  return await apiFetch(`${API_BASE_URL}/appointments-for-clients/${userId}`);
}

export const addMeal = async (userId, foodName, mealType, dateEaten) => {
  try {
    const response = await fetch(`${API_BASE_URL}/add-meal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        UserID: userId, 
        FoodName: foodName, 
        MealType: mealType, 
        DateEaten: dateEaten, // ✅ STRING OLARAK GÖNDER
      }),
    });

    if (response.ok) { 
      const data = await response.json();
      return { success: true, data };
    } else {
      const message = await getErrorMessage(response);
      return { success: false, message };
    }
  } catch (error) {
    console.error("Yemek Ekleme Hatası:", error);
    return { success: false, message: `Yemek eklenirken hata oluştu: ${error.message}` };
  }
};




/**

 * @param {object} requestData - { ClientUserId, DietitianId, AppointmentDate, Notes }
 */
export const requestAppointment = async (requestData) => {
    try {
        console.log('requestAppointment - Gönderilen veri:', requestData); // Debug
        
        // Önce add-appointment endpoint'ini dene
        let response = await fetch(`${API_BASE_URL}/add-appointment`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
        });

        // Eğer 404 dönerse, request-appointment endpoint'ini dene
        if (response.status === 404) {
            console.log('add-appointment bulunamadı, request-appointment deneniyor...');
            response = await fetch(`${API_BASE_URL}/request-appointment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
            });
        }

        let responseData;
        try {
            responseData = await response.json();
        } catch (e) {
            // JSON parse edilemezse
            const text = await response.text();
            console.log('requestAppointment - API Response (text):', text);
            if (response.ok) {
                return { success: true, message: 'Randevu başarıyla oluşturuldu.' };
            }
            return { success: false, message: text || 'Randevu oluşturulamadı.' };
        }

        console.log('requestAppointment - API Response:', responseData); // Debug
        console.log('requestAppointment - Status:', response.status, response.statusText); // Debug

        if (response.ok) {
            // API başarılı response döndürüyorsa
            if (responseData.success) {
                return { success: true, data: responseData.data, message: responseData.message || responseData.Message };
            }
            // Eğer direkt mesaj döndürüyorsa
            if (responseData.Message) {
                return { success: true, message: responseData.Message, data: responseData };
            }
            // Eğer sadece obje döndürüyorsa (AppointmentID varsa başarılı say)
            if (responseData.AppointmentID || responseData.AppointmentId) {
                return { success: true, data: responseData, message: 'Randevu başarıyla oluşturuldu.' };
            }
            // Eğer sadece obje döndürüyorsa
            return { success: true, data: responseData, message: 'Randevu başarıyla oluşturuldu.' };
        } else {
            const message = await getErrorMessage(response);
            return { success: false, message: message || responseData.Message || responseData.message || 'Randevu oluşturulamadı.' };
        }
    } catch (error) {
        console.error('requestAppointment hatası:', error);
        return { success: false, message: `Sunucuya bağlanırken hata oluştu: ${error.message}` };
    }
};


/**

 * @param {object} weightData -
 */
export const addWeight = async (weightData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/add-weight`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(weightData),
        });

        if (response.ok) {
            return await response.json();
        } else {
            const message = await getErrorMessage(response);
            return { success: false, message: message };
        }
    } catch (error) {
        return { success: false, message: 'Sunucuya bağlanırken hata oluştu.' };
    }
};

/**
 * Bir kullanıcının kilo geçmişini çeker
 * @param {number} userId 
 */
/**
 * Kullanıcının diyetisyenini davet koduna göre değiştirir
 * @param {number} clientUserId 
 * @param {string} invitationCode 
 */
export const changeDietitian = async (clientUserId, invitationCode) => {
    try {
        console.log('changeDietitian çağrıldı - clientUserId:', clientUserId, 'invitationCode:', invitationCode);
        
        const response = await fetch(`${API_BASE_URL}/change-dietitian`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ClientUserId: parseInt(clientUserId),
                InvitationCode: invitationCode.trim().toUpperCase()
            })
        });

        console.log('changeDietitian response status:', response.status);

        if (response.ok) {
            const data = await response.json();
            console.log('changeDietitian success response:', data);
            
            // Backend formatını normalize et
            if (data.success) {
                return { 
                    success: true, 
                    message: data.message || data.Message || 'Diyetisyen başarıyla değiştirildi.',
                    data: data.data 
                };
            } else {
                return { 
                    success: false, 
                    message: data.Message || data.message || 'Diyetisyen değiştirilemedi.' 
                };
            }
        } else {
            const message = await getErrorMessage(response);
            console.error('changeDietitian error:', message);
            return { success: false, message: message };
        }
    } catch (error) {
        console.error('changeDietitian catch hatası:', error);
        return { 
            success: false, 
            message: 'Sunucuya bağlanırken hata oluştu: ' + error.message 
        };
    }
};

export const getWeightHistory = async (userId) => {
    try {
        console.log('getWeightHistory çağrıldı - userId:', userId);
        const response = await fetch(`${API_BASE_URL}/weight-history/${userId}`);
        
        console.log('getWeightHistory response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('getWeightHistory raw response:', data);
            
           
           
            if (data.success && data.data) {
                console.log('✅ Backend format: { success: true, data: [...] }');
                return { success: true, data: data.data };
            }
          
            else if (Array.isArray(data)) {
                console.log('✅ Backend format: Array');
                return { success: true, data: data };
            }
          
            else {
                console.log('⚠️ Backend format bilinmiyor, direkt döndürülüyor:', data);
                return { success: true, data: data };
            }
        } else {
            const message = await getErrorMessage(response);
            console.error('❌ getWeightHistory hatası:', message);
            return { success: false, message: message };
        }
    } catch (error) {
        console.error('❌ getWeightHistory catch hatası:', error);
        return { success: false, message: 'Sunucuya bağlanırken hata oluştu.' };
    }
};


export const getUserInfo = async (userId) => {
  const userRole = localStorage.getItem('loggedInUserRole');
  console.log('getUserInfo çağrıldı - userId:', userId, 'role:', userRole);

  const endpoints = [];
  
  endpoints.push(`${API_BASE_URL}/user-details/${userId}`);
  

  if (userRole === 'Danisan') {
    endpoints.push(`${API_BASE_URL}/client-details/${userId}`);
  } else if (userRole === 'Diyetisyen') {
    endpoints.push(`${API_BASE_URL}/dietitian-info/${userId}`);
  }
  
  
  endpoints.push(`${API_BASE_URL}/user-info/${userId}`);

  for (const endpoint of endpoints) {
    try {
      console.log(`getUserInfo - endpoint deneniyor: ${endpoint}`);
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('getUserInfo başarılı - raw data:', data);
        console.log('getUserInfo - data keys:', Object.keys(data));
        console.log('getUserInfo - data type:', typeof data);
        console.log('getUserInfo - data stringified:', JSON.stringify(data, null, 2));
        
    
        let firstName = '';
        let lastName = '';
        let email = '';
        
   
        if (data.FirstName) firstName = data.FirstName;
        if (data.LastName) lastName = data.LastName;
        if (data.Email) email = data.Email;
        
     
        if (!firstName && data.firstName) firstName = data.firstName;
        if (!lastName && data.lastName) lastName = data.lastName;
        if (!email && data.email) email = data.email;
   
        if (!firstName && data.First_Name) firstName = data.First_Name;
        if (!lastName && data.Last_Name) lastName = data.Last_Name;
      
        if ((!firstName || !lastName || !email) && typeof data === 'object') {
          for (const key in data) {
            if (typeof data[key] === 'object' && data[key] !== null && !Array.isArray(data[key])) {
              const nested = data[key];
              if (!firstName && nested.FirstName) firstName = nested.FirstName;
              if (!lastName && nested.LastName) lastName = nested.LastName;
              if (!email && nested.Email) email = nested.Email;
            }
          }
        }
        
   
        if ((!firstName || !lastName) && data.FullName) {
          const nameParts = data.FullName.trim().split(' ');
          if (nameParts.length >= 2) {
            firstName = nameParts[0];
            lastName = nameParts.slice(1).join(' ');
          } else if (nameParts.length === 1) {
            firstName = nameParts[0];
          }
        }
        
        const normalizedData = {
          FirstName: firstName || '',
          LastName: lastName || '',
          Email: email || ''
        };
        
        console.log('getUserInfo - normalized data:', normalizedData);
        
    
        if (!firstName && !lastName && !email) {
          console.warn(`getUserInfo - ${endpoint} endpoint'i kullanıcı bilgilerini (FirstName, LastName, Email) döndürmüyor. Backend'de Users tablosunu JOIN etmeniz gerekiyor.`);
          continue; 
        }
        
        return { success: true, data: normalizedData };
      } else if (response.status !== 404) {
     
        const message = await getErrorMessage(response);
        console.warn(`getUserInfo - ${endpoint} hatası:`, response.status, message);
     
        continue;
      }
    
    } catch (error) {
     
      console.warn(`getUserInfo - ${endpoint} CORS/network hatası:`, error.message);
      continue;
    }
  }


  console.error('getUserInfo - Tüm endpoint\'ler başarısız oldu');
  return { success: false, message: "Kullanıcı bilgileri alınamadı. Backend endpoint'lerini kontrol edin." };
};


export const updateUserInfo = async (userId, userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/update-user-info/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, data: data, message: data.Message || "Bilgiler başarıyla güncellendi." };
    } else {
      const message = await getErrorMessage(response);
      return { success: false, message: message || "Bilgiler güncellenirken bir hata oluştu." };
    }
  } catch (error) {
    console.error("updateUserInfo hatası:", error);
    return { success: false, message: `Sunucuya bağlanırken hata oluştu: ${error.message}` };
  }
};


export const changePassword = async (userId, passwordData) => {
  try {
    console.log('changePassword çağrıldı - userId:', userId);
    console.log('changePassword - passwordData:', passwordData);
    console.log('changePassword - endpoint:', `${API_BASE_URL}/change-password/${userId}`);
    
    const requestBody = {
      UserId: parseInt(userId),
      CurrentPassword: passwordData.CurrentPassword,
      NewPassword: passwordData.NewPassword
    };
    
    console.log('changePassword - requestBody:', requestBody);
    
    const response = await fetch(`${API_BASE_URL}/change-password/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log('changePassword - response status:', response.status);
    console.log('changePassword - response ok:', response.ok);

    if (response.ok) {
      const data = await response.json();
      console.log('changePassword - response data:', data);
      return { success: true, data: data, message: data.Message || data.message || "Şifre başarıyla değiştirildi." };
    } else {
      const message = await getErrorMessage(response);
      console.error('changePassword - hata mesajı:', message);
      return { success: false, message: message || "Şifre değiştirilirken bir hata oluştu." };
    }
  } catch (error) {
    console.error("changePassword hatası:", error);
    return { success: false, message: `Sunucuya bağlanırken hata oluştu: ${error.message}` };
  }
};


export const getDietitianInfo = async (dietitianId) => {
  try {
    console.log('🔍 getDietitianInfo çağrıldı, dietitianId:', dietitianId);
    
  
    try {
      const response = await fetch(`${API_BASE_URL}/dietitian-info/${dietitianId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log('🔍 Response status:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ dietitian-info endpoint\'inden gelen data:', data);
        console.log('✅ Data keys:', Object.keys(data));
        console.log('✅ InvitationCode değeri:', data.InvitationCode);
        return { success: true, data: data };
      } else if (response.status === 404) {
        console.warn('⚠️ dietitian-info endpoint\'i bulunamadı (404). Alternatif yöntem deneniyor...');
      } else {
        const message = await getErrorMessage(response);
        console.warn('⚠️ dietitian-info endpoint hatası:', response.status, message);
      }
    } catch (corsError) {
      console.warn('⚠️ CORS hatası veya endpoint çalışmıyor. Alternatif yöntem deneniyor...', corsError.message);
    }

 
    console.log('⚠️ dietitian-info endpoint çalışmıyor. Backend\'de CORS ayarlarını kontrol edin.');
    return { 
      success: false, 
      message: "Diyetisyen bilgileri endpoint'i çalışmıyor. Backend'de CORS ayarlarını kontrol edin veya endpoint'i ekleyin." 
    };
  } catch (error) {
    console.error("❌ getDietitianInfo hatası:", error);
    return { success: false, message: `Sunucuya bağlanırken hata oluştu: ${error.message}` };
  }
};

export const getMyDietitian = async (clientUserId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/get-my-dietitian?clientUserId=${clientUserId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('getMyDietitian - Backend Response:', data);
      
 
      if (data.FullName || data.Email) {
       
        try {
          const clientDetailsResponse = await fetch(`${API_BASE_URL}/client-details/${clientUserId}`);
          if (clientDetailsResponse.ok) {
            const clientDetails = await clientDetailsResponse.json();
            console.log('Client Details:', clientDetails);
          
            return { 
              success: true, 
              data: {
                ...data,
                DietitianUserID: clientDetails.AssignedDietitianID,
                UserID: clientDetails.AssignedDietitianID
              }
            };
          }
        } catch (e) {
          console.warn('Client details alınamadı, sadece diyetisyen bilgisi döndürülüyor:', e);
        }
        
      
        return { success: true, data: data };
      }
      
      return { success: false, message: "Diyetisyen bilgisi bulunamadı." };
    } else if (response.status === 404) {
      return { success: false, message: "Size atanmış bir diyetisyen bulunamadı." };
    } else {
      const message = await getErrorMessage(response);
      return { success: false, message: message || "Diyetisyen bilgisi alınamadı." };
    }
  } catch (error) {
    console.error("getMyDietitian hatası:", error);
    return { success: false, message: `Sunucuya bağlanırken hata oluştu: ${error.message}` };
  }
};
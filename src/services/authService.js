const API_BASE_URL = "http://localhost:12346/api/auth";
/** 
@param {Response} Response
@returns {string}

*/
const getErrorMessage = async (response) => {
  try {
    const errorData = await response.json();
   
    return errorData.Message || 'Bilinmeyen bir sunucu hatası oluştu.';
  } catch (e) {
   
    return response.statusText; 
  }
};

/** 
@param {string} email
@param {string} password
@returns {object}
"*/

export const login = async (email,password) => {
    try{
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
        },
        body: JSON.stringify({
            Email: email, 
            Password: password,
        }),
    });

    if (response.ok) {
    const data = await response.json();
    return {success: true, data: data}; 
  }else{
    const message = await getErrorMessage(response);
    return {success: false, message: message};
   }
  } catch (error) {
    return {success: false, message: 'Sunucuya bağlanırken bir hata oluştu.'};
  }
};

export const registerClient = async (FirstName, LastName, Email, Password, invitationCode) => {
  try{
    const response = await fetch(`${API_BASE_URL}/register-client`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      FirstName: FirstName,
      LastName: LastName,
      Email: Email,
      Password: Password,
      InvitationCode: invitationCode,
    }),
  });
  if (response.ok) {
    
    return await response.json();
  } else {
    const message = await getErrorMessage(response);
    return {success: false, message: message};
  }
  } catch(error) {
    return {success: false, message: 'Sunucuya bağlanırken bir hata oluştu.'};  
  }
};

export const registerDietitian = async (FirstName, LastName, Email, Password, clinicName) => {
  try{
    const response = await fetch(`${API_BASE_URL}/register-dietitian`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        FirstName: FirstName,
        LastName: LastName,
        Email: Email,
        Password: Password,
        ClinicName: clinicName,
    }),
  }); 
  if (response.ok) {
    return await response.json();
  } else {
    const message = await getErrorMessage(response);
    return {success: false, message: message};
  }
} catch (error) {
  return {success: false, message: 'Sunucuya bağlanırken bir hata oluştu.'};
  } 
};

export const getUserInfo = async (userId) => {
  try {
    const response = await fetch(`http://localhost:12346/api/data/user-info/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, data: data };
    } else {
      const message = await getErrorMessage(response);
      return { success: false, message: message };
    }
  } catch (error) {
    return { success: false, message: 'Sunucuya bağlanırken bir hata oluştu.' };
  }
};


export const changePassword = async (userId, oldPassword, newPassword) => {
  try {
    console.log('authService.changePassword çağrıldı');
    console.log('userId:', userId);
    console.log('endpoint:', `${API_BASE_URL}/change-password`);
    
    const requestBody = {
      UserId: userId,
      OldPassword: oldPassword,
      NewPassword: newPassword,
    };
    
    console.log('requestBody:', requestBody);
    
    const response = await fetch(`${API_BASE_URL}/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log('response status:', response.status);
    console.log('response ok:', response.ok);

    if (response.ok) {
      const data = await response.json();
      console.log('response data:', data);
      return { success: true, message: data.message || data.Message || "Şifre başarıyla değiştirildi." };
    } else {
      const message = await getErrorMessage(response);
      console.error('changePassword hata:', message);
      return { success: false, message: message || "Şifre değiştirilirken bir hata oluştu." };
    }
  } catch (error) {
    console.error('changePassword catch hatası:', error);
    return { success: false, message: `Sunucuya bağlanırken bir hata oluştu: ${error.message}` };
  }
};


export const updateEmail = async (userId, newEmail) => {
  try {
    const response = await fetch(`${API_BASE_URL}/update-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        UserId: userId,
        NewEmail: newEmail,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, message: data.message || data.Message };
    } else {
      const message = await getErrorMessage(response);
      return { success: false, message: message };
    }
  } catch (error) {
    return { success: false, message: 'Sunucuya bağlanırken bir hata oluştu.' };
  }
};


export const updateUserInfo = async (userId, firstName, lastName) => {
  try {
    const response = await fetch(`http://localhost:12346/api/data/update-user-info`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        UserId: userId,
        FirstName: firstName,
        LastName: lastName,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, message: data.message || data.Message };
    } else {
      const message = await getErrorMessage(response);
      return { success: false, message: message };
    }
  } catch (error) {
    return { success: false, message: 'Sunucuya bağlanırken bir hata oluştu.' };
  }
};


export const deleteAccount = async (userId, password) => {
  try {
    console.log('=== HESAP SİLME İŞLEMİ BAŞLATILIYOR ===');
    console.log('deleteAccount çağrıldı - userId:', userId, 'type:', typeof userId);
    console.log('Endpoint:', `${API_BASE_URL}/delete-account`);
    
    const requestBody = {
      UserId: userId,
      Password: password,
    };
    console.log('Gönderilecek body:', requestBody);
    
    const response = await fetch(`${API_BASE_URL}/delete-account`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log('deleteAccount response status:', response.status, response.statusText);
    console.log('deleteAccount response ok:', response.ok);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ deleteAccount başarılı - data:', data);
      return { success: true, message: data.message || data.Message || "Hesabınız başarıyla silindi." };
    } else {
      const errorText = await response.text();
      console.error('❌ deleteAccount response text:', errorText);
      const message = await getErrorMessage(response);
      console.error('❌ deleteAccount hatası:', message);
      return { success: false, message: message || "Hesap silinirken bir hata oluştu." };
    }
  } catch (error) {
    console.error('❌ deleteAccount catch hatası:', error);
    console.error('❌ Error details:', error.message, error.stack);
    return { success: false, message: `Sunucuya bağlanırken bir hata oluştu: ${error.message}` };
  }
};



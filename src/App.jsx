// App.jsx
import React from 'react';

import { Routes, Route, Navigate } from 'react-router-dom';

import './App.css'; 

import AuthPage from './components/AuthPage'; 
import DietitianLayout from './components/DietitianLayout'; 
import ClientLayout from './components/ClientLayout'; 
import DietitianDashboard from './components/DietitianDashboard';
import DanisanlarListesi from './components/DanisanlarListesi';
import RandevularListesi from './components/RandevularListesi';
import ClientDashboard from './components/ClientDashboard';
import DanisanDetay from './components/DanisanDetay.jsx';
import GunlukBeslenme from './components/GunlukBeslenme.jsx';
import RandevuAl from './components/RandevuAl.jsx';
import Istatistikler from './components/Istatistikler.jsx';
import HesapAyarlari from './components/HesapAyarlari.jsx';

function App() {
  return (
    
    <Routes>
      {/* ANA YÖNLENDİRMELER */}

      {/* Kök adres (/) açıldığında kullanıcıyı /login'e yönlendir */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* /login adresine gidildiğinde sekmeli AuthPage'i (Giriş/Kayıt) göster */}
      <Route path="/login" element={<AuthPage />} />

   
      <Route path="/diyetisyen-paneli" element={<DietitianLayout />}>
        <Route index element={<DietitianDashboard />} />
        <Route path="danisanlar" element={<DanisanlarListesi />} />
        <Route path="danisan/:id" element={<DanisanDetay />} />
        <Route path="randevular" element={<RandevularListesi />} />
        <Route path="hesap-ayarlari" element={<HesapAyarlari />} />
      </Route>

     
      <Route path="/danisan-paneli" element={<ClientLayout />}>
        <Route index element={<ClientDashboard />} />
      
        <Route path="gunluk-beslenme" element={<GunlukBeslenme />} />
        <Route path="randevu-al" element={<RandevuAl />} />
        <Route path="istatistikler" element={<Istatistikler />} />
        <Route path="hesap-ayarlari" element={<HesapAyarlari />} />
      </Route>

    </Routes>
   
  );
}

export default App;
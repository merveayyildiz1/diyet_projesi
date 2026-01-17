import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

const ClientLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('loggedInUserId');
    localStorage.removeItem('loggedInUserRole');
    navigate('/login');
  };

  return (
    <div className="layout-container">
    
      <nav className="layout-sidebar">
        <div>
          <h3>Danışan Paneli</h3>

          <ul className="sidebar-menu">
            <li>
              <NavLink
                to="/danisan-paneli"
                end
                className={({ isActive }) =>
                  isActive ? 'active' : ''
                }
              >
                🏠 Ana Sayfa
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/danisan-paneli/gunluk-beslenme"
                className={({ isActive }) =>
                  isActive ? 'active' : ''
                }
              >
                🍽 Günlük Beslenme
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/danisan-paneli/istatistikler"
                className={({ isActive }) =>
                  isActive ? 'active' : ''
                }
              >
                📊 İstatistikler
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/danisan-paneli/randevu-al"
                className={({ isActive }) =>
                  isActive ? 'active' : ''
                }
              >
                📅 Randevu Al
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/danisan-paneli/hesap-ayarlari"
                className={({ isActive }) =>
                  isActive ? 'active' : ''
                }
              >
                ⚙️ Hesap Ayarları
              </NavLink>
            </li>
          </ul>
        </div>

   
        <div className="sidebar-footer">
          <button onClick={handleLogout}>Çıkış Yap</button>
        </div>
      </nav>

     
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
};

export default ClientLayout;

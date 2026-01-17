import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

const DietitianLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('loggedInUserId');
    localStorage.removeItem('loggedInUserRole');
    navigate('/login');
  };

  return (
    <div className="layout-container">
      {/* SIDEBAR */}
      <nav className="layout-sidebar">
        <div>
          <h3>Diyetisyen Paneli</h3>

          <ul className="sidebar-menu">
            <li>
              <NavLink
                to="/diyetisyen-paneli"
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
                to="/diyetisyen-paneli/danisanlar"
                className={({ isActive }) =>
                  isActive ? 'active' : ''
                }
              >
                👥 Danışanlar
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/diyetisyen-paneli/randevular"
                className={({ isActive }) =>
                  isActive ? 'active' : ''
                }
              >
                📅 Randevular
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/diyetisyen-paneli/hesap-ayarlari"
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

export default DietitianLayout;
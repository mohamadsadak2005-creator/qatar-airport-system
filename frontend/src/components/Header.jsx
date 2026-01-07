import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Leaf, Home, PlusCircle, Brain, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

const Header = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  const navItems = [
    { id: 'dashboard', label: t('navigation.dashboard'), icon: Home, path: '/dashboard' },
    { id: 'data-entry', label: t('navigation.dataEntry'), icon: PlusCircle, path: '/data-entry' },
    { id: 'ai-assistant', label: t('navigation.aiAssistant'), icon: Brain, path: '/ai-assistant' },
    { id: 'charts', label: t('navigation.charts'), icon: BarChart3, path: '/charts' }
  ];

  const handleLogout = () => {
    logout();
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <div className="logo-icon">
            <Leaf size={28} />
          </div>
          <div className="logo-text">
            <h1>{t('app.title')}</h1>
            <span>{t('navigation.welcome')}, {user?.username || t('common.user')}</span>
          </div>
        </div>
        
        <nav className="nav">
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        
        <div className="user-actions">
          <LanguageSwitcher />
          
          <div className="user-info">
            <span>{user?.username}</span>
          </div>
          
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>{t('auth.logout')}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
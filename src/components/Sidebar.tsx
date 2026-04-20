import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Wrench, Package, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Sidebar: React.FC = () => {
  const { signOut, user, role } = useAuth();

  const navItems = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard', roles: ['admin', 'operator', 'service_center'] },
    { to: '/intake', icon: <PlusCircle size={20} />, label: 'New Intake', roles: ['admin', 'operator'] },
    { to: '/products', icon: <Package size={20} />, label: 'Products', roles: ['admin', 'operator', 'service_center'] },
    { to: '/service-centers', icon: <Wrench size={20} />, label: 'Service Centers', roles: ['admin'] },
    { to: '/users', icon: <LogOut size={20} />, label: 'User Management', roles: ['admin'] },
  ].filter(item => item.roles.includes(role || 'operator'));

  return (
    <aside style={{
      width: '260px',
      backgroundColor: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0
    }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ color: 'var(--primary)', fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Service Manager</h1>
      </div>

      <nav style={{ padding: '1.5rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
              fontWeight: isActive ? 600 : 500,
              textDecoration: 'none',
              transition: 'var(--transition)'
            })}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '1.5rem 1rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ marginBottom: '1rem', padding: '0 0.5rem' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-main)', margin: 0 }}>Logged in as</p>
          <p className="text-sm text-muted" style={{ margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
        </div>
        <button
          onClick={signOut}
          className="btn"
          style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--danger)', backgroundColor: 'transparent' }}
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

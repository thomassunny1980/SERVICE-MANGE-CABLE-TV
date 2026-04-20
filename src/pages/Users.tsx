import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, Shield, User as UserIcon } from 'lucide-react';

export const Users: React.FC = () => {
  const { role } = useAuth();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('profiles').select('*').order('email');
      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (userId: string, newRole: string) => {
    setUpdating(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (error) throw error;
      setProfiles(profiles.map(p => p.id === userId ? { ...p, role: newRole } : p));
    } catch (error: any) {
      alert(error.message || 'Error updating role');
    } finally {
      setUpdating(null);
    }
  };

  if (role !== 'admin') {
    return <div className="text-center p-8">Access Denied. Only admins can manage users.</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.5rem' }}>User Management</h1>
          <p className="text-muted">Manage user roles and permissions.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', backgroundColor: 'var(--primary-light)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', color: 'var(--primary)' }}>
          <UserPlus size={20} />
          <span className="font-semibold text-sm">Create users via Supabase Auth Dashboard</span>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="text-center p-8">Loading users...</div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>User Email</th>
                  <th>Current Role</th>
                  <th>Change Role</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((profile) => (
                  <tr key={profile.id}>
                    <td className="flex items-center" style={{ gap: '0.75rem' }}>
                      <div style={{ backgroundColor: 'var(--surface-muted)', padding: '0.5rem', borderRadius: 'var(--radius-full)' }}>
                        <UserIcon size={18} className="text-muted" />
                      </div>
                      <span className="font-semibold">{profile.email}</span>
                    </td>
                    <td>
                      <span className={`badge ${profile.role === 'admin' ? 'badge-primary' : profile.role === 'operator' ? 'badge-warning' : 'badge-neutral'}`}>
                        {profile.role.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <select 
                        className="form-select" 
                        style={{ padding: '0.25rem 0.5rem', width: 'auto' }}
                        value={profile.role}
                        onChange={(e) => updateRole(profile.id, e.target.value)}
                        disabled={updating === profile.id}
                      >
                        <option value="admin">Admin</option>
                        <option value="operator">Operator</option>
                        <option value="service_center">Service Center</option>
                      </select>
                    </td>
                    <td className="text-sm text-muted">
                      {updating === profile.id ? 'Updating...' : 'Active'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="card" style={{ marginTop: '2rem', backgroundColor: 'var(--surface-muted)', border: '1px dashed var(--border)' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1rem' }}>
          <Shield size={18} className="text-primary" /> Admin Note
        </h3>
        <p className="text-sm text-muted">
          To create new users, please use the **Authentication** tab in your **Supabase Dashboard**. 
          Once a user is created there, they will automatically appear here where you can assign them specific roles.
        </p>
      </div>
    </div>
  );
};

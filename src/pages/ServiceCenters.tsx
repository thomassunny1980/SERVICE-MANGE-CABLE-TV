import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { MapPin, Phone } from 'lucide-react';

export const ServiceCenters: React.FC = () => {
  const [centers, setCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCenter, setNewCenter] = useState({ name: '', location: '', contact_info: '' });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    setLoading(true);
    try {
      // Demo mode bypass
      if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co') {
        const demoCenters = JSON.parse(localStorage.getItem('demo_centers') || '[]');
        setCenters(demoCenters);
        return;
      }

      const { data, error } = await supabase.from('service_centers').select('*').order('name');
      if (error) throw error;
      setCenters(data || []);
    } catch (error) {
      console.error('Error fetching centers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCenter = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      // Demo mode bypass
      if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co') {
        const demoCenter = {
          ...newCenter,
          id: Math.random().toString(36).substr(2, 9),
          created_at: new Date().toISOString()
        };
        const demoCenters = JSON.parse(localStorage.getItem('demo_centers') || '[]');
        demoCenters.push(demoCenter);
        localStorage.setItem('demo_centers', JSON.stringify(demoCenters));
        
        setCenters([...centers, demoCenter]);
        setShowAddForm(false);
        setNewCenter({ name: '', location: '', contact_info: '' });
        return;
      }

      const { data, error } = await supabase
        .from('service_centers')
        .insert([newCenter])
        .select();

      if (error) throw error;
      if (data) {
        setCenters([...centers, data[0]]);
        setShowAddForm(false);
        setNewCenter({ name: '', location: '', contact_info: '' });
      }
    } catch (error: any) {
      alert(error.message || 'Error adding service center');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.5rem' }}>Service Centers</h1>
          <p className="text-muted">Manage authorized service centers for warranty claims.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : 'Add Service Center'}
        </button>
      </div>

      {showAddForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Add New Center</h2>
          <form onSubmit={handleAddCenter} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Name</label>
              <input type="text" className="form-input" required value={newCenter.name} onChange={e => setNewCenter({...newCenter, name: e.target.value})} placeholder="TechHub Repairs" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Location</label>
              <input type="text" className="form-input" required value={newCenter.location} onChange={e => setNewCenter({...newCenter, location: e.target.value})} placeholder="City, State" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Contact Info</label>
              <input type="text" className="form-input" value={newCenter.contact_info} onChange={e => setNewCenter({...newCenter, contact_info: e.target.value})} placeholder="Email or Phone" />
            </div>
            <button type="submit" className="btn btn-primary" disabled={adding}>
              {adding ? 'Adding...' : 'Save'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading service centers...</div>
      ) : centers.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {centers.map(center => (
            <div key={center.id} className="card">
              <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', color: 'var(--primary)' }}>{center.name}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="flex items-center text-muted" style={{ gap: '0.75rem' }}>
                  <MapPin size={18} />
                  <span>{center.location}</span>
                </div>
                {center.contact_info && (
                  <div className="flex items-center text-muted" style={{ gap: '0.75rem' }}>
                    <Phone size={18} />
                    <span>{center.contact_info}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center card" style={{ padding: '3rem 0', color: 'var(--text-muted)' }}>
          <p>No service centers found. Click "Add Service Center" to create one.</p>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export const Intake: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    productType: 'Set-Top Box',
    serialNumber: '',
    macAddress: '',
    underWarranty: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Demo mode bypass
      if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co') {
        const demoProduct = {
          id: Math.random().toString(36).substr(2, 9),
          customer_id: 'demo-customer',
          product_type: formData.productType,
          serial_number: formData.serialNumber,
          mac_address: formData.macAddress,
          under_warranty: formData.underWarranty,
          status: 'Received',
          created_at: new Date().toISOString(),
          customers: { name: formData.customerName }
        };
        
        // Save to localStorage for demo persistence
        const demoProducts = JSON.parse(localStorage.getItem('demo_products') || '[]');
        demoProducts.push(demoProduct);
        localStorage.setItem('demo_products', JSON.stringify(demoProducts));
        
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network
        navigate('/products');
        return;
      }

      // 1. Create or Find Customer
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .insert([{
          name: formData.customerName,
          contact_number: formData.customerPhone,
          address: formData.customerAddress
        }])
        .select()
        .single();

      if (customerError) throw customerError;

      // 2. Create Product Ticket
      const { error: productError } = await supabase
        .from('products')
        .insert([{
          customer_id: customerData.id,
          product_type: formData.productType,
          serial_number: formData.serialNumber,
          mac_address: formData.macAddress,
          under_warranty: formData.underWarranty,
          status: 'Received'
        }]);

      if (productError) throw productError;

      // Success
      navigate('/products');
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during intake registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>New Service Intake</h1>
      <p className="text-muted" style={{ marginBottom: '2rem' }}>Register a new product for service or warranty claims.</p>

      {error && (
        <div style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger-hover)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.125rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>Customer Information</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" name="customerName" className="form-input" required value={formData.customerName} onChange={handleChange} placeholder="John Doe" />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Number</label>
              <input type="text" name="customerPhone" className="form-input" required value={formData.customerPhone} onChange={handleChange} placeholder="+1 234 567 8900" />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Address</label>
              <textarea name="customerAddress" className="form-textarea" rows={3} value={formData.customerAddress} onChange={handleChange} placeholder="123 Main St, City, State" />
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.125rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>Product Information</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Product Type</label>
              <select name="productType" className="form-select" value={formData.productType} onChange={handleChange}>
                <option value="Set-Top Box">Set-Top Box</option>
                <option value="Modem">Modem</option>
                <option value="Router">Router</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginTop: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" name="underWarranty" checked={formData.underWarranty} onChange={handleChange} style={{ width: '1.25rem', height: '1.25rem' }} />
                <span className="font-semibold" style={{ color: 'var(--primary)' }}>Under Warranty</span>
              </label>
            </div>
            <div className="form-group">
              <label className="form-label">Serial Number (S/N)</label>
              <input type="text" name="serialNumber" className="form-input" required value={formData.serialNumber} onChange={handleChange} placeholder="SN-123456789" />
            </div>
            <div className="form-group">
              <label className="form-label">MAC Address (Optional)</label>
              <input type="text" name="macAddress" className="form-input" value={formData.macAddress} onChange={handleChange} placeholder="00:1A:2B:3C:4D:5E" />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Submitting...' : 'Register Intake'}
          </button>
        </div>
      </form>
    </div>
  );
};

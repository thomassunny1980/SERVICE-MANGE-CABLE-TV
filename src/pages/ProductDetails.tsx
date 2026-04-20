import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Truck, Wrench } from 'lucide-react';

export const ProductDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [serviceCenters, setServiceCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states for dispatch
  const [status, setStatus] = useState('');
  const [serviceCenterId, setServiceCenterId] = useState('');
  const [courierName, setCourierName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [dispatchDate, setDispatchDate] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Demo mode bypass
      if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co') {
        const demoProducts = JSON.parse(localStorage.getItem('demo_products') || '[]');
        const productData = demoProducts.find((p: any) => p.id === id);
        
        if (productData) {
          setProduct(productData);
          setStatus(productData.status || 'Received');
          setServiceCenterId(productData.service_center_id || '');
          setCourierName(productData.courier_name || '');
          setTrackingNumber(productData.tracking_number || '');
          setDispatchDate(productData.dispatch_date || '');
        }

        const demoCenters = JSON.parse(localStorage.getItem('demo_centers') || '[]');
        setServiceCenters(demoCenters);
        return;
      }

      // Fetch Product
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select(`*, customers(*)`)
        .eq('id', id)
        .single();
      
      if (productError) throw productError;
      setProduct(productData);
      
      setStatus(productData.status || 'Received');
      setServiceCenterId(productData.service_center_id || '');
      setCourierName(productData.courier_name || '');
      setTrackingNumber(productData.tracking_number || '');
      setDispatchDate(productData.dispatch_date || '');

      // Fetch Service Centers
      const { data: centersData, error: centersError } = await supabase
        .from('service_centers')
        .select('*');
        
      if (centersError) throw centersError;
      setServiceCenters(centersData || []);
      
    } catch (error) {
      console.error('Error fetching details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Demo mode bypass
      if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co') {
        const demoProducts = JSON.parse(localStorage.getItem('demo_products') || '[]');
        const index = demoProducts.findIndex((p: any) => p.id === id);
        
        if (index !== -1) {
          demoProducts[index] = {
            ...demoProducts[index],
            status,
            service_center_id: serviceCenterId || null,
            courier_name: courierName,
            tracking_number: trackingNumber,
            dispatch_date: dispatchDate || null
          };
          localStorage.setItem('demo_products', JSON.stringify(demoProducts));
          setProduct(demoProducts[index]);
          alert('Product updated successfully (Local Demo)');
        }
        return;
      }

      const { error } = await supabase
        .from('products')
        .update({
          status,
          service_center_id: serviceCenterId || null,
          courier_name: courierName,
          tracking_number: trackingNumber,
          dispatch_date: dispatchDate || null
        })
        .eq('id', id);

      if (error) throw error;
      alert('Product updated successfully');
    } catch (error: any) {
      console.error('Update error:', error);
      alert(error.message || 'Error updating product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading details...</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} className="btn" style={{ background: 'transparent', padding: '0', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
        <ArrowLeft size={20} /> Back to Products
      </button>

      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>{product.product_type} - {product.serial_number}</h1>
          <p className="text-muted">Manage service ticket and dispatch details</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {product.under_warranty ? (
            <span className="badge badge-success text-sm">Under Warranty</span>
          ) : (
            <span className="badge badge-danger text-sm">Out of Warranty</span>
          )}
          <span className="badge badge-neutral text-sm">{status}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Wrench size={18} /> Product Info
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li className="flex justify-between"><span className="text-muted">Type:</span> <span>{product.product_type}</span></li>
            <li className="flex justify-between"><span className="text-muted">S/N:</span> <span>{product.serial_number}</span></li>
            <li className="flex justify-between"><span className="text-muted">MAC:</span> <span>{product.mac_address || 'N/A'}</span></li>
            <li className="flex justify-between"><span className="text-muted">Intake Date:</span> <span>{new Date(product.created_at).toLocaleDateString()}</span></li>
          </ul>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Customer Info</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li className="flex justify-between"><span className="text-muted">Name:</span> <span>{product.customers?.name}</span></li>
            <li className="flex justify-between"><span className="text-muted">Phone:</span> <span>{product.customers?.contact_number}</span></li>
            <li className="flex justify-between"><span className="text-muted">Address:</span> <span style={{ textAlign: 'right', maxWidth: '200px' }}>{product.customers?.address}</span></li>
          </ul>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Truck size={20} className="text-primary" /> Service & Dispatch Routing
        </h2>

        <form onSubmit={handleUpdate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Current Status</label>
              <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="Received">Received</option>
                <option value="In Service">In Service</option>
                <option value="Dispatched">Dispatched</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Assign Service Center</label>
              <select className="form-select" value={serviceCenterId} onChange={(e) => setServiceCenterId(e.target.value)}>
                <option value="">-- Select Center --</option>
                {serviceCenters.map(center => (
                  <option key={center.id} value={center.id}>{center.name} ({center.location})</option>
                ))}
              </select>
            </div>
            
            <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--border)', margin: '1rem 0' }} />

            <div className="form-group">
              <label className="form-label">Courier Name</label>
              <input type="text" className="form-input" value={courierName} onChange={(e) => setCourierName(e.target.value)} placeholder="e.g. FedEx, BlueDart" />
            </div>

            <div className="form-group">
              <label className="form-label">Tracking Number</label>
              <input type="text" className="form-input" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="Tracking ID" />
            </div>

            <div className="form-group">
              <label className="form-label">Dispatch Date</label>
              <input type="date" className="form-input" value={dispatchDate} onChange={(e) => setDispatchDate(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Updates'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

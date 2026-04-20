import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

export const Products: React.FC = () => {
  const { role, serviceCenterId } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Demo mode bypass
      if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co') {
        const demoProducts = JSON.parse(localStorage.getItem('demo_products') || '[]');
        setProducts(demoProducts.reverse());
        return;
      }

      let query = supabase.from('products').select(`*, customers(name)`);

      if (role === 'service_center' && serviceCenterId) {
        query = query.eq('service_center_id', serviceCenterId);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return <span className="badge badge-success">Completed</span>;
      case 'dispatched': return <span className="badge badge-primary">Dispatched</span>;
      case 'in service': return <span className="badge badge-warning">In Service</span>;
      default: return <span className="badge badge-neutral">Received</span>;
    }
  };

  const filteredProducts = products.filter(p => 
    p.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.customers?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.product_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.5rem' }}>Products & Service Tickets</h1>
          <p className="text-muted">View all intakes and manage their service journey.</p>
        </div>
      </div>

      <div className="card">
        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)', width: '1.25rem', height: '1.25rem' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search by S/N, Customer Name or Type..." 
              style={{ paddingLeft: '2.75rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading products...</div>
        ) : filteredProducts.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Product S/N</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Warranty</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="font-semibold">{product.serial_number}</td>
                    <td>{product.customers?.name || 'N/A'}</td>
                    <td className="text-muted">{product.product_type}</td>
                    <td>
                      {product.under_warranty ? (
                        <span className="badge badge-success">Yes</span>
                      ) : (
                        <span className="badge badge-danger">No</span>
                      )}
                    </td>
                    <td>{getStatusBadge(product.status)}</td>
                    <td className="text-sm text-muted">{new Date(product.created_at).toLocaleDateString()}</td>
                    <td>
                      <Link to={`/products/${product.id}`} className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center" style={{ padding: '2rem 0', color: 'var(--text-muted)' }}>
            <p>No products found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

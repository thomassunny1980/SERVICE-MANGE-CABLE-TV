import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Package, Wrench, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { role, serviceCenterId } = useAuth();
  const [stats, setStats] = useState({ received: 0, dispatched: 0, completed: 0, total: 0 });
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Demo mode bypass
      if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co') {
        const demoProducts = JSON.parse(localStorage.getItem('demo_products') || '[]');
        setRecentProducts(demoProducts.slice(-5).reverse());
        
        const counts = demoProducts.reduce((acc: any, curr: any) => {
          const status = curr.status?.toLowerCase() || 'received';
          if (acc[status] !== undefined) acc[status]++;
          acc.total++;
          return acc;
        }, { received: 0, dispatched: 0, completed: 0, total: 0 });
        
        setStats(counts);
        return;
      }

      // Role-based query construction
      let query = supabase.from('products').select(`*, customers(name)`);
      let countQuery = supabase.from('products').select('status');

      if (role === 'service_center' && serviceCenterId) {
        query = query.eq('service_center_id', serviceCenterId);
        countQuery = countQuery.eq('service_center_id', serviceCenterId);
      }

      // Get recent products
      const { data: productsData, error: productsError } = await query
        .order('created_at', { ascending: false })
        .limit(5);

      if (productsError) throw productsError;
      setRecentProducts(productsData || []);

      // Get counts for statuses
      const { data: allProducts, error: countError } = await countQuery;
        
      if (countError) throw countError;
      
      const counts = (allProducts || []).reduce((acc, curr) => {
        const status = curr.status?.toLowerCase() || 'received';
        if (acc[status] !== undefined) {
          acc[status]++;
        }
        acc.total++;
        return acc;
      }, { received: 0, dispatched: 0, completed: 0, total: 0 });
      
      setStats(counts);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.5rem' }}>Dashboard Overview</h1>
          <p className="text-muted">Manage your service operations efficiently.</p>
        </div>
        <Link to="/intake" className="btn btn-primary">
          New Service Intake
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card flex items-center" style={{ gap: '1.5rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 'var(--radius-full)' }}>
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm text-muted font-semibold">Total Intake</p>
            <h2 className="text-2xl">{stats.total}</h2>
          </div>
        </div>

        <div className="card flex items-center" style={{ gap: '1.5rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--warning-light)', color: 'var(--warning-hover)', borderRadius: 'var(--radius-full)' }}>
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-muted font-semibold">Pending / Received</p>
            <h2 className="text-2xl">{stats.received}</h2>
          </div>
        </div>

        <div className="card flex items-center" style={{ gap: '1.5rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--secondary-light)', color: 'var(--secondary-hover)', borderRadius: 'var(--radius-full)' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-muted font-semibold">Completed</p>
            <h2 className="text-2xl">{stats.completed}</h2>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Recent Intakes</h2>
        {recentProducts.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Customer</th>
                  <th>S/N</th>
                  <th>Warranty</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="font-semibold">{product.product_type}</td>
                    <td>{product.customers?.name || 'N/A'}</td>
                    <td className="text-muted">{product.serial_number}</td>
                    <td>
                      {product.under_warranty ? (
                        <span className="badge badge-success">Yes</span>
                      ) : (
                        <span className="badge badge-danger">No</span>
                      )}
                    </td>
                    <td>{getStatusBadge(product.status)}</td>
                    <td className="text-sm text-muted">{new Date(product.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center" style={{ padding: '2rem 0', color: 'var(--text-muted)' }}>
            <p>No service intakes found. Start by creating a new intake.</p>
          </div>
        )}
      </div>
    </div>
  );
};

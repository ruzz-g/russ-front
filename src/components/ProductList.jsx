import { useCallback, useEffect, useState } from 'react';
import { getProducts, deleteProduct, errorMessage } from '../api.js';
import ProductForm from './ProductForm.jsx';
import BeachScene from './BeachScene.jsx';

const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });
const fmtDate = (s) => (s ? new Date(s.replace(' ', 'T')).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) : '');

export default function ProductList({ user, onLogout }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [formFor, setFormFor] = useState(undefined); // undefined = closed, null = add, object = edit
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async (q) => {
    setLoading(true);
    setError('');
    try {
      const res = await getProducts(q);
      setProducts(res.data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // Load on mount and (debounced) whenever the search box changes
  useEffect(() => {
    const t = setTimeout(() => load(search), 300);
    return () => clearTimeout(t);
  }, [search, load]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(''), 3500);
    return () => clearTimeout(t);
  }, [notice]);

  const saved = (message) => {
    setFormFor(undefined);
    setNotice(message);
    load(search);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const res = await deleteProduct(toDelete.id);
      setNotice(res.message);
      setToDelete(null);
      load(search);
    } catch (err) {
      setError(errorMessage(err));
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page">
      <BeachScene />
      <header className="topbar">
        <div className="title">📦 Product Management</div>
        <div className="who">
          <span className="muted">Signed in as <strong>{user?.username}</strong></span>
          <button className="btn" onClick={onLogout}>Logout</button>
        </div>
      </header>

      <main className="container">
        <div className="toolbar">
          <h1>Products <span className="count">{products.length}</span></h1>
          <div className="tools">
            <input className="search" type="search" placeholder="Search by name…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <button className="btn primary" onClick={() => setFormFor(null)}>+ Add product</button>
          </div>
        </div>

        {notice && <div className="alert success">{notice}</div>}
        {error && <div className="alert error">{error}</div>}

        <div className="card table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Product</th>
                <th>Description</th>
                <th className="num">Price</th>
                <th className="num">Qty</th>
                <th>Created</th>
                <th className="actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="empty">Loading products…</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan="7" className="empty">{search ? 'No products match your search.' : 'No products yet. Click “Add product” to create one.'}</td></tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td className="name">{p.product_name}</td>
                    <td className="desc">{p.description || <span className="muted">—</span>}</td>
                    <td className="num">{peso.format(p.price)}</td>
                    <td className="num"><span className={p.quantity === 0 ? 'badge out' : p.quantity < 5 ? 'badge low' : 'badge'}>{p.quantity}</span></td>
                    <td>{fmtDate(p.created_at)}</td>
                    <td className="actions-col">
                      <button className="btn sm" onClick={() => setFormFor(p)}>Edit</button>
                      <button className="btn sm danger" onClick={() => setToDelete(p)}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {formFor !== undefined && <ProductForm product={formFor} onClose={() => setFormFor(undefined)} onSaved={saved} />}

      {toDelete && (
        <div className="modal-backdrop" onMouseDown={() => !deleting && setToDelete(null)}>
          <div className="card modal small" onMouseDown={(e) => e.stopPropagation()}>
            <h2>Delete product?</h2>
            <p>
              You are about to delete <strong>{toDelete.product_name}</strong>. This cannot be undone.
            </p>
            <div className="actions">
              <button className="btn" onClick={() => setToDelete(null)} disabled={deleting}>Cancel</button>
              <button className="btn danger solid" onClick={confirmDelete} disabled={deleting}>{deleting ? 'Deleting…' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

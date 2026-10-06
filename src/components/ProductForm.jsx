import { useState } from 'react';
import { createProduct, updateProduct, errorMessage } from '../api.js';

// Used for both "Add product" (product = null) and "Edit product"
export default function ProductForm({ product, onClose, onSaved }) {
  const editing = Boolean(product);
  const [form, setForm] = useState({
    product_name: product?.product_name ?? '',
    description: product?.description ?? '',
    price: product?.price ?? '',
    quantity: product?.quantity ?? '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    const payload = {
      product_name: form.product_name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      quantity: Number(form.quantity),
    };
    try {
      const res = editing ? await updateProduct(product.id, payload) : await createProduct(payload);
      onSaved(res.message);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form className="card modal" onSubmit={submit} onMouseDown={(e) => e.stopPropagation()}>
        <h2>{editing ? 'Edit product' : 'Add product'}</h2>
        {error && <div className="alert error">{error}</div>}

        <label>
          Product name
          <input value={form.product_name} onChange={set('product_name')} maxLength={100} required autoFocus />
        </label>
        <label>
          Description
          <textarea rows={3} value={form.description} onChange={set('description')} />
        </label>
        <div className="row">
          <label>
            Price (₱)
            <input type="number" min="0" step="0.01" value={form.price} onChange={set('price')} required />
          </label>
          <label>
            Quantity
            <input type="number" min="0" step="1" value={form.quantity} onChange={set('quantity')} required />
          </label>
        </div>

        <div className="actions">
          <button type="button" className="btn" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="btn primary" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Add product'}</button>
        </div>
      </form>
    </div>
  );
}

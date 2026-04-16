/**
 * ProductInventory Component
 * Display and manage product inventory
 */

import { useState, useEffect } from 'react';
import productService from '../services/products';
import { AlertCircle, Plus, Trash2, Edit2 } from 'lucide-react';

export function ProductInventory() {
  const [products, setProducts] = useState([]);
  const [lowStockAlert, setLowStockAlert] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    stock: 0,
    description: '',
  });

  // Load products and stock alerts
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const [allProducts, lowStockItems] = await Promise.all([
        productService.getAll(),
        productService.getStockAlert(5),
      ]);
      setProducts(allProducts);
      setLowStockAlert(lowStockItems);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await productService.update(editingId, formData);
      } else {
        await productService.create(formData);
      }
      setFormData({ name: '', price: 0, stock: 0, description: '' });
      setEditingId(null);
      setIsFormVisible(false);
      await loadProducts();
    } catch (err) {
      setError(err.message || 'Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      price: product.price,
      stock: product.stock,
      description: product.description || '',
    });
    setEditingId(product.id);
    setIsFormVisible(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Hapus produk ini?')) {
      try {
        await productService.delete(id);
        await loadProducts();
      } catch (err) {
        setError(err.message || 'Failed to delete product');
      }
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', price: 0, stock: 0, description: '' });
    setEditingId(null);
    setIsFormVisible(false);
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Inventory Manajemen</h2>
        <button
          onClick={() => setIsFormVisible(!isFormVisible)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Tambah Produk
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Stock Alert */}
      {lowStockAlert.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
          <p className="font-semibold flex items-center gap-2">
            <AlertCircle size={20} />
            {lowStockAlert.length} produk dengan stok rendah
          </p>
          <ul className="mt-2 list-disc list-inside">
            {lowStockAlert.map((p) => (
              <li key={p.id}>
                {p.name} - stok: {p.stock}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Form */}
      {isFormVisible && (
        <form onSubmit={handleAddOrUpdate} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit Produk' : 'Produk Baru'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nama Produk"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
            <input
              type="number"
              placeholder="Harga"
              required
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
            <input
              type="number"
              placeholder="Stok"
              required
              min="0"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
            <textarea
              placeholder="Deskripsi (opsional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 md:col-span-2"
              rows="2"
            />
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              Simpan
            </button>
            <button type="button" onClick={handleCancel} className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500">
              Batal
            </button>
          </div>
        </form>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
            <h4 className="font-semibold text-lg">{product.name}</h4>
            <p className="text-gray-600 text-sm mt-1">{product.description}</p>
            <div className="mt-3 space-y-1">
              <p>
                <span className="font-semibold">Harga:</span> Rp {product.price.toLocaleString('id-ID')}
              </p>
              <p className={`font-semibold ${product.stock <= 5 ? 'text-red-600' : 'text-green-600'}`}>
                Stok: {product.stock}
              </p>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleEdit(product)}
                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Edit2 size={16} />
                Edit
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          <p>Tidak ada produk. Tambahkan produk pertama Anda.</p>
        </div>
      )}
    </div>
  );
}

export default ProductInventory;

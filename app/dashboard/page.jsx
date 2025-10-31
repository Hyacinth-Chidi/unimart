'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon, AlertCircle, CheckCircle, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function VendorDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/my-products`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error(data.message || 'Failed to fetch products');
        }

        setProducts(data.products || []);
        setError('');
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message || 'Failed to load products');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [router]);

  const handleDeleteProduct = async (productId) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error(data.message || 'Failed to delete product');
      }

      setProducts(products.filter((p) => p.id !== productId)); // Changed _id to id
      setSuccess('Product deleted successfully');
      setDeleteConfirm(null);

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete product');
      setTimeout(() => setError(''), 3000);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Vendor Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your products and listings</p>
          </div>
          <Link
            href="/dashboard/create-product"
            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
          >
            <Plus className="w-5 h-5" />
            Add New Product
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-accent/20 border border-accent/30 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <p className="text-accent">{success}</p>
          </div>
        )}

        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-input"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-muted-foreground text-sm mb-2">Total Products</p>
            <p className="text-3xl font-bold text-primary">{products.length}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-muted-foreground text-sm mb-2">Available</p>
            <p className="text-3xl font-bold text-accent">
              {products.filter((p) => p.isAvailable).length}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-muted-foreground text-sm mb-2">Total Value</p>
            <p className="text-3xl font-bold text-green-600">
              ₦{products.reduce((sum, p) => sum + p.price, 0).toLocaleString()}
            </p>
          </div>
        </div>

        {loading ? (
          <div key="loading" className="text-center py-12">
            <div className="inline-block animate-spin mb-4">
              <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full"></div>
            </div>
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-lg">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No Products Yet</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm
                ? 'No products match your search'
                : 'Start by creating your first product listing'}
            </p>
            {!searchTerm && (
              <Link
                href="/dashboard/create-product"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
              >
                <Plus className="w-5 h-5" />
                Create Your First Product
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id} // Changed _id to id
                className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition"
              >
                <div className="relative w-full h-48 bg-secondary/20 flex items-center justify-center overflow-hidden">
                  {product.mainImage ? (
                    <img
                      src={product.mainImage}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No image</p>
                    </div>
                  )}
                  {product.images && product.images.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      +{product.images.length - 1}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground truncate mb-1">{product.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        ₦{product.price.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">{product.category}</p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        product.isAvailable
                          ? 'bg-green-100/20 text-green-600'
                          : 'bg-red-100/20 text-red-600'
                      }`}
                    >
                      {product.isAvailable ? 'Available' : 'Unavailable'}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/edit-product/${product.id}`} // Changed _id to id
                      className="flex-1 flex items-center justify-center gap-2 bg-primary/10 text-primary py-2 rounded-lg hover:bg-primary/20 transition font-medium text-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Link>
                    <button
                      onClick={() => setDeleteConfirm(product.id)} // Changed _id to id
                      className="flex-1 flex items-center justify-center gap-2 bg-destructive/10 text-destructive py-2 rounded-lg hover:bg-destructive/20 transition font-medium text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg p-6 max-w-sm w-full border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-2">Delete Product?</h3>
            <p className="text-muted-foreground mb-6">
              This action cannot be undone. Are you sure you want to delete this product?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-secondary transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProduct(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-destructive text-white rounded-lg hover:opacity-90 transition font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

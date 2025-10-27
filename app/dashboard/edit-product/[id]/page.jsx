'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, X, AlertCircle, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

const PRODUCT_CATEGORIES = [
  'Books',
  'Electronics',
  'Clothing',
  'Food & Beverages',
  'Stationery',
  'Sports Equipment',
  'Furniture',
  'Beauty & Personal Care',
  'Other',
];

export default function EditProduct() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    images: [], // New images as Data URLs
    isAvailable: true,
  });
  const [imagePreviews, setImagePreviews] = useState([]); // For display: [{ id, url }]
  const [existingImages, setExistingImages] = useState([]); // Array of { url, publicId }
  const [allImages, setAllImages] = useState([]); // Combined display images
  const [loading, setLoading] = useState(false);
  const [fetchingProduct, setFetchingProduct] = useState(true);
  const [updatingImages, setUpdatingImages] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  // Validate ObjectId format (24-character hexadecimal)
  const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

  // Combine existing and new images for display
  useEffect(() => {
    const combined = [
      ...existingImages.map((img, index) => ({
        id: `${img.publicId || 'existing'}-${index}`,
        url: img.url,
        type: 'existing',
        publicId: img.publicId,
      })),
      ...imagePreviews.map((img) => ({
        ...img,
        type: 'new',
      })),
    ];
    setAllImages(combined);
  }, [existingImages, imagePreviews]);

  useEffect(() => {
    console.log('Product ID from params:', productId);
    const fetchProduct = async () => {
      if (!productId || !isValidObjectId(productId)) {
        setError('Invalid product ID format');
        setFetchingProduct(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
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
          throw new Error(data.message || 'Failed to fetch product');
        }

        const product = data.product;
        console.log('Fetched product images:', product.images); // Debug

        setFormData({
          name: product.name || '',
          description: product.description || '',
          price: product.price?.toString() || '',
          category: product.category || '',
          images: [], // New images start empty
          isAvailable: product.isAvailable !== undefined ? product.isAvailable : true,
        });

        // Handle images - validate and set existing images
        let validImages = [];
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
          validImages = product.images.filter(
            (img) => 
              img && 
              typeof img === 'object' && 
              img.url && 
              typeof img.url === 'string' &&
              img.url.startsWith('http')
          ).map(img => ({
            url: img.url,
            publicId: img.publicId || '',
          }));
        }

        // Fallback to mainImage if no valid images array
        if (validImages.length === 0 && product.mainImage) {
          validImages = [{
            url: product.mainImage,
            publicId: 'main-image-fallback',
          }];
        }

        console.log('Valid existing images:', validImages); // Debug
        setExistingImages(validImages);
        setImagePreviews([]); // Clear new images

      } catch (err) {
        console.error('Fetch product error:', err);
        setError(err.message || 'Failed to load product');
      } finally {
        setFetchingProduct(false);
      }
    };

    fetchProduct();
  }, [productId, router]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (error) setError('');
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const totalImages = allImages.length;

    if (files.length + totalImages > 3) {
      setError('You can upload a maximum of 3 images total');
      return;
    }

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        const newPreview = {
          id: `${Date.now()}-${Math.random()}`,
          url: dataUrl,
          type: 'new',
        };
        setImagePreviews((prev) => [...prev, newPreview]);
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, dataUrl],
        }));
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (id, type, index) => {
    if (type === 'existing') {
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      setImagePreviews((prev) => prev.filter((img) => img.id !== id));
      setFormData((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Product name is required');
      return;
    }

    if (!formData.description.trim()) {
      setError('Product description is required');
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Please enter a valid price');
      return;
    }

    if (!formData.category) {
      setError('Please select a category');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Updating product with existingImages:', existingImages.length, 'newImages:', formData.images.length);

      const updateData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        isAvailable: formData.isAvailable,
      };

      // Only include images if there are new ones or we're modifying existing
      if (formData.images.length > 0) {
        updateData.images = formData.images; // New images to upload
      }
      if (existingImages.length > 0) {
        updateData.existingImages = existingImages; // Preserve existing
      }

      const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      console.log('PUT response:', data);

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error(data.message || 'Failed to update product');
      }

      // Refetch product to get updated images
      setUpdatingImages(true);
      try {
        const refetchResponse = await fetch(`http://localhost:5000/api/products/${productId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        const refetchData = await refetchResponse.json();
        if (refetchResponse.ok) {
          const updatedProduct = refetchData.product;
          console.log('Refetched updated product:', updatedProduct.images);
          
          // Update existing images with new data
          let newExistingImages = [];
          if (updatedProduct.images && Array.isArray(updatedProduct.images)) {
            newExistingImages = updatedProduct.images.filter(
              (img) => img && img.url && typeof img.url === 'string'
            );
          }
          setExistingImages(newExistingImages);
          setImagePreviews([]); // Clear new images after successful upload
          setFormData(prev => ({ ...prev, images: [] }));
        }
      } catch (refetchError) {
        console.error('Refetch error (non-critical):', refetchError);
      } finally {
        setUpdatingImages(false);
      }

      setSuccess('Product updated successfully!');
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (err) {
      console.error('Update error:', err);
      setError(err.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  // Check if can add more images
  const canAddImages = allImages.length < 3;

  if (fetchingProduct) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin mb-4">
            <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full"></div>
          </div>
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-secondary rounded-lg transition">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Edit Product</h1>
            <p className="text-muted-foreground mt-1">Update your product listing</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Details Form - unchanged */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Product Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="5"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-input resize-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Price (₦) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-input"
                  >
                    <option value="">Select a category...</option>
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isAvailable"
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleInputChange}
                  className="w-4 h-4 border border-border rounded focus:ring-2 focus:ring-primary"
                />
                <label htmlFor="isAvailable" className="text-sm font-medium text-foreground cursor-pointer">
                  Product is available for sale
                </label>
              </div>
            </div>
          </div>

          {/* Images Section */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Product Images</h2>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Upload up to 3 images total. Current: {allImages.length}/3
              </p>

              {allImages.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-foreground mb-3">Images</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {allImages.map((img, index) => (
                      <div key={img.id} className="relative group">
                        <img
                          src={img.url}
                          alt={`Product image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-border"
                          onError={(e) => {
                            console.error('Image load error:', img.url);
                            e.target.src = 'https://via.placeholder.com/150x150?text=No+Image';
                          }}
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 rounded-lg transition flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => removeImage(img.id, img.type, index)}
                            className="opacity-0 group-hover:opacity-100 transition bg-destructive text-white p-2 rounded-full"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        {index === 0 && (
                          <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                            Main
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {canAddImages && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:bg-secondary/30 transition"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Upload className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Click to upload images</p>
                      <p className="text-sm text-muted-foreground">PNG, JPG, GIF up to 5MB each</p>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>
              )}

              {updatingImages && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating images...</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="flex-1 px-6 py-3 border border-border rounded-lg hover:bg-secondary transition font-semibold text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || updatingImages}
              className="flex-1 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                  Updating...
                </>
              ) : (
                'Update Product'
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
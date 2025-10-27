'use client';

import { useState, useRef } from 'react';
import { Upload, X, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const PRODUCT_CATEGORIES = [
  'Books',
  'Electronics',
  'Clothing',
  'Food & Beverages',
  'Stationery',
  'Sports Equipment',
  'Furniture',
  'Beauty & Personal Care',
  'Other'
];

export default function CreateProduct() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    images: []
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);
  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + imagePreviews.length > 3) {
      setError('You can upload a maximum of 3 images');
      return;
    }

    files.forEach(file => {
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
        setImagePreviews(prev => [...prev, {
          id: Date.now() + Math.random(),
          preview: e.target.result
        }]);
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, e.target.result]
        }));
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (id, index) => {
    setImagePreviews(prev => prev.filter(img => img.id !== id));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
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
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Send HTTP-only cookie
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          images: formData.images,
          isAvailable: true // Default for new products
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error(data.message || 'Failed to create product');
      }

      setSuccess('Product created successfully!');
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        images: []
      });
      setImagePreviews([]);

      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (err) {
      setError(err.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2 hover:bg-secondary rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Add New Product</h1>
            <p className="text-muted-foreground mt-1">Create a new product listing</p>
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
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Product Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Used Calculus Textbook"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your product in detail (condition, features, etc.)"
                  rows="5"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-input resize-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Price (₦) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-input appearance-none"
                  >
                    <option value="">Select a category...</option>
                    {PRODUCT_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Product Images</h2>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Upload up to 3 images of your product. The first image will be used as the main product image.
              </p>
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
                    <p className="text-sm text-muted-foreground">or drag and drop</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, GIF up to 5MB each (Max 3 images)
                  </p>
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
              {imagePreviews.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-foreground mb-3">
                    {imagePreviews.length} image{imagePreviews.length !== 1 ? 's' : ''} selected
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {imagePreviews.map((img, index) => (
                      <div key={img.id} className="relative group">
                        <img
                          src={img.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-border"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 rounded-lg transition flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => removeImage(img.id, index)}
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
              disabled={loading}
              className="flex-1 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Product...' : 'Create Product'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

// 'use client';

// import { useState, useRef } from 'react';
// import { Upload, X, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
// import Link from 'next/link';

// const PRODUCT_CATEGORIES = [
//   'Books',
//   'Electronics',
//   'Clothing',
//   'Food & Beverages',
//   'Stationery',
//   'Sports Equipment',
//   'Furniture',
//   'Beauty & Personal Care',
//   'Other'
// ];

// export default function CreateProduct() {
//   const [formData, setFormData] = useState({
//     name: '',
//     description: '',
//     price: '',
//     category: '',
//     images: []
//   });

//   const [imagePreviews, setImagePreviews] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const fileInputRef = useRef(null);

//   // Handle text input change
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//     if (error) setError('');
//   };

//   // Handle image selection
//   const handleImageSelect = (e) => {
//     const files = Array.from(e.target.files || []);
    
//     // Limit to 3 images
//     if (files.length + imagePreviews.length > 3) {
//       setError('You can upload a maximum of 3 images');
//       return;
//     }

//     // Convert files to base64
//     files.forEach(file => {
//       if (!file.type.startsWith('image/')) {
//         setError('Only image files are allowed');
//         return;
//       }

//       if (file.size > 5 * 1024 * 1024) { // 5MB limit
//         setError('Image size must be less than 5MB');
//         return;
//       }

//       const reader = new FileReader();
//       reader.onload = (e) => {
//         setImagePreviews(prev => [...prev, {
//           id: Date.now() + Math.random(),
//           preview: e.target.result
//         }]);
//         setFormData(prev => ({
//           ...prev,
//           images: [...prev.images, e.target.result]
//         }));
//       };
//       reader.readAsDataURL(file);
//     });

//     // Reset input
//     if (fileInputRef.current) {
//       fileInputRef.current.value = '';
//     }
//   };

//   // Remove image
//   const removeImage = (id, index) => {
//     setImagePreviews(prev => prev.filter(img => img.id !== id));
//     setFormData(prev => ({
//       ...prev,
//       images: prev.images.filter((_, i) => i !== index)
//     }));
//   };

//   // Handle form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Validate
//     if (!formData.name.trim()) {
//       setError('Product name is required');
//       return;
//     }

//     if (!formData.description.trim()) {
//       setError('Product description is required');
//       return;
//     }

//     if (!formData.price || parseFloat(formData.price) <= 0) {
//       setError('Please enter a valid price');
//       return;
//     }

//     if (!formData.category) {
//       setError('Please select a category');
//       return;
//     }

//     setLoading(true);
//     setError('');
//     setSuccess('');

//     try {
//       const token = localStorage.getItem('token');

//       if (!token) {
//         window.location.href = '/auth/login';
//         return;
//       }

//       const response = await fetch('http://localhost:5000/api/products/create', {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           name: formData.name,
//           description: formData.description,
//           price: parseFloat(formData.price),
//           category: formData.category,
//           images: formData.images // Array of base64 images
//         })
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || 'Failed to create product');
//       }

//       setSuccess('Product created successfully!');
      
//       // Reset form
//       setFormData({
//         name: '',
//         description: '',
//         price: '',
//         category: '',
//         images: []
//       });
//       setImagePreviews([]);

//       // Redirect after 2 seconds
//       setTimeout(() => {
//         window.location.href = '/dashboard';
//       }, 2000);

//     } catch (err) {
//       setError(err.message || 'Failed to create product');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       {/* Header */}
//       <header className="bg-card border-b border-border">
//         <div className="max-w-4xl mx-auto px-4 py-6 flex items-center gap-4">
//           <Link
//             href="/dashboard"
//             className="p-2 hover:bg-secondary rounded-lg transition"
//           >
//             <ArrowLeft className="w-5 h-5 text-foreground" />
//           </Link>
//           <div>
//             <h1 className="text-3xl font-bold text-foreground">Add New Product</h1>
//             <p className="text-muted-foreground mt-1">Create a new product listing</p>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="max-w-4xl mx-auto px-4 py-8">
//         {/* Alerts */}
//         {error && (
//           <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
//             <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
//             <p className="text-destructive">{error}</p>
//           </div>
//         )}

//         {success && (
//           <div className="mb-6 p-4 bg-accent/20 border border-accent/30 rounded-lg flex items-start gap-3">
//             <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
//             <p className="text-accent">{success}</p>
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Product Details Card */}
//           <div className="bg-card border border-border rounded-lg p-6">
//             <h2 className="text-xl font-semibold text-foreground mb-6">Product Details</h2>

//             <div className="space-y-4">
//               {/* Product Name */}
//               <div>
//                 <label className="block text-sm font-medium text-foreground mb-2">
//                   Product Name *
//                 </label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleInputChange}
//                   placeholder="e.g., Used Calculus Textbook"
//                   className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-input"
//                 />
//               </div>

//               {/* Description */}
//               <div>
//                 <label className="block text-sm font-medium text-foreground mb-2">
//                   Description *
//                 </label>
//                 <textarea
//                   name="description"
//                   value={formData.description}
//                   onChange={handleInputChange}
//                   placeholder="Describe your product in detail (condition, features, etc.)"
//                   rows="5"
//                   className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-input resize-none"
//                 />
//               </div>

//               {/* Price */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-foreground mb-2">
//                     Price (₦) *
//                   </label>
//                   <input
//                     type="number"
//                     name="price"
//                     value={formData.price}
//                     onChange={handleInputChange}
//                     placeholder="0.00"
//                     step="0.01"
//                     min="0"
//                     className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-input"
//                   />
//                 </div>

//                 {/* Category */}
//                 <div>
//                   <label className="block text-sm font-medium text-foreground mb-2">
//                     Category *
//                   </label>
//                   <select
//                     name="category"
//                     value={formData.category}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-input appearance-none"
//                   >
//                     <option value="">Select a category...</option>
//                     {PRODUCT_CATEGORIES.map(cat => (
//                       <option key={cat} value={cat}>
//                         {cat}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Image Upload Card */}
//           <div className="bg-card border border-border rounded-lg p-6">
//             <h2 className="text-xl font-semibold text-foreground mb-6">Product Images</h2>

//             <div className="space-y-4">
//               <p className="text-sm text-muted-foreground">
//                 Upload up to 3 images of your product. The first image will be used as the main product image.
//               </p>

//               {/* Upload Area */}
//               <div
//                 onClick={() => fileInputRef.current?.click()}
//                 className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:bg-secondary/30 transition"
//               >
//                 <div className="flex flex-col items-center gap-3">
//                   <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
//                     <Upload className="w-6 h-6 text-primary" />
//                   </div>
//                   <div>
//                     <p className="font-medium text-foreground">Click to upload images</p>
//                     <p className="text-sm text-muted-foreground">or drag and drop</p>
//                   </div>
//                   <p className="text-xs text-muted-foreground">
//                     PNG, JPG, GIF up to 5MB each (Max 3 images)
//                   </p>
//                 </div>
//                 <input
//                   ref={fileInputRef}
//                   type="file"
//                   multiple
//                   accept="image/*"
//                   onChange={handleImageSelect}
//                   className="hidden"
//                 />
//               </div>

//               {/* Image Previews */}
//               {imagePreviews.length > 0 && (
//                 <div>
//                   <p className="text-sm font-medium text-foreground mb-3">
//                     {imagePreviews.length} image{imagePreviews.length !== 1 ? 's' : ''} selected
//                   </p>
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                     {imagePreviews.map((img, index) => (
//                       <div key={img.id} className="relative group">
//                         <img
//                           src={img.preview}
//                           alt={`Preview ${index + 1}`}
//                           className="w-full h-32 object-cover rounded-lg border border-border"
//                         />
//                         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 rounded-lg transition flex items-center justify-center">
//                           <button
//                             type="button"
//                             onClick={() => removeImage(img.id, index)}
//                             className="opacity-0 group-hover:opacity-100 transition bg-destructive text-white p-2 rounded-full"
//                           >
//                             <X className="w-4 h-4" />
//                           </button>
//                         </div>
//                         {index === 0 && (
//                           <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
//                             Main
//                           </div>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Submit Button */}
//           <div className="flex gap-3">
//             <Link
//               href="/dashboard"
//               className="flex-1 px-6 py-3 border border-border rounded-lg hover:bg-secondary transition font-semibold text-center"
//             >
//               Cancel
//             </Link>
//             <button
//               type="submit"
//               disabled={loading}
//               className="flex-1 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {loading ? 'Creating Product...' : 'Create Product'}
//             </button>
//           </div>
//         </form>
//       </main>
//     </div>
//   );
// }
'use client';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function AddProductPage() {
  // --- ADD PRODUCT STATES ---
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    tag: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // NEW: --- EDIT PRODUCT STATES ---
  const [editingProduct, setEditingProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    price: '',
    tag: '',
  });
  const [editImageFile, setEditImageFile] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  // --- FETCH PRODUCTS STATE ---
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  // --- HANDLERS FOR ADDING ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      setMessage('Please select an image.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('tag', formData.tag);
      data.append('image', imageFile);

      const res = await fetch('/api/products/add', {
        method: 'POST',
        body: data,
      });

      const contentType = res.headers.get('content-type');
      let result = {};

      if (contentType && contentType.includes('application/json')) {
        result = await res.json();
      } else {
        const errorText = await res.text();
        console.error('Server returned non-JSON response:', errorText);
        throw new Error('Server returned an invalid response format.');
      }

      if (res.ok) {
        setMessage('Product added successfully!');
        setFormData({ title: '', description: '', price: '', tag: '' });
        setImageFile(null);
        setPreview(null);
        fetchProducts(); // NEW: Refresh list after adding
      } else {
        setMessage(result.error || 'Failed to add product.');
      }
    } catch (err) {
      console.error(err);
      setMessage(err.message || 'An error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };

  // --- FETCH DATA ---
  async function fetchProducts() {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();

      if (res.ok) {
        setProducts(data.products);
      } else {
        setError(data.error || 'Failed to load products');
      }
    } catch (err) {
      console.error(err);
      setError('Error connecting to server');
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  // NEW: --- HANDLERS FOR EDITING ---
  const openEditModal = (product) => {
    setEditingProduct(product);
    setEditFormData({
      title: product.title,
      description: product.description,
      price: product.price,
      tag: product.tag || '',
    });
    setEditImageFile(null);
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditImageFile(file);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);

    try {
      const data = new FormData();
      data.append('id', editingProduct._id);
      data.append('title', editFormData.title);
      data.append('description', editFormData.description);
      data.append('price', editFormData.price);
      data.append('tag', editFormData.tag);
      if (editImageFile) {
        data.append('image', editImageFile);
      }

      // NOTE: You will need to create this API route if you don't have it yet!
      const res = await fetch('/api/products', {
        method: 'PUT', // or PATCH
        body: data,
      });

      if (res.ok) {
        alert('Product updated successfully!');
        setEditingProduct(null); // Close modal
        fetchProducts(); // Refresh list
      } else {
        const result = await res.json();
        alert(result.error || 'Failed to update product.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while updating.');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <>
      <div className="max-w-xl mx-auto p-6 my-10 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Add New Product</h1>

        {message && (
          <div className="mb-4 p-3 rounded bg-blue-50 text-blue-700 text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
            {/* ... Your Existing Add Form Code Stays Here ... */}
            <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea name="description" value={formData.description} onChange={handleChange} required rows="3" className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price (OMR) *</label>
              <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tag (Optional)</label>
              <select name="tag" value={formData.tag} onChange={handleChange} className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">None</option>
                <option value="Trending">Trending</option>
                <option value="New">New</option>
                <option value="Sale">Sale</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Product Image *</label>
            <input type="file" accept="image/*" onChange={handleImageChange} required className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
            {preview && (
              <div className="mt-3">
                <img src={preview} alt="Preview" className="h-32 w-32 object-cover rounded-md border" />
              </div>
            )}
          </div>
          <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition disabled:bg-gray-400">
            {loading ? 'Uploading...' : 'Save Product'}
          </button>
        </form>
      </div>

      {/* Main Product Grid Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
            Uploaded Products
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            return (
              <div
                key={product._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col group"
              >
                <div className="relative aspect-square w-full bg-gray-100 overflow-hidden">
                  {product.tag && (
                    <span className="absolute top-3 left-3 bg-amber-900 text-white text-xs px-2.5 py-1 rounded-full font-semibold z-10 shadow-sm">
                      {product.tag}
                    </span>
                  )}
                  <Image
                    src={product.imageUrl}
                    alt={product.title}
                    fill
                    sizes="(max-w-640px) 100vw, (max-w-768px) 50vw, (max-w-1024px) 33vw, 25vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-base md:text-lg tracking-tight line-clamp-1">
                      {product.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between gap-2">
                    <span className="text-xl font-extrabold text-gray-900">
                      <span>OMR</span> {Number(product.price).toFixed(2)}
                    </span>
                    
                    {/* NEW: Edit Button */}
                    <button
                      onClick={() => openEditModal(product)}
                      className="text-indigo-600 hover:text-indigo-800 font-medium text-sm bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* NEW: EDIT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
            
            {/* Close Button */}
            <button 
              onClick={() => setEditingProduct(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4 text-gray-800">Edit Product</h2>
            
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input type="text" name="title" value={editFormData.title} onChange={handleEditChange} required className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description *</label>
                <textarea name="description" value={editFormData.description} onChange={handleEditChange} required rows="3" className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price (OMR) *</label>
                  <input type="number" step="0.01" name="price" value={editFormData.price} onChange={handleEditChange} required className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tag</label>
                  <select name="tag" value={editFormData.tag} onChange={handleEditChange} className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">None</option>
                    <option value="Trending">Trending</option>
                    <option value="New">New</option>
                    <option value="Sale">Sale</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Update Image (Optional)</label>
                <input type="file" accept="image/*" onChange={handleEditImageChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                <p className="text-xs text-gray-400 mt-1">Leave blank to keep existing image</p>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setEditingProduct(null)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 transition">
                  Cancel
                </button>
                <button type="submit" disabled={editLoading} className="flex-1 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition disabled:bg-gray-400">
                  {editLoading ? 'Updating...' : 'Update Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
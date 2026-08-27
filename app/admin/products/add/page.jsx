'use client';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function AddProductPage() {
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

      // Safely check if the response is JSON
      const contentType = res.headers.get('content-type');
      let result = {};

      if (contentType && contentType.includes('application/json')) {
        result = await res.json();
      } else {
        // If not JSON, capture the raw response string (e.g. server error text)
        const errorText = await res.text();
        console.error('Server returned non-JSON response:', errorText);
        throw new Error('Server returned an invalid response format.');
      }

      if (res.ok) {
        setMessage('Product added successfully!');
        setFormData({ title: '', description: '', price: '', tag: '' });
        setImageFile(null);
        setPreview(null);
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



  // Start to Fetch Data and saved in state Variables
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
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
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // End



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
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="3"
              className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price (OMR) *</label>
              <input
                type="number"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tag (Optional)</label>
              <select
                name="tag"
                value={formData.tag}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">None</option>
                <option value="Trending">Trending</option>
                <option value="New">New</option>
                <option value="Sale">Sale</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Product Image *</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {preview && (
              <div className="mt-3">
                <img
                  src={preview}
                  alt="Preview"
                  className="h-32 w-32 object-cover rounded-md border"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition disabled:bg-gray-400"
          >
            {loading ? 'Uploading...' : 'Save Product'}
          </button>
        </form>
      </div>

      {/* 3. Main Product Grid Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
            Featured Products
          </h2>
        </div>

        {/* Responsive Grid Setup: 1 Column Mobile -> 2 Tablet -> 3 Medium Screen -> 4 Desktop */}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => {

            return (
              <div
                key={product._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col group"
              >
                {/* Product Image Container */}
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

                {/* Product Info & Action Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Title */}
                    <h3 className="font-semibold text-gray-800 text-base md:text-lg tracking-tight group-hover:text-amber-700 transition-colors line-clamp-1">
                      {product.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Pricing & Dynamic Cart Control */}
                  <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between gap-2">
                    <span className="text-xl font-extrabold text-gray-900">
                      <span>OMR</span> {product.price.toFixed(2)}
                    </span>

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
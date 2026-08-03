'use client';

import { useState } from 'react';

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

  return (
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
  );
}
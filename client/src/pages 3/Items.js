import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Items.css';

const Items = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get('/api/items');
        setItems(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch items');
        console.error('Error fetching items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  if (loading) return <div className="loading">Loading items...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="items">
      <h1>Items</h1>
      <p>Data fetched from Express backend API</p>
      
      <div className="items-grid">
        {items.map((item) => (
          <div key={item.id} className="item-card">
            <h3>{item.name}</h3>
            <p>ID: {item.id}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Items; 
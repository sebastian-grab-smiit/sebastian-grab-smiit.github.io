// src/hooks/useGeocode.js
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function useGeocode(addresses) {
  const [coords, setCoords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchAll() {
      try {
        setLoading(true);
        const results = await Promise.all(
          addresses.map(async (address) => {
            if (!address) return { lat: null, lng: null };
            const res = await axios.get(
              'https://nominatim.openstreetmap.org/search',
              { params: { q: address, format: 'json', limit: 1 } }
            );
            if (res.data && res.data.length > 0) {
              const { lat, lon } = res.data[0];
              return { lat: parseFloat(lat), lng: parseFloat(lon) };
            }
            return { lat: null, lng: null };
          })
        );
        if (!cancelled) setCoords(results);
      } catch (e) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchAll();
    return () => {
      cancelled = true;
    };
  }, [addresses]);

  return { coords, loading, error };
}

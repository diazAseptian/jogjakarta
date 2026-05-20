import { useState, useEffect, useRef } from 'react';
import { ItineraryData, defaultData, subscribeItinerary } from '../data/itinerary';

// Untuk AdminPage: load sekali, tidak di-override listener
export function useItinerary() {
  const [data, setData] = useState<ItineraryData>(defaultData);
  const [loading, setLoading] = useState(true);
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const unsub = subscribeItinerary((incoming) => {
      setData(incoming);
      setLoading(false);
      // Unsubscribe setelah data pertama masuk agar tidak override perubahan lokal
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
    });
    unsubRef.current = unsub;
    return () => {
      if (unsubRef.current) unsubRef.current();
    };
  }, []);

  return { data, setData, loading };
}

// Untuk LandingPage: real-time, selalu update saat admin simpan
export function useItineraryLive() {
  const [data, setData] = useState<ItineraryData>(defaultData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeItinerary((incoming) => {
      setData(incoming);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { data, loading };
}

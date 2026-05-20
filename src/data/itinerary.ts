import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Activity {
  id: string;
  name: string;
  time: string;
  duration: string;
  cost: string;
  description: string;
  address: string;
  mapsUrl: string;
}

export interface DayPlan {
  id: string;
  theme: string;
  activities: Activity[];
}

export interface TripInfo {
  title: string;
  subtitle: string;
  totalPeople: string;
  estimateBudget: string;
  startDate: string;
}

export interface TipItem {
  id: string;
  icon: string;
  title: string;
  desc: string;
}

export interface SiteSettings {
  primaryColor: string;
  footerText: string;
  footerSub: string;
  showTips: boolean;
  adminPassword: string;
  headerImage: string;
}

export interface ItineraryData {
  tripInfo: TripInfo;
  days: DayPlan[];
  tips: TipItem[];
  settings: SiteSettings;
}

const DOC_REF = () => doc(db, 'itinerary', 'main');

export const defaultData: ItineraryData = {
  tripInfo: {
    title: 'Road To Jogjakarta',
    subtitle: 'Itinerary Perjalanan ke Yogyakarta',
    totalPeople: '2 Orang',
    estimateBudget: 'Est. Rp 500rb–1jt/orang',
    startDate: '',
  },
  days: [],
  tips: [
    { id: '1', icon: '🚗', title: 'Transportasi', desc: 'Sewa motor Rp 70–100rb/hari atau gunakan Trans Jogja untuk keliling kota.' },
    { id: '2', icon: '🌤️', title: 'Cuaca', desc: 'Bawa payung atau jas hujan. Yogya bisa hujan tiba-tiba terutama sore hari.' },
    { id: '3', icon: '💵', title: 'Budget', desc: 'Siapkan uang tunai. Banyak warung dan parkir wisata belum pakai QRIS.' },
    { id: '4', icon: '📸', title: 'Foto', desc: 'Datang pagi ke Borobudur dan Prambanan untuk cahaya terbaik dan lebih sepi.' },
    { id: '5', icon: '👟', title: 'Pakaian', desc: 'Pakai sepatu nyaman. Banyak area wisata yang perlu banyak jalan kaki.' },
    { id: '6', icon: '🍽️', title: 'Kuliner', desc: 'Jangan lewatkan Gudeg, Bakmi Jawa, dan Angkringan khas Yogyakarta.' },
  ],
  settings: {
    primaryColor: 'blue',
    footerText: '🗺️ Selamat Berlibur ke Yogyakarta!',
    footerSub: 'Jangan lupa bawa kamera dan semangat petualangan ✨',
    showTips: true,
    adminPassword: 'jogja2025',
    headerImage: '',
  },
};

export const loadItinerary = async (): Promise<ItineraryData> => {
  try {
    const snap = await getDoc(DOC_REF());
    if (!snap.exists()) return defaultData;
    const parsed = snap.data() as Partial<ItineraryData>;
    return {
      ...defaultData,
      ...parsed,
      settings: { ...defaultData.settings, ...parsed.settings },
      tripInfo: { ...defaultData.tripInfo, ...parsed.tripInfo },
    };
  } catch {
    return defaultData;
  }
};

export const saveItinerary = async (data: ItineraryData): Promise<void> => {
  await setDoc(DOC_REF(), data);
};

export const subscribeItinerary = (callback: (data: ItineraryData) => void): (() => void) => {
  return onSnapshot(DOC_REF(), (snap) => {
    if (!snap.exists()) {
      callback(defaultData);
      return;
    }
    const parsed = snap.data() as Partial<ItineraryData>;
    callback({
      ...defaultData,
      ...parsed,
      settings: { ...defaultData.settings, ...parsed.settings },
      tripInfo: { ...defaultData.tripInfo, ...parsed.tripInfo },
      days: parsed.days ?? defaultData.days,
      tips: parsed.tips ?? defaultData.tips,
    });
  }, (error) => {
    console.error('[Firestore] subscribeItinerary error:', error.code, error.message);
    callback(defaultData);
  });
};

export const generateId = () => Math.random().toString(36).slice(2, 9);

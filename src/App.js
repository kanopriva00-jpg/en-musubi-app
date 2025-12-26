/* global __firebase_config, __app_id, __initial_auth_token */
import React, { useState, useMemo, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getFirestore, collection, query, onSnapshot, addDoc,
  serverTimestamp, orderBy
} from 'firebase/firestore';
import {
  getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged
} from 'firebase/auth';
import {
  Search, Calendar, Utensils, Users, MapPin, Heart,
  MessageCircle, ChevronRight, ChevronLeft, Star, Bell, User as UserIcon,
  ArrowRight, ExternalLink, X, Send, ShieldCheck, Clock, Sparkles, Plus, ChevronDown
} from 'lucide-react';

// --- Firebase Configuration ---
const firebaseConfig = typeof __firebase_config !== 'undefined'
  ? JSON.parse(__firebase_config)
  : {
    apiKey: "AIzaSyAVBN0mtvL2m0CaXz2BRk-nKL4w2dt_8Zk",
    authDomain: "en-musubi-kansai.firebaseapp.com",
    projectId: "en-musubi-kansai",
    storageBucket: "en-musubi-kansai.firebasestorage.app",
    messagingSenderId: "517935929084",
    appId: "1:517935929084:web:6897997592fa8e50a52979"
    };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'en-musubi-kansai';

const App = () => {
  // Tailwind CSS 強制読み込み
  useEffect(() => {
    if (!document.getElementById('tailwind-cdn')) {
      const link = document.createElement('link');
      link.id = 'tailwind-cdn';
      link.href = "https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css";
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
  }, []);

  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [posts, setPosts] = useState([]);
  const [isPosting, setIsPosting] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', area: '梅田' });

  // フィルタ状態
  const [selectedDate, setSelectedDate] = useState('2025-12-26');
  const [selectedTime, setSelectedTime] = useState('19:00');
  const [quickCategory, setQuickCategory] = useState('今日');

  // 1. ログイン処理
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) { console.error("Auth Error:", err); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // 2. 掲示板データ取得
  useEffect(() => {
    if (!user) return;
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'community');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.error("Firestore Error:", err));
    return () => unsubscribe();
  }, [user]);

  // データ定義
  const sliderItems = [
    { id: 1, items: [
      { title: "梅田特集", img: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=200", tag: "NEW" },
      { title: "30代婚活", img: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=200", tag: "PICKUP" },
      { title: "趣味コン", img: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=200", tag: "HOT" },
    ]},
    { id: 2, items: [
      { title: "三宮カフェ", img: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200", tag: "NEW" },
      { title: "一人参加", img: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=200", tag: "SAFE" },
      { title: "難波個室", img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200", tag: "PREMIUM" },
    ]}
  ];

  const rankingData = [
    { rank: 1, title: "【梅田】ハイスペ限定パーティー", count: 124 },
    { rank: 2, title: "【難波】平日夜のカジュアル飲み会", count: 98 },
    { rank: 3, title: "【三宮】20代限定お散歩コン", count: 85 },
  ];

  const eventData = [
    { id: 101, title: "梅田茶屋町でおしゃれ婚活パーティー", area: "梅田", price: "¥4,000", time: "19:30~", img: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400" },
    { id: 102, title: "難波・カジュアル街コン！お酒好き大集合", area: "難波", price: "¥3,500", time: "20:00~", img: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400" },
    { id: 103, title: "三宮・元町ハイスペック個室お見合い", area: "三宮", price: "¥5,500", time: "18:00~", img: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=400" },
  ];

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!db || !user || !newPost.title.trim()) return;
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'community'), {
        ...newPost,
        userId: user.uid,
        userName: `User-${user.uid.slice(0, 4)}`,
        createdAt: serverTimestamp(),
      });
      setNewPost({ title: '', content: '', area: '梅田' });
      setIsPosting(false);
    } catch (err) { console.error("Post Error:", err); }
  };

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-32 font-sans text-gray-900 shadow-2xl relative flex flex-col overflow-x-hidden border-x border-gray-100">

      {/* 1. Header */}
      <header className="bg-white/80 backdrop-blur-md px-5 py-4 flex justify-between items-center sticky top-0 z-40 border-b border-gray-50">
        <div>
          <h1 className="text-xl font-black text-pink-500 italic tracking-tighter">En-Musubi</h1>
          <p className="text-[8px] text-gray-300 font-bold tracking-[0.2em] uppercase">Kansai App</p>
        </div>
        <div className="flex items-center space-x-3 text-gray-400">
          <Bell size={20} />
          <div className="w-8 h-8 bg-pink-500 rounded-xl flex items-center justify-center text-white"><UserIcon size={16} /></div>
        </div>
      </header>

      <main className="flex-1">
        {/* ホーム画面 */}
        {activeTab === 'home' && (
          <div className="animate-in fade-in duration-300">

            {/* 上部手動スライダー (3カラム) */}
            <section className="relative group overflow-hidden bg-gray-900 aspect-[16/10]">
              <div
                className="flex h-full transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {sliderItems.map((slide) => (
                  <div key={slide.id} className="min-w-full grid grid-cols-3 h-full">
                    {slide.items.map((item, idx) => (
                      <div key={idx} className="relative border-r border-white/5 last:border-none">
                        <img src={item.img} className="w-full h-full object-cover opacity-60" alt={item.title} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-end">
                          <span className="text-[8px] text-pink-400 font-bold mb-1">{item.tag}</span>
                          <h3 className="text-[10px] text-white font-black leading-tight">{item.title}</h3>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <button onClick={() => setCurrentSlide((prev) => (prev - 1 + sliderItems.length) % sliderItems.length)} className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white"><ChevronLeft size={14}/></button>
              <button onClick={() => setCurrentSlide((prev) => (prev + 1) % sliderItems.length)} className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white"><ChevronRight size={14}/></button>
            </section>

            {/* 日付と時間選択 */}
            <section className="p-4 bg-white border-b border-gray-100 shadow-sm">
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <Calendar size={14} className="text-pink-500" />
                  <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-transparent text-[10px] font-bold outline-none w-full" />
                </div>
                <div className="flex-1 flex items-center gap-2 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <Clock size={14} className="text-pink-500" />
                  <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} className="bg-transparent text-[10px] font-bold outline-none w-full appearance-none">
                    {['10:00', '13:00', '18:00', '19:00', '20:00'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </section>

            {/* クイックカテゴリー */}
            <section className="px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar">
              {['今日', '明日', '明後日', '今すぐ (30分)'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setQuickCategory(cat)}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-2xl text-[10px] font-black transition-all ${quickCategory === cat ? 'bg-pink-500 text-white shadow-lg shadow-pink-100' : 'bg-white text-gray-400 border border-gray-100'}`}
                >
                  {cat === '今すぐ (30分)' && <Sparkles size={10} className="inline mr-1" />} {cat}
                </button>
              ))}
            </section>

            {/* イベントリスト */}
            <section className="p-4 space-y-4">
              <div className="flex justify-between items-center mb-2 px-1">
                <h2 className="text-sm font-black text-gray-800">おすすめイベント</h2>
                <span className="text-[10px] text-pink-500 font-bold">すべて見る</span>
              </div>
              {eventData.map(event => (
                <div key={event.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm flex active:scale-95 transition-transform">
                  <img src={event.img} className="w-24 h-24 object-cover" alt={event.title} />
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[8px] bg-pink-50 text-pink-500 px-2 py-0.5 rounded font-bold uppercase">{event.area}</span>
                      <h4 className="text-[11px] font-bold text-gray-800 mt-1 line-clamp-2">{event.title}</h4>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] text-gray-400 font-bold">{event.time}</span>
                      <span className="text-sm text-pink-500 font-black">{event.price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </section>

            {/* 人気ランキング */}
            <section className="p-4 mt-2">
              <div className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-sm">
                <h3 className="text-sm font-black text-gray-800 mb-4 flex items-center gap-2"><Star size={16} className="text-yellow-400" fill="currentColor"/> 人気ランキング</h3>
                <div className="space-y-4">
                  {rankingData.map(item => (
                    <div key={item.rank} className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-pink-50 text-pink-500 rounded-lg flex items-center justify-center text-[10px] font-black">{item.rank}</span>
                      <p className="text-[11px] font-bold text-gray-600 line-clamp-1 flex-1">{item.title}</p>
                      <span className="text-[9px] text-gray-300 font-bold">{item.count} views</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* バナーエリア */}
            <section className="p-4 grid grid-cols-2 gap-3 pb-8">
              <div onClick={() => setActiveTab('community')} className="bg-gradient-to-br from-pink-500 to-rose-400 p-5 rounded-[2rem] text-white shadow-lg active:scale-95 transition-transform">
                <Users size={20} className="mb-2" />
                <h4 className="text-xs font-black">女子友づくり<br/>掲示板</h4>
              </div>
              <div className="bg-gray-900 p-5 rounded-[2rem] text-white shadow-lg active:scale-95 transition-transform">
                <Utensils size={20} className="mb-2 text-pink-400" />
                <h4 className="text-xs font-black">相席屋<br/>徹底ガイド</h4>
              </div>
            </section>
          </div>
        )}

        {/* 掲示板画面 */}
        {activeTab === 'community' && (
          <div className="p-5 animate-in slide-in-from-right duration-300">
            <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
              <Users size={24} className="text-pink-500" /> 女子友掲示板
            </h2>
            <button onClick={() => setIsPosting(true)} className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 text-xs font-bold mb-6">+ 募集を投稿する</button>
            <div className="space-y-4">
              {posts.map(post => (
                <div key={post.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] bg-pink-50 text-pink-500 px-2 py-0.5 rounded font-black">{post.area}</span>
                    <span className="text-[9px] text-gray-300 font-bold">{post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString() : 'Now'}</span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-800">{post.title}</h4>
                  <p className="text-xs text-gray-500 mt-2 line-clamp-3">{post.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* モーダル：投稿 */}
      {isPosting && (
        <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-10 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-gray-800 tracking-tight">募集を投稿</h3>
              <button onClick={() => setIsPosting(false)} className="p-2 bg-gray-50 rounded-full text-gray-400"><X size={20}/></button>
            </div>
            <form onSubmit={handlePostSubmit} className="space-y-4">
              <input type="text" placeholder="タイトル" className="w-full p-4 bg-gray-50 rounded-2xl text-xs font-bold outline-none" value={newPost.title} onChange={(e) => setNewPost({...newPost, title: e.target.value})} required />
              <textarea placeholder="内容" className="w-full p-4 bg-gray-50 rounded-2xl text-xs h-32 outline-none resize-none" value={newPost.content} onChange={(e) => setNewPost({...newPost, content: e.target.value})}></textarea>
              <button type="submit" className="w-full bg-pink-500 text-white py-4 rounded-2xl text-xs font-black shadow-lg shadow-pink-100">公開する</button>
            </form>
          </div>
        </div>
      )}

      {/* 5. Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-gray-50 flex justify-around py-4 z-40 rounded-t-[2.5rem] shadow-[0_-5px_20px_rgba(0,0,0,0.02)]">
        {[
          { id: 'home', icon: Heart, label: 'ホーム' },
          { id: 'search', icon: Search, label: '探す' },
          { id: 'gourmet', icon: Utensils, label: 'スポット' },
          { id: 'community', icon: Users, label: '掲示板' }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id === 'community' ? 'community' : 'home')} className={`flex flex-col items-center flex-1 transition-all ${activeTab === tab.id || (activeTab === 'home' && tab.id === 'home') ? 'text-pink-500 scale-110' : 'text-gray-300'}`}>
            <tab.icon size={20} strokeWidth={activeTab === tab.id || (activeTab === 'home' && tab.id === 'home') ? 3 : 2} />
            <span className="text-[9px] mt-1 font-black uppercase tracking-tighter">{tab.label}</span>
          </button>
        ))}
      </nav>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-in-right { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slide-in-bottom { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-in { animation-fill-mode: both; }
        .fade-in { animation-name: fade-in; }
        .slide-in-from-right { animation-name: slide-in-right; }
        .slide-in-from-bottom { animation-name: slide-in-bottom; }
      `}</style>
    </div>
  );
};

export default App;
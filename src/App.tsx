/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { UploadCloud, Sparkles, Diamond, Shield, CheckCircle2, ChevronRight, Crown } from "lucide-react";
import { AnalysisResult } from "./types";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [images, setImages] = useState<{dataUrl: string, type: string}[]>([]);
  const [metadata, setMetadata] = useState({
    name: '', type: '', weight: '', dimensions: '', origin: '', material: '',
    craftsmanship: '', rarity: '', year: '', certificate: '', desiredPrice: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = (error) => {
        URL.revokeObjectURL(img.src);
        reject(error);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (images.length + files.length > 3) {
      setError("Chỉ được tải lên tối đa 3 ảnh.");
      return;
    }
    setError(null);
    
    for (const file of files) {
      try {
        const compressedDataUrl = await compressImage(file);
        setImages(prev => [...prev, { dataUrl: compressedDataUrl, type: 'image/jpeg' }]);
      } catch (err) {
        console.error("Error compressing image", err);
        setError("Lỗi xử lý ảnh, có thể ảnh quá lớn hoặc định dạng không hỗ trợ.");
      }
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const analyzeLuxury = async () => {
    if (images.length === 0) return;
    setIsAnalyzing(true);
    setResult(null);

    try {
      const payload = images.map(img => ({ base64: img.dataUrl, mimeType: img.type }));
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ images: payload, metadata }),
      });

      if (!response.ok) throw new Error("Analysis failed");

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra khi phân tích. Vui lòng thử lại.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div 
      className="h-screen w-full bg-onyx text-smoke font-sans overflow-hidden grid border border-charcoal"
      style={{
        gridTemplateColumns: (isAnalyzing || result) ? '1fr 380px' : '1fr',
        gridTemplateRows: '80px 1fr 140px'
      }}
    >
      {/* Premium Header */}
      <header className="col-span-full flex items-center justify-between px-10 border-b border-charcoal header-bg">
        <div className="flex items-center gap-3">
          <Diamond className="w-6 h-6 text-gold" />
          <h1 className="text-2xl font-display tracking-[4px] uppercase bg-gradient-to-r from-yellow-400 to-white bg-clip-text text-transparent font-bold">
            LUXE AI <span className="opacity-70 font-light">MARKETPLACE™</span>
          </h1>
        </div>
        <div className="flex items-center gap-[30px] text-[11px] uppercase tracking-[2px] opacity-60 hidden md:flex">
          <span className="hover:text-gold transition-colors cursor-pointer">Bộ Sưu Tập</span>
          <span className="hover:text-gold transition-colors cursor-pointer">Định Giá</span>
          <span className="hover:text-gold transition-colors cursor-pointer">Cộng Đồng</span>
        </div>
        <button className="bg-gold text-onyx border-none px-6 py-3 font-bold uppercase tracking-[1px] text-xs cursor-pointer hover:opacity-90 transition-opacity">
          KẾT NỐI KÉT SẮT
        </button>
      </header>

      {/* Main Content */}
      <main className="main-stage-bg border-r border-charcoal relative flex items-center justify-center overflow-auto p-10">
        <AnimatePresence mode="wait">
          {!isAnalyzing && !result && (
            <motion.div 
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full flex flex-col items-center text-center px-4"
            >
              {images.length === 0 && (
                <div className="mb-12">
                  <h2 className="font-display text-5xl md:text-6xl mb-6 leading-tight font-light">
                    Hệ Sinh Thái Thương Mại <br/> <span className="font-display italic text-gold">AI Siêu Sang Trọng Đầu Tiên</span>
                  </h2>
                  <p className="opacity-50 text-[13px] tracking-wide max-w-2xl mx-auto">
                    Công nghệ Vision Intelligence độc quyền của LUXE AI phân tích đá quý, Thiên thạch, cổ vật, tạo ra gian hàng và các chiến dịch Marketing nhắm vào giới siêu giàu toàn cầu.
                  </p>
                </div>
              )}

              <label className="w-full max-w-2xl mx-auto bg-[#1a1a1a] shadow-[0_0_100px_rgba(212,175,55,0.05)] border border-gold/20 p-12 hover:bg-[#222] transition-colors cursor-pointer group flex flex-col items-center justify-center rounded-sm">
                <div className="text-7xl mb-4 drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]">💎</div>
                <p className="text-2xl font-bold text-gold">Kéo hoặc tải tối đa 3 ảnh</p>
                <p className="text-smoke/50 mt-3 text-lg font-light tracking-[2px] uppercase">Hỗ trợ AI Luxury Marketplace</p>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={images.length >= 3}
                />
              </label>

              {error && (
                <div className="mt-6 bg-red-500/10 border border-red-500 rounded-sm p-4 text-red-400 font-semibold tracking-wide">
                  {error}
                </div>
              )}

              {images.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 w-full max-w-5xl mx-auto">
                  {images.map((img, index) => (
                    <div
                      key={index}
                      className="relative rounded-sm overflow-hidden border border-gold/40 bg-[#0a0a0a] shadow-[0_0_30px_rgba(0,0,0,0.8)] group h-80"
                    >
                      <img
                        src={img.dataUrl}
                        alt="Luxury Preview"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90 mix-blend-screen"
                      />

                      <button
                        onClick={(e) => { e.preventDefault(); removeImage(index); }}
                        className="absolute top-4 right-4 bg-black/70 hover:bg-red-800 transition w-10 h-10 flex items-center justify-center border border-white/20 hover:border-red-500 rounded-full text-white font-bold z-20"
                      >
                        ✕
                      </button>

                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 text-left pointer-events-none">
                        <h3 className="text-xl font-display text-gold">
                          Sản Phẩm Cao Cấp {index + 1}
                        </h3>
                        <p className="text-smoke/60 mt-1 text-[11px] uppercase tracking-[2px]">
                          Sẵn sàng phân tích AI
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {images.length > 0 && (
                <div className="w-full max-w-5xl mx-auto mt-12 bg-[#0a0a0a] border border-gold/20 p-8 rounded-sm shadow-[0_0_30px_rgba(212,175,55,0.05)] text-left">
                  <h3 className="text-xl font-display text-gold mb-6 border-b border-gold/20 pb-4">Thông Tin Về Sản Phẩm (Tùy Chọn)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { label: "Tên Sản Phẩm", key: "name", placeholder: "VD: Nhẫn Ruby Lục Yên" },
                      { label: "Loại Sản Phẩm", key: "type", placeholder: "VD: Đá quý, Đồng hồ, Thiên thạch" },
                      { label: "Trọng Lượng", key: "weight", placeholder: "VD: 2.5 Carat, 180g" },
                      { label: "Kích Thước", key: "dimensions", placeholder: "VD: 10x8 mm" },
                      { label: "Xuất Xứ", key: "origin", placeholder: "VD: Myanmar, Thụy Sĩ" },
                      { label: "Chất Liệu", key: "material", placeholder: "VD: Vàng khối 18k, Bạch kim" },
                      { label: "Độ Hiếm", key: "rarity", placeholder: "VD: Độc bản duy nhất" },
                      { label: "Chứng Nhận", key: "certificate", placeholder: "VD: GIA, GRS, Rolex Papers" },
                      { label: "Giá Mong Muốn", key: "desiredPrice", placeholder: "VD: Từ $200,000" },
                    ].map((field) => (
                      <div key={field.key} className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase tracking-[2px] text-smoke/70">{field.label}</label>
                        <input
                          type="text"
                          value={(metadata as any)[field.key]}
                          onChange={(e) => setMetadata({ ...metadata, [field.key]: e.target.value })}
                          placeholder={field.placeholder}
                          className="bg-black/50 border border-charcoal focus:border-gold/50 outline-none px-4 py-3 text-sm text-smoke transition-colors rounded-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {images.length > 0 && (
                <div className="mt-12 flex justify-center">
                  <button
                    onClick={analyzeLuxury}
                    className="px-10 py-5 rounded-sm bg-gradient-to-r from-gold to-[#B5952F] text-onyx text-xl tracking-[2px] font-black shadow-[0_0_40px_rgba(212,175,55,0.4)] hover:shadow-[0_0_60px_rgba(212,175,55,0.6)] uppercase hover:scale-105 transition duration-300 flex items-center gap-3"
                  >
                    PHÂN TÍCH VISION AI <Sparkles className="w-5 h-5"/>
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {(isAnalyzing || result) && (
            <motion.div 
              key="results-img"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full h-full flex flex-col items-center justify-center relative"
            >
              <div className="absolute w-full h-[1px] bg-gold opacity-30 top-1/2 left-0 shadow-[0_0_15px_var(--color-gold)] pointer-events-none" />
              
              <div className="w-[420px] h-[420px] rounded-full flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#000] border border-gold/20 shadow-[0_0_100px_rgba(212,175,55,0.15)] relative z-10 p-2 overflow-hidden">
                <img src={images[0]?.dataUrl} alt="Uploaded item" className="w-full h-full object-cover rounded-full mix-blend-screen opacity-90" />
              </div>

              {images.length > 1 && (
                <div className="absolute top-[20%] right-[10%] flex flex-col gap-4 z-20 pointer-events-none">
                  {images.slice(1).map((img, i) => (
                    <div key={i} className="w-20 h-20 rounded-full border border-gold/40 overflow-hidden shadow-[0_0_20px_rgba(212,175,55,0.2)] bg-black">
                      <img src={img.dataUrl} className="w-full h-full object-cover mix-blend-screen opacity-80" />
                    </div>
                  ))}
                </div>
              )}

              <div className="absolute bottom-10 left-10 text-left">
                <h1 className="font-display text-[42px] font-light mt-8 text-white">{result?.analysis?.type || 'Đang Xác Thực...'}</h1>
                <p className="text-[13px] opacity-50 mt-2 uppercase tracking-widest">
                  ID: GEM-LX-{new Date().getFullYear()}-{Math.floor(Math.random() * 1000).toString().padStart(3, '0')} • CHỨNG NHẬN BẢN SAO SỐ
                </p>
              </div>

              <button 
                onClick={() => { setImages([]); setResult(null); setIsAnalyzing(false); }}
                className="absolute top-10 left-10 text-smoke/40 hover:text-gold transition-colors text-[11px] uppercase tracking-[2px] flex items-center gap-2 z-30"
              >
                ← Thoát & Đổi Ảnh
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Sidebar for Results Data */}
      {(isAnalyzing || result) && (
        <aside className="bg-[#0d0d0d] p-10 flex flex-col gap-[30px] overflow-auto">
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-8 py-20">
              <div className="relative">
                <motion.div 
                  className="absolute inset-0 border-2 border-gold/30 rounded-full blur-[2px]"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                />
                <motion.div 
                  className="w-20 h-20 rounded-full border border-gold flex items-center justify-center bg-black shadow-[0_0_50px_rgba(212,175,55,0.3)] relative z-10"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                >
                  <Sparkles className="w-8 h-8 text-gold drop-shadow-[0_0_10px_rgba(212,175,55,0.8)]" />
                </motion.div>
              </div>
              
              <div className="flex flex-col gap-2">
                <p className="font-display text-gold italic text-xl">Đang Khởi Tạo Phân Tích...</p>
                <span className="text-[10px] uppercase tracking-[4px] text-white/50 animate-pulse">Quét Đa Chiều AI Vision</span>
              </div>
            </div>
          ) : result ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-[30px]">
              
              <section>
                <span className="text-[10px] uppercase tracking-[3px] text-gold mb-3 block opacity-80">Phân Tích Thị Giác</span>
                <div className="flex justify-between py-3 border-b border-[#222]">
                  <span className="text-[12px] text-white/40">Loại</span>
                  <span className="text-[12px] font-medium text-smoke text-right w-1/2">{result.analysis.type}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-[#222]">
                  <span className="text-[12px] text-white/40">Nguồn Gốc</span>
                  <span className="text-[12px] font-medium text-smoke text-right w-1/2">{result.analysis.origin}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-[#222]">
                  <span className="text-[12px] text-white/40">Độ Hiếm</span>
                  <span className="bg-gold/10 border border-gold text-gold px-2 py-0.5 text-[10px] rounded-sm ml-auto text-center">{result.analysis.luxuryLevel}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-[#222]">
                  <span className="text-[12px] text-white/40">Cấp Độ Khách Hàng</span>
                  <span className="text-[12px] font-medium text-gold text-right w-1/2">{result.analysis.targetAudience}</span>
                </div>
                {result.analysis.estimatedMarketPrice && (
                  <div className="flex justify-between py-3 border-b border-[#222]">
                    <span className="text-[12px] text-white/40">Định Giá Đề Xuất</span>
                    <span className="text-[14px] font-bold text-green-400 text-right w-1/2">{result.analysis.estimatedMarketPrice}</span>
                  </div>
                )}
              </section>

              <section className="bg-[#111] p-6 border border-gold/20 rounded-sm">
                <span className="text-[10px] uppercase tracking-[3px] text-gold mb-4 block opacity-80 flex items-center gap-2">
                  <Crown className="w-4 h-4"/> STORYTELLING BÁN HÀNG
                </span>
                
                <h4 className="font-display text-xl text-gold mb-3">{result.luxuryStory.title}</h4>
                
                <div className="text-[13px] leading-[1.8] text-smoke/80 space-y-3 mb-6 relative">
                  <div className="absolute -left-2 top-0 w-[2px] h-full bg-gradient-to-b from-gold/50 to-transparent"></div>
                  <div className="pl-4">
                    {result.luxuryStory.description?.split('\n').filter(Boolean).map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </div>

                <div className="text-gold/60 font-display italic mb-4 text-center">
                  "{result.luxuryStory.slogan}"
                </div>

                <div className="text-[11px] text-blue-400/80 mb-6 font-mono tracking-wider">
                  {result.luxuryStory.hashtags}
                </div>

                <button className="w-full bg-white text-black font-bold uppercase tracking-[2px] py-3 text-xs hover:bg-gray-200 transition-colors">
                  {result.luxuryStory.cta}
                </button>
              </section>

              <section className="flex flex-col gap-3">
                <button className="w-full border py-3 text-[11px] uppercase tracking-widest text-[#1877F2] border-[#1877F2]/30 hover:bg-[#1877F2]/10 transition-colors">
                  Xuất bản Facebook Marketplace
                </button>
                <button className="w-full border py-3 text-[11px] uppercase tracking-widest text-white border-white/30 hover:bg-white/10 transition-colors">
                  Tạo Video TikTok AI Quét Sản Phẩm
                </button>
              </section>

            </motion.div>
          ) : null}
        </aside>
      )}

      {/* Footer / Status Bar - Show across full width during upload, but acts as bottom bar */}
      <footer className="col-span-full flex items-center px-10 gap-10 bg-charcoal border-t border-[#333]">
        <div className={`flex items-center gap-[10px] text-[11px] tracking-[1px] ${(isAnalyzing || result) ? 'text-gold opacity-100' : 'opacity-40'}`}>
          <div className={`w-[6px] h-[6px] rounded-full ${(isAnalyzing || result) ? 'bg-gold shadow-[0_0_5px_var(--color-gold)]' : 'bg-current'}`} />
          <span>Trí Tuệ Gemini</span>
        </div>
        <div className={`flex items-center gap-[10px] text-[11px] tracking-[1px] ${result ? 'text-gold opacity-100' : 'opacity-40'}`}>
          <div className={`w-[6px] h-[6px] rounded-full ${result ? 'bg-gold shadow-[0_0_5px_var(--color-gold)]' : 'bg-current'}`} />
          <span>Claude Copy Sang Trọng</span>
        </div>
        <div className="flex items-center gap-[10px] text-[11px] tracking-[1px] opacity-40">
          <div className="w-[6px] h-[6px] rounded-full bg-current" />
          <span>Mô Phỏng 3D Flux</span>
        </div>
        <div className="flex items-center gap-[10px] text-[11px] tracking-[1px] opacity-40">
          <div className="w-[6px] h-[6px] rounded-full bg-current" />
          <span>Video Điện Ảnh Runway</span>
        </div>
        {(isAnalyzing || result) && (
          <button className="ml-auto bg-gold text-onyx border-none px-6 py-3 font-bold uppercase tracking-[1px] text-[12px] cursor-pointer hover:opacity-90 flex items-center gap-2">
            Đăng Lên Chợ Tinh Hoa <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </footer>
    </div>
  );
}


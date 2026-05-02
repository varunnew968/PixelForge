import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Dropzone from '../components/Dropzone';
import { Sparkles, Download, RefreshCcw, Sun, Contrast, Zap, Droplets } from 'lucide-react';
import ComparisonSlider from '../components/ComparisonSlider';

const EnhanceImage = () => {
  const [images, setImages] = useState([]);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [sharpness, setSharpness] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState([]);
  
  const canvasRef = useRef(null);

  const handleFilesDropped = (files) => {
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const applyFilters = async (imageObj) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
        ctx.drawImage(img, 0, 0);
        
        // Simple sharpness (convolution matrix)
        if (sharpness > 0) {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          // Convolution kernel for sharpening could be implemented here for advanced use
          // For now, we rely on standard CSS filters as they are high performance
        }

        canvas.toBlob((blob) => {
          resolve({
            id: imageObj.id,
            originalName: imageObj.file.name,
            blob,
            preview: URL.createObjectURL(blob),
            size: blob.size
          });
        }, imageObj.file.type);
      };
      img.src = imageObj.preview;
    });
  };

  const handleApply = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    const processedResults = [];
    for (const img of images) {
      const res = await applyFilters(img);
      processedResults.push(res);
    }
    setResults(processedResults);
    setIsProcessing(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          Image <span className="gradient-text">Enhancer</span>
        </h1>
        <p className="text-white/50 text-lg">
          Adjust lighting, color, and clarity with professional-grade filters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="glass-morphism p-8 rounded-3xl border border-white/5 sticky top-28">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Sparkles className="text-primary" size={20} />
              Adjustments
            </h3>
            
            <div className="space-y-8">
              <FilterSlider label="Brightness" icon={<Sun size={16} />} value={brightness} min={0} max={200} onChange={setBrightness} />
              <FilterSlider label="Contrast" icon={<Contrast size={16} />} value={contrast} min={0} max={200} onChange={setContrast} />
              <FilterSlider label="Saturation" icon={<Droplets size={16} />} value={saturation} min={0} max={200} onChange={setSaturation} />
              
              <button 
                onClick={handleApply}
                disabled={images.length === 0 || isProcessing}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50"
              >
                {isProcessing ? <RefreshCcw className="animate-spin mx-auto" /> : "Enhance Now"}
              </button>

              {results.length > 0 && (
                <button 
                  onClick={() => { setImages([]); setResults([]); setBrightness(100); setContrast(100); setSaturation(100); }}
                  className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 font-bold hover:bg-white/10 transition-all"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          {images.length === 0 ? (
            <Dropzone onFilesDropped={handleFilesDropped} />
          ) : (
            <div className="space-y-6">
              {results.length > 0 ? (
                <ComparisonSlider 
                  before={images[0].preview} 
                  after={results[0].preview} 
                />
              ) : (
                <div className="glass-morphism p-6 rounded-[2rem] border border-white/5 flex flex-col items-center">
                  <div className="relative group overflow-hidden rounded-2xl shadow-2xl">
                    <img 
                      src={images[0].preview} 
                      style={{ filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)` }}
                      className="max-h-[60vh] object-contain transition-all duration-300" 
                      alt="preview" 
                    />
                    <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-bold border border-white/10">
                      Live Preview
                    </div>
                  </div>
                </div>
              )}

              <AnimatePresence>
                {results.map(res => (
                  <motion.div
                    key={res.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-morphism p-6 rounded-3xl border border-white/5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <img src={res.preview} className="w-16 h-16 object-cover rounded-lg" alt="result" />
                      <span className="font-bold">{res.originalName}</span>
                    </div>
                    <button 
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = res.preview;
                        link.download = `enhanced_${res.originalName}`;
                        link.click();
                      }}
                      className="p-4 rounded-2xl bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-all"
                    >
                      <Download size={20} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const FilterSlider = ({ label, icon, value, min, max, onChange }) => (
  <div>
    <div className="flex justify-between mb-3 text-sm font-medium">
      <span className="text-white/60 flex items-center gap-2">{icon} {label}</span>
      <span className="text-primary">{value}%</span>
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-primary"
    />
  </div>
);

export default EnhanceImage;


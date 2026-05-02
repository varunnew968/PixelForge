import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Dropzone from '../components/Dropzone';
import { Layers, Download, RefreshCcw, Maximize, Check } from 'lucide-react';


const ResizeImage = () => {
  const [images, setImages] = useState([]);
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState([]);
  

  const presets = [
    { name: 'Instagram (1:1)', w: 1080, h: 1080 },
    { name: 'YouTube (16:9)', w: 1920, h: 1080 },
    { name: 'Facebook Cover', w: 820, h: 312 },
    { name: '4K Ultra HD', w: 3840, h: 2160 },
  ];

  const handleFilesDropped = (files) => {
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const applyPreset = (p) => {
    setWidth(p.w);
    setHeight(p.h);
  };

  const resizeImage = async (imageObj, targetWidth, targetHeight) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        
        // Better scaling quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        
        canvas.toBlob((blob) => {
          resolve({
            id: imageObj.id,
            originalName: imageObj.file.name,
            blob,
            preview: URL.createObjectURL(blob),
            dimensions: `${targetWidth}x${targetHeight}`,
            size: blob.size
          });
        }, imageObj.file.type, 0.92);
      };
      img.src = imageObj.preview;
    });
  };

  const handleResize = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    
    const resizedResults = [];
    for (const img of images) {
      const res = await resizeImage(img, width, height);
      resizedResults.push(res);
    }
    
    setResults(resizedResults);
    track(resizedResults.map(r => ({
      fileName: r.originalName,
      outputSize: r.size,
    })), 'Resize');
    setIsProcessing(false);
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          Pixel<span className="gradient-text">Scale</span>
        </h1>
        <p className="text-white/50 text-lg">
          Precisely scale your images with custom dimensions or popular presets.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="glass-morphism p-8 rounded-3xl border border-white/5 sticky top-28">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Maximize className="text-primary" size={20} />
              Dimensions
            </h3>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Width (px)</label>
                  <input 
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(parseInt(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Height (px)</label>
                  <input 
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(parseInt(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-3">Presets</label>
                <div className="flex flex-wrap gap-2">
                  {presets.map(p => (
                    <button
                      key={p.name}
                      onClick={() => applyPreset(p)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium hover:bg-white/10 transition-all"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setMaintainAspectRatio(!maintainAspectRatio)}
                  className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${maintainAspectRatio ? 'bg-primary border-primary' : 'border-white/20'}`}
                >
                  {maintainAspectRatio && <Check size={14} />}
                </button>
                <span className="text-sm text-white/60">Maintain Aspect Ratio</span>
              </div>

              <button 
                onClick={handleResize}
                disabled={images.length === 0 || isProcessing}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary font-bold shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all"
              >
                {isProcessing ? <RefreshCcw className="animate-spin mx-auto" /> : "Resize Now"}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {images.length === 0 ? (
            <Dropzone onFilesDropped={handleFilesDropped} />
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {(results.length > 0 ? results : images).map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-morphism p-6 rounded-3xl border border-white/5 flex items-center gap-6"
                  >
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/5 flex-shrink-0">
                      <img src={item.preview} alt="preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-bold truncate max-w-[200px]">
                        {item.originalName || item.file.name}
                      </h4>
                      <p className="text-white/40 text-sm mt-1">
                        {item.dimensions ? `${item.dimensions} • ${formatSize(item.size)}` : formatSize(item.file.size)}
                      </p>
                    </div>
                    
                    {results.length > 0 && (
                      <button 
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = item.preview;
                          link.download = `resized_${item.originalName}`;
                          link.click();
                        }}
                        className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-primary"
                      >
                        <Download size={20} />
                      </button>
                    )}
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

export default ResizeImage;


import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Dropzone from '../components/Dropzone';
import { Type, Image as ImageIcon, Download, RefreshCcw, Layout, Maximize } from 'lucide-react';


const WatermarkImage = () => {
  const [images, setImages] = useState([]);
  const [watermarkText, setWatermarkText] = useState('PixelForge');
  const [watermarkImage, setWatermarkImage] = useState(null);
  const [position, setPosition] = useState('bottom-right');
  const [opacity, setOpacity] = useState(50);
  const [fontSize, setFontSize] = useState(40);
  const [color, setColor] = useState('#ffffff');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState([]);
  

  const handleFilesDropped = (files) => {
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const handleWatermarkImage = (files) => {
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => setWatermarkImage(e.target.result);
      reader.readAsDataURL(files[0]);
    }
  };

  const applyWatermark = async (imageObj) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        ctx.globalAlpha = opacity / 100;

        if (watermarkImage) {
          const wImg = new Image();
          wImg.onload = () => {
            const wWidth = img.width * 0.2;
            const wHeight = (wImg.height / wImg.width) * wWidth;
            const { x, y } = getPosition(img.width, img.height, wWidth, wHeight);
            ctx.drawImage(wImg, x, y, wWidth, wHeight);
            finish();
          };
          wImg.src = watermarkImage;
        } else {
          ctx.font = `bold ${fontSize * (img.width / 1000)}px Inter, sans-serif`;
          ctx.fillStyle = color;
          const metrics = ctx.measureText(watermarkText);
          const wWidth = metrics.width;
          const wHeight = fontSize * (img.width / 1000);
          const { x, y } = getPosition(img.width, img.height, wWidth, wHeight);
          ctx.fillText(watermarkText, x, y + wHeight);
          finish();
        }

        function finish() {
          canvas.toBlob((blob) => {
            resolve({
              id: imageObj.id,
              originalName: imageObj.file.name,
              blob,
              preview: URL.createObjectURL(blob),
              size: blob.size
            });
          }, imageObj.file.type);
        }
      };
      img.src = imageObj.preview;
    });
  };

  const getPosition = (canvasW, canvasH, itemW, itemH) => {
    const padding = canvasW * 0.05;
    switch (position) {
      case 'top-left': return { x: padding, y: padding };
      case 'top-right': return { x: canvasW - itemW - padding, y: padding };
      case 'center': return { x: (canvasW - itemW) / 2, y: (canvasH - itemH) / 2 };
      case 'bottom-left': return { x: padding, y: canvasH - itemH - padding };
      default: return { x: canvasW - itemW - padding, y: canvasH - itemH - padding };
    }
  };

  const handleApply = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    const processedResults = [];
    for (const img of images) {
      const res = await applyWatermark(img);
      processedResults.push(res);
    }
    setResults(processedResults);
    track(processedResults.map(r => ({
      fileName: r.originalName,
      outputSize: r.size,
    })), 'Watermark');
    setIsProcessing(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          Add <span className="gradient-text">Watermark</span>
        </h1>
        <p className="text-white/50 text-lg">
          Protect your work with custom text or image watermarks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="glass-morphism p-8 rounded-3xl border border-white/5 sticky top-28">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Type className="text-primary" size={20} />
              Settings
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Text Watermark</label>
                <input 
                  type="text" 
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50"
                  placeholder="Enter watermark text"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Image Watermark</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleWatermarkImage(e.target.files)}
                  className="w-full text-xs text-white/40 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Position</label>
                <select 
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50"
                >
                  <option value="top-left">Top Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="center">Center</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="bottom-right">Bottom Right</option>
                </select>
              </div>

              <Slider label="Opacity" value={opacity} onChange={setOpacity} />
              <Slider label="Font Size" value={fontSize} onChange={setFontSize} />

              <button 
                onClick={handleApply}
                disabled={images.length === 0 || isProcessing}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50"
              >
                {isProcessing ? <RefreshCcw className="animate-spin mx-auto" /> : "Apply Watermark"}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          {images.length === 0 ? (
            <Dropzone onFilesDropped={handleFilesDropped} />
          ) : (
            <div className="space-y-6">
              <div className="glass-morphism p-6 rounded-[2rem] border border-white/5 flex justify-center items-center">
                <div className="relative group overflow-hidden rounded-2xl shadow-2xl">
                  <img src={images[0].preview} className="max-h-[60vh] object-contain" alt="preview" />
                  {/* Mock live preview overlay could be added here */}
                </div>
              </div>
              
              <AnimatePresence>
                {results.map(res => (
                  <motion.div
                    key={res.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
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
                        link.download = `watermarked_${res.originalName}`;
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

const Slider = ({ label, value, onChange }) => (
  <div>
    <div className="flex justify-between mb-2 text-sm font-medium">
      <span className="text-white/60">{label}</span>
      <span className="text-primary">{value}</span>
    </div>
    <input 
      type="range" 
      min="1" 
      max="100" 
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-primary"
    />
  </div>
);

export default WatermarkImage;


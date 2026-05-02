import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Dropzone from '../components/Dropzone';
import { RefreshCcw, RotateCcw, RotateCw, Download, ArrowLeftRight, ArrowUpDown } from 'lucide-react';

const RotateImage = () => {
  const [images, setImages] = useState([]);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(1);
  const [flipV, setFlipV] = useState(1);
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

  const processImage = async (imageObj) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Adjust canvas size for rotation
        const is90 = Math.abs(rotation % 180) === 90;
        canvas.width = is90 ? img.height : img.width;
        canvas.height = is90 ? img.width : img.height;
        
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(flipH, flipV);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        
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
      const res = await processImage(img);
      processedResults.push(res);
    }
    setResults(processedResults);
    setIsProcessing(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          Rotate & <span className="gradient-text">Flip</span>
        </h1>
        <p className="text-white/50 text-lg">
          Fix orientation or mirror your images with one click.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="glass-morphism p-8 rounded-3xl border border-white/5 sticky top-28">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <RotateCw className="text-primary" size={20} />
              Controls
            </h3>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <ControlButton 
                  onClick={() => setRotation(r => r - 90)} 
                  icon={<RotateCcw size={20} />} 
                  label="-90°" 
                />
                <ControlButton 
                  onClick={() => setRotation(r => r + 90)} 
                  icon={<RotateCw size={20} />} 
                  label="+90°" 
                />
                <ControlButton 
                  onClick={() => setFlipH(f => f * -1)} 
                  icon={<ArrowLeftRight size={20} />} 
                  label="Flip H" 
                  active={flipH === -1}
                />
                <ControlButton 
                  onClick={() => setFlipV(f => f * -1)} 
                  icon={<ArrowUpDown size={20} />} 
                  label="Flip V" 
                  active={flipV === -1}
                />
              </div>

              <button 
                onClick={handleApply}
                disabled={images.length === 0 || isProcessing}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50"
              >
                {isProcessing ? <RefreshCcw className="animate-spin mx-auto" /> : "Apply Changes"}
              </button>

              {results.length > 0 && (
                <button 
                  onClick={() => { setImages([]); setResults([]); setRotation(0); setFlipH(1); setFlipV(1); }}
                  className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 font-bold hover:bg-white/10 transition-all"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          {images.length === 0 ? (
            <Dropzone onFilesDropped={handleFilesDropped} />
          ) : (
            <div className="space-y-4">
              <div className="glass-morphism p-8 rounded-[2rem] border border-white/5 flex justify-center items-center min-h-[400px] overflow-hidden">
                <motion.div 
                  animate={{ rotate: rotation, scaleX: flipH, scaleY: flipV }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="relative"
                >
                  <img src={images[0].preview} className="max-h-[60vh] rounded-xl shadow-2xl" alt="preview" />
                </motion.div>
              </div>
              
              <AnimatePresence>
                {results.map(res => (
                  <motion.div
                    key={res.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
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
                        link.download = `rotated_${res.originalName}`;
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

const ControlButton = ({ onClick, icon, label, active }) => (
  <button 
    onClick={onClick}
    className={`p-4 rounded-2xl flex flex-col items-center gap-2 border transition-all ${
      active ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
    }`}
  >
    {icon}
    <span className="text-xs font-bold uppercase">{label}</span>
  </button>
);

export default RotateImage;


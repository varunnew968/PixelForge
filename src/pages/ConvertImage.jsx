import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Dropzone from '../components/Dropzone';
import { ImageIcon, Download, RefreshCcw, ArrowRight, ChevronDown } from 'lucide-react';

const ConvertImage = () => {
  const [images, setImages] = useState([]);
  const [targetFormat, setTargetFormat] = useState('webp');
  const [quality, setQuality] = useState(0.8);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState([]);

  const outputFormats = ['webp', 'png', 'jpeg', 'bmp'];

  const handleFilesDropped = (files) => {
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const convertImage = async (imageObj, format) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        const mimeType = `image/${format}`;
        canvas.toBlob((blob) => {
          resolve({
            id: imageObj.id,
            originalName: imageObj.file.name,
            blob,
            preview: URL.createObjectURL(blob),
            format: format.toUpperCase(),
            size: blob.size
          });
        }, mimeType, quality);
      };
      img.src = imageObj.preview;
    });
  };

  const handleConvert = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    
    const convertedResults = [];
    for (const img of images) {
      const res = await convertImage(img, targetFormat);
      convertedResults.push(res);
    }
    
    setResults(convertedResults);
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
          Convert <span className="gradient-text">Format</span>
        </h1>
        <p className="text-white/50 text-lg">
          Switch between JPG, PNG, and WebP instantly with high fidelity.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="glass-morphism p-8 rounded-3xl border border-white/5 sticky top-28">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <ImageIcon className="text-primary" size={20} />
              Options
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-3">Convert To</label>
                <div className="grid grid-cols-2 gap-3">
                  {outputFormats.map(f => (
                    <button
                      key={f}
                      onClick={() => setTargetFormat(f)}
                      className={`py-3 rounded-xl border font-bold transition-all ${
                        targetFormat === f 
                        ? 'bg-primary/20 border-primary text-primary' 
                        : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
                      }`}
                    >
                      {f.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {(targetFormat === 'webp' || targetFormat === 'jpeg') && (
                <div>
                  <div className="flex justify-between mb-3 text-sm font-medium">
                    <span className="text-white/60">Quality</span>
                    <span className="text-primary">{Math.round(quality * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.1" 
                    max="1.0" 
                    step="0.05" 
                    value={quality}
                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                    className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              )}

              <button 
                onClick={handleConvert}
                disabled={images.length === 0 || isProcessing}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary font-bold shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all"
              >
                {isProcessing ? <RefreshCcw className="animate-spin mx-auto" /> : "Convert Files"}
              </button>

              {results.length > 0 && (
                <button 
                  onClick={() => { setImages([]); setResults([]); }}
                  className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 font-bold hover:bg-white/10 transition-all"
                >
                  Clear Results
                </button>
              )}
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
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-morphism p-6 rounded-3xl border border-white/5 flex items-center gap-6"
                  >
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/5 flex-shrink-0">
                      <img src={item.preview} alt="preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-bold truncate max-w-[200px]">
                        {results.length > 0 ? `converted_${item.originalName.split('.')[0]}.${item.format.toLowerCase()}` : item.file.name}
                      </h4>
                      <p className="text-white/40 text-sm mt-1">
                        {results.length > 0 ? `${item.format} • ${formatSize(item.size)}` : formatSize(item.file.size)}
                      </p>
                    </div>
                    
                    {results.length > 0 ? (
                      <button 
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = item.preview;
                          link.download = `converted_${item.originalName.split('.')[0]}.${item.format.toLowerCase()}`;
                          link.click();
                        }}
                        className="p-4 rounded-2xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all"
                      >
                        <Download size={20} />
                      </button>
                    ) : (
                      <div className="text-white/20">
                        <ArrowRight size={20} />
                      </div>
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

export default ConvertImage;


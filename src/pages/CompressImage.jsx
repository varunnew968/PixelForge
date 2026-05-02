import React, { useState, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import { motion, AnimatePresence } from 'framer-motion';
import Dropzone from '../components/Dropzone';
import { Zap, Download, RefreshCcw, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import ComparisonSlider from '../components/ComparisonSlider';
import { useImages } from '../context/ImageContext';


const CompressImage = () => {
  const { sharedImages, clearSharedImages } = useImages();
  
  const [images, setImages] = useState(sharedImages || []);
  const [quality, setQuality] = useState(0.8);

  useEffect(() => {
    if (sharedImages.length > 0) {
      setImages(sharedImages);
      clearSharedImages();
    }
  }, [sharedImages]);
  const [isLossless, setIsLossless] = useState(false);
  const [maxWidth, setMaxWidth] = useState(2048);
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

  const handleCompress = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    
    const compressedResults = [];
    
    for (const item of images) {
      const options = {
        maxSizeMB: isLossless ? 100 : 1,
        maxWidthOrHeight: maxWidth,
        useWebWorker: true,
        initialQuality: isLossless ? 1.0 : quality,
      };

      try {
        const compressedFile = await imageCompression(item.file, options);
        compressedResults.push({
          id: item.id,
          original: item.file,
          compressed: compressedFile,
          originalSize: item.file.size,
          compressedSize: compressedFile.size,
          preview: URL.createObjectURL(compressedFile),
          reduction: (((item.file.size - compressedFile.size) / item.file.size) * 100).toFixed(1)
        });
      } catch (error) {
        console.error('Compression error:', error);
      }
    }
    
    setResults(compressedResults);
    track(compressedResults.map(r => ({
      originalName: r.original.name,
      fileSize: r.originalSize,
      outputSize: r.compressedSize,
      reduction: r.reduction,
    })), 'Compress');
    setIsProcessing(false);
  };

  const downloadAll = () => {
    results.forEach(res => {
      const link = document.createElement('a');
      link.href = res.preview;
      link.download = `compressed_${res.original.name}`;
      link.click();
    });
  };

  const reset = () => {
    setImages([]);
    setResults([]);
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
          Compress <span className="gradient-text">Image</span>
        </h1>
        <p className="text-white/50 text-lg">
          Reduce file size by up to 90% while maintaining stunning visual quality.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-morphism p-8 rounded-3xl border border-white/5 sticky top-28">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Zap className="text-primary" size={20} />
              Settings
            </h3>
            
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-3">Compression Mode</label>
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                  <button 
                    onClick={() => setIsLossless(false)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${!isLossless ? 'bg-primary text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                  >
                    LOSSY
                  </button>
                  <button 
                    onClick={() => setIsLossless(true)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${isLossless ? 'bg-primary text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                  >
                    LOSSLESS
                  </button>
                </div>
              </div>

              {!isLossless && (
                <div>
                  <div className="flex justify-between mb-3 text-sm font-medium">
                    <span className="text-white/60">Quality</span>
                    <span className="text-primary">{Math.round(quality * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.1" 
                    max="1.0" 
                    step="0.1" 
                    value={quality}
                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                    className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              )}

              <div>
                <div className="flex justify-between mb-3 text-sm font-medium">
                  <span className="text-white/60">Max Width</span>
                  <span className="text-primary">{maxWidth}px</span>
                </div>
                <input 
                  type="range" 
                  min="400" 
                  max="4096" 
                  step="100" 
                  value={maxWidth}
                  onChange={(e) => setMaxWidth(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div className="pt-4 space-y-4">
                <button 
                  onClick={handleCompress}
                  disabled={images.length === 0 || isProcessing}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary font-bold shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <RefreshCcw className="animate-spin" size={20} /> Processing...
                    </span>
                  ) : "Compress Now"}
                </button>
                
                {results.length > 0 && (
                  <>
                    <button 
                      onClick={downloadAll}
                      className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                    >
                      <Download size={20} /> Download All
                    </button>
                    <button 
                      onClick={reset}
                      className="w-full text-white/40 text-sm hover:text-white transition-colors"
                    >
                      Clear All
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Upload & Results */}
        <div className="lg:col-span-2">
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
                <div className="glass-morphism p-8 rounded-[2rem] border border-white/5 flex flex-col items-center">
                  <img src={images[0].preview} className="max-h-[50vh] rounded-2xl shadow-2xl mb-6" alt="preview" />
                  <p className="text-white/40 text-sm">Previewing original image</p>
                </div>
              )}
              
              <AnimatePresence>
                {results.length > 0 ? (
                  results.map((res) => (
                    <motion.div
                      key={res.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="glass-morphism p-6 rounded-3xl border border-white/5 flex items-center gap-6 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-3">
                        <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-500/30">
                          -{res.reduction}%
                        </div>
                      </div>
                      
                      <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white/5 flex-shrink-0">
                        <img src={res.preview} alt="preview" className="w-full h-full object-cover" />
                      </div>
                      
                      <div className="flex-grow">
                        <h4 className="font-bold truncate max-w-[200px]">{res.original.name}</h4>
                        <div className="flex items-center gap-3 mt-2 text-sm">
                          <span className="text-white/40 line-through">{formatSize(res.originalSize)}</span>
                          <ArrowRight size={14} className="text-primary" />
                          <span className="text-primary font-bold">{formatSize(res.compressedSize)}</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = res.preview;
                          link.download = `compressed_${res.original.name}`;
                          link.click();
                        }}
                        className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-primary"
                      >
                        <Download size={20} />
                      </button>
                    </motion.div>
                  ))
                ) : (
                  images.map((img) => (
                    <motion.div
                      key={img.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="glass-morphism p-6 rounded-3xl border border-white/5 flex items-center gap-6"
                    >
                      <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white/5 flex-shrink-0">
                        <img src={img.preview} alt="preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-bold truncate max-w-[200px]">{img.file.name}</h4>
                        <p className="text-white/40 text-sm mt-1">{formatSize(img.file.size)}</p>
                      </div>
                      <div className="text-white/20">
                        <CheckCircle2 size={24} />
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
              
              {results.length === 0 && (
                <button 
                  onClick={() => document.querySelector('input[type="file"]').click()}
                  className="w-full py-8 border-2 border-dashed border-white/5 rounded-3xl hover:border-primary/30 hover:bg-white/[0.01] transition-all text-white/30 font-medium"
                >
                  + Add More Images
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompressImage;


import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Dropzone from '../components/Dropzone';
import { Wand2, Download, RefreshCcw, Sliders, Aperture } from 'lucide-react';
import ComparisonSlider from '../components/ComparisonSlider';
import { useToast } from '../components/Toast';


const FILTERS = [
  { name: 'Original', style: '' },
  { name: 'Grayscale', style: 'grayscale(100%)' },
  { name: 'Sepia', style: 'sepia(100%)' },
  { name: 'Vintage', style: 'sepia(60%) contrast(110%) brightness(90%)' },
  { name: 'Vivid', style: 'saturate(200%) contrast(115%)' },
  { name: 'Cool', style: 'hue-rotate(180deg) saturate(130%)' },
  { name: 'Warm', style: 'hue-rotate(-20deg) saturate(140%) brightness(105%)' },
  { name: 'Fade', style: 'brightness(110%) contrast(85%) saturate(80%)' },
  { name: 'Drama', style: 'contrast(150%) saturate(120%) brightness(90%)' },
  { name: 'Noir', style: 'grayscale(100%) contrast(150%) brightness(85%)' },
  { name: 'Dreamy', style: 'brightness(115%) saturate(80%) blur(0.5px)' },
  { name: 'Punch', style: 'contrast(140%) saturate(160%)' },
];

const applyFilterToCanvas = (imageObj, filterStyle) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.filter = filterStyle || 'none';
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        resolve({
          id: imageObj.id,
          originalName: imageObj.file.name,
          blob,
          preview: URL.createObjectURL(blob),
          size: blob.size
        });
      }, imageObj.file.type || 'image/jpeg', 0.92);
    };
    img.src = imageObj.preview;
  });
};

const FilterStudio = () => {
  const [images, setImages] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState([]);
  const { addToast } = useToast();
  

  const handleFilesDropped = (files) => {
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }));
    setImages(prev => [...prev, ...newImages]);
    setResults([]);
  };

  const handleApply = async () => {
    if (images.length === 0 || selectedFilter.name === 'Original') return;
    setIsProcessing(true);
    const processedResults = [];
    for (const img of images) {
      const res = await applyFilterToCanvas(img, selectedFilter.style);
      processedResults.push(res);
    }
    setResults(processedResults);
    track(processedResults.map(r => ({
      fileName: r.originalName,
      outputSize: r.size,
    })), 'Filter Studio');
    setIsProcessing(false);
    addToast(`${selectedFilter.name} filter applied!`, 'success');
  };

  const reset = () => { setImages([]); setResults([]); setSelectedFilter(FILTERS[0]); };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          Filter <span className="gradient-text">Studio</span>
        </h1>
        <p className="text-white/50 text-lg">
          Apply beautiful Instagram-style filters to your images instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="glass-morphism p-6 rounded-3xl border border-white/5 sticky top-28 space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Aperture className="text-primary" size={20} />
              Filters
            </h3>
            <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-1">
              {FILTERS.map(filter => (
                <button
                  key={filter.name}
                  onClick={() => { setSelectedFilter(filter); setResults([]); }}
                  className={`relative p-3 rounded-2xl border text-xs font-bold transition-all ${selectedFilter.name === filter.name ? 'border-primary bg-primary/10 text-primary' : 'border-white/5 bg-white/3 text-white/50 hover:text-white hover:border-white/20'}`}
                >
                  {images.length > 0 && (
                    <img
                      src={images[0].preview}
                      className="w-full h-14 object-cover rounded-xl mb-2"
                      style={{ filter: filter.style || 'none' }}
                      alt={filter.name}
                    />
                  )}
                  {filter.name}
                </button>
              ))}
            </div>

            <button
              onClick={handleApply}
              disabled={images.length === 0 || isProcessing || selectedFilter.name === 'Original'}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary font-bold shadow-lg shadow-primary/20 disabled:opacity-50 hover:opacity-90 transition-all"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCcw className="animate-spin" size={20} /> Applying...
                </span>
              ) : 'Apply Filter'}
            </button>

            {results.length > 0 && (
              <button onClick={reset}
                className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 font-bold hover:bg-white/10 transition-all text-sm">
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          {images.length === 0 ? (
            <Dropzone onFilesDropped={handleFilesDropped} />
          ) : (
            <div className="space-y-6">
              {results.length > 0 ? (
                <ComparisonSlider before={images[0].preview} after={results[0].preview} />
              ) : (
                <div className="glass-morphism p-8 rounded-[2rem] border border-white/5 flex flex-col items-center">
                  <div className="relative">
                    <img
                      src={images[0].preview}
                      style={{ filter: selectedFilter.style || 'none' }}
                      className="max-h-[60vh] object-contain rounded-2xl shadow-2xl transition-all duration-500"
                      alt="preview"
                    />
                    <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-bold border border-white/10">
                      {selectedFilter.name} — Live Preview
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
                      <img src={res.preview} className="w-16 h-16 object-cover rounded-xl" alt="result" />
                      <div>
                        <p className="font-bold">{res.originalName}</p>
                        <p className="text-primary text-sm font-medium mt-1">{selectedFilter.name} filter applied</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = res.preview;
                        link.download = `${selectedFilter.name.toLowerCase()}_${res.originalName}`;
                        link.click();
                        addToast('Image downloaded!', 'success');
                      }}
                      className="p-4 rounded-2xl bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-all"
                    >
                      <Download size={20} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {results.length > 1 && (
                <button
                  onClick={() => results.forEach(res => {
                    const link = document.createElement('a');
                    link.href = res.preview;
                    link.download = `${selectedFilter.name.toLowerCase()}_${res.originalName}`;
                    link.click();
                  })}
                  className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <Download size={20} /> Download All
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterStudio;


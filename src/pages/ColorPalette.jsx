import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Dropzone from '../components/Dropzone';
import { Palette, Download, RefreshCcw, Copy } from 'lucide-react';
import { useToast } from '../components/Toast';


const extractColors = (imageObj, colorCount = 8) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, 200 / Math.max(img.width, img.height));
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

      // Simple quantization: bucket pixels into color groups
      const colorMap = {};
      for (let i = 0; i < data.length; i += 4) {
        const a = data[i + 3];
        if (a < 128) continue;
        // Quantize to 32-step buckets
        const r = Math.round(data[i] / 32) * 32;
        const g = Math.round(data[i + 1] / 32) * 32;
        const b = Math.round(data[i + 2] / 32) * 32;
        const key = `${r},${g},${b}`;
        colorMap[key] = (colorMap[key] || 0) + 1;
      }

      const sorted = Object.entries(colorMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, colorCount * 3);

      // Deduplicate similar colors
      const selected = [];
      for (const [key] of sorted) {
        const [r, g, b] = key.split(',').map(Number);
        const isDuplicate = selected.some(([sr, sg, sb]) =>
          Math.abs(sr - r) < 40 && Math.abs(sg - g) < 40 && Math.abs(sb - b) < 40
        );
        if (!isDuplicate) {
          selected.push([r, g, b]);
          if (selected.length >= colorCount) break;
        }
      }

      const hex = selected.map(([r, g, b]) => {
        return '#' + [r, g, b].map(v => Math.min(255, v).toString(16).padStart(2, '0')).join('');
      });

      resolve({ id: imageObj.id, colors: hex, fileName: imageObj.file.name });
    };
    img.src = imageObj.preview;
  });
};

const ColorPaletteExtractor = () => {
  const [images, setImages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState([]);
  const [colorCount, setColorCount] = useState(8);
  const { addToast } = useToast();
  

  const handleFilesDropped = (files) => {
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const handleExtract = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    const processedResults = [];
    for (const img of images) {
      const res = await extractColors(img, colorCount);
      processedResults.push(res);
    }
    setResults(processedResults);
    track(processedResults.map(r => ({
      fileName: r.fileName,
      outputSize: null, // No output file size for palette extraction
    })), 'Color Palette');
    setIsProcessing(false);
    addToast(`Extracted palettes from ${processedResults.length} image(s)!`, 'success');
  };

  const copyColor = (hex) => {
    navigator.clipboard.writeText(hex);
    addToast(`Copied ${hex} to clipboard!`, 'info');
  };

  const exportPalette = (colors, fileName) => {
    const css = colors.map((c, i) => `  --color-${i + 1}: ${c};`).join('\n');
    const content = `:root {\n${css}\n}`;
    const blob = new Blob([content], { type: 'text/css' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName.replace(/\.[^.]+$/, '')}-palette.css`;
    link.click();
    addToast('CSS palette exported!', 'success');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          Color <span className="gradient-text">Palette Extractor</span>
        </h1>
        <p className="text-white/50 text-lg">
          Extract the dominant color palette from any image. Copy HEX codes or export as CSS.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="glass-morphism p-8 rounded-3xl border border-white/5 sticky top-28 space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Palette className="text-primary" size={20} />
              Settings
            </h3>

            <div>
              <div className="flex justify-between mb-3 text-sm font-medium">
                <span className="text-white/60">Color Count</span>
                <span className="text-primary">{colorCount}</span>
              </div>
              <input
                type="range" min={4} max={16} step={1} value={colorCount}
                onChange={(e) => setColorCount(parseInt(e.target.value))}
                className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <button
              onClick={handleExtract}
              disabled={images.length === 0 || isProcessing}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary font-bold shadow-lg shadow-primary/20 disabled:opacity-50 hover:opacity-90 transition-all"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCcw className="animate-spin" size={20} /> Extracting...
                </span>
              ) : 'Extract Colors'}
            </button>

            {results.length > 0 && (
              <button onClick={() => { setImages([]); setResults([]); }}
                className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 font-bold hover:bg-white/10 transition-all text-sm">
                Clear All
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          {images.length === 0 ? (
            <Dropzone onFilesDropped={handleFilesDropped} />
          ) : (
            <div className="space-y-8">
              {images.map((img) => {
                const result = results.find(r => r.id === img.id);
                return (
                  <motion.div
                    key={img.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-morphism rounded-3xl border border-white/5 overflow-hidden"
                  >
                    <div className="flex gap-6 p-6">
                      <img src={img.preview} className="w-28 h-28 object-cover rounded-2xl flex-shrink-0" alt="source" />
                      <div className="flex-grow">
                        <h4 className="font-bold mb-2 truncate">{img.file.name}</h4>
                        <p className="text-white/40 text-sm">{(img.file.size / 1024).toFixed(1)} KB</p>
                        {result && (
                          <button
                            onClick={() => exportPalette(result.colors, img.file.name)}
                            className="mt-3 flex items-center gap-2 text-xs font-bold text-primary hover:underline"
                          >
                            <Download size={14} /> Export CSS Palette
                          </button>
                        )}
                      </div>
                    </div>
                    {result && (
                      <div className="px-6 pb-6">
                        <div className="flex rounded-2xl overflow-hidden h-16 mb-4">
                          {result.colors.map((color, i) => (
                            <div
                              key={i}
                              className="flex-1 cursor-pointer hover:flex-[2] transition-all duration-300"
                              style={{ backgroundColor: color }}
                              onClick={() => copyColor(color)}
                              title={color}
                            />
                          ))}
                        </div>
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                          {result.colors.map((color, i) => (
                            <button
                              key={i}
                              onClick={() => copyColor(color)}
                              className="group flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/5 transition-all"
                            >
                              <div
                                className="w-10 h-10 rounded-xl shadow-lg border border-white/10 group-hover:scale-110 transition-transform"
                                style={{ backgroundColor: color }}
                              />
                              <span className="text-[10px] font-mono text-white/50 group-hover:text-white transition-colors">{color}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ColorPaletteExtractor;


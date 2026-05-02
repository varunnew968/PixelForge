import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Dropzone from '../components/Dropzone';
import { Eraser, Download, RefreshCcw, Sparkles, Info, CheckCircle2 } from 'lucide-react';
import { useToast } from '../components/Toast';


// Pure client-side background removal using Canvas API with color-based algorithm
const removeBackground = async (imageObj) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Sample background color from corners (top-left, top-right, bottom-left, bottom-right)
      const corners = [
        [0, 0], [img.width - 1, 0],
        [0, img.height - 1], [img.width - 1, img.height - 1]
      ];

      let bgR = 0, bgG = 0, bgB = 0;
      corners.forEach(([x, y]) => {
        const idx = (y * img.width + x) * 4;
        bgR += data[idx]; bgG += data[idx + 1]; bgB += data[idx + 2];
      });
      bgR /= 4; bgG /= 4; bgB /= 4;

      // Flood-fill from edges to detect background
      const width = img.width, height = img.height;
      const visited = new Uint8Array(width * height);
      const queue = [];

      // Seed from all edges
      for (let x = 0; x < width; x++) {
        queue.push(x, 0);
        queue.push(x, height - 1);
      }
      for (let y = 0; y < height; y++) {
        queue.push(0, y);
        queue.push(width - 1, y);
      }

      const tolerance = 60;
      const colorDistance = (r1, g1, b1, r2, g2, b2) =>
        Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);

      let qi = 0;
      while (qi < queue.length) {
        const x = queue[qi++];
        const y = queue[qi++];
        if (x < 0 || x >= width || y < 0 || y >= height) continue;
        const pidx = y * width + x;
        if (visited[pidx]) continue;
        const didx = pidx * 4;
        const r = data[didx], g = data[didx + 1], b = data[didx + 2];
        if (colorDistance(r, g, b, bgR, bgG, bgB) > tolerance) continue;
        visited[pidx] = 1;
        queue.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1);
      }

      // Make visited (background) pixels transparent
      for (let i = 0; i < width * height; i++) {
        if (visited[i]) {
          data[i * 4 + 3] = 0;
        }
      }

      ctx.putImageData(imageData, 0, 0);

      canvas.toBlob((blob) => {
        resolve({
          id: imageObj.id,
          originalName: imageObj.file.name.replace(/\.[^.]+$/, '') + '_no_bg.png',
          blob,
          preview: URL.createObjectURL(blob),
          size: blob.size
        });
      }, 'image/png');
    };
    img.src = imageObj.preview;
  });
};

const RemoveBackground = () => {
  const [images, setImages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState([]);
  const [checkerBg, setCheckerBg] = useState(true);
  const { addToast } = useToast();
  

  const handleFilesDropped = (files) => {
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const handleRemoveBg = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    addToast('Removing background...', 'info', 10000);
    try {
      const processedResults = [];
      for (const img of images) {
        const res = await removeBackground(img);
        processedResults.push(res);
      }
      setResults(processedResults);
      track(processedResults.map(r => ({
        fileName: r.originalName,
        outputSize: r.size,
      })), 'Remove Background');
      addToast(`Background removed from ${processedResults.length} image(s)!`, 'success');
    } catch (err) {
      addToast('Processing failed. Please try another image.', 'error');
    }
    setIsProcessing(false);
  };

  const reset = () => { setImages([]); setResults([]); };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          Remove <span className="gradient-text">Background</span>
        </h1>
        <p className="text-white/50 text-lg max-w-2xl mx-auto">
          Automatically erase image backgrounds in seconds. Works best on solid or uniform backgrounds.
        </p>
        <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm">
          <Info size={14} />
          <span>100% client-side — your images never leave your device</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="glass-morphism p-8 rounded-3xl border border-white/5 sticky top-28 space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Eraser className="text-primary" size={20} />
              Options
            </h3>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-3">Preview Background</label>
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => setCheckerBg(true)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${checkerBg ? 'bg-primary text-white' : 'text-white/40 hover:text-white'}`}
                >
                  CHECKER
                </button>
                <button
                  onClick={() => setCheckerBg(false)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${!checkerBg ? 'bg-primary text-white' : 'text-white/40 hover:text-white'}`}
                >
                  BLACK
                </button>
              </div>
            </div>

            <button
              onClick={handleRemoveBg}
              disabled={images.length === 0 || isProcessing}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary font-bold shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCcw className="animate-spin" size={20} /> Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Sparkles size={18} /> Remove Background
                </span>
              )}
            </button>

            {results.length > 0 && (
              <button
                onClick={reset}
                className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 font-bold hover:bg-white/10 transition-all text-sm"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          {images.length === 0 ? (
            <Dropzone onFilesDropped={handleFilesDropped} multiple={true} />
          ) : (
            <div className="space-y-6">
              {/* Preview Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {images.map((img, idx) => {
                  const result = results.find(r => r.id === img.id);
                  return (
                    <motion.div
                      key={img.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="glass-morphism rounded-2xl border border-white/5 overflow-hidden"
                    >
                      <div
                        className="relative flex items-center justify-center min-h-[200px] p-4"
                        style={checkerBg ? {
                          backgroundImage: 'linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)',
                          backgroundSize: '20px 20px',
                          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                        } : { background: '#111' }}
                      >
                        <img
                          src={result ? result.preview : img.preview}
                          className="max-h-[180px] object-contain rounded-xl"
                          alt="preview"
                        />
                        {result && (
                          <div className="absolute top-2 right-2 bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-bold border border-green-500/30 flex items-center gap-1">
                            <CheckCircle2 size={12} /> Done
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm truncate max-w-[150px]">{img.file.name}</p>
                          <p className="text-white/40 text-xs mt-1">{(img.file.size / 1024).toFixed(1)} KB</p>
                        </div>
                        {result && (
                          <button
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = result.preview;
                              link.download = result.originalName;
                              link.click();
                              addToast('Image downloaded!', 'success');
                            }}
                            className="p-3 rounded-xl bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-all"
                          >
                            <Download size={18} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Download All */}
              {results.length > 1 && (
                <button
                  onClick={() => {
                    results.forEach(res => {
                      const link = document.createElement('a');
                      link.href = res.preview;
                      link.download = res.originalName;
                      link.click();
                    });
                    addToast('All images downloaded!', 'success');
                  }}
                  className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <Download size={20} /> Download All ({results.length} images)
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RemoveBackground;


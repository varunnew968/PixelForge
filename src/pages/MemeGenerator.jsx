import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Dropzone from '../components/Dropzone';
import { 
  Type, Download, RefreshCcw, Smile, Plus, Trash2, 
  ChevronUp, ChevronDown, AlignLeft, AlignCenter, AlignRight,
  Move, Settings, Type as TypeIcon, Palette, Bold, Italic
} from 'lucide-react';
import { useToast } from '../components/Toast';

const FONTS = [
  'Impact', 'Inter', 'Roboto', 'Arial Black', 'Comic Sans MS', 
  'Georgia', 'Verdana', 'Courier New', 'Bebas Neue', 'Permanent Marker',
  'Monoton', 'Pacifico'
];

const DEFAULT_LAYER = {
  text: 'NEW TEXT',
  x: 50, // Percentage
  y: 10, // Percentage
  fontSize: 40,
  color: '#ffffff',
  strokeColor: '#000000',
  strokeWidth: 4,
  fontFamily: 'Impact',
  align: 'center',
  isUppercase: true,
  opacity: 100,
};

const MemeGenerator = () => {
  const [image, setImage] = useState(null);
  const [layers, setLayers] = useState([
    { ...DEFAULT_LAYER, text: 'TOP TEXT', y: 10 },
    { ...DEFAULT_LAYER, text: 'BOTTOM TEXT', y: 85 }
  ]);
  const [activeLayerIndex, setActiveLayerIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const canvasRef = useRef(null);
  const { addToast } = useToast();

  const handleFilesDropped = (files) => {
    if (files.length === 0) return;
    const file = files[0];
    setImage({ 
      file, 
      preview: URL.createObjectURL(file), 
      id: Math.random().toString(36).substr(2, 9) 
    });
    setResult(null);
  };

  const addLayer = () => {
    const newLayer = { ...DEFAULT_LAYER, id: Date.now() };
    setLayers([...layers, newLayer]);
    setActiveLayerIndex(layers.length);
  };

  const removeLayer = (index) => {
    if (layers.length <= 1) {
      addToast('Keep at least one text layer!', 'info');
      return;
    }
    const newLayers = layers.filter((_, i) => i !== index);
    setLayers(newLayers);
    setActiveLayerIndex(Math.max(0, index - 1));
  };

  const updateLayer = (index, updates) => {
    const newLayers = [...layers];
    newLayers[index] = { ...newLayers[index], ...updates };
    setLayers(newLayers);
  };

  const renderMeme = useCallback(async (isExport = false) => {
    if (!image) return;
    
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        // Draw background
        ctx.drawImage(img, 0, 0);

        // Draw layers
        layers.forEach(layer => {
          const fontSize = (layer.fontSize / 1000) * canvas.width;
          const x = (layer.x / 100) * canvas.width;
          const y = (layer.y / 100) * canvas.height;
          const text = layer.isUppercase ? layer.text.toUpperCase() : layer.text;

          ctx.font = `900 ${fontSize}px "${layer.fontFamily}"`;
          ctx.fillStyle = layer.color;
          ctx.strokeStyle = layer.strokeColor;
          ctx.lineWidth = (layer.strokeWidth / 100) * fontSize;
          ctx.textAlign = layer.align;
          ctx.textBaseline = 'middle';
          ctx.globalAlpha = layer.opacity / 100;

          ctx.strokeText(text, x, y);
          ctx.fillText(text, x, y);
        });

        if (isExport) {
          canvas.toBlob((blob) => {
            resolve({ blob, preview: URL.createObjectURL(blob), name: `pixelforge_meme_${Date.now()}.jpg` });
          }, 'image/jpeg', 0.95);
        } else {
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        }
      };
      img.src = image.preview;
    });
  }, [image, layers]);

  const handleDownload = async () => {
    setIsProcessing(true);
    try {
      const exportResult = await renderMeme(true);
      const link = document.createElement('a');
      link.href = exportResult.preview;
      link.download = exportResult.name;
      link.click();
      addToast('Meme downloaded!', 'success');
    } catch (err) {
      addToast('Download failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const activeLayer = layers[activeLayerIndex];

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold mb-6"
        >
          <Smile size={16} /> Advanced Meme Studio
        </motion.div>
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
          Create <span className="gradient-text">Viral Memes</span>
        </h1>
        <p className="text-white/50 text-lg max-w-2xl mx-auto">
          The ultimate pro meme creator. Multiple layers, precise positioning, custom fonts, and real-time effects.
        </p>
      </div>

      {!image ? (
        <div className="max-w-4xl mx-auto">
          <Dropzone onFilesDropped={handleFilesDropped} multiple={false} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Editor Controls */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-morphism p-6 rounded-[2.5rem] border border-white/5 sticky top-28">
              {/* Layers List */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <TypeIcon size={20} className="text-primary" />
                  Text Layers
                </h3>
                <button 
                  onClick={addLayer}
                  className="p-2 rounded-xl bg-primary text-white hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                >
                  <Plus size={18} />
                </button>
              </div>

              <div className="space-y-2 mb-8 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                <AnimatePresence mode="popLayout">
                  {layers.map((layer, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`group flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                        activeLayerIndex === idx 
                        ? 'bg-primary/10 border-primary shadow-lg shadow-primary/5' 
                        : 'bg-white/5 border-white/5 hover:border-white/20'
                      }`}
                      onClick={() => setActiveLayerIndex(idx)}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                        activeLayerIndex === idx ? 'bg-primary text-white' : 'bg-white/10 text-white/40'
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className={`text-sm font-bold truncate ${activeLayerIndex === idx ? 'text-white' : 'text-white/40'}`}>
                          {layer.text || 'Empty Text'}
                        </p>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeLayer(idx); }}
                        className="p-2 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Active Layer Editor */}
              <div className="space-y-6 pt-6 border-t border-white/5">
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase mb-3">Content</label>
                  <textarea
                    value={activeLayer.text}
                    onChange={(e) => updateLayer(activeLayerIndex, { text: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:border-primary/50 focus:outline-none transition-all resize-none h-24"
                    placeholder="Enter meme text..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-white/40 uppercase mb-3">Font Size</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="range" min="10" max="200" 
                        value={activeLayer.fontSize} 
                        onChange={(e) => updateLayer(activeLayerIndex, { fontSize: parseInt(e.target.value) })}
                        className="flex-grow h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary" 
                      />
                      <span className="text-xs font-bold text-white/60 w-8">{activeLayer.fontSize}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/40 uppercase mb-3">Opacity</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="range" min="0" max="100" 
                        value={activeLayer.opacity} 
                        onChange={(e) => updateLayer(activeLayerIndex, { opacity: parseInt(e.target.value) })}
                        className="flex-grow h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary" 
                      />
                      <span className="text-xs font-bold text-white/60 w-8">{activeLayer.opacity}%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase mb-3">Typography</label>
                  <div className="grid grid-cols-2 gap-3">
                    <select 
                      value={activeLayer.fontFamily} 
                      onChange={(e) => updateLayer(activeLayerIndex, { fontFamily: e.target.value })}
                      className="px-4 py-3 rounded-xl bg-[#1a1a2e] border border-white/10 text-white text-sm focus:border-primary/50 focus:outline-none"
                    >
                      {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                    <div className="flex bg-white/5 rounded-xl border border-white/10 p-1">
                      {[
                        { val: 'left', icon: <AlignLeft size={16} /> },
                        { val: 'center', icon: <AlignCenter size={16} /> },
                        { val: 'right', icon: <AlignRight size={16} /> }
                      ].map(a => (
                        <button
                          key={a.val}
                          onClick={() => updateLayer(activeLayerIndex, { align: a.val })}
                          className={`flex-1 flex items-center justify-center p-2 rounded-lg transition-all ${activeLayer.align === a.val ? 'bg-primary text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                        >
                          {a.icon}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="block text-xs font-bold text-white/40 uppercase mb-3">Position X</label>
                    <input 
                      type="range" min="0" max="100" 
                      value={activeLayer.x} 
                      onChange={(e) => updateLayer(activeLayerIndex, { x: parseInt(e.target.value) })}
                      className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/40 uppercase mb-3">Position Y</label>
                    <input 
                      type="range" min="0" max="100" 
                      value={activeLayer.y} 
                      onChange={(e) => updateLayer(activeLayerIndex, { y: parseInt(e.target.value) })}
                      className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-white/40 uppercase mb-3">Color</label>
                    <div className="flex items-center gap-3 p-2 rounded-2xl bg-white/5 border border-white/10">
                      <input 
                        type="color" 
                        value={activeLayer.color} 
                        onChange={(e) => updateLayer(activeLayerIndex, { color: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none"
                      />
                      <span className="text-[10px] font-mono text-white/60 uppercase">{activeLayer.color}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/40 uppercase mb-3">Stroke</label>
                    <div className="flex items-center gap-3 p-2 rounded-2xl bg-white/5 border border-white/10">
                      <input 
                        type="color" 
                        value={activeLayer.strokeColor} 
                        onChange={(e) => updateLayer(activeLayerIndex, { strokeColor: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none"
                      />
                      <span className="text-[10px] font-mono text-white/60 uppercase">{activeLayer.strokeColor}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateLayer(activeLayerIndex, { isUppercase: !activeLayer.isUppercase })}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                        activeLayer.isUppercase ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/10 text-white/40'
                      }`}
                    >
                      AA
                    </button>
                  </div>
                  <button 
                    onClick={handleDownload}
                    disabled={isProcessing}
                    className="px-8 py-3 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isProcessing ? <RefreshCcw size={18} className="animate-spin" /> : 'Download'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Area */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="glass-morphism p-4 sm:p-10 rounded-[3rem] border border-white/5 flex items-center justify-center min-h-[600px] relative overflow-hidden">
               <div className="absolute inset-0 opacity-10 checker-bg" />
               
               <div className="relative group max-w-full">
                 <img 
                  src={image.preview} 
                  className="max-h-[75vh] w-auto object-contain rounded-2xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] relative z-10"
                  alt="Meme source"
                 />
                 
                 {/* Live Canvas Overlay (Visual only, scaling is tricky) */}
                 <div className="absolute inset-0 z-20 pointer-events-none select-none overflow-hidden rounded-2xl">
                    {layers.map((layer, idx) => (
                      <div
                        key={idx}
                        className={`absolute text-center whitespace-nowrap transition-all duration-75 ${activeLayerIndex === idx ? 'ring-2 ring-primary ring-offset-4 ring-offset-transparent' : ''}`}
                        style={{
                          left: `${layer.x}%`,
                          top: `${layer.y}%`,
                          transform: `translate(${layer.align === 'center' ? '-50%' : layer.align === 'right' ? '-100%' : '0'}, -50%)`,
                          fontSize: `${layer.fontSize}px`, // This will be visually approximate
                          color: layer.color,
                          fontFamily: layer.fontFamily,
                          fontWeight: 900,
                          textAlign: layer.align,
                          textShadow: `
                            -${layer.strokeWidth/2}px -${layer.strokeWidth/2}px 0 ${layer.strokeColor},
                             ${layer.strokeWidth/2}px -${layer.strokeWidth/2}px 0 ${layer.strokeColor},
                            -${layer.strokeWidth/2}px  ${layer.strokeWidth/2}px 0 ${layer.strokeColor},
                             ${layer.strokeWidth/2}px  ${layer.strokeWidth/2}px 0 ${layer.strokeColor}
                          `,
                          opacity: layer.opacity / 100,
                          zIndex: activeLayerIndex === idx ? 50 : 20
                        }}
                      >
                        {layer.isUppercase ? layer.text.toUpperCase() : layer.text}
                      </div>
                    ))}
                 </div>
               </div>

               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 z-30">
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                    <Move size={10} /> Live Preview
                  </p>
               </div>
            </div>

            <div className="flex items-center justify-between px-6">
              <button 
                onClick={() => { setImage(null); setLayers([{ ...DEFAULT_LAYER, text: 'TOP TEXT', y: 10 }, { ...DEFAULT_LAYER, text: 'BOTTOM TEXT', y: 85 }]); }}
                className="text-white/30 hover:text-white transition-all text-sm font-bold flex items-center gap-2"
              >
                <RefreshCcw size={14} /> Start Over
              </button>
              <p className="text-white/20 text-xs italic">
                Render quality is optimized for high-resolution download.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemeGenerator;

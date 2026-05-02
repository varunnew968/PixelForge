import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Dropzone from '../components/Dropzone';
import { FileImage, Download, RefreshCcw, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { useToast } from '../components/Toast';


const ImageToPDF = () => {
  const [images, setImages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pageSize, setPageSize] = useState('A4');
  const [orientation, setOrientation] = useState('portrait');
  const [fit, setFit] = useState('fit');
  const { addToast } = useToast();
  

  const pageSizes = {
    A4: { w: 595.28, h: 841.89 },
    A3: { w: 841.89, h: 1190.55 },
    Letter: { w: 612, h: 792 },
    Square: { w: 595.28, h: 595.28 },
  };

  const handleFilesDropped = (files) => {
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (id) => setImages(prev => prev.filter(img => img.id !== id));

  const moveImage = (id, dir) => {
    setImages(prev => {
      const idx = prev.findIndex(img => img.id === id);
      if (idx === -1) return prev;
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return arr;
    });
  };

  const generatePDF = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    addToast('Generating PDF...', 'info', 8000);

    try {
      let ps = pageSizes[pageSize];
      if (orientation === 'landscape') {
        ps = { w: ps.h, h: ps.w };
      }

      // Build a minimal PDF manually
      const pdfParts = [];
      const xobjects = [];
      const pages = [];
      let offset = 0;

      // We'll use canvas to convert images to JPEG data URLs
      const imageDataList = await Promise.all(images.map(img => new Promise((resolve) => {
        const image = new Image();
        image.onload = () => {
          const canvas = document.createElement('canvas');
          let iw = image.width, ih = image.height;
          if (fit === 'fit') {
            const scale = Math.min(ps.w / iw, ps.h / ih);
            iw = iw * scale; ih = ih * scale;
          } else if (fit === 'fill') {
            const scale = Math.max(ps.w / iw, ps.h / ih);
            iw = iw * scale; ih = ih * scale;
          } else {
            iw = ps.w; ih = ps.h;
          }
          canvas.width = Math.round(iw);
          canvas.height = Math.round(ih);
          const ctx = canvas.getContext('2d');
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve({ dataUrl: canvas.toDataURL('image/jpeg', 0.92), w: Math.round(iw), h: Math.round(ih) });
        };
        image.src = img.preview;
      })));

      // jsPDF is not installed, use iframe print approach with canvas
      // Create a hidden iframe with the images and trigger print-to-PDF
      const html = `<!DOCTYPE html><html><head><style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: white; }
        .page { width: ${ps.w}pt; height: ${ps.h}pt; display: flex; align-items: center; justify-content: center; page-break-after: always; overflow: hidden; }
        img { max-width: 100%; max-height: 100%; object-fit: ${fit === 'fill' ? 'cover' : fit === 'stretch' ? 'fill' : 'contain'}; }
        @page { size: ${pageSize} ${orientation}; margin: 0; }
        @media print { .page { page-break-after: always; } }
      </style></head><body>
        ${imageDataList.map(d => `<div class="page"><img src="${d.dataUrl}" /></div>`).join('')}
      </body></html>`;

      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(html);
      iframeDoc.close();

      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        document.body.removeChild(iframe);
        
        addToast('PDF dialog opened! Save as PDF.', 'success');
        setIsProcessing(false);
      }, 1200);
    } catch (err) {
      addToast('PDF generation failed. Please try again.', 'error');
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          Image to <span className="gradient-text">PDF</span>
        </h1>
        <p className="text-white/50 text-lg">
          Convert and arrange multiple images into a single PDF document.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="glass-morphism p-8 rounded-3xl border border-white/5 sticky top-28 space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <FileImage className="text-primary" size={20} />
              PDF Settings
            </h3>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-3">Page Size</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(pageSizes).map(size => (
                  <button key={size} onClick={() => setPageSize(size)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${pageSize === size ? 'bg-primary text-white' : 'bg-white/5 border border-white/10 text-white/50 hover:text-white'}`}>
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-3">Orientation</label>
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                <button onClick={() => setOrientation('portrait')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${orientation === 'portrait' ? 'bg-primary text-white' : 'text-white/40 hover:text-white'}`}>
                  Portrait
                </button>
                <button onClick={() => setOrientation('landscape')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${orientation === 'landscape' ? 'bg-primary text-white' : 'text-white/40 hover:text-white'}`}>
                  Landscape
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-3">Image Fit</label>
              <div className="space-y-2">
                {['fit', 'fill', 'stretch'].map(f => (
                  <button key={f} onClick={() => setFit(f)}
                    className={`w-full py-2 rounded-xl text-xs font-bold capitalize transition-all ${fit === f ? 'bg-primary text-white' : 'bg-white/5 border border-white/10 text-white/50 hover:text-white'}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={generatePDF}
              disabled={images.length === 0 || isProcessing}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary font-bold shadow-lg shadow-primary/20 disabled:opacity-50 hover:opacity-90 transition-all"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCcw className="animate-spin" size={20} /> Generating...
                </span>
              ) : 'Generate PDF'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-3">
          <Dropzone onFilesDropped={handleFilesDropped} />

          {images.length > 0 && (
            <AnimatePresence>
              <motion.div className="mt-6 space-y-3">
                <p className="text-white/40 text-sm font-medium">
                  {images.length} image(s) — drag to reorder
                </p>
                {images.map((img, idx) => (
                  <motion.div
                    key={img.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: idx * 0.04 }}
                    className="glass-morphism p-4 rounded-2xl border border-white/5 flex items-center gap-4"
                  >
                    <span className="w-8 h-8 rounded-xl bg-primary/20 text-primary text-sm font-bold flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <img src={img.preview} className="w-16 h-16 object-cover rounded-xl flex-shrink-0" alt="" />
                    <div className="flex-grow min-w-0">
                      <p className="font-semibold truncate text-sm">{img.file.name}</p>
                      <p className="text-white/40 text-xs mt-1">{(img.file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => moveImage(img.id, -1)} disabled={idx === 0}
                        className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white disabled:opacity-30 transition-all">
                        <ArrowUp size={16} />
                      </button>
                      <button onClick={() => moveImage(img.id, 1)} disabled={idx === images.length - 1}
                        className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white disabled:opacity-30 transition-all">
                        <ArrowDown size={16} />
                      </button>
                      <button onClick={() => removeImage(img.id)}
                        className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageToPDF;


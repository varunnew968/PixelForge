import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Dropzone from '../components/Dropzone';
import { FileSearch, Download, RefreshCcw, Camera, Calendar, MapPin, Cpu, Image as ImageIcon } from 'lucide-react';
import { useToast } from '../components/Toast';


// Read EXIF data using manual binary parsing
const readExif = async (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target.result;
        const view = new DataView(buffer);

        // Check JPEG SOI marker
        if (view.getUint16(0) !== 0xFFD8) {
          resolve(null); return;
        }

        const exif = {};
        let offset = 2;
        while (offset < view.byteLength - 2) {
          const marker = view.getUint16(offset);
          if (marker === 0xFFE1) {
            // APP1 marker - EXIF data
            const exifLength = view.getUint16(offset + 2);
            const exifData = new DataView(buffer, offset + 4, exifLength - 2);
            const exifHeader = String.fromCharCode(...new Uint8Array(buffer, offset + 4, 4));
            if (exifHeader === 'Exif') {
              const tiffOffset = 6;
              const byteOrder = exifData.getUint16(tiffOffset);
              const littleEndian = byteOrder === 0x4949;
              const ifdOffset = exifData.getUint32(tiffOffset + 4, littleEndian);

              const tagNames = {
                0x010F: 'Make', 0x0110: 'Model', 0x0112: 'Orientation',
                0x011A: 'XResolution', 0x011B: 'YResolution',
                0x0132: 'DateTime', 0x8769: 'ExifIFD',
                0x8825: 'GPS IFD', 0x0213: 'YCbCrPositioning',
                0x0128: 'ResolutionUnit', 0x013B: 'Artist',
                0x013E: 'WhitePoint',
              };

              const ifdEntries = exifData.getUint16(tiffOffset + ifdOffset, littleEndian);
              for (let i = 0; i < ifdEntries; i++) {
                const entryOffset = tiffOffset + ifdOffset + 2 + i * 12;
                const tag = exifData.getUint16(entryOffset, littleEndian);
                const type = exifData.getUint16(entryOffset + 2, littleEndian);
                const count = exifData.getUint32(entryOffset + 4, littleEndian);
                const name = tagNames[tag];
                if (name) {
                  if (type === 2) { // ASCII
                    const strOffset = count <= 4
                      ? entryOffset + 8
                      : tiffOffset + exifData.getUint32(entryOffset + 8, littleEndian);
                    let str = '';
                    for (let j = 0; j < count - 1; j++) {
                      str += String.fromCharCode(exifData.getUint8(strOffset + j));
                    }
                    exif[name] = str.trim();
                  } else if (type === 3) {
                    exif[name] = exifData.getUint16(entryOffset + 8, littleEndian);
                  } else if (type === 4) {
                    exif[name] = exifData.getUint32(entryOffset + 8, littleEndian);
                  }
                }
              }
            }
            break;
          }
          if (marker === 0xFFDA) break;
          const segLength = view.getUint16(offset + 2);
          offset += 2 + segLength;
        }
        resolve(Object.keys(exif).length > 0 ? exif : null);
      } catch {
        resolve(null);
      }
    };
    reader.readAsArrayBuffer(file);
  });
};

const EXIFViewer = () => {
  const [images, setImages] = useState([]);
  const [results, setResults] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
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
      const exif = await readExif(img.file);
      const basicInfo = {
        'File Name': img.file.name,
        'File Size': `${(img.file.size / 1024).toFixed(2)} KB`,
        'File Type': img.file.type,
        'Last Modified': new Date(img.file.lastModified).toLocaleString(),
      };

      // Get image dimensions
      const dims = await new Promise((res) => {
        const i = new Image();
        i.onload = () => res({ Width: `${i.width}px`, Height: `${i.height}px`, Megapixels: `${(i.width * i.height / 1000000).toFixed(2)} MP` });
        i.src = img.preview;
      });

      processedResults.push({
        id: img.id,
        preview: img.preview,
        fileName: img.file.name,
        data: { ...basicInfo, ...dims, ...(exif || { 'EXIF Data': 'Not available (non-JPEG or no EXIF metadata)' }) }
      });
    }
    setResults(processedResults);
    track(processedResults.map(r => ({
      fileName: r.fileName,
      outputSize: null, // No output file size for metadata viewing
    })), 'EXIF Viewer');
    setIsProcessing(false);
    addToast('EXIF data extracted!', 'success');
  };

  const exportJSON = (data, fileName) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName.replace(/\.[^.]+$/, '')}-exif.json`;
    link.click();
    addToast('EXIF exported as JSON!', 'success');
  };

  const iconForKey = (key) => {
    if (key.toLowerCase().includes('date') || key.toLowerCase().includes('modified')) return <Calendar size={14} />;
    if (key.toLowerCase().includes('make') || key.toLowerCase().includes('model')) return <Camera size={14} />;
    if (key.toLowerCase().includes('gps') || key.toLowerCase().includes('location')) return <MapPin size={14} />;
    if (key.toLowerCase().includes('width') || key.toLowerCase().includes('height') || key.toLowerCase().includes('pixel')) return <ImageIcon size={14} />;
    return <Cpu size={14} />;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          EXIF <span className="gradient-text">Metadata Viewer</span>
        </h1>
        <p className="text-white/50 text-lg">
          View hidden metadata in your photos: camera model, date, GPS location, resolution and more.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="glass-morphism p-8 rounded-3xl border border-white/5 sticky top-28 space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <FileSearch className="text-primary" size={20} />
              Options
            </h3>
            <button onClick={handleExtract} disabled={images.length === 0 || isProcessing}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary font-bold shadow-lg shadow-primary/20 disabled:opacity-50 hover:opacity-90 transition-all">
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCcw className="animate-spin" size={20} /> Reading...
                </span>
              ) : 'Extract EXIF Data'}
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
          <Dropzone onFilesDropped={handleFilesDropped} />
          <AnimatePresence>
            {results.map(result => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 glass-morphism rounded-3xl border border-white/5 overflow-hidden"
              >
                <div className="flex items-center gap-4 p-6 border-b border-white/5">
                  <img src={result.preview} className="w-16 h-16 object-cover rounded-xl flex-shrink-0" alt="" />
                  <div className="flex-grow">
                    <h4 className="font-bold">{result.fileName}</h4>
                    <p className="text-white/40 text-sm mt-1">{Object.keys(result.data).length} metadata fields found</p>
                  </div>
                  <button onClick={() => exportJSON(result.data, result.fileName)}
                    className="p-3 rounded-xl bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-all">
                    <Download size={18} />
                  </button>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(result.data).map(([key, value]) => (
                    <div key={key} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <span className="text-primary mt-0.5 flex-shrink-0">{iconForKey(key)}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white/40 uppercase tracking-wider">{key}</p>
                        <p className="text-sm font-medium text-white mt-1 break-all">{String(value)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default EXIFViewer;


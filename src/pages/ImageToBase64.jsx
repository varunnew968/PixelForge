import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Dropzone from '../components/Dropzone';
import { Binary, Copy, Download, RefreshCcw, Code, CheckCircle2 } from 'lucide-react';
import { useToast } from '../components/Toast';


const ImageToBase64 = () => {
  const [images, setImages] = useState([]);
  const [results, setResults] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputFormat, setOutputFormat] = useState('dataurl');
  const { addToast } = useToast();
  

  const handleFilesDropped = (files) => {
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const convertToBase64 = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    const processedResults = [];
    for (const img of images) {
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(img.file);
      });
      const rawBase64 = base64.split(',')[1];
      processedResults.push({
        id: img.id,
        fileName: img.file.name,
        preview: img.preview,
        dataUrl: base64,
        raw: rawBase64,
        cssBackground: `background-image: url('${base64}');`,
        imgTag: `<img src="${base64}" alt="${img.file.name}" />`,
        size: img.file.size,
        encodedSize: base64.length,
      });
    }
    setResults(processedResults);
    track(processedResults.map(r => ({
      fileName: r.fileName,
      outputSize: r.encodedSize,
    })), 'Image to Base64');
    setIsProcessing(false);
    addToast('Converted to Base64!', 'success');
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    addToast(`${label} copied to clipboard!`, 'info');
  };

  const downloadText = (text, fileName) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    addToast('File downloaded!', 'success');
  };

  const getOutput = (result) => {
    switch (outputFormat) {
      case 'raw': return result.raw;
      case 'css': return result.cssBackground;
      case 'html': return result.imgTag;
      default: return result.dataUrl;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          Image to <span className="gradient-text">Base64</span>
        </h1>
        <p className="text-white/50 text-lg">
          Convert images to Base64 encoded strings for embedding in HTML, CSS, or APIs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="glass-morphism p-8 rounded-3xl border border-white/5 sticky top-28 space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Binary className="text-primary" size={20} />
              Output Format
            </h3>

            <div className="space-y-2">
              {[
                { id: 'dataurl', label: 'Data URL', desc: 'data:image/...' },
                { id: 'raw', label: 'Raw Base64', desc: 'Pure base64 string' },
                { id: 'css', label: 'CSS Background', desc: 'background-image: url(...)' },
                { id: 'html', label: 'HTML img tag', desc: '<img src="..." />' },
              ].map(fmt => (
                <button key={fmt.id} onClick={() => setOutputFormat(fmt.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${outputFormat === fmt.id ? 'border-primary bg-primary/10' : 'border-white/5 bg-white/3 hover:border-white/20'}`}>
                  <p className={`text-sm font-bold ${outputFormat === fmt.id ? 'text-primary' : 'text-white'}`}>{fmt.label}</p>
                  <p className="text-xs text-white/40 mt-0.5 font-mono">{fmt.desc}</p>
                </button>
              ))}
            </div>

            <button onClick={convertToBase64} disabled={images.length === 0 || isProcessing}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary font-bold shadow-lg shadow-primary/20 disabled:opacity-50 hover:opacity-90 transition-all">
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCcw className="animate-spin" size={20} /> Converting...
                </span>
              ) : 'Convert to Base64'}
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
                  <img src={result.preview} className="w-14 h-14 object-cover rounded-xl flex-shrink-0" alt="" />
                  <div className="flex-grow">
                    <h4 className="font-bold">{result.fileName}</h4>
                    <div className="flex gap-4 mt-1 text-sm text-white/40">
                      <span>Original: {(result.size / 1024).toFixed(1)} KB</span>
                      <span>Encoded: {(result.encodedSize / 1024).toFixed(1)} KB</span>
                      <span className="text-orange-400">+{Math.round((result.encodedSize / result.size - 1) * 100)}% size</span>
                    </div>
                  </div>
                  <CheckCircle2 className="text-green-400 flex-shrink-0" size={24} />
                </div>

                <div className="p-6">
                  <div className="relative">
                    <pre className="bg-black/40 rounded-2xl p-4 text-xs font-mono text-primary/80 overflow-x-auto max-h-[120px] overflow-y-auto scrollbar-thin whitespace-pre-wrap break-all">
                      {getOutput(result).substring(0, 500)}{getOutput(result).length > 500 ? '...' : ''}
                    </pre>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => copyToClipboard(getOutput(result), 'Output')}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-all text-sm font-bold">
                        <Copy size={14} /> Copy
                      </button>
                      <button onClick={() => downloadText(getOutput(result), `${result.fileName}-base64.txt`)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white transition-all text-sm font-bold">
                        <Download size={14} /> Download .txt
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ImageToBase64;


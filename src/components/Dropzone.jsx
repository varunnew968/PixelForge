import React, { useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, ClipboardPaste } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from './Toast';

const Dropzone = ({ onFilesDropped, multiple = true, accept = { 'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif', '.bmp', '.tiff', '.svg'] } }) => {
  const { addToast } = useToast();

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length > 0) {
      onFilesDropped(acceptedFiles);
    }
  }, [onFilesDropped]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple
  });

  // Paste support
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const imageFiles = [];
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) imageFiles.push(file);
        }
      }
      if (imageFiles.length > 0) {
        onFilesDropped(multiple ? imageFiles : [imageFiles[0]]);
        addToast('Image pasted from clipboard!', 'success');
      }
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [onFilesDropped, multiple, addToast]);

  return (
    <motion.div
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.995 }}
      {...getRootProps()}
      className={`relative cursor-pointer group p-12 rounded-[2rem] border-2 border-dashed transition-all duration-300
        ${isDragActive ? 'border-primary bg-primary/10 scale-[1.01]' : 'border-white/10 hover:border-primary/50 hover:bg-white/[0.02]'}`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center text-center">
        <motion.div
          animate={isDragActive ? { scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] } : {}}
          transition={{ duration: 0.5 }}
          className={`mb-6 p-6 rounded-3xl bg-white/5 group-hover:scale-110 transition-transform ${isDragActive ? 'text-primary' : 'text-white/40'}`}
        >
          <Upload size={48} />
        </motion.div>
        <h3 className="text-2xl font-bold mb-2">
          {isDragActive ? '✨ Drop it here!' : 'Drag & drop images'}
        </h3>
        <p className="text-white/40 mb-8 max-w-sm">
          or click to browse. Supports JPG, PNG, WebP, GIF, BMP and more.
        </p>

        {/* Action Badges */}
        <div className="flex flex-wrap justify-center gap-3">
          <Badge text="Max 50MB per file" />
          <Badge text="100% Private" />
          <Badge text="Instant Processing" />
        </div>



        <p className="mt-3 text-white/25 text-xs flex items-center gap-1">
          <ClipboardPaste size={11} /> Or paste image with Ctrl+V
        </p>
      </div>

      {/* Decorative corners */}
      <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-white/10 rounded-tl-xl group-hover:border-primary/40 transition-colors" />
      <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-white/10 rounded-tr-xl group-hover:border-primary/40 transition-colors" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-white/10 rounded-bl-xl group-hover:border-primary/40 transition-colors" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-white/10 rounded-br-xl group-hover:border-primary/40 transition-colors" />
    </motion.div>
  );
};

const Badge = ({ text }) => (
  <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-white/50">
    {text}
  </span>
);

export default Dropzone;

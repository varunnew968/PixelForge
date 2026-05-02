import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Camera, Layers, Zap, Image as ImageIcon, RefreshCcw, Type, Sparkles,
  ChevronDown, Menu, X, Upload, Sun, Moon, History, Eraser, Palette,
  FileImage, Binary, FileSearch, Wand2, Smile, LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useImages } from '../context/ImageContext';
import { useToast } from '../components/Toast';

const ALL_TOOLS = [
  // Core
  { to: '/compress-image-online', icon: <Zap size={18} />, label: 'Compress', color: 'text-yellow-400', category: 'Core' },
  { to: '/resize-image-online', icon: <Layers size={18} />, label: 'Resize', color: 'text-blue-400', category: 'Core' },
  { to: '/convert-image-online', icon: <ImageIcon size={18} />, label: 'Convert', color: 'text-purple-400', category: 'Core' },
  { to: '/crop-image-online', icon: <Camera size={18} />, label: 'Crop', color: 'text-cyan-400', category: 'Core' },
  { to: '/rotate-image-online', icon: <RefreshCcw size={18} />, label: 'Rotate & Flip', color: 'text-orange-400', category: 'Core' },
  { to: '/watermark-image-online', icon: <Type size={18} />, label: 'Watermark', color: 'text-emerald-400', category: 'Core' },
  { to: '/enhance-image-online', icon: <Sparkles size={18} />, label: 'Enhance', color: 'text-pink-400', category: 'Core' },
  // AI / Advanced
  { to: '/remove-background-online', icon: <Eraser size={18} />, label: 'Remove Background', color: 'text-red-400', category: 'AI' },
  { to: '/filter-studio-online', icon: <Wand2 size={18} />, label: 'Filter Studio', color: 'text-violet-400', category: 'AI' },
  // Utility
  { to: '/color-palette-online', icon: <Palette size={18} />, label: 'Color Palette', color: 'text-lime-400', category: 'Utility' },
  { to: '/image-to-pdf-online', icon: <FileImage size={18} />, label: 'Image to PDF', color: 'text-sky-400', category: 'Utility' },
  { to: '/image-to-base64-online', icon: <Binary size={18} />, label: 'Image to Base64', color: 'text-fuchsia-400', category: 'Utility' },
  { to: '/exif-viewer-online', icon: <FileSearch size={18} />, label: 'EXIF Viewer', color: 'text-teal-400', category: 'Utility' },
  { to: '/meme-generator-online', icon: <Smile size={18} />, label: 'Meme Generator', color: 'text-amber-400', category: 'Fun' },
];

const NAV_PRIMARY = [
  { to: '/compress-image-online', label: 'Compress' },
  { to: '/resize-image-online', label: 'Resize' },
  { to: '/convert-image-online', label: 'Convert' },
  { to: '/crop-image-online', label: 'Crop' },
  { to: '/enhance-image-online', label: 'Enhance' },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isAllToolsOpen, setIsAllToolsOpen] = useState(false);
  const navigate = useNavigate();
  const { setImagesFromFiles } = useImages();
  const { addToast } = useToast();

  // Clipboard paste handler
  const handlePaste = useCallback((e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          setImagesFromFiles([file]);
          navigate('/compress-image-online');
          addToast('Image pasted from clipboard! 📋', 'success');
        }
      }
    }
  }, [setImagesFromFiles, navigate, addToast]);

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  const categories = ['Core', 'AI', 'Utility', 'Fun'];

  return (
    <nav className="sticky top-0 z-50 glass-morphism border-b border-white/10 shadow-2xl shadow-black/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center group flex-shrink-0">
            <img src="/logo_white.png" alt="PixelForge Logo" className="h-12 w-auto group-hover:scale-105 transition-transform" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-5">
            <NavLink to="/" label="Home" />
            {NAV_PRIMARY.map(item => (
              <NavLink key={item.to} to={item.to} label={item.label} />
            ))}

            {/* More Dropdown */}
            <div className="relative" onMouseLeave={() => setIsToolsOpen(false)}>
              <button
                onMouseEnter={() => setIsToolsOpen(true)}
                className="flex items-center gap-1 text-white/70 hover:text-white transition-colors font-semibold group py-2"
              >
                More <ChevronDown size={16} className={`transition-transform duration-300 ${isToolsOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {isToolsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 mt-2 w-64 glass-morphism rounded-2xl border border-white/10 p-2 shadow-2xl backdrop-blur-xl"
                  >
                    <DropdownItem to="/rotate-image-online" icon={<RefreshCcw size={18} />} label="Rotate & Flip" color="text-orange-400" />
                    <DropdownItem to="/watermark-image-online" icon={<Type size={18} />} label="Watermark" color="text-emerald-400" />
                    <DropdownItem to="/remove-background-online" icon={<Eraser size={18} />} label="Remove Background" color="text-red-400" />
                    <DropdownItem to="/filter-studio-online" icon={<Wand2 size={18} />} label="Filter Studio" color="text-violet-400" />
                    <DropdownItem to="/color-palette-online" icon={<Palette size={18} />} label="Color Palette" color="text-lime-400" />
                    <DropdownItem to="/meme-generator-online" icon={<Smile size={18} />} label="Meme Generator" color="text-amber-400" />
                    <DropdownItem to="/image-to-pdf-online" icon={<FileImage size={18} />} label="Image to PDF" color="text-sky-400" />
                    <DropdownItem to="/image-to-base64-online" icon={<Binary size={18} />} label="Image to Base64" color="text-fuchsia-400" />
                    <DropdownItem to="/exif-viewer-online" icon={<FileSearch size={18} />} label="EXIF Viewer" color="text-teal-400" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Upload Button */}
            <input
              type="file"
              id="global-upload"
              className="hidden"
              multiple
              accept="image/*"
              onChange={(e) => {
                if (e.target.files.length > 0) {
                  setImagesFromFiles(e.target.files);
                  navigate('/compress-image-online');
                  addToast(`${e.target.files.length} image(s) loaded!`, 'success');
                }
              }}
            />
            <button
              onClick={() => document.getElementById('global-upload').click()}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary font-bold text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-sm"
            >
              <Upload size={16} />
              Upload
            </button>

            {/* Mobile Menu */}
            <button
              className="lg:hidden p-3 text-white/70"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass-morphism border-t border-white/10 overflow-hidden"
          >
            <div className="px-4 py-6 flex flex-col gap-1 max-h-[70vh] overflow-y-auto">
              <MobileNavLink to="/" label="🏠 Home" onClick={() => setIsMenuOpen(false)} />
              <p className="text-white/30 text-xs font-bold uppercase tracking-wider mt-4 mb-2 px-2">Core Tools</p>
              {ALL_TOOLS.filter(t => t.category === 'Core').map(tool => (
                <MobileNavLink key={tool.to} to={tool.to} label={tool.label} onClick={() => setIsMenuOpen(false)} />
              ))}
              <p className="text-white/30 text-xs font-bold uppercase tracking-wider mt-4 mb-2 px-2">AI & Advanced</p>
              {ALL_TOOLS.filter(t => t.category === 'AI').map(tool => (
                <MobileNavLink key={tool.to} to={tool.to} label={tool.label} onClick={() => setIsMenuOpen(false)} />
              ))}
              <p className="text-white/30 text-xs font-bold uppercase tracking-wider mt-4 mb-2 px-2">Utilities</p>
              {ALL_TOOLS.filter(t => t.category === 'Utility').map(tool => (
                <MobileNavLink key={tool.to} to={tool.to} label={tool.label} onClick={() => setIsMenuOpen(false)} />
              ))}
              <p className="text-white/30 text-xs font-bold uppercase tracking-wider mt-4 mb-2 px-2">Fun</p>
              {ALL_TOOLS.filter(t => t.category === 'Fun').map(tool => (
                <MobileNavLink key={tool.to} to={tool.to} label={tool.label} onClick={() => setIsMenuOpen(false)} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const NavLink = ({ to, label }) => (
  <Link
    to={to}
    className="relative text-white/70 hover:text-white transition-all font-semibold group py-2 text-sm"
  >
    {label}
    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full shadow-[0_0_10px_#6366f1]"></span>
  </Link>
);

const DropdownItem = ({ to, icon, label, color }) => (
  <Link
    to={to}
    className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/5 text-white/70 hover:text-white transition-all group"
  >
    <span className={`${color || 'text-white/40'} group-hover:scale-110 transition-transform`}>{icon}</span>
    <span className="font-medium text-sm">{label}</span>
  </Link>
);

const MobileNavLink = ({ to, label, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="text-base font-bold text-white/70 hover:text-white hover:bg-white/5 transition-all py-2.5 px-3 rounded-xl block"
  >
    {label}
  </Link>
);

export default Navbar;

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Layers, Image as ImageIcon, Scissors, Shield, Gauge, Sparkles,
  MoveRight, RefreshCcw, Eraser, Palette, FileImage, Binary, FileSearch,
  Smile, Wand2, Type, Upload, Link as LinkIcon, ClipboardPaste
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useImages } from '../context/ImageContext';
import { useToast } from '../components/Toast';

const TOOL_CATEGORIES = [
  {
    name: 'Core Tools',
    color: 'from-blue-500/20 to-cyan-500/20',
    border: 'border-blue-500/20',
    tools: [
      { icon: <Zap className="text-yellow-400" />, title: 'Compress', desc: 'Reduce file size by up to 90% without losing quality.', link: '/compress-image-online', badge: 'Most Popular' },
      { icon: <Layers className="text-blue-400" />, title: 'Resize', desc: 'Batch resize images with custom dimensions & presets.', link: '/resize-image-online' },
      { icon: <ImageIcon className="text-purple-400" />, title: 'Convert', desc: 'Switch between JPG, PNG, WebP and GIF instantly.', link: '/convert-image-online' },
      { icon: <Scissors className="text-cyan-400" />, title: 'Crop', desc: 'Perfectly frame your shots with aspect ratio tools.', link: '/crop-image-online' },
      { icon: <RefreshCcw className="text-orange-400" />, title: 'Rotate & Flip', desc: 'Fix orientation or mirror images instantly.', link: '/rotate-image-online' },
      { icon: <Type className="text-emerald-400" />, title: 'Watermark', desc: 'Protect your work with text or image overlays.', link: '/watermark-image-online' },
      { icon: <Sparkles className="text-pink-400" />, title: 'Enhance', desc: 'Adjust brightness, contrast, and saturation.', link: '/enhance-image-online' },
    ]
  },
  {
    name: 'AI & Advanced',
    color: 'from-purple-500/20 to-pink-500/20',
    border: 'border-purple-500/20',
    tools: [
      { icon: <Eraser className="text-red-400" />, title: 'Remove Background', desc: 'Automatically erase backgrounds from images.', link: '/remove-background-online', badge: 'New' },
      { icon: <Wand2 className="text-violet-400" />, title: 'Filter Studio', desc: '12 Instagram-style filters with live preview.', link: '/filter-studio-online', badge: 'New' },
    ]
  },
  {
    name: 'Utilities',
    color: 'from-green-500/20 to-teal-500/20',
    border: 'border-green-500/20',
    tools: [
      { icon: <Palette className="text-lime-400" />, title: 'Color Palette', desc: 'Extract dominant colors & export CSS variables.', link: '/color-palette-online', badge: 'New' },
      { icon: <FileImage className="text-sky-400" />, title: 'Image to PDF', desc: 'Convert multiple images into a single PDF.', link: '/image-to-pdf-online', badge: 'New' },
      { icon: <Binary className="text-fuchsia-400" />, title: 'Image to Base64', desc: 'Convert images to Base64 for embedding in code.', link: '/image-to-base64-online', badge: 'New' },
      { icon: <FileSearch className="text-teal-400" />, title: 'EXIF Viewer', desc: 'View hidden metadata from any photo.', link: '/exif-viewer-online', badge: 'New' },
    ]
  },
  {
    name: 'Fun',
    color: 'from-yellow-500/20 to-orange-500/20',
    border: 'border-yellow-500/20',
    tools: [
      { icon: <Smile className="text-amber-400" />, title: 'Meme Generator', desc: 'Add hilarious text to any image. Classic meme style.', link: '/meme-generator-online', badge: 'New' },
    ]
  }
];

const WHY_US = [
  { icon: <Gauge className="w-8 h-8 text-cyan-400" />, title: 'Lightning Fast', desc: 'Optimized browser processing ensures desktop-level speed with zero server uploads.' },
  { icon: <Shield className="w-8 h-8 text-purple-400" />, title: '100% Private', desc: 'Your images never leave your device. Everything runs locally in the browser.' },
  { icon: <Sparkles className="w-8 h-8 text-pink-400" />, title: 'Studio Quality', desc: 'Smart algorithms deliver professional-grade results every time.' },
  { icon: <Zap className="w-8 h-8 text-yellow-400" />, title: 'Always Free', desc: 'All 14 tools with unlimited usage. No account, no ads, no limits.' },
  { icon: <Layers className="w-8 h-8 text-blue-400" />, title: 'Batch Processing', desc: 'Process hundreds of images simultaneously with one click.' },
  { icon: <ImageIcon className="w-8 h-8 text-emerald-400" />, title: 'All Formats', desc: 'Full support for JPG, PNG, WEBP, GIF, BMP, SVG and many more.' },
];

const Home = () => {
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();
  const { setImagesFromFiles } = useImages();
  const { addToast } = useToast();

  const allTools = TOOL_CATEGORIES.flatMap(cat => cat.tools.map(t => ({ ...t, category: cat.name })));
  const totalTools = allTools.length;

  const handlePaste = useCallback((e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          setImagesFromFiles([file]);
          navigate('/compress-image-online');
          addToast('Image pasted! Redirecting...', 'success');
        }
      }
    }
  }, [setImagesFromFiles, navigate, addToast]);

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  const displayTools = activeTab === 'all'
    ? allTools
    : allTools.filter(t => t.category === activeTab);

  return (
    <div className="pb-32 overflow-hidden">
      {/* Hero */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
            <Sparkles size={16} />
            <span>{totalTools} Professional Image Tools — 100% Free</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
            The Premium Suite for <br />
            <span className="gradient-text">Visual Perfection</span>
          </h1>
          <p className="text-xl text-white/60 font-medium max-w-3xl mx-auto mb-12">
            Professional-grade image tools right in your browser. Fast, private, and stunningly powerful. No uploads to server required.
          </p>

          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <Link
              to="/compress-image-online"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary text-lg font-bold shadow-2xl shadow-primary/40 hover:scale-105 transition-transform flex items-center gap-2"
            >
              Get Started <MoveRight />
            </Link>
            <button
              onClick={() => document.getElementById('tools-grid').scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-lg font-bold hover:bg-white/10 transition-colors"
            >
              View All {totalTools} Tools
            </button>
          </div>

          {/* Quick tips */}
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/3 border border-white/10 text-white/40 text-xs font-medium">
              <ClipboardPaste size={12} />
              Paste image with Ctrl+V anywhere
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/3 border border-white/10 text-white/40 text-xs font-medium">
              <Upload size={12} />
              Upload from device
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/3 border border-white/10 text-white/40 text-xs font-medium">
              <LinkIcon size={12} />
              Import from URL
            </div>
          </div>
        </motion.div>

        {/* Tools Grid */}
        <div id="tools-grid" className="mt-28">
          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {['all', ...TOOL_CATEGORIES.map(c => c.name)].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all capitalize ${activeTab === tab ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 border border-white/10 text-white/50 hover:text-white'}`}
              >
                {tab === 'all' ? `All Tools (${totalTools})` : tab}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <AnimatePresence mode="popLayout">
              {displayTools.map((tool, idx) => (
                <ToolCard key={tool.title} {...tool} delay={idx * 0.05} />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Why Us */}
        <div className="mt-48">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4">Why Choose <span className="gradient-text">PixelForge?</span></h2>
            <p className="text-white/40 text-lg">Professional tools with zero compromises.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
            {WHY_US.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group p-8 rounded-[2rem] glass-morphism border border-white/5 hover:border-primary/30 transition-all hover:scale-[1.02] relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl group-hover:bg-primary/10 transition-colors" />
                <div className="mb-6 p-4 rounded-2xl bg-white/5 w-fit border border-white/10 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-white/40 leading-relaxed text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-32 p-12 rounded-[2.5rem] bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/10 border border-primary/20 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.15),transparent_70%)]" />
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 relative">Ready to transform your images?</h2>
          <p className="text-white/50 mb-8 text-lg relative">Join thousands of designers, developers and creators using PixelForge daily.</p>
          <div className="flex flex-wrap justify-center gap-4 relative">
            <Link to="/compress-image-online"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary font-bold shadow-xl shadow-primary/30 hover:scale-105 transition-transform flex items-center gap-2 text-lg">
              Start Free Now <MoveRight />
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

const ToolCard = ({ icon, title, desc, link, badge, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay }}
    layout
  >
    <Link
      to={link}
      className="group block p-7 rounded-3xl glass-morphism hover:bg-white/[0.05] border border-white/5 hover:border-white/20 transition-all text-left relative overflow-hidden h-full"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-[50px] group-hover:bg-primary/20 transition-colors" />

      {badge && (
        <span className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-[10px] font-bold uppercase tracking-wider">
          {badge}
        </span>
      )}

      <div className="mb-5 p-4 rounded-2xl bg-white/5 inline-block group-hover:scale-110 transition-transform">
        {React.cloneElement(icon, { size: 28 })}
      </div>
      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-white/50 mb-5 leading-relaxed text-sm">{desc}</p>
      <div className="flex items-center gap-2 text-xs font-bold text-primary group-hover:translate-x-2 transition-transform">
        TRY TOOL <MoveRight size={14} />
      </div>
    </Link>
  </motion.div>
);

export default Home;


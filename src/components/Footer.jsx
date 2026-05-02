import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Shield } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#080808] border-t border-white/5 py-16 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center mb-6">
              <img src="/logo_white.png" alt="PixelForge" className="h-12 w-auto" />
            </Link>
            <p className="text-white/40 max-w-sm mb-6 leading-relaxed">
              The ultimate toolkit for fast, private, and professional image processing. 14 tools. Zero server uploads. Always free.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1.5 text-white/30">
                <Shield size={14} className="text-green-400" /> 100% Private
              </span>
              <span className="flex items-center gap-1.5 text-white/30">
                <Zap size={14} className="text-yellow-400" /> Always Free
              </span>
            </div>
          </div>

          {/* Core Tools */}
          <div>
            <h4 className="font-bold mb-5 text-sm text-white uppercase tracking-wider">Core Tools</h4>
            <ul className="space-y-3 text-white/40">
              {[
                { to: '/compress-image-online', label: 'Compress Image' },
                { to: '/resize-image-online', label: 'Resize Image' },
                { to: '/convert-image-online', label: 'Convert Format' },
                { to: '/crop-image-online', label: 'Crop Image' },
                { to: '/rotate-image-online', label: 'Rotate & Flip' },
                { to: '/watermark-image-online', label: 'Watermark' },
                { to: '/enhance-image-online', label: 'Image Enhancer' },
              ].map(item => (
                <li key={item.to}>
                  <Link to={item.to} className="hover:text-primary transition-colors text-sm">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* New Tools + Legal */}
          <div>
            <h4 className="font-bold mb-5 text-sm text-white uppercase tracking-wider">New Tools</h4>
            <ul className="space-y-3 text-white/40 mb-8">
              {[
                { to: '/remove-background-online', label: 'Remove Background' },
                { to: '/filter-studio-online', label: 'Filter Studio' },
                { to: '/color-palette-online', label: 'Color Palette' },
                { to: '/image-to-pdf-online', label: 'Image to PDF' },
                { to: '/image-to-base64-online', label: 'Image to Base64' },
                { to: '/exif-viewer-online', label: 'EXIF Viewer' },
                { to: '/meme-generator-online', label: 'Meme Generator' },
              ].map(item => (
                <li key={item.to}>
                  <Link to={item.to} className="hover:text-primary transition-colors text-sm">
                    <span className="text-primary/60 text-xs mr-1">✦</span>{item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h4 className="font-bold mb-4 text-sm text-white uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-white/40">
              {[
                { to: '/about', label: 'About Us' },
                { to: '/privacy', label: 'Privacy Policy' },
                { to: '/terms', label: 'Terms of Service' },
              ].map(item => (
                <li key={item.to}>
                  <Link to={item.to} className="hover:text-primary transition-colors text-sm">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 text-center text-white/20 text-sm">
          <p>© {new Date().getFullYear()} PixelForge. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

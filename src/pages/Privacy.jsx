import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, EyeOff, ServerOff } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl font-extrabold mb-6">Privacy <span className="gradient-text">Policy</span></h1>
        <p className="text-xl text-white/60">
          Your privacy is built into our code. Literally.
        </p>
      </motion.div>

      <div className="space-y-12">
        <section className="glass-morphism p-8 rounded-3xl border border-white/5">
          <div className="flex items-center gap-4 mb-6">
            <ServerOff className="text-primary" size={32} />
            <h2 className="text-2xl font-bold">100% Client-Side Processing</h2>
          </div>
          <p className="text-white/60 leading-relaxed">
            The most important thing you should know: **We never upload your images to our servers.** 
            All processing (compression, resizing, etc.) happens directly within your web browser using JavaScript and WebAssembly. 
            Your images stay on your device throughout the entire process.
          </p>
        </section>

        <section className="glass-morphism p-8 rounded-3xl border border-white/5">
          <div className="flex items-center gap-4 mb-6">
            <Lock className="text-secondary" size={32} />
            <h2 className="text-2xl font-bold">No Data Collection</h2>
          </div>
          <p className="text-white/60 leading-relaxed">
            We do not collect personal information. We don't have user accounts, we don't track your identity, and we don't store your original or processed images. 
            Once you close the tab, all image data is wiped from your browser's temporary memory.
          </p>
        </section>

        <section className="glass-morphism p-8 rounded-3xl border border-white/5">
          <div className="flex items-center gap-4 mb-6">
            <EyeOff className="text-accent" size={32} />
            <h2 className="text-2xl font-bold">Cookies & Analytics</h2>
          </div>
          <p className="text-white/60 leading-relaxed">
            We use minimal, anonymous analytics (like Google Analytics or similar) to understand how many people use our tools. 
            This data is used solely to improve the application and does not contain any identifying information or image data.
          </p>
        </section>

        <div className="text-center text-white/30 text-sm italic">
          Last Updated: May 2026
        </div>
      </div>
    </div>
  );
};

export default Privacy;


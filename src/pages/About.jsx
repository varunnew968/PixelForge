import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Shield, Zap, Image as ImageIcon } from 'lucide-react';

const About = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl font-extrabold mb-6">About <span className="gradient-text">PixelForge</span></h1>
        <p className="text-xl text-white/60 leading-relaxed">
          We are on a mission to provide the world's most accessible, private, and high-quality image processing tools.
          Built with love for creators, designers, and developers.
        </p>
      </motion.div>

      <div className="space-y-20">
        <section className="glass-morphism p-10 rounded-[2.5rem] border border-white/5">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Heart className="text-primary" /> Our Story
          </h2>
          <p className="text-white/60 leading-relaxed text-lg">
            PixelForge started as a simple experiment: could we build professional image tools that run entirely in the browser?
            No accounts, no subscriptions, and most importantly, no uploading your private photos to a mysterious server.
            Today, we serve millions of images monthly, all processed locally on your own hardware using cutting-edge WebAssembly and Canvas technologies.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ValueCard
            icon={<Shield size={32} className="text-cyan-400" />}
            title="Privacy First"
            desc="Your data is your business. We never see, store, or transmit your images. Everything happens on your device."
          />
          <ValueCard
            icon={<Zap size={32} className="text-yellow-400" />}
            title="Speed Matters"
            desc="Wait less, create more. Our tools are optimized for maximum performance, rivaling desktop applications."
          />
          <ValueCard
            icon={<ImageIcon size={32} className="text-purple-400" />}
            title="Quality Focused"
            desc="We use industry-standard algorithms to ensure your images look perfect, whether compressed or resized."
          />
          <ValueCard
            icon={<Heart size={32} className="text-pink-400" />}
            title="Free for All"
            desc="Premium tools shouldn't have a premium price tag. PixelForge is and always will be free to use."
          />
        </div>
      </div>
    </div>
  );
};

const ValueCard = ({ icon, title, desc }) => (
  <div className="glass-morphism p-8 rounded-3xl border border-white/5 hover:border-primary/20 transition-all">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-white/40 leading-relaxed">{desc}</p>
  </div>
);

export default About;


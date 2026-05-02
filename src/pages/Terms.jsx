import React from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, AlertTriangle } from 'lucide-react';

const Terms = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl font-extrabold mb-6">Terms of <span className="gradient-text">Service</span></h1>
        <p className="text-xl text-white/60">
          Simple, fair, and transparent.
        </p>
      </motion.div>

      <div className="space-y-8 glass-morphism p-10 rounded-[2.5rem] border border-white/5">
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <CheckCircle className="text-primary" size={20} /> 1. Acceptance of Terms
          </h2>
          <p className="text-white/60 leading-relaxed">
            By accessing and using PixelForge, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <CheckCircle className="text-primary" size={20} /> 2. License to Use
          </h2>
          <p className="text-white/60 leading-relaxed">
            We grant you a personal, non-exclusive, non-transferable license to use our web application for both personal and commercial image processing tasks.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <CheckCircle className="text-primary" size={20} /> 3. Prohibited Uses
          </h2>
          <p className="text-white/60 leading-relaxed">
            You agree not to use PixelForge to process any illegal, harmful, or copyright-infringing content. You may not attempt to reverse engineer or disrupt the service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="text-yellow-500" size={20} /> 4. Disclaimer of Warranty
          </h2>
          <p className="text-white/60 leading-relaxed italic">
            The service is provided "as is" without any warranties of any kind. We do not guarantee that the service will be uninterrupted or error-free. Use at your own risk.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <CheckCircle className="text-primary" size={20} /> 5. Limitation of Liability
          </h2>
          <p className="text-white/60 leading-relaxed">
            PixelForge shall not be liable for any damages arising out of your use or inability to use the service, including data loss or business interruption.
          </p>
        </section>

        <div className="pt-8 border-t border-white/10 text-center text-white/30 text-sm">
          Last Updated: May 2, 2026
        </div>
      </div>
    </div>
  );
};

export default Terms;


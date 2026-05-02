import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Send, CheckCircle } from 'lucide-react';

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // In a real app, send data to an API
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-extrabold mb-6">Contact <span className="gradient-text">Us</span></h1>
        <p className="text-xl text-white/60">
          Have a question or feedback? We'd love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-12">
          <div className="glass-morphism p-8 rounded-3xl border border-white/5 space-y-6">
            <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
            <p className="text-white/60 leading-relaxed">
              Whether you're experiencing a technical issue or have a suggestion for a new feature, our team is ready to help.
            </p>
            
            <div className="space-y-6">
              <ContactInfo 
                icon={<Mail className="text-primary" />}
                title="Email Us"
                content="support@PixelForge.online"
              />
              <ContactInfo 
                icon={<MessageSquare className="text-secondary" />}
                title="Community"
                content="Join our Discord server"
              />
            </div>
          </div>
        </div>

        <div className="glass-morphism p-10 rounded-[2.5rem] border border-white/10 shadow-2xl">
          {submitted ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="inline-block p-4 rounded-full bg-green-500/20 text-green-400 mb-6">
                <CheckCircle size={48} />
              </div>
              <h2 className="text-3xl font-bold mb-4">Message Sent!</h2>
              <p className="text-white/60">Thank you for reaching out. We'll get back to you shortly.</p>
              <button 
                onClick={() => setSubmitted(false)}
                className="mt-8 text-primary font-bold hover:underline"
              >
                Send another message
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:outline-none focus:border-primary/50 transition-all"
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Email</label>
                <input 
                  type="email" 
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:outline-none focus:border-primary/50 transition-all"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Message</label>
                <textarea 
                  required
                  rows="4"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:outline-none focus:border-primary/50 transition-all resize-none"
                  placeholder="How can we help?"
                ></textarea>
              </div>
              <button 
                type="submit"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary font-bold text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Send size={20} />
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const ContactInfo = ({ icon, title, content }) => (
  <div className="flex gap-4">
    <div className="p-3 rounded-xl bg-white/5 border border-white/10 h-fit">
      {icon}
    </div>
    <div>
      <h3 className="font-bold text-lg">{title}</h3>
      <p className="text-white/40">{content}</p>
    </div>
  </div>
);

export default Contact;


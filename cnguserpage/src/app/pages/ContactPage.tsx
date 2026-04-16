import React from 'react';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { useState } from 'react';

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { api } = await import('../../services/api');
      await api.submitFeedback(formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Connection error. Please check if the server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone',
      detail: '+91 9677545819',
      color: 'bg-teal-900/30 text-teal-400 border border-teal-800/50',
    },
    {
      icon: Mail,
      title: 'Email',
      detail: 'superadmin@cng.com',
      color: 'bg-cyan-900/30 text-cyan-400 border border-cyan-800/50',
    },
    {
      icon: MapPin,
      title: 'Address',
      detail: 'IXLY Technologies Private Limited,Forge.Factory,KCT Tech Park,Coimbatore - 641 049,Tamil Nadu,India',
      color: 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/50',
    },
    {
      icon: Clock,
      title: 'Support Hours',
      detail: 'Mon-Sat: 9 AM - 6 PM',
      color: 'bg-indigo-900/30 text-indigo-400 border border-indigo-800/50',
    },
  ];

  return (
    <div className="min-h-screen bg-[#040f16] font-sans">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl tracking-tight font-bold text-white mb-4">Contact Us</h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Have questions or feedback? We'd love to hear from you
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {contactInfo.map((info, index) => {
            const Icon = info.icon;
            return (
              <div key={index} className="bg-[#0a1924] rounded-xl shadow-xl border border-slate-800 p-6 text-center hover:-translate-y-1 transition-transform">
                <div className={`w-14 h-14 ${info.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <Icon className="w-6 h-6 drop-shadow-md" />
                </div>
                <h3 className="font-semibold tracking-tight text-white mb-2">{info.title}</h3>
                <p className="text-slate-400 text-sm">{info.detail}</p>
              </div>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-[#0a1924] rounded-xl shadow-2xl border border-slate-800 p-8">
            <h2 className="text-2xl font-bold tracking-tight mb-6 text-white">Send us a Message</h2>
            {submitted ? (
              <div className="bg-teal-900/20 border border-teal-800/50 rounded-lg p-6 text-center">
                <div className="text-teal-400 text-5xl mb-4">✓</div>
                <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Message Sent!</h3>
                <p className="text-slate-300">We'll get back to you as soon as possible.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-[#040f16] border border-slate-700 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-white placeholder:text-slate-600 transition-colors"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-[#040f16] border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-white placeholder:text-slate-600 transition-colors"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Subject
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-[#040f16] border border-slate-700 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-white transition-colors appearance-none"
                  >
                    <option value="" className="text-slate-500">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="feedback">Feedback</option>
                    <option value="partnership">Partnership Opportunity</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 bg-[#040f16] border border-slate-700 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 resize-none text-white placeholder:text-slate-600 transition-colors"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                {error && (
                  <div className="bg-rose-900/20 border border-rose-800/50 text-rose-400 p-4 rounded-lg text-sm mb-6">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full glow-button py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(20,184,166,0.15)] hover:shadow-[0_0_20px_rgba(20,184,166,0.3)] ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  <Send className={`w-5 h-5 ${isLoading ? 'animate-pulse' : ''}`} />
                  {isLoading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>

          {/* FAQ Section */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-6 text-white">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div className="bg-[#0a1924] rounded-xl border border-slate-800 p-6 hover:border-slate-700 transition-colors">
                <h3 className="font-semibold text-teal-400 mb-2">How do I update station stock information?</h3>
                <p className="text-slate-300 text-sm">
                  Click the edit icon on any station card to update stock levels and pricing. The information will be updated in real-time.
                </p>
              </div>

              <div className="bg-[#0a1924] rounded-xl border border-slate-800 p-6 hover:border-slate-700 transition-colors">
                <h3 className="font-semibold text-teal-400 mb-2">Is the service free to use?</h3>
                <p className="text-slate-300 text-sm">
                  Yes, our platform is completely free for all users. We aim to make CNG station information accessible to everyone.
                </p>
              </div>

              <div className="bg-[#0a1924] rounded-xl border border-slate-800 p-6 hover:border-slate-700 transition-colors">
                <h3 className="font-semibold text-teal-400 mb-2">How accurate is the stock information?</h3>
                <p className="text-slate-300 text-sm">
                  We work with station operators to provide real-time updates. Information is typically updated every 15-30 minutes.
                </p>
              </div>

              <div className="bg-[#0a1924] rounded-xl border border-slate-800 p-6 hover:border-slate-700 transition-colors">
                <h3 className="font-semibold text-teal-400 mb-2">Can I add a new station?</h3>
                <p className="text-slate-300 text-sm">
                  Yes! Please contact us with the station details, and we'll verify and add it to our database within 24-48 hours.
                </p>
              </div>

              <div className="bg-[#0a1924] rounded-xl border border-slate-800 p-6 hover:border-slate-700 transition-colors">
                <h3 className="font-semibold text-teal-400 mb-2">Do you have a mobile app?</h3>
                <p className="text-slate-300 text-sm">
                  We're currently working on mobile apps for iOS and Android. Stay tuned for updates!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

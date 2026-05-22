import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Contact() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      {/* Main Container - Locked to viewport */}
      <div className="flex-1 flex flex-col max-w-6xl w-full mx-auto px-6 py-8">
        
        {/* Header Section */}
        <div className="text-center mb-5 shrink-0">
          <h1 className="text-slate-900 font-black text-3xl mb-1">
            Get in <span className="text-blue-600">Touch</span>
          </h1>
          <p className="text-slate-400 font-medium text-sm">
            Have questions? We are here to help you on your CSE journey.
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
          
          {/* Left Column: Message Form (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 shadow-sm rounded-2xl border border-white/10 p-6 shadow-xl flex flex-col">
            <h2 className="text-slate-900 font-bold text-xl mb-4">Send us a Message</h2>
            
            <form className="flex flex-col gap-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-300 text-xs font-semibold tracking-wide">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="John Doe"
                    className="bg-slate-50 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-600 transition-colors placeholder:text-slate-600 font-medium"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-300 text-xs font-semibold tracking-wide">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="john@example.com"
                    className="bg-slate-50 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-600 transition-colors placeholder:text-slate-600 font-medium"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-300 text-xs font-semibold tracking-wide">Subject</label>
                <input 
                  type="text" 
                  placeholder="How can we help?"
                  className="bg-slate-50 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-600 transition-colors placeholder:text-slate-600 font-medium"
                />
              </div>

              <div className="flex flex-col gap-1.5 flex-1 min-h-[70px]">
                <label className="text-slate-300 text-xs font-semibold tracking-wide">Message</label>
                <textarea 
                  placeholder="Write your message here..."
                  className="bg-slate-50 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-600 transition-colors placeholder:text-slate-600 font-medium flex-1 resize-none"
                ></textarea>
              </div>

              <button 
                type="button"
                className="mt-2 w-full bg-blue-600 text-white font-black text-sm py-2.5 rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 uppercase tracking-widest"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Right Column: Info (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            
            {/* Contact Information Box */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl border border-white/10 p-6 shadow-xl shrink-0">
              <h2 className="text-slate-900 font-bold text-xl mb-5">Contact Information</h2>
              
              <div className="flex flex-col gap-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-50 border border-white/10 flex items-center justify-center shrink-0 shadow-inner">
                    <Mail className="text-blue-600" size={18} />
                  </div>
                  <div className="flex flex-col justify-center h-10">
                    <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Email</h3>
                    <p className="text-slate-900 font-semibold text-sm">support@pacser.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-50 border border-white/10 flex items-center justify-center shrink-0 shadow-inner">
                    <Phone className="text-blue-600" size={18} />
                  </div>
                  <div className="flex flex-col justify-center h-10">
                    <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Phone</h3>
                    <p className="text-slate-900 font-semibold text-sm">+63 912 345 6789</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-50 border border-white/10 flex items-center justify-center shrink-0 shadow-inner">
                    <MapPin className="text-blue-600" size={18} />
                  </div>
                  <div className="flex flex-col justify-center py-0.5">
                    <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">Address</h3>
                    <p className="text-slate-900 font-semibold text-sm leading-snug">
                      123 Reviewer Street, <br />
                      Quezon City, Metro Manila
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Follow Us Box */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl border border-white/10 p-6 shadow-xl shrink-0">
              <h2 className="text-slate-900 font-bold text-xl mb-5">Follow Us</h2>
              
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-slate-50 border border-blue-600/50 hover:border-blue-600 hover:bg-blue-600/10 hover:shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-all flex items-center justify-center group shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 group-hover:scale-110 transition-transform"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-50 border border-blue-600/50 hover:border-blue-600 hover:bg-blue-600/10 hover:shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-all flex items-center justify-center group shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 group-hover:scale-110 transition-transform"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-50 border border-blue-600/50 hover:border-blue-600 hover:bg-blue-600/10 hover:shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-all flex items-center justify-center group shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 group-hover:scale-110 transition-transform"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                </a>
              </div>
            </div>

          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}






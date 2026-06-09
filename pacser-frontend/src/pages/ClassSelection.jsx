import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';
import { Briefcase, FileText, CheckCircle2 } from 'lucide-react';

export default function ClassSelection() {
  const { saveUserClass } = useAuth();
  const navigate = useNavigate();

  const handleSelect = (className) => {
    saveUserClass(className);
    navigate('/dashboard');
  };

  const profContent = [
    "Numerical Ability",
    "Analytical Ability",
    "Verbal Ability",
    "General Information"
  ];

  const subProfContent = [
    "Numerical Ability",
    "Clerical Ability",
    "Verbal Ability",
    "General Information"
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-sans transition-colors">
      <Navbar />

      <div className="flex-1 flex flex-col max-w-5xl w-full mx-auto px-6 py-12 justify-center">
        
        <div className="text-center mb-12">
          <h1 className="text-slate-900 dark:text-white font-black text-4xl mb-4 tracking-tight">
            Select Your <span className="text-blue-600 dark:text-blue-400">Category</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-2xl mx-auto">
            Which civil service examination are you preparing for? You can change this later in your profile.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Professional Card */}
          <button 
            onClick={() => handleSelect('Professional')}
            className="group relative bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-200 dark:border-slate-700 p-8 shadow-sm hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-xl hover:shadow-blue-600/10 transition-all duration-300 flex flex-col items-center text-center h-full hover:-translate-y-1 overflow-hidden"
          >
            {/* Default State */}
            <div className="flex flex-col items-center transition-all duration-300 group-hover:opacity-0 group-hover:-translate-y-4 absolute inset-0 p-8 justify-center">
              <div className="w-24 h-24 rounded-full bg-blue-50 dark:bg-blue-900/30 border-4 border-white dark:border-slate-800 shadow-sm flex items-center justify-center mb-6 transition-colors">
                <Briefcase className="text-blue-600 dark:text-blue-400" size={40} />
              </div>
              <h2 className="text-slate-900 dark:text-white font-extrabold text-2xl mb-3 tracking-tight">Professional</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium px-4">
                For individuals seeking professional or technical positions in the government requiring a bachelor's degree.
              </p>
            </div>

            {/* Hover State (Content Overview) */}
            <div className="flex flex-col h-full w-full opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 text-left">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-xl mb-4 flex items-center gap-2">
                <Briefcase className="text-blue-600 dark:text-blue-400" size={24} /> Professional Coverage
              </h3>
              <ul className="space-y-3 mb-8">
                {profContent.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-600 dark:text-slate-300 font-medium text-sm">
                    <CheckCircle2 size={18} className="text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto w-full">
                <span className="inline-block bg-blue-600 text-white font-bold px-6 py-3.5 rounded-xl w-full text-center shadow-md shadow-blue-600/20 uppercase tracking-widest text-sm">
                  Select Professional
                </span>
              </div>
            </div>
          </button>

          {/* Sub-Professional Card */}
          <button 
            onClick={() => handleSelect('Sub-Professional')}
            className="group relative bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-200 dark:border-slate-700 p-8 shadow-sm hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-xl hover:shadow-blue-600/10 transition-all duration-300 flex flex-col items-center text-center h-[420px] hover:-translate-y-1 overflow-hidden"
          >
            {/* Default State */}
            <div className="flex flex-col items-center transition-all duration-300 group-hover:opacity-0 group-hover:-translate-y-4 absolute inset-0 p-8 justify-center">
              <div className="w-24 h-24 rounded-full bg-blue-50 dark:bg-blue-900/30 border-4 border-white dark:border-slate-800 shadow-sm flex items-center justify-center mb-6 transition-colors">
                <FileText className="text-blue-600 dark:text-blue-400" size={40} />
              </div>
              <h2 className="text-slate-900 dark:text-white font-extrabold text-2xl mb-3 tracking-tight">Sub-Professional</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium px-4">
                For individuals seeking clerical, trades, and crafts positions. High school graduates can apply.
              </p>
            </div>

            {/* Hover State (Content Overview) */}
            <div className="flex flex-col h-full w-full opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 text-left">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-xl mb-4 flex items-center gap-2">
                <FileText className="text-blue-600 dark:text-blue-400" size={24} /> Sub-Prof Coverage
              </h3>
              <ul className="space-y-3 mb-8">
                {subProfContent.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-600 dark:text-slate-300 font-medium text-sm">
                    <CheckCircle2 size={18} className="text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto w-full">
                <span className="inline-block bg-blue-600 text-white font-bold px-6 py-3.5 rounded-xl w-full text-center shadow-md shadow-blue-600/20 uppercase tracking-widest text-sm">
                  Select Sub-Professional
                </span>
              </div>
            </div>
          </button>

        </div>
      </div>
    </div>
  );
}

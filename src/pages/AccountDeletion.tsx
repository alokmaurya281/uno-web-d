import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, ArrowLeft, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

const AccountDeletion: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <Link 
        to="/" 
        className="fixed top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-uno-red transition-colors font-medium text-sm"
      >
        <ArrowLeft size={18} />
        Back to Home
      </Link>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-[600px] w-full bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-black/[0.03] border border-gray-100"
      >
        <div className="w-16 h-16 bg-red-50 text-uno-red rounded-2xl flex items-center justify-center mb-8 mx-auto">
          <Trash2 size={32} />
        </div>

        <h1 className="text-3xl font-black text-center text-gray-900 mb-4 tracking-tight">
          Account Deletion Request
        </h1>

        <p className="text-gray-500 text-center mb-10 leading-relaxed font-medium">
          If you want to delete your account and all associated data from our app, please submit the request below. We will process your request within 7 days.
        </p>

        <form 
          action="mailto:snmaurya10275@gmail.com" 
          method="post" 
          encType="text/plain" 
          className="space-y-6"
        >
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 px-1">Your Email</label>
            <input 
              type="email" 
              name="email" 
              required 
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-uno-red/50 focus:ring-4 focus:ring-uno-red/5 transition-all"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 px-1">User ID (optional)</label>
            <input 
              type="text" 
              name="userid" 
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-uno-red/50 focus:ring-4 focus:ring-uno-red/5 transition-all"
              placeholder="e.g. A7X9-2911"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 px-1">Reason (optional)</label>
            <textarea 
              name="reason" 
              rows={4} 
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-uno-red/50 focus:ring-4 focus:ring-uno-red/5 transition-all resize-none"
              placeholder="Tell us why you're leaving..."
            />
          </div>

          <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit" 
            className="w-full bg-[#0e0c0a] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-uno-red transition-all shadow-lg shadow-black/10"
          >
            <Send size={18} />
            REQUEST ACCOUNT DELETION
          </motion.button>
        </form>

        <div className="mt-12 pt-8 border-t border-gray-50 text-center">
            <p className="text-xs font-mono text-gray-400 uppercase tracking-widest leading-loose">
                Data removal complies with GDPR & COPPA regulations. <br />
                Process time: <strong>7 Business Days</strong>.
            </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AccountDeletion;

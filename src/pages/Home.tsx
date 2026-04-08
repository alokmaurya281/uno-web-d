import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Download, Share2, Award, Zap, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.unogame.uno_flutter";

  return (
    <div className="relative min-h-screen flex flex-col items-center bg-uno-dark px-4 font-['Outfit']">
      {/* Background Animated Blobs */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-uno-red rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-pulse" />
      <div className="absolute top-1/2 -right-4 w-96 h-96 bg-uno-blue rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-pulse delay-700" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-uno-green rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-pulse delay-1000" />

      {/* Hero Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 text-center max-w-4xl pt-24 pb-16"
      >
        <div className="mb-8 flex justify-center">
            <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-uno-red via-uno-yellow to-uno-blue rounded-full blur opacity-75 animate-gradient"></div>
                <div className="relative px-8 py-4 bg-uno-dark rounded-full flex items-center">
                    <span className="text-4xl md:text-5xl font-black italic tracking-tighter text-white">
                        UNO<span className="text-uno-red">.</span>MOBILE
                    </span>
                </div>
            </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter leading-tight text-white">
          The Classic Game, <br />
          <span className="text-uno-yellow uppercase">Now In Your Pocket.</span>
        </h1>
        
        <p className="text-gray-400 text-xl md:text-2xl mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
          Experience the thrill of UNO anytime, anywhere. Built for speed, competition, and fun on the go.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <motion.a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative px-10 py-5 w-full sm:w-auto overflow-hidden rounded-2xl bg-uno-red font-black text-white shadow-2xl transition-all hover:shadow-uno-red/50 flex items-center justify-center gap-3 text-lg"
          >
            <Download className="w-6 h-6" />
            <span>GET IT ON GOOGLE PLAY</span>
          </motion.a>
          
          <div className="flex items-center gap-3 text-gray-500 font-bold tracking-widest text-xs uppercase">
            <ShieldCheck className="text-uno-green" size={18} />
            Verified & Secure
          </div>
        </div>
      </motion.div>

      {/* App Features Grid */}
      <div className="w-full max-w-6xl z-10 grid grid-cols-1 md:grid-cols-3 gap-8 pb-32">
        {[
          { icon: <Zap className="text-uno-yellow" />, title: "Instant Matchmaking", desc: "No wait times. Jump into a game with players worldwide in seconds." },
          { icon: <Share2 className="text-uno-blue" />, title: "Play with Friends", desc: "Create private rooms and invite your friends with a single tap." },
          { icon: <Award className="text-uno-green" />, title: "Global Rankings", desc: "Climb the leaderboards and prove you are the ultimate UNO master." },
        ].map((feat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 * i + 0.4 }}
            className="glass-dark p-8 rounded-[2.5rem] border border-white/5 hover:border-white/10 transition-all group"
          >
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
              {feat.icon}
            </div>
            <h3 className="text-2xl font-black mb-4 text-white italic">{feat.title}</h3>
            <p className="text-gray-400 text-lg leading-relaxed font-medium">{feat.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Footer Section */}
      <footer className="w-full py-16 border-t border-white/5 z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 px-4">
          <div className="text-center md:text-left">
            <h4 className="text-white font-black italic text-2xl tracking-tighter mb-2">UNO<span className="text-uno-red">.</span>PLATFORM</h4>
            <p className="text-gray-500 text-sm font-medium">Developed by Alok Shiv. All rights reserved.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-[11px] font-black tracking-[0.2em] uppercase text-gray-600">
            <Link to="/privacy-policy" className="hover:text-uno-red transition-colors">Privacy Policy</Link>
            <Link to="/uno-delete" className="hover:text-uno-red transition-colors">Account Deletion</Link>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer">
              <Smartphone size={20} />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

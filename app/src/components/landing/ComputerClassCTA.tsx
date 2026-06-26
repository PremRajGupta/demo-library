
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Monitor, Cpu, Code, ArrowRight } from 'lucide-react';

export default function ComputerClassCTA() {
  return (
    <section className="py-10 lg:py-16 bg-white dark:bg-[#0f172a] relative overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Side: Content */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className=""
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold text-sm mb-6">
              <Monitor size={16} />
              <span>Skill Development Program</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-tight mb-6">
              Master Digital Skills at <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Galaxy Computer Center</span>
            </h2>
            
            <p className="text-slate-600 dark:text-slate-300 text-lg mb-8 leading-relaxed">
              In today's fast-paced world, computer skills are essential. Join our comprehensive courses tailored for beginners to advanced learners and prepare yourself for the digital future.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                  <Cpu size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-lg">Modern Infrastructure</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">High-speed internet and latest generation computers for a smooth learning experience.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                  <Code size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-lg">Expert Instructors</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Learn programming, office tools, and design from experienced industry professionals.</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <Link 
                to="/computer-center"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold shadow-[0_8px_30px_rgb(37,99,235,0.3)] hover:shadow-[0_8px_30px_rgb(37,99,235,0.5)] transition-all transform hover:-translate-y-1 group"
              >
                Visit Computer Class 
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>

          {/* Right Side: Image */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center"
          >
            <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl group border-4 border-white dark:border-slate-800">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
              <img 
                src="https://images.unsplash.com/photo-1590374585152-ca0e8194c0d6?q=80&w=1600&auto=format&fit=crop" 
                alt="Galaxy Computer Center Classes" 
                className="w-full h-[300px] sm:h-[350px] lg:h-[400px] object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            
          </motion.div>

        </div>
      </div>
      
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-blue-500/5 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none" />
    </section>
  );
}

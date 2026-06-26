import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import type { HeroSlide } from '../../data/landingContent';

const Typewriter = ({ 
  words, 
  onWordChange 
}: { 
  words: string[]; 
  onWordChange: (index: number) => void;
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  const wordsRef = useRef(words);
  const onWordChangeRef = useRef(onWordChange);

  useEffect(() => {
    wordsRef.current = words;
    onWordChangeRef.current = onWordChange;
  }, [words, onWordChange]);

  useEffect(() => {
    const currentWords = wordsRef.current;
    if (currentWords.length === 0) return;
    
    const word = currentWords[currentWordIndex];
    if (!word) return;

    let typingSpeed = isDeleting ? 30 : 60;
    
    if (!isDeleting && currentText === word) {
      typingSpeed = 3000; // Pause at end of word
      const timeout = setTimeout(() => setIsDeleting(true), typingSpeed);
      return () => clearTimeout(timeout);
    } else if (isDeleting && currentText === '') {
      setIsDeleting(false);
      const nextIndex = (currentWordIndex + 1) % currentWords.length;
      setCurrentWordIndex(nextIndex);
      onWordChangeRef.current(nextIndex);
      return;
    }

    const timeout = setTimeout(() => {
      setCurrentText(word.substring(0, currentText.length + (isDeleting ? -1 : 1)));
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentWordIndex]);

  return (
    <span className="inline-block">
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">
        {currentText}
      </span>
      <span className="animate-pulse border-r-[3px] border-blue-500 dark:border-blue-400 ml-1 pr-1">&nbsp;</span>
    </span>
  );
};

type HeroSliderProps = {
  slides: HeroSlide[];
};

export default function HeroSlider({ slides }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [current]);

  if (slides.length === 0) {
    return (
      <section id="home" className="relative min-h-[50vh] flex items-center justify-center pt-16 bg-white dark:bg-[#040814] transition-colors duration-300">
        <p className="text-slate-800 dark:text-white transition-colors">Hero content coming soon...</p>
      </section>
    );
  }

  const slide = slides[current];

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden pt-16 bg-slate-50 dark:bg-[#040814] transition-colors duration-300">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0"
        >
          {!imageFailed && slide.image ? (
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover opacity-100 dark:opacity-70 transition-opacity duration-700"
              loading="eager"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 dark:from-[#040814] dark:via-[#0f172a] dark:to-[#1e1b4b]" />
          )}
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/70 to-transparent dark:from-[#040814]/95 dark:via-[#040814]/70 dark:to-transparent transition-colors duration-300" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent dark:from-[#040814]/90 dark:via-transparent dark:to-transparent transition-colors duration-300" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="max-w-3xl">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100/60 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-400 text-sm font-medium mb-8 backdrop-blur-md shadow-sm transition-colors"
          >
            <Sparkles size={16} />
            <span>Welcome to the Future of Education</span>
          </motion.div>

          <h1 className="text-4xl sm:text-5xl lg:text-5xl font-extrabold text-slate-900 dark:text-white leading-[1.2] mb-6 tracking-tight drop-shadow-sm dark:drop-shadow-2xl transition-colors">
            <Typewriter 
              words={slides.map(s => s.title)} 
              onWordChange={(index) => setCurrent(index)} 
            />
          </h1>
          
          <AnimatePresence mode="wait">
            <motion.p 
              key={slide.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-10 leading-relaxed max-w-2xl font-medium transition-colors"
            >
              {slide.subtitle}
            </motion.p>
          </AnimatePresence>

        </div>
      </div>
    </section>
  );
}

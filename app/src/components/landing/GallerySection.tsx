import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ImageOff } from 'lucide-react';
import type { GalleryImage, PageText } from '../../data/landingContent';

type GallerySectionProps = {
  images: GalleryImage[];
  pageText: PageText;
};

function GalleryTile({
  image,
  index,
  onSelect,
}: {
  image: GalleryImage;
  index: number;
  onSelect: () => void;
}) {
  const [loadFailed, setLoadFailed] = useState(false);
  const hasSrc = Boolean(image.src?.trim());

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      onClick={onSelect}
      disabled={!hasSrc || loadFailed}
      className="group relative aspect-[4/3] rounded-2xl overflow-hidden shadow-md dark:shadow-lg hover:shadow-xl dark:hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all duration-500 text-left disabled:cursor-not-allowed disabled:opacity-70 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
    >
      {hasSrc && !loadFailed ? (
        <>
          <img
            src={image.src}
            alt={image.alt || image.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-100 dark:opacity-90 dark:group-hover:opacity-100"
            loading="lazy"
            onError={() => setLoadFailed(true)}
          />
          <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/20 opacity-0 group-hover:opacity-100 mix-blend-overlay transition-opacity duration-500" />
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 dark:text-slate-600 p-4 bg-slate-50 dark:bg-slate-800/50">
          <ImageOff size={40} className="mb-3 opacity-50" />
          <span className="text-sm text-center">{loadFailed ? 'Image failed to load' : 'No image URL'}</span>
        </div>
      )}
      
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 dark:from-[#020617] dark:via-[#020617]/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500 pointer-events-none" />
      
      <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between pointer-events-none translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
        <p className="text-white font-bold text-lg group-hover:text-blue-300 transition-colors drop-shadow-md">{image.title}</p>
        {hasSrc && !loadFailed && (
          <div className="w-10 h-10 rounded-full bg-blue-500/40 dark:bg-blue-500/20 backdrop-blur-md flex items-center justify-center border border-blue-400/50 dark:border-blue-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
            <ZoomIn className="text-white dark:text-blue-300" size={18} />
          </div>
        )}
      </div>
    </motion.button>
  );
}

export default function GallerySection({ images, pageText }: GallerySectionProps) {
  const [selected, setSelected] = useState<GalleryImage | null>(null);
  const visibleImages = images.filter((img) => img.src?.trim());

  return (
    <section id="gallery" className="py-24 bg-slate-100 dark:bg-[#040814] relative transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 transition-colors">{pageText.galleryTitle}</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg transition-colors">{pageText.gallerySubtitle}</p>
        </motion.div>

        {visibleImages.length === 0 ? (
          <p className="text-center text-slate-500 text-sm py-12">
            Gallery images will appear here after you add image URLs in Website Settings.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            {visibleImages.map((image, index) => (
              <GalleryTile
                key={image.id}
                image={image}
                index={index}
                onSelect={() => setSelected(image)}
              />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && selected.src?.trim() && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(10px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-slate-900/90 dark:bg-[#020617]/90"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl w-full flex flex-col items-center"
            >
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="absolute -top-16 right-0 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all border border-white/10 hover:border-white/30 backdrop-blur-md"
                aria-label="Close image"
              >
                <X size={24} />
              </button>
              
              <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-slate-700 bg-black dark:bg-[#0a0f1e] p-2">
                <img
                  src={selected.src}
                  alt={selected.alt || selected.title}
                  className="w-full max-h-[75vh] object-contain rounded-xl"
                />
              </div>
              
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center text-white mt-6 text-xl font-medium tracking-wide drop-shadow-md"
              >
                {selected.title}
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

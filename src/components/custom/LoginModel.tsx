import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Chrome, Facebook, MessageCircle } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [mounted, setMounted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  // Image array for the slider - using placeholder images for now
  const images = [
    "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop", 
    "https://images.unsplash.com/abs/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop"
  ];

  // Auto-slide images every 4 seconds
  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setDirection(1);
        setCurrentImageIndex((prevIndex) =>
          prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [isOpen, images.length]);

  // Prevent scroll when modal is open
  useEffect(() => {
    setMounted(true);

    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Swipe gesture handler
  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x < -50) {
      // Swipe left
      setDirection(1);
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    } else if (info.offset.x > 50) {
      // Swipe right
      setDirection(-1);
      setCurrentImageIndex(
        (prev) => (prev - 1 + images.length) % images.length
      );
    }
  };

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop with blur */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Modal */}
          <motion.div
            className="relative flex w-[90%] max-w-4xl bg-background rounded-2xl overflow-hidden"
            initial={{ scale: 0.6, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.6, opacity: 0, y: 40 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
              mass: 1.2,
              delay: 0.15,
            }}
          >
            {/* Close button */}
            <motion.button
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <X size={28} />
            </motion.button>

            {/* Left side - Image */}
            <div className="hidden md:block w-1/2 h-[600px] relative p-2">
              <motion.div
                className="absolute top-8 left-8 text-2xl font-bold text-white tracking-widest z-10"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              ></motion.div>
              <div className="w-full h-full overflow-hidden rounded-xl relative">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={currentImageIndex}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={handleDragEnd}
                    initial={{ opacity: 0, scale: 1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="absolute inset-0 cursor-grab"
                    style={{ touchAction: "pan-y" }}
                  >
                    <img
                      src={images[currentImageIndex]}
                      alt={`Streamoai slide ${currentImageIndex + 1}`}
                      className="object-cover select-none"
                      draggable={false}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        position: "absolute",
                        inset: 0,
                      }}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
              {/* Image slider dots */}
              <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
                {images.map((_, index) => (
                  <motion.div
                    key={index}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      index === currentImageIndex
                        ? "w-6 bg-white shadow-lg"
                        : "w-2 bg-white/50"
                    }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    onClick={() => {
                      setDirection(index > currentImageIndex ? 1 : -1);
                      setCurrentImageIndex(index);
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Right side - Login form */}
            <div className="w-full md:w-1/2 p-8 md:p-10 bg-black flex flex-col justify-center">
              <motion.h2
                className="text-3xl font-medium text-white mb-8 tracking-tighter"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Welcome to Streamoai
              </motion.h2>

              {/* Social login buttons */}
              <div className="space-y-4 mb-8">
                                 <motion.button
                   className="flex items-center justify-center w-full gap-3 bg-[#262424] text-white py-3 px-4 rounded-lg hover:bg-gray-900 transition-colors"
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.3 }}
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                 >
                   <Chrome size={20} />
                   <span>Continue with Google</span>
                 </motion.button>

                                 <motion.button
                   className="flex items-center justify-center w-full gap-3 bg-[#262424] text-white py-3 px-4 rounded-lg hover:bg-gray-900 transition-colors"
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.4 }}
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                 >
                   <Facebook size={20} className="text-blue-600" />
                   <span>Continue with Facebook</span>
                 </motion.button>

                                 <motion.button
                   className="flex items-center justify-center w-full gap-3 bg-[#262424] text-white py-3 px-4 rounded-lg hover:bg-gray-900 transition-colors"
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.5 }}
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                 >
                   <MessageCircle size={20} className="text-indigo-400" />
                   <span>Continue with Discord</span>
                 </motion.button>
              </div>

              {/* Divider */}
              <motion.div
                className="flex items-center gap-4 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex-1 h-px bg-gray-700"></div>
                <div className="text-gray-400">or</div>
                <div className="flex-1 h-px bg-gray-700"></div>
              </motion.div>

              {/* Email login */}
                             <motion.div
                 className="space-y-4 mb-6"
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.7 }}
               >
                 <div>
                   <label className="block text-white text-sm mb-2">
                     Email Address
                   </label>
                   <div className="relative">
                     <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                     <input
                       type="email"
                       placeholder="Enter your email address"
                       className="w-full bg-gray-900 text-white pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFE053]"
                     />
                   </div>
                 </div>
               </motion.div>

              <motion.button
                className="w-full bg-[#FFE053] text-black font-medium py-3 rounded-lg hover:bg-opacity-90 transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Continue
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

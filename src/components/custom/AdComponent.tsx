import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, ExternalLink, CheckCircle } from "lucide-react";
import Lottie from "lottie-react";
import giftAnimation from "@/components/assets/animated/gift.json";

interface AdData {
  $id: string;
  title: string;
  description: string;
  websiteUrl: string;
  logo: string;
  features: string[];
  ctaText: string;
  isActive: boolean;
  showOnce: boolean;
  maxShows: number;
}

interface AdComponentProps {
  adData: AdData;
  onClose?: () => void;
  delay?: number; // Delay before showing the ad
}

const AdComponent: React.FC<AdComponentProps> = ({
  adData,
  onClose,
  delay = 2000,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    const timer = setTimeout(() => {
      if (!isMobile) {
        setIsVisible(true);
      }
    }, delay);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", checkMobile);
    };
  }, [delay, isMobile]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  const handleCTAClick = () => {
    window.open(adData.websiteUrl, "_blank", "noopener,noreferrer");
  };

  // Left to right slide animation
  const slideInVariants = {
    hidden: {
      x: "-100%",
      opacity: 0,
      scale: 0.9,
    },
    visible: {
      x: "0%",
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 150,
        duration: 0.5,
      },
    },
    exit: {
      x: "-100%",
      opacity: 0,
      scale: 0.9,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 150,
        duration: 0.4,
      },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.2,
        duration: 0.4,
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -15 },
    visible: { opacity: 1, x: 0 },
  };

  // Don't show on mobile
  if (isMobile || !isVisible) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="fixed bottom-4 left-4 z-50 w-72 max-w-sm"
        variants={slideInVariants as any}
        initial="hidden"
        animate={isClosing ? "exit" : "visible"}
        exit="exit"
      >
        <Card className="relative overflow-hidden border-0 bg-primary">
          {/* Background Image with 30% opacity */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
            style={{
              backgroundImage: `url(${adData.logo})`,
            }}
          />

          {/* Close Button */}
          <motion.button
            onClick={handleClose}
            className="absolute top-3 right-3 z-10 p-1 rounded-full border border-muted-foreground "
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-4 h-4" />
          </motion.button>

          <CardContent className="relative p-4">
            <motion.div
              variants={contentVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Header with larger image and better alignment */}
              <motion.div
                variants={itemVariants}
                className="flex items-center gap-4 mb-4"
              >
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg border border-muted-foreground">
                    <img
                      src={adData.logo}
                      alt={`${adData.title} logo`}
                      className="w-12 h-12 rounded-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextElementSibling?.classList.remove(
                          "hidden"
                        );
                      }}
                    />
                    <div className="hidden w-12 h-12 text-foreground font-sans font-bold text-xl items-center justify-center">
                      {adData.title.charAt(0)}
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <motion.h3
                    variants={itemVariants}
                    className="text-lg font-bold text-gray-900 mb-1 line-clamp-2 leading-tight"
                  >
                    {adData.title}
                  </motion.h3>
                  <motion.div
                    variants={itemVariants}
                    className="inline-flex items-center px-1.5 py-0.5 border border-secondary text-secondary text-[10px] font-bold rounded-full"
                  >
                    🔥 HOT
                  </motion.div>
                </div>
              </motion.div>

              {/* Description */}
              <motion.p
                variants={itemVariants}
                className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed"
              >
                {adData.description}
              </motion.p>

              {/* Features */}
              <motion.div variants={itemVariants} className="mb-4">
                <div className="space-y-2">
                  {adData.features.map((feature, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      className="flex items-center gap-2 text-sm text-gray-700"
                    >
                      <CheckCircle className="w-4 h-4 text-secondary flex-shrink-0" />
                      <span className="line-clamp-1">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* CTA Button */}
              <motion.div variants={itemVariants}>
                <Button
                  variant="pixel"
                  onClick={handleCTAClick}
                  className="w-full py-3 flex rounded-sm items-center justify-center gap-1"
                  size="default"
                >
                  <Lottie
                    animationData={giftAnimation}
                    className="w-6 h-16"
                    loop={true}
                  />
                  {adData.ctaText}
                </Button>
              </motion.div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default AdComponent;

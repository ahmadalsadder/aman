'use client';

import { useLoader } from '@/hooks/use-loader';
import { AnimatePresence, motion } from 'framer-motion';

export function GlobalLoader() {
  const { isLoading } = useLoader();

  const svgVariants = {
    hidden: {
      pathLength: 0,
      opacity: 0,
      rotate: -90,
    },
    visible: (i: number) => ({
      pathLength: 1.1, // Overshoot slightly to ensure full closure
      opacity: 1,
      rotate: 0,
      transition: {
        pathLength: { delay: i * 0.1, type: "tween", duration: 1.5, repeat: Infinity, repeatType: 'loop', repeatDelay: 0.5 },
        opacity: { delay: i * 0.1, duration: 0.01 },
        rotate: { delay: i * 0.1, duration: 0.01 },
      },
    }),
  };

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-4">
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-24 w-24 text-primary md:h-32 md:w-32"
              initial="hidden"
              animate="visible"
            >
              <title>Loading...</title>
              <motion.path
                d="M12 2L4 6v6c0 4.4 3.6 8 8 8s8-3.6 8-8V6l-8-4z"
                variants={svgVariants}
                custom={1}
              />
              <motion.rect
                x="8"
                y="9"
                width="8"
                height="6"
                rx="1"
                strokeWidth="1.5"
                fill="none"
                variants={svgVariants}
                custom={2}
              />
              <motion.circle
                cx="12"
                cy="12"
                r="1.5"
                strokeWidth="1.5"
                fill="none"
                variants={svgVariants}
                custom={3}
              />
            </motion.svg>
            <p className="animate-pulse text-lg font-medium text-primary">Loading...</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

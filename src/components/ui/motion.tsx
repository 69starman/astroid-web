import { motion } from 'framer-motion';

// Common entrance stagger for pages
export const PageTransition = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      exit="hidden"
      variants={{
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.05 } }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerContainer = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: 0.05,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 15 },
        show: { 
          opacity: 1, 
          y: 0,
          transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1]
          }
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Animated Number Counter
import { useEffect, useState } from 'react';
import { useSpring } from 'framer-motion';

export const AnimatedNumber = ({ value, formatter }: { value: number, formatter: (val: number) => string }) => {
  const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 });
  const [display, setDisplay] = useState(formatter(value));

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    return spring.on('change', (latest) => {
      setDisplay(formatter(latest));
    });
  }, [spring, formatter]);

  return <span>{display}</span>;
};

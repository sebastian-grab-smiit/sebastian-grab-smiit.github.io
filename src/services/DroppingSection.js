import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

// Stagger delay per section
const sectionDelay = 0.12;

export default function DroppingSection({ children, index }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: false, margin: '-5% 0px' });

    return (
        <motion.section
            ref={ref}
            initial={{ opacity: 0, y: 44 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{
                duration: 0.7,
                delay: index * sectionDelay,
                ease: 'easeOut'
            }}
            style={{ willChange: 'opacity, transform' }}
        >
            {children}
        </motion.section>
    );
}

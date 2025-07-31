// AppLogo.js
import { motion } from 'framer-motion';
import logoWhite from '../assets/logo-white.png';
import logoBlack from '../assets/logo-black.png';

export default function AppLogo({theme}) {
    return (
        <motion.div
            className="app-logo"
            initial={{ y: -28, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
        >
            <a href="https://www.smiit.de">
                <img src={theme === 'dark' ? logoWhite : logoBlack} alt="smiit GmbH Logo" />
            </a>
        </motion.div>
    );
}

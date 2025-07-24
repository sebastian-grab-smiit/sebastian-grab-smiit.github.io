import React from 'react';
import { motion } from 'framer-motion';
import '../styles/Timeline.css';

export default function Timeline({ events }) {
    return (
        <div className="timeline-container">
        {events.map((e, i) => (
            <motion.div
                key={i}
                className="timeline-event"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                >
                <h4>{e.date}</h4>
                <p>{e.label}</p>
            </motion.div>
        ))}
        </div>
    );
}
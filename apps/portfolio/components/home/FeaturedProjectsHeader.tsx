'use client';

import { motion } from 'framer-motion';

export default function FeaturedProjectsHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mb-8 text-center"
    >
      <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2 tracking-tight">
        Featured <span className="gradient-text">Projects</span>
      </h2>
      <p className="text-base text-white/80 max-w-2xl mx-auto">
        Real-world applications showcasing architectural excellence
      </p>
    </motion.div>
  );
}




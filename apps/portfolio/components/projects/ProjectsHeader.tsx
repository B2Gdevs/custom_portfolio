'use client';

import { motion } from 'framer-motion';

export default function ProjectsHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className="text-5xl font-bold mb-4">
        <span className="gradient-text">Projects</span>
      </h1>
      <p className="text-xl text-text-muted max-w-2xl mx-auto">
        Showcase of software projects, architecture, and open-source contributions
      </p>
    </motion.div>
  );
}


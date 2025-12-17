'use client';

import { motion } from 'framer-motion';

export default function DocsHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-12"
    >
      <h1 className="text-5xl font-bold mb-4">
        <span className="gradient-text">Documentation</span>
      </h1>
      <p className="text-xl text-text-muted">
        Comprehensive guides, tutorials, and architecture documentation
      </p>
    </motion.div>
  );
}




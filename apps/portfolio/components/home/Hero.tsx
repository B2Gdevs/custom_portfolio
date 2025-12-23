'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { PCBBackground } from '@/components/decorative/PCBBackground';

export default function Hero() {
  return (
    <section className="relative overflow-hidden hero-background">
      {/* PCB-style background pattern */}
      <PCBBackground />
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-10 w-full"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-block mb-5"
            >
              <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-accent/30 shadow-lg shadow-accent/10 hover:border-accent/50 transition-colors">
                <Image
                  src="/images/my_avatar.jpeg"
                  alt="Profile"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </motion.div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-center tracking-tight">
              <span className="gradient-text">Software Architect</span>
            </h1>
            <p className="text-lg md:text-xl text-white max-w-2xl mx-auto mb-8 leading-relaxed text-center">
              Building scalable systems, shipping products, and sharing insights
            </p>
            
            <div className="flex gap-3 justify-center items-center flex-wrap">
              <Link
                href="/projects"
                className="bg-gradient-to-r from-accent to-accent-3 text-white font-semibold rounded-xl px-5 py-2.5 text-sm inline-flex items-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                View Projects
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/blog"
                className="bg-dark-elevated text-white border border-border rounded-xl px-5 py-2.5 text-sm font-semibold inline-flex items-center gap-2 hover:border-accent hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                Read Blog
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}




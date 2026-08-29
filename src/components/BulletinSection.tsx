import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Newspaper, ChevronRight, X, Calendar, UserCheck, BookOpen } from 'lucide-react';
import { BULLETIN_POSTS, ASSETS } from '../data/config';
import { BulletinPost } from '../types';

export const BulletinSection: React.FC = () => {
  const [activeArticle, setActiveArticle] = useState<BulletinPost | null>(null);

  return (
    <section id="bulletin" className="relative py-28 bg-[#08090c] border-t border-[#1a1d24] film-grain">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="h-[1px] w-8 bg-[#c5a059]" />
            <span className="font-mono-vintage text-xs tracking-[0.3em] text-[#c5a059] uppercase">
              SECTION VII // GAZETTE & COMMUNIQUÉS
            </span>
            <span className="h-[1px] w-8 bg-[#c5a059]" />
          </div>
          <h2 className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-black text-[#ede8dd] tracking-[0.15em] uppercase">
            R4V BULLETIN
          </h2>
          <p className="font-editorial italic text-lg sm:text-xl text-[#9f9788] mt-3">
            Official dispatches, procedural circulars, and system notices from executive command.
          </p>
        </div>

        {/* Newspaper Clippings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {BULLETIN_POSTS.map((post, idx) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: idx * 0.2 }}
              className="bg-[#121419] border border-[#262a34] hover:border-[#c5a059] transition-all duration-300 p-6 sm:p-7 flex flex-col justify-between shadow-[0_12px_35px_rgba(0,0,0,0.7)] group relative"
            >
              {/* Top Newspaper Masthead Strip */}
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#20242c] mb-4 text-xs font-mono-vintage">
                  <span className="text-[#8c6d32] font-bold">{post.date}</span>
                  <span className="text-[#6d665a] tracking-widest">{post.issueNo}</span>
                </div>

                <div className="space-y-3">
                  <span className="font-cinzel text-xs font-bold tracking-[0.2em] text-[#c5a059] block uppercase">
                    {post.title}
                  </span>

                  <h3 className="font-playfair text-xl sm:text-2xl font-black text-[#fff6e5] group-hover:text-[#e5cb91] transition-colors leading-tight">
                    {post.headline}
                  </h3>

                  <p className="font-editorial text-sm text-[#aba394] leading-relaxed line-clamp-3 pt-2">
                    {post.summary}
                  </p>
                </div>
              </div>

              {/* Bottom Read File CTA */}
              <div className="mt-8 pt-4 border-t border-[#20242c] flex items-center justify-between">
                <span className="font-mono-vintage text-[10px] text-[#696357]">
                  {post.columnist}
                </span>

                <button
                  id={`read-bulletin-btn-${post.id}`}
                  onClick={() => setActiveArticle(post)}
                  className="font-cinzel text-xs font-bold tracking-widest text-[#e3ded4] hover:text-[#c5a059] flex items-center gap-1 group-hover:translate-x-1 transition-all uppercase cursor-pointer"
                >
                  <span>READ FILE</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Full Broadsheet Reader Modal */}
        <AnimatePresence>
          {activeArticle && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md"
              onClick={() => setActiveArticle(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#121418] border-2 border-[#c5a059] max-w-2xl w-full p-6 sm:p-10 relative shadow-[0_25px_80px_rgba(0,0,0,0.95)] max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => setActiveArticle(null)}
                  className="absolute top-5 right-5 p-1 text-[#8c8273] hover:text-[#fff6e5] border border-[#272b34] hover:border-[#c5a059]"
                >
                  <X size={18} />
                </button>

                {/* Broadsheet Masthead */}
                <div className="text-center pb-6 border-b-2 border-[#262b35] mb-6">
                  <span className="font-cinzel text-xs tracking-[0.3em] text-[#8c6d32] block mb-1">
                    THE BIRMINGHAM GAZETTE // R4V DISPATCH
                  </span>
                  <div className="font-mono-vintage text-xs text-[#7a7469] flex items-center justify-center gap-4">
                    <span>{activeArticle.date}</span>
                    <span>•</span>
                    <span>{activeArticle.issueNo}</span>
                  </div>
                </div>

                <div className="space-y-6 font-editorial">
                  <h3 className="font-playfair text-2xl sm:text-3xl font-black text-[#fff6e5] leading-tight text-center">
                    {activeArticle.headline}
                  </h3>

                  <div className="p-4 bg-[#0a0c0e] border border-[#1e222a] text-sm text-[#c5a059] font-mono-vintage">
                    SYNOPSIS: {activeArticle.summary}
                  </div>

                  <div className="text-base sm:text-lg text-[#d1cbc0] leading-relaxed space-y-4">
                    <p>{activeArticle.fullText}</p>
                    <p className="italic text-[#9c9589]">
                      All operatives and community associates are required to observe these standing orders under official executive mandate.
                    </p>
                  </div>

                  <div className="pt-6 border-t border-[#262b35] flex items-center justify-between text-xs font-mono-vintage text-[#7a7469]">
                    <span>DISPATCH DESK: {activeArticle.columnist}</span>
                    <button
                      onClick={() => setActiveArticle(null)}
                      className="px-5 py-2 bg-[#8c6d32] text-black font-cinzel font-bold text-xs tracking-wider uppercase hover:bg-[#c5a059]"
                    >
                      RETURN TO ARCHIVE
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

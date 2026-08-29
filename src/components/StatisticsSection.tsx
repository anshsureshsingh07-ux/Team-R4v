import React from 'react';
import { motion } from 'motion/react';
import { FileCheck, Users, Archive, Shield, Database } from 'lucide-react';
import { STATISTICS } from '../data/config';

export const StatisticsSection: React.FC = () => {
  const statItems = [
    {
      id: 'stat-doc',
      label: 'DOCUMENTED CASES',
      value: STATISTICS.documentedCases,
      subtext: 'Standardized evidentiary files verified',
      icon: FileCheck,
    },
    {
      id: 'stat-res',
      label: 'RESOLVED CASES',
      value: STATISTICS.resolvedCases,
      subtext: 'Platform actions successfully audited',
      icon: Shield,
    },
    {
      id: 'stat-mem',
      label: 'ACTIVE MEMBERS',
      value: STATISTICS.activeMembers,
      subtext: 'Auditors across intelligence units',
      icon: Users,
    },
    {
      id: 'stat-arc',
      label: 'ARCHIVED REPORTS',
      value: STATISTICS.archivedReports,
      subtext: 'Cold storage incident dossiers',
      icon: Archive,
    },
  ];

  return (
    <section id="statistics" className="relative py-24 bg-[#0a0c0f] border-t border-[#1a1d24] film-grain">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="h-[1px] w-8 bg-[#c5a059]" />
            <span className="font-mono-vintage text-xs tracking-[0.3em] text-[#c5a059] uppercase">
              SECTION VI // INTELLIGENCE METRICS
            </span>
            <span className="h-[1px] w-8 bg-[#c5a059]" />
          </div>
          <h2 className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-black text-[#ede8dd] tracking-[0.15em] uppercase">
            REGISTRY METRICS
          </h2>
          <p className="font-editorial italic text-lg sm:text-xl text-[#9f9788] mt-3">
            Verified institutional records maintained in the central ledger.
          </p>
        </div>

        {/* 4 Stats Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className="bg-[#121419] border border-[#232732] hover:border-[#c5a059] p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.6)] group relative"
              >
                {/* Vintage Corner Accent */}
                <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity">
                  <Icon size={20} className="text-[#c5a059]" />
                </div>

                <div className="space-y-2">
                  <span className="font-mono-vintage text-[11px] tracking-[0.25em] text-[#8c6d32] uppercase block">
                    {item.label}
                  </span>

                  <div className="font-cinzel text-4xl sm:text-5xl font-black text-[#fff6e5] tracking-tight group-hover:text-[#c5a059] transition-colors">
                    {item.value}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#1f222b]">
                  <p className="font-editorial text-xs sm:text-sm text-[#9c9589] leading-relaxed">
                    {item.subtext}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Configuration Notice */}
        <div className="mt-8 text-center">
          <span className="font-mono-vintage text-[11px] text-[#696357] tracking-wider uppercase">
            [DATA TIED DIRECTLY TO CENTRALIZED SYSTEM REGISTRY // REAL-TIME SYNCHRONIZED]
          </span>
        </div>
      </div>
    </section>
  );
};

import React, { useState, useEffect } from 'react';
import { AtmosphereCanvas } from './components/AtmosphereCanvas';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { LeadershipSection } from './components/LeadershipSection';
import { ArchiveSection } from './components/ArchiveSection';
import { OperationsSection } from './components/OperationsSection';
import { CodeSection } from './components/CodeSection';
import { StatisticsSection } from './components/StatisticsSection';
import { BulletinSection } from './components/BulletinSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { ClassifiedDossierModal } from './components/ClassifiedDossierModal';
import { CaseFileSequenceModal } from './components/CaseFileSequenceModal';
import { JoinModal } from './components/JoinModal';
import { AdminPanel } from './components/AdminPanel';

export default function App() {
  const [isClassifiedModalOpen, setIsClassifiedModalOpen] = useState<boolean>(false);
  const [isCaseFileSequenceOpen, setIsCaseFileSequenceOpen] = useState<boolean>(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('hero');
  // Helper to check if current route is an admin/pilot/owner route
  const checkIsPilotRoute = (): boolean => {
    try {
      const pathname = (window.location.pathname || '').toLowerCase().replace(/\/+$/, '');
      const hash = (window.location.hash || '').toLowerCase().replace(/\/+$/, '');
      return (
        pathname === '/owner' ||
        pathname.startsWith('/owner/') ||
        pathname === '/pilot' ||
        pathname.startsWith('/pilot/') ||
        pathname === '/admin' ||
        pathname.startsWith('/admin/') ||
        hash === '#owner' ||
        hash === '#pilot' ||
        hash === '#admin'
      );
    } catch {
      return false;
    }
  };

  const [isPilotView, setIsPilotView] = useState<boolean>(checkIsPilotRoute);

  // Handle URL path changes, browser back/forward & hash changes
  useEffect(() => {
    const handleLocationChange = () => {
      setIsPilotView(checkIsPilotRoute());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    // Initial check on mount
    handleLocationChange();

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Handle section tracking for nav when in public view
  useEffect(() => {
    if (isPilotView) return;

    const handleScroll = () => {
      const sections = ['hero', 'about', 'leadership', 'archive', 'operations', 'code', 'statistics', 'bulletin', 'contact'];
      const scrollPosition = window.scrollY + 200;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isPilotView]);

  const handleEnterWebsite = () => {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenPilot = () => {
    window.history.pushState({}, '', '/owner');
    setIsPilotView(true);
  };

  const handleExitPilot = () => {
    window.history.pushState({}, '', '/');
    setIsPilotView(false);
  };

  // If in pilot/owner view, render AdminPanel directly
  if (isPilotView) {
    return <AdminPanel onExitAdmin={handleExitPilot} />;
  }

  return (
    <div className="relative min-h-screen bg-[#08090a] text-[#e3ded4] overflow-hidden selection:bg-[#722020] selection:text-[#fff6e5]">
      {/* 1920s Atmospheric Rain, Smoke & Dust Particle Simulation */}
      <AtmosphereCanvas intensity="full" />

      {/* Top Dossier Navigation */}
      <Navigation
        onOpenClassified={() => setIsClassifiedModalOpen(true)}
        onOpenCaseFileSequence={() => setIsCaseFileSequenceOpen(true)}
        onOpenJoinModal={() => setIsJoinModalOpen(true)}
        onOpenPilotAccess={handleOpenPilot}
        activeSection={activeSection}
      />

      {/* Main Content Sections */}
      <main>
        {/* Fullscreen Cinematic Hero */}
        <Hero
          onEnter={handleEnterWebsite}
          onOpenClassified={() => setIsClassifiedModalOpen(true)}
          onOpenCaseFileSequence={() => setIsCaseFileSequenceOpen(true)}
          onOpenJoinModal={() => setIsJoinModalOpen(true)}
        />

        {/* Section 1: The Organization */}
        <AboutSection />

        {/* Section 2: Leadership */}
        <LeadershipSection onOpenPilotAccess={handleOpenPilot} />

        {/* Section 3: The Archive */}
        <ArchiveSection
          onOpenCaseFileSequence={() => setIsCaseFileSequenceOpen(true)}
        />

        {/* Section 4: Operations Pipeline */}
        <OperationsSection />

        {/* Section 5: The R4V Code */}
        <CodeSection />

        {/* Section 6: Intelligence Metrics / Statistics */}
        <StatisticsSection />

        {/* Section 7: R4V Bulletin (Newspaper Clippings) */}
        <BulletinSection />

        {/* Section 8: Communications Desk */}
        <ContactSection onOpenJoinModal={() => setIsJoinModalOpen(true)} />
      </main>

      {/* Cinematic Footer */}
      <Footer onOpenPilotAccess={handleOpenPilot} />

      {/* Interactive Classified Dossier Modal */}
      <ClassifiedDossierModal
        isOpen={isClassifiedModalOpen}
        onClose={() => setIsClassifiedModalOpen(false)}
        onOpenPilotAccess={handleOpenPilot}
      />

      {/* Cinematic Case File Motion-Graphic Sequence Modal */}
      <CaseFileSequenceModal
        isOpen={isCaseFileSequenceOpen}
        onClose={() => setIsCaseFileSequenceOpen(false)}
      />

      {/* Secure JOIN R4V Application Modal */}
      <JoinModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
      />
    </div>
  );
}

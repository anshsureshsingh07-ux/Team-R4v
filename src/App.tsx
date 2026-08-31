import React, { useState, useEffect, useCallback } from 'react';
import { AtmosphereCanvas } from './components/AtmosphereCanvas';
import { BureauHUD } from './components/BureauHUD';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { LeadershipSection } from './components/LeadershipSection';
import { CaseAnalyzerSection } from './components/CaseAnalyzerSection';
import { MethodsSection } from './components/MethodsSection';
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
import { PrivacyNoticeModal } from './components/PrivacyNoticeModal';
import { TermsConditionsModal } from './components/TermsConditionsModal';
import { ApplicantStatusLookupModal } from './components/ApplicantStatusLookupModal';
import { AdminPanel } from './components/AdminPanel';
import { ToastNotification, ToastItem } from './components/ToastNotification';
import { ambientSound } from './utils/ambientAudio';

export default function App() {
  const [isClassifiedModalOpen, setIsClassifiedModalOpen] = useState<boolean>(false);
  const [isCaseFileSequenceOpen, setIsCaseFileSequenceOpen] = useState<boolean>(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState<boolean>(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState<boolean>(false);
  const [isApplicantStatusModalOpen, setIsApplicantStatusModalOpen] = useState<boolean>(false);
  const [initialLookupQuery, setInitialLookupQuery] = useState<string>('');
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Toast dispatcher
  const notify = useCallback((message: string, type: 'info' | 'success' | 'alert' | 'copy' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev.slice(-3), { id, message, type }]); // Keep at most 4 toasts

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

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

    handleLocationChange();

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Throttled RAF Scroll Tracking for buttery smooth 60fps
  useEffect(() => {
    if (isPilotView) return;

    const sections = ['hero', 'about', 'leadership', 'analyzer', 'methods', 'archive', 'operations', 'code', 'statistics', 'bulletin', 'contact'];
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollPosition = window.scrollY + 250;
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
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isPilotView]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when user is typing in form inputs
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      if (e.key === 'Escape') {
        setIsClassifiedModalOpen(false);
        setIsCaseFileSequenceOpen(false);
        setIsJoinModalOpen(false);
        return;
      }

      if (isInput) return;

      if (e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        const searchInput = document.getElementById('archive-search-input');
        if (searchInput) {
          searchInput.scrollIntoView({ behavior: 'smooth' });
          searchInput.focus();
          notify('SEARCH ARCHIVE ACTIVE', 'info');
        }
      } else if (e.key === 'm' || e.key === 'M') {
        const isPlaying = ambientSound.toggle();
        ambientSound.playClick(isPlaying ? 1100 : 700);
        notify(isPlaying ? '1920s Vinyl & Rain Ambience Engaged.' : 'Ambient Gramophone Muted.', 'info');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [notify]);

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

  const handleTriggerSearch = () => {
    const searchInput = document.getElementById('archive-search-input');
    if (searchInput) {
      searchInput.scrollIntoView({ behavior: 'smooth' });
      searchInput.focus();
    }
  };

  // If in pilot/owner view, render AdminPanel directly
  if (isPilotView) {
    return <AdminPanel onExitAdmin={handleExitPilot} />;
  }

  return (
    <div className="relative min-h-screen bg-[#07080a] text-[#e3ded4] overflow-x-hidden selection:bg-[#722020] selection:text-[#fff6e5] font-editorial">
      {/* 1920s Atmospheric Rain, Smoke & Dust Particle Simulation */}
      <AtmosphereCanvas intensity="full" />

      {/* Top Bureau Live Status & Telemetry HUD */}
      <BureauHUD
        onTriggerSearch={handleTriggerSearch}
        onOpenPilotAccess={handleOpenPilot}
        onNotify={notify}
      />

      {/* Top Dossier Navigation */}
      <Navigation
        onOpenClassified={() => setIsClassifiedModalOpen(true)}
        onOpenCaseFileSequence={() => setIsCaseFileSequenceOpen(true)}
        onOpenJoinModal={() => setIsJoinModalOpen(true)}
        onOpenPilotAccess={handleOpenPilot}
        activeSection={activeSection}
        onNotify={notify}
      />

      {/* Main Content Sections */}
      <main className="relative z-10">
        {/* Fullscreen Cinematic Hero */}
        <Hero
          onEnter={handleEnterWebsite}
          onOpenClassified={() => setIsClassifiedModalOpen(true)}
          onOpenCaseFileSequence={() => setIsCaseFileSequenceOpen(true)}
          onOpenJoinModal={() => setIsJoinModalOpen(true)}
          onNotify={notify}
        />

        {/* Section 1: The Organization */}
        <AboutSection />

        {/* Section 2: Leadership */}
        <LeadershipSection onOpenPilotAccess={handleOpenPilot} />

        {/* Feature: R4V Case Analyzer (AI-Assisted Policy & Evidence Analysis) */}
        <CaseAnalyzerSection onNotify={notify} />

        {/* Section: Operational Methods & Dispatch Protocols (King of Banning) */}
        <MethodsSection onNotify={notify} />

        {/* Section 3: The Archive */}
        <ArchiveSection onNotify={notify} />

        {/* Section 4: Operations Pipeline */}
        <OperationsSection />

        {/* Section 5: The R4V Code */}
        <CodeSection onOpenTerms={() => setIsTermsModalOpen(true)} />

        {/* Section 6: Intelligence Metrics / Statistics */}
        <StatisticsSection />

        {/* Section 7: R4V Bulletin (Newspaper Clippings) */}
        <BulletinSection />

        {/* Section 8: Communications Desk */}
        <ContactSection onOpenJoinModal={() => setIsJoinModalOpen(true)} />
      </main>

      {/* Cinematic Footer */}
      <Footer 
        onOpenPilotAccess={handleOpenPilot} 
        onOpenPrivacyNotice={() => setIsPrivacyModalOpen(true)}
        onOpenTerms={() => setIsTermsModalOpen(true)}
        onOpenApplicantStatus={() => {
          setInitialLookupQuery('');
          setIsApplicantStatusModalOpen(true);
        }}
      />

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
        onOpenPrivacyNotice={() => setIsPrivacyModalOpen(true)}
        onOpenTerms={() => setIsTermsModalOpen(true)}
        onOpenStatusLookup={(appId) => {
          setInitialLookupQuery(appId || '');
          setIsApplicantStatusModalOpen(true);
        }}
      />

      {/* Privacy Policy Modal */}
      <PrivacyNoticeModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        onOpenTerms={() => {
          setIsPrivacyModalOpen(false);
          setIsTermsModalOpen(true);
        }}
      />

      {/* Terms & Conditions Modal */}
      <TermsConditionsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        onOpenPrivacyPolicy={() => {
          setIsTermsModalOpen(false);
          setIsPrivacyModalOpen(true);
        }}
      />

      {/* Applicant Status & Inbox Modal */}
      <ApplicantStatusLookupModal
        isOpen={isApplicantStatusModalOpen}
        onClose={() => setIsApplicantStatusModalOpen(false)}
        initialQuery={initialLookupQuery}
      />

      {/* Bureau Telegraph Toast Dispatcher */}
      <ToastNotification toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

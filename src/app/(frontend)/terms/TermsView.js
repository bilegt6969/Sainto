'use client'
import React, { useState, useEffect } from 'react';
import { Download, Clock, ChevronDown, ArrowUp, Globe, FileText, History, X, Calendar, Eye } from 'lucide-react';

// Translation data
const translations = {
  en: {
    language: 'English',
    country: 'United States',
    pageTitle: 'Terms & Conditions',
    legalDocs: 'Legal Documents',
    downloadPdf: 'Download PDF',
    history: 'History',
    tableOfContents: 'Table of Contents',
    description: 'Please read these terms and conditions carefully before using our service. By accessing and using Sainto, you agree to be bound by these terms.',
    contactInfo: 'Contact Information',
    phone: 'Phone',
    email: 'Email',
    socialMedia: 'Social Media',
    address: 'Address',
    version: 'Version',
    lastUpdated: 'Last updated',
    agreement: 'By using Sainto, you confirm that you have read, understood, and agree to these Terms and Conditions.',
    downloadingPdf: 'Generating PDF...',
    loadingHistory: 'Loading history...',
    versionHistory: 'Version History',
    closeHistory: 'Close History',
    viewVersion: 'View Version',
    sections: [
      { id: "basics", title: "The Basics", content: "These fundamental terms explain what you need to know about using our service.", subsections: [{ id: "what-are-terms", title: "What's in these terms?", content: "These terms tell you the rules for using our website www.sainto.mn (our site)." }, { id: "who-we-are", title: "Who we are and how to contact us?", content: "Our site is operated by Sainto (we or us). We are a company based in Ulaanbaatar, Mongolia. To contact us, please use the contact information provided below." }] },
      { id: "website-use", title: "Use of the Website", content: "Guidelines for proper and acceptable use of our platform.", subsections: [{ id: "acceptable-use", title: "Acceptable use", content: "You may use our site only for lawful purposes. You may not use our site:", items: ["In any way that breaches any applicable local, national or international law or regulation", "To transmit, or procure the sending of, any unsolicited or unauthorized advertising or promotional material", "To knowingly transmit any data or material that contains viruses or other harmful components"] }, { id: "interactive-services", title: "Interactive services", content: "We may from time to time provide interactive services on our site, including chat rooms, bulletin boards, and user reviews. We will provide clear information to you about the kind of service offered and whether it is moderated." }] },
      { id: "orders-payments", title: "Orders and Payments", content: "Terms related to purchasing and payment processing.", subsections: [{ id: "order-process", title: "Order process", content: "When you place an order through our website, the following process applies:", items: ["Order confirmation via email and SMS", "Daily delivery location updates", "Phone call coordination for delivery"] }, { id: "payment-methods", title: "Payment methods", content: "We currently accept cash on delivery. Future payment methods will include StorePay, QPay, and Stripe." }] }]
  },
  mn: {
    language: 'Монгол',
    country: 'Монгол Улс',
    pageTitle: 'Үйлчилгээний Нөхцөл',
    legalDocs: 'Хууль Эрх Зүйн Баримт Бичиг',
    downloadPdf: 'PDF Татах',
    history: 'Түүх',
    tableOfContents: 'Агуулга',
    description: 'Манай үйлчилгээг ашиглахын өмнө эдгээр нөхцөлийг анхааралтай уншина уу. Sainto-г ашиглаж, хандах замаар та эдгээр нөхцөлийг хүлээн зөвшөөрч байна.',
    contactInfo: 'Холбоо Барих Мэдээлэл',
    phone: 'Утас',
    email: 'Имэйл',
    socialMedia: 'Нийгмийн Сүлжээ',
    address: 'Хаяг',
    version: 'Хувилбар',
    lastUpdated: 'Сүүлд шинэчилсэн',
    agreement: 'Sainto-г ашигласнаар та эдгээр Үйлчилгээний Нөхцөлийг уншиж, ойлгож, зөвшөөрч байгаагаа баталж байна.',
    downloadingPdf: 'PDF үүсгэж байна...',
    loadingHistory: 'Түүх ачааллаж байна...',
    versionHistory: 'Хувилбарын Түүх',
    closeHistory: 'Түүх Хаах',
    viewVersion: 'Хувилбар Үзэх',
    sections: [
      { id: "basics", title: "Үндсэн Зүйлс", content: "Эдгээр үндсэн нөхцөлүүд нь манай үйлчилгээг ашиглахад таны мэдэх ёстой зүйлсийг тайлбарладаг.", subsections: [{ id: "what-are-terms", title: "Эдгээр нөхцөлд юу байгаа вэ?", content: "Эдгээр нөхцөлүүд нь манай www.sainto.mn вэбсайт (манай сайт) ашиглах дүрмийг танд хэлж өгдөг." }, { id: "who-we-are", title: "Бид хэн бэ, хэрхэн холбогдох вэ?", content: "Манай сайтыг Sainto (бид эсвэл биднийх) компани ажиллуулдаг. Бид Улаанбаатар хотод байрладаг компани юм. Бидэнтэй холбогдохдоо доош өгөгдсөн холбоо барих мэдээллийг ашиглана уу." }] },
      { id: "website-use", title: "Вэбсайт Ашиглах", content: "Манай платформыг зөв, зохистой ашиглах удирдамж.", subsections: [{ id: "acceptable-use", title: "Зөвшөөрөгдөх ашиглалт", content: "Та манай сайтыг зөвхөн хууль ёсны зорилгоор ашиглаж болно. Та манай сайтыг дараах зорилгоор ашиглаж болохгүй:", items: ["Орон нутгийн, үндэсний эсвэл олон улсын хууль, журмыг зөрчихөд", "Зөвшөөрөлгүй сурталчилгаа, сурталчилгааны материал илгээхэд", "Вирус болон бусад хортой бүрэлдэхүүн агуулсан өгөгдөл, материал илгээхэд"] }, { id: "interactive-services", title: "Интерактив үйлчилгээ", content: "Бид үе үе манай сайт дээр чат өрөө, зарын самбар, хэрэглэгчийн үнэлгээ зэрэг интерактив үйлчилгээ үзүүлж болно. Бид танд санал болгож буй үйлчилгээний төрөл, хяналттай эсэх талаар тодорхой мэдээлэл өгөх болно." }] },
      { id: "orders-payments", title: "Захиалга, Төлбөр", content: "Худалдана авалт, төлбөрийн процесстой холбоотой нөхцөлүүд.", subsections: [{ id: "order-process", title: "Захиалгын процесс", content: "Та манай вэбсайтаар дамжуулан захиалга өгөхөд дараах процесс хэрэгжинэ:", items: ["Имэйл болон SMS-ээр захиалга баталгаажуулах", "Өдөр бүр хүргэлтийн байршлын мэдээлэл өгөх", "Хүргэлтийн талаар утсаар харилцах"] }, { id: "payment-methods", title: "Төлбөрийн аргууд", content: "Бид одоогоор хүргэлтийн үед бэлэн мөнгөөр төлбөр хүлээн авдаг. Ирээдүйд StorePay, QPay, Stripe зэрэг төлбөрийн аргуудыг нэмж оруулна." }] }]
  }
};

// Mock contact data
const contactInfo = {
  phone: "90195589",
  email: "bilegt6969@gmail.com",
  facebook: "https://www.facebook.com/profile.php?id=61573613619465",
  instagram: "https://www.instagram.com/sainto.ub/",
  address: "Ulaanbaatar, Mongolia"
};

const mockTermsData = {
  lastUpdated: "June 18, 2025",
  version: "1.0",
  contactInfo
};

// Skeleton Components
const SkeletonText = ({ lines = 3, className = "" }) => (
  <div className={`space-y-3 ${className}`}>
    {[...Array(lines)].map((_, i) => (
      <div key={i} className={`h-4 bg-gray-200 rounded animate-pulse ${i === lines - 1 ? 'w-3/4' : 'w-full'}`} />
    ))}
  </div>
);

const SkeletonButton = ({ className = "" }) => (
  <div className={`h-12 bg-gray-200 rounded-full animate-pulse ${className}`} />
);

const SkeletonSection = () => (
  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 md:p-8">
    <div className="h-8 bg-gray-200 rounded w-3/4 mb-4 animate-pulse" />
    <SkeletonText lines={4} />
  </div>
);

// Language Switcher with skeleton loading state
const LanguageSwitcher = ({ onToggle, t, isTranslating }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onToggle();
      setTimeout(() => setIsAnimating(false), 300);
    }, 150);
  };

  if (isTranslating) {
    return <SkeletonButton className="min-w-[200px]" />;
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isAnimating}
      className={`relative overflow-hidden bg-gradient-to-r from-gray-100 to-gray-50 border border-gray-200 hover:border-gray-300 transition-all duration-300 px-4 sm:px-6 py-3 rounded-full text-sm font-medium text-gray-900 cursor-pointer focus:ring-2 focus:ring-gray-900 focus:ring-opacity-20 focus:outline-none flex items-center gap-2 sm:gap-3 min-w-[160px] sm:min-w-[200px] ${isAnimating ? 'scale-95' : 'hover:scale-105'}`}
    >
      <Globe className={`w-4 h-4 transition-transform duration-300 ${isAnimating ? 'rotate-180' : ''}`} />
      <div className="relative flex-1 text-left">
        <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 transform translate-y-2' : 'opacity-100 transform translate-y-0'}`}>
          <span className="hidden sm:inline">{t.country} ({t.language})</span>
          <span className="sm:hidden">{t.language}</span>
        </div>
      </div>
      {isAnimating && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-100 animate-pulse rounded-full" />
      )}
    </button>
  );
};

// Enhanced PDF Download with progress
const PDFDownloadButton = ({ onDownload, t, isDownloading }) => (
  <button
    onClick={onDownload}
    disabled={isDownloading}
    className={`relative overflow-hidden bg-gray-900 hover:bg-gray-800 text-white px-4 sm:px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 sm:gap-3 min-w-[120px] sm:min-w-[140px] ${isDownloading ? 'opacity-75 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
  >
    {isDownloading ? (
      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
    ) : (
      <Download className="w-4 h-4" />
    )}
    <span className="relative text-xs sm:text-sm">{isDownloading ? t.downloadingPdf : t.downloadPdf}</span>
    {isDownloading && (
      <div className="absolute bottom-0 left-0 h-1 bg-white bg-opacity-30 animate-pulse" style={{ width: '60%' }} />
    )}
  </button>
);

// Enhanced History Button
const HistoryButton = ({ onViewHistory, t, isLoading }) => (
  <button
    onClick={onViewHistory}
    disabled={isLoading}
    className={`bg-gray-100 border border-gray-200 hover:border-gray-300 text-gray-900 px-4 sm:px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 sm:gap-3 min-w-[100px] sm:min-w-[120px] ${isLoading ? 'opacity-75 cursor-not-allowed' : 'hover:bg-gray-50 hover:scale-105'}`}
  >
    {isLoading ? (
      <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full" />
    ) : (
      <History className="w-4 h-4" />
    )}
    <span className="text-xs sm:text-sm">{isLoading ? t.loadingHistory : t.history}</span>
  </button>
);

// History Modal Component
const HistoryModal = ({ isOpen, onClose, history, t, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" onClick={onClose} />

        {/* Modal */}
        <div className="inline-block w-full max-w-2xl p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl sm:my-16">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <History className="w-6 h-6" />
              {t.versionHistory}
            </h3>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4">
                    <div className="h-5 bg-gray-200 rounded w-1/4 mb-3 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((version, index) => (
                  <div key={index} className="bg-gray-50 hover:bg-gray-100 rounded-xl p-4 transition-colors duration-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-gray-900 text-white px-3 py-1 rounded-full text-sm font-bold">v{version.version}</div>
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <Calendar className="w-4 h-4" />
                          {version.date}
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600 p-1 rounded">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{version.changes}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
            <button onClick={onClose} className="px-6 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors duration-200">
              {t.closeHistory}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Table of Contents Component
const TableOfContents = ({ sections, activeSection, onSectionClick, t, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="lg:sticky lg:top-8 lg:w-72 mb-8 lg:mb-0">
        <div className="lg:hidden mb-4">
          <SkeletonButton className="w-full h-16" />
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-6 animate-pulse" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:sticky lg:top-8 lg:w-72 mb-8 lg:mb-0">
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden w-full flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-2xl mb-4 text-gray-900 hover:bg-gray-100 transition-colors duration-200"
      >
        <span className="font-medium">{t.tableOfContents}</span>
        <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Table of Contents */}
      <nav className={`${isOpen ? 'block' : 'hidden'} lg:block bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-6 transition-all duration-300`}>
        <h3 className="font-bold text-gray-900 mb-4 sm:mb-6 text-base sm:text-lg">{t.tableOfContents}</h3>
        <ul className="space-y-2">
          {sections.map((section) => (
            <li key={section.id}>
              <button
                onClick={() => { onSectionClick(section.id); setIsOpen(false); }}
                className={`text-left w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all duration-200 text-sm font-medium ${activeSection === section.id ? 'bg-gray-900 text-white transform scale-105' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
              >
                {section.title}
              </button>
              {section.subsections && activeSection === section.id && (
                <ul className="ml-3 sm:ml-4 mt-2 space-y-1 animate-fadeIn">
                  {section.subsections.map((subsection) => (
                    <li key={subsection.id}>
                      <button
                        onClick={() => { onSectionClick(subsection.id); setIsOpen(false); }}
                        className="text-left w-full px-3 sm:px-4 py-2 rounded-lg text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
                      >
                        {subsection.title}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

// Contact Information Component
const ContactInfo = ({ contactInfo, t }) => (
  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-6 mt-6 hover:shadow-lg transition-all duration-300">
    <h4 className="font-bold text-gray-900 mb-4 sm:mb-6 text-base sm:text-lg">{t.contactInfo}</h4>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-sm">
      <div className="space-y-4">
        <div>
          <p className="font-medium text-gray-600 mb-1">{t.phone}</p>
          <a href={`tel:${contactInfo.phone}`} className="text-gray-900 hover:text-blue-600 transition-colors duration-200 font-medium">{contactInfo.phone}</a>
        </div>
        <div>
          <p className="font-medium text-gray-600 mb-1">{t.email}</p>
          <a href={`mailto:${contactInfo.email}`} className="text-gray-900 hover:text-blue-600 transition-colors duration-200 font-medium break-all">{contactInfo.email}</a>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <p className="font-medium text-gray-600 mb-2">{t.socialMedia}</p>
          <div className="space-y-2">
            <a href={contactInfo.facebook} target="_blank" rel="noopener noreferrer" className="block text-gray-900 hover:text-blue-600 transition-colors duration-200 font-medium">Facebook</a>
            <a href={contactInfo.instagram} target="_blank" rel="noopener noreferrer" className="block text-gray-900 hover:text-pink-600 transition-colors duration-200 font-medium">Instagram</a>
          </div>
        </div>
        <div>
          <p className="font-medium text-gray-600 mb-1">{t.address}</p>
          <p className="text-gray-900">{contactInfo.address}</p>
        </div>
      </div>
    </div>
  </div>
);

// Scroll to Top Button
const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 p-3 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-800 transition-all duration-300 z-40 hover:scale-110${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
};

// Mock PDF generation function
function generatePDF(content, language) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const blob = new Blob([`Terms & Conditions - ${language}\n\n${JSON.stringify(content, null, 2)}`], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `terms-conditions-${language}-${new Date().getTime()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      resolve();
    }, 2000);
  });
}

// Mock history data
const getVersionHistory = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const history = [
        { version: '1.0', date: 'June 18, 2025', changes: 'Initial release with complete terms and conditions. Added payment processing terms and user agreement guidelines.' },
        { version: '0.9', date: 'May 15, 2025', changes: 'Beta version with comprehensive payment terms. Integrated StorePay and QPay payment methods for testing.' },
        { version: '0.8', date: 'April 10, 2025', changes: 'Draft version with basic terms structure. Established fundamental user rights and service guidelines.' },
      ];
      resolve(history);
    }, 1500);
  });
};

// Main Terms View Component
const TermsView = ({ termsData = mockTermsData }) => {
  const [currentLang, setCurrentLang] = useState('en');
  const [activeSection, setActiveSection] = useState('');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const t = translations[currentLang];

  useEffect(() => {
    setMounted(true); // Indicate component has mounted
  }, []);

  useEffect(() => {
    // Set initial active section to the first section
    if (t.sections.length > 0) {
      setActiveSection(t.sections[0].id);
    }

    const handleScroll = () => {
      const sections = t.sections;
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i].id);
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(sections[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentLang, t.sections]);

  const toggleLanguage = () => {
    setIsTranslating(true);
    setTimeout(() => { // Simulate translation delay
      setCurrentLang((prevLang) => (prevLang === 'en' ? 'mn' : 'en'));
      setIsTranslating(false);
    }, 500);
  };

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    await generatePDF(translations[currentLang], currentLang);
    setIsDownloadingPdf(false);
  };

  const handleViewHistory = async () => {
    setIsLoadingHistory(true);
    setIsHistoryModalOpen(true);
    const history = await getVersionHistory();
    setHistoryData(history);
    setIsLoadingHistory(false);
  };

  const handleSectionClick = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.pageYOffset - 80; // Adjust for sticky header/padding
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  // Conditional rendering for skeleton loading of the main content area
  const isLoadingContent = isTranslating || !mounted;

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900 antialiased">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-200 py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <FileText className="w-6 h-6 text-gray-900" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t.pageTitle}</h1>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <LanguageSwitcher currentLang={currentLang} onToggle={toggleLanguage} t={t} isTranslating={isTranslating} />
            <HistoryButton onViewHistory={handleViewHistory} t={t} isLoading={isLoadingHistory} />
            <PDFDownloadButton onDownload={handleDownloadPdf} t={t} isDownloading={isDownloadingPdf} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="lg:flex lg:gap-8">
          {/* Table of Contents */}
          <TableOfContents
            sections={t.sections}
            activeSection={activeSection}
            onSectionClick={handleSectionClick}
            t={t}
            isLoading={isLoadingContent}
          />

          {/* Terms and Conditions Content */}
          <article className="flex-1 min-w-0">
            <section className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4">{t.legalDocs}</h2>
              {isLoadingContent ? (
                <SkeletonText lines={3} className="mb-6" />
              ) : (
                <p className="text-gray-700 leading-relaxed mb-6">{t.description}</p>
              )}

              <div className="flex items-center text-gray-500 text-sm mb-8 gap-4">
                {isLoadingContent ? (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{t.lastUpdated}: {termsData.lastUpdated}</span>
                  </div>
                )}
                {isLoadingContent ? (
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>{t.version}: {termsData.version}</span>
                  </div>
                )}
              </div>

              {isLoadingContent ? (
                <div className="space-y-8">
                  <SkeletonSection />
                  <SkeletonSection />
                  <SkeletonSection />
                </div>
              ) : (
                t.sections.map((section) => (
                  <div key={section.id} id={section.id} className="mb-10 last:mb-0 pt-2">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{section.title}</h3>
                    <p className="text-gray-700 leading-relaxed mb-6">{section.content}</p>
                    {section.subsections && (
                      <div className="space-y-8 pl-4 sm:pl-6 border-l-2 border-gray-200">
                        {section.subsections.map((subsection) => (
                          <div key={subsection.id} id={subsection.id} className="pt-2">
                            <h4 className="text-xl font-semibold text-gray-800 mb-3">{subsection.title}</h4>
                            <p className="text-gray-700 leading-relaxed mb-4">{subsection.content}</p>
                            {subsection.items && (
                              <ul className="list-disc list-inside space-y-2 text-gray-700">
                                {subsection.items.map((item, index) => (
                                  <li key={index} className="flex items-start">
                                    <span className="mr-2 text-gray-500">•</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </section>

            {/* Contact Information */}
            {isLoadingContent ? (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-6 mt-6">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-6 animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-4">
                    <SkeletonText lines={2} />
                    <SkeletonText lines={2} />
                  </div>
                  <div className="space-y-4">
                    <SkeletonText lines={3} />
                    <SkeletonText lines={2} />
                  </div>
                </div>
              </div>
            ) : (
              <ContactInfo contactInfo={termsData.contactInfo} t={t} />
            )}

            {/* Agreement Statement */}
            {isLoadingContent ? (
              <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 sm:p-6 rounded-2xl mt-8 shadow-sm flex items-start gap-3 animate-pulse">
                <div className="h-6 bg-blue-200 rounded w-6" />
                <div className="h-6 bg-blue-200 rounded w-full" />
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 sm:p-6 rounded-2xl mt-8 shadow-sm flex items-start gap-3">
                <Info className="w-6 h-6 text-blue-600 flex-shrink-0" />
                <p className="leading-relaxed font-medium">{t.agreement}</p>
              </div>
            )}
          </article>
        </div>
      </main>

      {/* History Modal */}
      <HistoryModal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} history={historyData} t={t} isLoading={isLoadingHistory} />

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
};

export default TermsView;

// Dummy Info icon, replace with actual lucide-react import if available
const Info = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);
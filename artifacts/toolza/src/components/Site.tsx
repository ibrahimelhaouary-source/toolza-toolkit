import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowRight, FileText, Moon, Sun, Wrench } from 'lucide-react';

export const tools = [
  { title: 'PDF Merger', description: 'Bring multiple PDF files together in the order you choose.', href: '/tools/pdf-merger', icon: 'pdf', label: 'Combine PDFs', category: 'Files & Images' },
  { title: 'Image Compressor', description: 'Make image files lighter while keeping them looking sharp.', href: '/tools/image-compressor', icon: 'image', label: 'Shrink images', category: 'Files & Images' },
  { title: 'Word Counter', description: 'Count words, characters, and paragraphs as you write.', href: '/tools/word-counter', icon: 'words', label: 'Count text', category: 'Text' },
  { title: 'Case Converter', description: 'Switch text between uppercase, lowercase, and title case.', href: '/tools/case-converter', icon: 'case', label: 'Change case', category: 'Text' },
  { title: 'CV Builder', description: 'Shape your experience into a clean, print-ready CV.', href: '/tools/cv-builder', icon: 'cv', label: 'Build a CV', category: 'Career' },
];

export function Header() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem('toolza-theme');
    const initial = stored === 'dark';
    setDark(initial);
    document.documentElement.classList.toggle('dark', initial);
  }, []);
  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('toolza-theme', next ? 'dark' : 'light');
  }
  return (
    <header className="topbar">
      <Link href="/" className="brand" data-testid="link-brand">
        <span className="brand-mark"><Wrench size={18} strokeWidth={2.5} /></span>
        <span>toolza</span>
      </Link>
      <nav className="nav-links" aria-label="Main navigation">
        <Link href="/" data-testid="link-home">All tools</Link>
        <Link href="/about" data-testid="link-about">About</Link>
        <Link href="/privacy" data-testid="link-privacy">Privacy</Link>
      </nav>
      <div className="header-actions">
        <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} data-testid="button-theme-toggle">
          {dark ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <Link href="/" className="brand" data-testid="link-footer-brand"><span className="brand-mark"><Wrench size={17} /></span><span>toolza</span></Link>
          <nav className="footer-links" aria-label="Footer navigation">
            <Link href="/about" data-testid="link-footer-about">About</Link>
            <Link href="/privacy" data-testid="link-footer-privacy">Privacy</Link>
            <Link href="/terms" data-testid="link-footer-terms">Terms</Link>
            <Link href="/contact" data-testid="link-footer-contact">Contact</Link>
          </nav>
        </div>
        <div className="copyright">Free tools. No account. Your files stay on your device.</div>
      </div>
    </footer>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const titles: Record<string, [string, string]> = {
    '/': ['Free Online Tools for Everyday Tasks | Toolza', 'Use Toolza’s free browser-based tools for PDFs, images, writing, and CVs. No account required; your files stay on your device.'],
    '/tools/pdf-merger': ['Free PDF Merger — Combine PDFs Locally | Toolza', 'Merge multiple PDF files in your browser, arrange their order, and download one combined PDF. Files stay on your device.'],
    '/tools/image-compressor': ['Free Image Compressor — Reduce Image Size | Toolza', 'Compress images directly in your browser, preview the result, and download a smaller file without uploading it.'],
    '/tools/word-counter': ['Free Word Counter — Count Words and Characters | Toolza', 'Count words, characters, and paragraphs instantly while you type or paste text in your browser.'],
    '/tools/case-converter': ['Free Case Converter — Change Text Case | Toolza', 'Convert text to uppercase, lowercase, or title case instantly, right in your browser.'],
    '/tools/cv-builder': ['Free CV Builder — Create a Print-ready CV | Toolza', 'Build a simple, professional CV with a live preview and print-to-PDF option. Your details stay in your browser.'],
    '/about': ['About Toolza — Everyday Tools, Made Simple', 'Learn why Toolza makes quick, private browser-based utilities free and accessible to everyone.'],
    '/privacy': ['Privacy at Toolza — Your Files Stay Yours', 'Understand how Toolza handles privacy: tools run in your browser, and files are not uploaded to our servers.'],
    '/terms': ['Terms of Use | Toolza', 'Read the terms for using Toolza’s free browser-based tools and services.'],
    '/contact': ['Contact Toolza — Share Feedback Locally', 'Find the best way to prepare feedback about Toolza without a server-side contact form or invented email address.'],
  };
  const [title, description] = titles[location] || ['Page not found | Toolza', 'The requested Toolza page could not be found.'];
  useEffect(() => {
    document.title = title;
    const setMeta = (selector: string, attr: string, value: string) => {
      let el = document.head.querySelector(selector) as HTMLMetaElement | null;
      if (!el) { el = document.createElement('meta'); document.head.appendChild(el); }
      el.setAttribute(attr, value);
    };
    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[name="twitter:title"]', 'content', title);
    setMeta('meta[name="twitter:description"]', 'content', description);
    let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = `${window.location.origin}${location}`;
  }, [description, location, title]);
  return <div className="site-shell"><Header /><main>{children}</main><Footer /></div>;
}

export function PageHeading({ title, description, label = 'A TOOLZA TOOL' }: { title: string; description: string; label?: string }) {
  return <div className="tool-heading"><span className="eyebrow">{label}</span><h1>{title}</h1><p>{description}</p></div>;
}

export function PrivacyNote() {
  return <div className="privacy-note"><FileText size={14} /> Runs in your browser. Your files are never uploaded.</div>;
}

export function ToolLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="button button-secondary" data-testid={`link-tool-${href.split('/').pop()}`}>{children}<ArrowRight size={15} /></Link>;
}

import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { ArrowRight, Check, FileImage, Files, FileText, Search, ShieldCheck, Type, UserRound } from 'lucide-react';
import { PrivacyNote, tools } from '../components/Site';

const iconMap = {
  pdf: Files,
  image: FileImage,
  words: FileText,
  case: Type,
  cv: UserRound,
};

export default function Home() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All tools');
  const categories = ['All tools', 'Files & Images', 'Text', 'Career'];
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tools.filter((tool) =>
      (category === 'All tools' || tool.category === category) &&
      (!query || `${tool.title} ${tool.description} ${tool.label}`.toLowerCase().includes(query)),
    );
  }, [category, search]);
  return (
    <>
      <section className="hero">
        <div className="container">
          <span className="eyebrow">YOUR EVERYDAY TOOLKIT · FREE, ALWAYS</span>
          <h1>Your Free Everyday <span>Online Toolkit.</span></h1>
          <p className="hero-copy">The little tools that make everyday tasks easier. No account, no fuss — just open a tool and get it done.</p>
          <label className="search-wrap">
            <Search className="search-icon" size={19} />
            <span className="sr-only">Search tools</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="What do you need to get done?" type="search" data-testid="input-tool-search" />
          </label>
          <PrivacyNote />
        </div>
      </section>
      <section className="section" id="tools">
        <div className="container">
          <div className="section-head">
            <div><h2>Useful tools, ready when you are</h2><p>Pick a tool and get straight to the useful part.</p></div>
            <span className="eyebrow">{filtered.length} {filtered.length === 1 ? 'TOOL' : 'TOOLS'}</span>
          </div>
          <div className="category-filters" role="group" aria-label="Filter tools by category">
            {categories.map((item) => (
              <button
                className={`category-chip${category === item ? ' active' : ''}`}
                type="button"
                key={item}
                aria-pressed={category === item}
                onClick={() => setCategory(item)}
                data-testid={`button-category-${item.toLowerCase().replace(/[^a-z]+/g, '-')}`}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="tool-grid" data-testid="list-tools">
            {filtered.map((tool) => {
              const Icon = iconMap[tool.icon as keyof typeof iconMap];
              return (
                <Link key={tool.href} href={tool.href} className="tool-card" data-testid={`card-tool-${tool.icon}`}>
                  <span className="tool-icon"><Icon size={21} /></span>
                  <h3>{tool.title}</h3>
                  <p>{tool.description}</p>
                  <span className="card-arrow">{tool.label}<ArrowRight size={14} style={{ verticalAlign: 'middle', marginLeft: 5 }} /></span>
                </Link>
              );
            })}
            {filtered.length === 0 && <div className="no-results" data-testid="status-no-tool-results">No tools match “{search}”. Try “PDF”, “image”, or “text”.</div>}
          </div>
        </div>
      </section>
      <section className="trust-band">
        <div className="container trust-grid">
          <div><span className="eyebrow">PRIVATE BY DESIGN</span><h2>Your files don’t need to leave your device.</h2><p>Toolza processes supported files right in your browser. That means your documents and images stay with you while you work.</p></div>
          <div className="trust-points">
            <div className="trust-point"><span className="trust-check"><Check size={16} /></span>No account, signup, or upload queue</div>
            <div className="trust-point"><span className="trust-check"><Check size={16} /></span>Local processing for supported tools</div>
            <div className="trust-point"><span className="trust-check"><Check size={16} /></span>Simple tools, free to use</div>
            <Link href="/privacy" className="footer-links" data-testid="link-home-privacy">Read our privacy approach <ArrowRight size={14} /></Link>
          </div>
        </div>
      </section>
    </>
  );
}

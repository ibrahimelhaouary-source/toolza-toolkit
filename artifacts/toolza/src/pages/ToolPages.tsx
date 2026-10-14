import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { ArrowDown, ArrowUp, Check, Download, FileImage, FilePlus2, Files, Minus, Printer, RefreshCw, Trash2, Upload } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { PageHeading, PrivacyNote } from '../components/Site';

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

type PdfFile = { id: string; file: File };

export function PdfMergerPage() {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  useEffect(() => () => { if (downloadUrl) URL.revokeObjectURL(downloadUrl); }, [downloadUrl]);
  function addFiles(event: ChangeEvent<HTMLInputElement>) {
    const incoming = Array.from(event.target.files || []).filter((file) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));
    if (incoming.length !== (event.target.files?.length || 0)) setError('Only PDF files can be added.');
    if (incoming.length) {
      setFiles((existing) => [...existing, ...incoming.map((file) => ({ id: `${file.name}-${file.size}-${Math.random()}`, file }))]);
      setDownloadUrl('');
    }
    event.target.value = '';
  }
  function moveFile(index: number, direction: number) {
    setDownloadUrl('');
    setFiles((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }
  async function mergePdfs() {
    if (files.length < 2) { setError('Add at least two PDFs to merge.'); return; }
    setBusy(true);
    setError('');
    try {
      const merged = await PDFDocument.create();
      for (const entry of files) {
        const source = await PDFDocument.load(await entry.file.arrayBuffer());
        const pages = await merged.copyPages(source, source.getPageIndices());
        pages.forEach((page) => merged.addPage(page));
      }
      const bytes = await merged.save();
      const blob = new Blob([new Uint8Array(bytes).buffer], { type: 'application/pdf' });
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(URL.createObjectURL(blob));
    } catch (reason) {
      setError(reason instanceof Error ? `Could not merge these PDFs: ${reason.message}` : 'Could not merge these PDFs. Check the files and try again.');
    } finally {
      setBusy(false);
    }
  }
  return <div className="page-main"><PageHeading title="Merge PDF files" description="Put multiple PDFs together in the order you choose. Everything is processed locally in your browser." /><div className="workspace"><section className="panel">
    <div className="drop-zone"><Files size={28} color="hsl(var(--primary))" /><p>Choose two or more PDF files to get started.</p><label className="button button-secondary" htmlFor="pdf-picker" data-testid="button-select-pdfs"><Upload size={15} />Select PDFs</label><input id="pdf-picker" type="file" accept="application/pdf,.pdf" multiple onChange={addFiles} className="sr-only" data-testid="input-pdf-files" /></div>
    {files.length > 0 && <div className="file-list" data-testid="list-pdf-files">{files.map((entry, index) => <div className="file-row" key={entry.id} data-testid={`row-pdf-${index}`}><span className="tool-icon" style={{ width: 36, height: 36, margin: 0 }}><FilePlus2 size={17} /></span><div className="file-meta"><div className="file-name">{index + 1}. {entry.file.name}</div><div className="file-size">{formatBytes(entry.file.size)}</div></div><div className="file-actions"><button className="small-action" type="button" disabled={index === 0} onClick={() => moveFile(index, -1)} aria-label={`Move ${entry.file.name} up`} data-testid={`button-pdf-up-${index}`}><ArrowUp size={14} /></button><button className="small-action" type="button" disabled={index === files.length - 1} onClick={() => moveFile(index, 1)} aria-label={`Move ${entry.file.name} down`} data-testid={`button-pdf-down-${index}`}><ArrowDown size={14} /></button><button className="small-action" type="button" onClick={() => { setFiles((current) => current.filter((file) => file.id !== entry.id)); setDownloadUrl(''); }} aria-label={`Remove ${entry.file.name}`} data-testid={`button-pdf-remove-${index}`}><Trash2 size={14} /></button></div></div>)}</div>}
    {error && <div className="message error" role="alert" data-testid="status-pdf-error">{error}</div>}
    <div className="button-row"><button className="button" type="button" disabled={busy || files.length < 2} onClick={mergePdfs} data-testid="button-merge-pdfs">{busy ? <><RefreshCw size={15} />Merging…</> : <><Files size={15} />Merge PDFs</>}</button>{files.length > 0 && <button className="button button-outline" type="button" onClick={() => { setFiles([]); setDownloadUrl(''); setError(''); }} data-testid="button-clear-pdfs">Clear files</button>}</div>
    {downloadUrl && <div className="message" role="status" data-testid="status-pdf-ready"><Check size={15} /> Your merged PDF is ready. <a href={downloadUrl} download="toolza-merged.pdf" className="button" style={{ marginLeft: 8 }} data-testid="link-download-merged-pdf"><Download size={14} />Download PDF</a></div>}
  </section><PrivacyNote /></div></div>;
}

export function ImageCompressorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(0.76);
  const [result, setResult] = useState<{ url: string; size: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const inputUrl = useMemo(() => file ? URL.createObjectURL(file) : '', [file]);
  useEffect(() => () => { if (inputUrl) URL.revokeObjectURL(inputUrl); }, [inputUrl]);
  useEffect(() => () => { if (result?.url) URL.revokeObjectURL(result.url); }, [result]);
  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.files?.[0] || null;
    setFile(next);
    setResult(null);
    setError('');
    event.target.value = '';
  }
  async function compress() {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas is not available in this browser.');
      context.drawImage(bitmap, 0, 0);
      bitmap.close();
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((output) => output ? resolve(output) : reject(new Error('Image could not be compressed.')), 'image/webp', quality);
      });
      if (result?.url) URL.revokeObjectURL(result.url);
      setResult({ url: URL.createObjectURL(blob), size: blob.size });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'This image could not be compressed. Try another file.');
    } finally {
      setBusy(false);
    }
  }
  const reduction = file && result ? Math.max(0, Math.round((1 - result.size / file.size) * 100)) : 0;
  return <div className="page-main"><PageHeading title="Compress an image" description="Shrink an image into a lighter WebP file. A preview and size comparison help you decide if the result works for you." /><div className="workspace"><section className="panel">
    {!file && <div className="drop-zone"><FileImage size={29} color="hsl(var(--primary))" /><p>Choose a JPG, PNG, WebP, or other browser-supported image.</p><label htmlFor="image-picker" className="button button-secondary" data-testid="button-select-image"><Upload size={15} />Choose image</label><input id="image-picker" className="sr-only" type="file" accept="image/*" onChange={chooseFile} data-testid="input-image-file" /></div>}
    {file && <div className="compress-layout"><div><img className="preview-image" src={inputUrl} alt={`Original preview of ${file.name}`} /><div className="stat-card"><div className="stat-value">{formatBytes(file.size)}</div><div className="stat-label">Original · {file.name}</div></div></div><div><label className="field-label" htmlFor="quality-slider">Compression quality</label><div className="range-line"><span>Smaller file</span><strong data-testid="text-image-quality">{Math.round(quality * 100)}%</strong><span>More detail</span></div><input id="quality-slider" type="range" min="0.2" max="0.95" step="0.05" value={quality} onChange={(event) => { setQuality(Number(event.target.value)); setResult(null); }} style={{ width: '100%' }} data-testid="input-image-quality" /><div className="button-row"><button className="button" type="button" onClick={compress} disabled={busy} data-testid="button-compress-image">{busy ? 'Compressing…' : <><RefreshCw size={15} />Compress image</>}</button><button className="button button-outline" type="button" onClick={() => { setFile(null); setResult(null); }} data-testid="button-reset-image">Choose another</button></div>{result && <div className="message" role="status" data-testid="status-image-result"><strong>{formatBytes(result.size)}</strong> compressed WebP · {reduction}% smaller{result.size > file.size && ' · This version is larger than the original.'}<a href={result.url} download={`${file.name.replace(/\.[^.]+$/, '')}-compressed.webp`} className="button" style={{ marginTop: 12 }} data-testid="link-download-image"><Download size={14} />Download WebP</a></div>}{error && <div className="message error" role="alert" data-testid="status-image-error">{error}</div>}</div>{result && <div><img className="preview-image" src={result.url} alt="Compressed image preview" /><div className="stat-card"><div className="stat-value">{formatBytes(result.size)}</div><div className="stat-label">Compressed result</div></div></div>}</div>}
  </section><PrivacyNote /></div></div>;
}

export function WordCounterPage() {
  const [text, setText] = useState('');
  const words = text.trim() ? text.trim().split(/\s+/u).length : 0;
  const paragraphs = text.trim() ? text.trim().split(/\n\s*\n/u).filter((paragraph) => paragraph.trim()).length : 0;
  return <div className="page-main"><PageHeading title="Count your words" description="Write or paste text to get an instant count of words, characters, and paragraphs. Your text is not sent anywhere." /><div className="workspace"><section className="panel"><label className="field-label" htmlFor="counter-text">Your text</label><textarea id="counter-text" className="text-area" value={text} onChange={(event) => setText(event.target.value)} placeholder="Start typing or paste your text here…" data-testid="input-word-counter" /><div className="stats-grid" aria-live="polite"><div className="stat-card"><div className="stat-value" data-testid="text-word-count">{words.toLocaleString()}</div><div className="stat-label">Words</div></div><div className="stat-card"><div className="stat-value" data-testid="text-character-count">{text.length.toLocaleString()}</div><div className="stat-label">Characters</div></div><div className="stat-card"><div className="stat-value" data-testid="text-paragraph-count">{paragraphs.toLocaleString()}</div><div className="stat-label">Paragraphs</div></div></div><div className="button-row"><button className="button button-outline" type="button" onClick={() => setText('')} disabled={!text} data-testid="button-clear-counter"><Minus size={14} />Clear text</button></div></section><PrivacyNote /></div></div>;
}

function titleCase(value: string) {
  return value.toLocaleLowerCase().replace(/(^|[\s([{'"“])(\p{L})/gu, (match) => match.toLocaleUpperCase());
}

export function CaseConverterPage() {
  const [text, setText] = useState('');
  const [converted, setConverted] = useState('');
  const [copied, setCopied] = useState(false);
  function convert(mode: 'upper' | 'lower' | 'title') {
    setConverted(mode === 'upper' ? text.toLocaleUpperCase() : mode === 'lower' ? text.toLocaleLowerCase() : titleCase(text));
    setCopied(false);
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(converted);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }
  return <div className="page-main"><PageHeading title="Change your text case" description="Choose a case style and get a transformed version instantly. Your original text stays right here." /><div className="workspace"><section className="panel"><label className="field-label" htmlFor="case-source">Your text</label><textarea id="case-source" className="text-area" value={text} onChange={(event) => setText(event.target.value)} placeholder="Paste or type the text you want to change…" data-testid="input-case-source" /><div className="button-row"><button className="button" type="button" disabled={!text} onClick={() => convert('upper')} data-testid="button-case-uppercase">UPPERCASE</button><button className="button button-secondary" type="button" disabled={!text} onClick={() => convert('lower')} data-testid="button-case-lowercase">lowercase</button><button className="button button-outline" type="button" disabled={!text} onClick={() => convert('title')} data-testid="button-case-titlecase">Title Case</button></div><label className="field-label" htmlFor="case-result" style={{ marginTop: 23 }}>Converted text</label><textarea id="case-result" className="text-area" value={converted} readOnly placeholder="Your converted text will appear here…" data-testid="output-case-result" /><div className="button-row"><button className="button button-outline" type="button" disabled={!converted} onClick={copy} data-testid="button-copy-case"><Check size={15} />{copied ? 'Copied' : 'Copy result'}</button><button className="button button-outline" type="button" disabled={!text} onClick={() => { setText(''); setConverted(''); setCopied(false); }} data-testid="button-clear-case">Clear all</button></div>{copied && <div className="message" role="status" data-testid="status-case-copied">Converted text copied to clipboard.</div>}</section><PrivacyNote /></div></div>;
}

type CvData = { name: string; role: string; email: string; phone: string; location: string; summary: string; experience: string; education: string; skills: string };
const emptyCv: CvData = { name: '', role: '', email: '', phone: '', location: '', summary: '', experience: '', education: '', skills: '' };

export function CvBuilderPage() {
  const [cv, setCv] = useState<CvData>(emptyCv);
  function update(field: keyof CvData, value: string) { setCv((current) => ({ ...current, [field]: value })); }
  function field(name: keyof CvData, label: string, placeholder: string, multiline = false) {
    return <div className={`form-field ${multiline ? 'full' : ''}`} key={name}><label className="field-label" htmlFor={`cv-${name}`}>{label}</label>{multiline ? <textarea id={`cv-${name}`} className="text-area" style={{ minHeight: 82 }} value={cv[name]} onChange={(event) => update(name, event.target.value)} placeholder={placeholder} data-testid={`input-cv-${name}`} /> : <input id={`cv-${name}`} className="text-input" value={cv[name]} onChange={(event) => update(name, event.target.value)} placeholder={placeholder} data-testid={`input-cv-${name}`} />}</div>;
  }
  return <div className="page-main"><PageHeading title="Build a clear, confident CV" description="Add your details and see the page take shape. Print it or choose Save as PDF in your browser’s print dialog." /><div className="workspace" style={{ width: 'min(1120px, calc(100% - 40px))' }}><div className="cv-layout"><section className="panel cv-form" aria-label="CV details"><div className="form-grid">{field('name', 'Name', 'Your name')}{field('role', 'Professional title', 'What you do')}{field('email', 'Email', 'you@example.com')}{field('phone', 'Phone', 'Phone number')}{field('location', 'Location', 'City, country')}{field('summary', 'Profile', 'A few lines about your experience and goals.', true)}{field('experience', 'Experience', 'Role, company, dates, and key contributions.', true)}{field('education', 'Education', 'Qualification, institution, and year.', true)}{field('skills', 'Skills', 'Separate skills with commas.', true)}</div><button className="button button-outline" type="button" onClick={() => window.print()} data-testid="button-print-cv"><Printer size={15} />Print or save as PDF</button><button className="button button-outline" type="button" onClick={() => setCv(emptyCv)} data-testid="button-clear-cv">Clear details</button></section><article className="cv-preview" id="cv-preview" aria-label="Live CV preview" data-testid="preview-cv"><h2>{cv.name || 'Your Name'}</h2>{cv.role && <p style={{ fontWeight: 700, color: '#5269cf', marginBottom: 5 }}>{cv.role}</p>}<div className="cv-contact">{[cv.email, cv.phone, cv.location].filter(Boolean).join(' · ') || 'Email · Phone · Location'}</div>{(['summary', 'experience', 'education', 'skills'] as const).map((key) => <section key={key}><h3>{({ summary: 'Profile', experience: 'Experience', education: 'Education', skills: 'Skills' })[key]}</h3><p>{cv[key] || ({ summary: 'A concise introduction to your professional background and what you bring to a team.', experience: 'Add roles, responsibilities, and contributions that show your experience.', education: 'Add qualifications, courses, or other relevant learning.', skills: 'Add skills relevant to the opportunities you are seeking.' })[key]}</p></section>)}</article></div><PrivacyNote /></div></div>;
}

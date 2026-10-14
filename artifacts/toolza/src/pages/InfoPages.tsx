import { useState } from 'react';
import { Check, Clipboard, LockKeyhole, MessageCircle, ShieldCheck } from 'lucide-react';
import { PageHeading } from '../components/Site';

export function AboutPage() {
  return <div className="page-main"><article className="info-content"><PageHeading title="Tools for the things you do every day." description="Toolza is a small collection of practical, free browser tools—made to help you get on with the task at hand." label="ABOUT TOOLZA" /><section className="info-block"><h2>Useful, not complicated</h2><p>Sometimes you just need to merge a couple of PDFs, check a word count, or make an image smaller. Toolza gives those everyday jobs a focused place to happen—without signing up or learning a new app.</p></section><section className="info-block"><h2>Private by default</h2><p>Our file tools work locally in your browser. Your files are processed on your device rather than sent to a Toolza server. You stay in control of what you download and when.</p></section><section className="info-block"><h2>Free to use</h2><p>Toolza is built as an approachable everyday toolkit. Open a tool, do your work, and leave when you’re done. No account is required.</p></section></article></div>;
}

export function PrivacyPage() {
  return <div className="page-main"><article className="info-content"><PageHeading title="Privacy is part of the tool." description="When you work with a file in Toolza, it stays on your device. Here is the plain-language version of what that means." label="PRIVACY AT TOOLZA" /><section className="info-block"><h2><LockKeyhole size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />Your files are processed locally</h2><p>The PDF Merger and Image Compressor use browser-side processing. Selected files are read by your browser and are not uploaded to a Toolza server. You can close the page to clear the working session.</p></section><section className="info-block"><h2>Text and CV details</h2><p>Text entered into the Word Counter, Case Converter, and CV Builder is handled in the page. Toolza does not send your text to a backend. CV details are not saved by Toolza after you close or reload the page.</p></section><section className="info-block"><h2>Theme preference</h2><p>Your light or dark theme choice is stored in your browser’s local storage so it can be remembered on your next visit. It is not an account or a tracking profile.</p></section><section className="info-block"><h2>A note about your browser</h2><p>Downloaded files are saved using your browser’s normal download behavior. Your browser, extensions, or operating system may have their own privacy and storage settings outside Toolza’s control.</p></section></article></div>;
}

export function TermsPage() {
  return <div className="page-main"><article className="info-content"><PageHeading title="A few simple terms." description="Use Toolza for your everyday tasks, and use your own judgment about the results." label="TERMS OF USE" /><section className="info-block"><h2>Using the tools</h2><p>Toolza’s tools are provided free for personal and general-purpose use. You are responsible for ensuring that you have the rights to process and use the files and text you provide.</p></section><section className="info-block"><h2>Check important results</h2><p>Tools are provided as-is and may have limitations depending on browser support, file format, or document content. Review merged PDFs, compressed images, and generated CVs before relying on them.</p></section><section className="info-block"><h2>Availability and responsibility</h2><p>We work to keep Toolza useful, but do not guarantee uninterrupted availability or suitability for a particular purpose. Keep your original files and maintain backups of anything important.</p></section></article></div>;
}

export function ContactPage() {
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  async function copyFeedback() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }
  return <div className="page-main"><article className="info-content"><PageHeading title="Tell us what would help." description="There is no contact backend or support inbox attached to this page. You can prepare and copy your feedback here to share through a channel you already trust." label="CONTACT" /><section className="contact-box"><MessageCircle size={28} color="hsl(var(--primary))" /><h2>Prepare a note</h2><p>Your message stays in this browser. Nothing is submitted when you press copy.</p><label className="sr-only" htmlFor="feedback">Your feedback</label><textarea id="feedback" className="text-area" value={message} onChange={(event) => { setMessage(event.target.value); setCopied(false); }} placeholder="What were you trying to do? What could work better?" data-testid="input-contact-feedback" /><div className="button-row" style={{ justifyContent: 'center' }}><button className="button" type="button" onClick={copyFeedback} disabled={!message.trim()} data-testid="button-copy-feedback"><Clipboard size={15} />{copied ? 'Copied to clipboard' : 'Copy feedback'}</button></div>{copied && <p className="message" role="status" data-testid="status-feedback-copied"><Check size={14} /> Feedback copied. No message was sent.</p>}</section><div className="info-block"><h2><ShieldCheck size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />Privacy-first by design</h2><p>We don’t ask for your files or personal details to use the tools. The feedback box above is local-only and intentionally does not pretend to send a message.</p></div></article></div>;
}

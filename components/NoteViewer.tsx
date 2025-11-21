import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { decryptNote, importKey } from '../services/cryptoUtils';
import { formatNoteWithAI, summarizeNote } from '../services/geminiService';
import { EncryptedNote, DownloadFormat } from '../types';
import { Button } from './Button';
import { Download, FileText, Code, Sparkles, AlertTriangle } from 'lucide-react';

export const NoteViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'decrypting' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  useEffect(() => {
    const loadAndDecrypt = async () => {
      if (!id) return;
      
      // 1. Get Key from URL
      const keyStringB64 = searchParams.get('k');
      if (!keyStringB64) {
        setStatus('error');
        setErrorMsg('Decryption key missing from URL.');
        return;
      }

      try {
        // 2. Fetch Encrypted Data (Simulated)
        const store = JSON.parse(localStorage.getItem('ciphernotes') || '{}');
        const note: EncryptedNote = store[id];
        
        if (!note) {
          setStatus('error');
          setErrorMsg('Note not found or has been deleted.');
          return;
        }

        setStatus('decrypting');

        // 3. Import Key
        const jwk = JSON.parse(window.atob(keyStringB64));
        const cryptoKey = await importKey(jwk);

        // 4. Decrypt
        const plainText = await decryptNote(note.ciphertext, note.iv, cryptoKey);
        setDecryptedContent(plainText);
        setStatus('success');
        
        // Optional: Auto-summarize for preview
        summarizeNote(plainText).then(setSummary).catch(() => {});

      } catch (err) {
        console.error(err);
        setStatus('error');
        setErrorMsg('Decryption failed. The key may be invalid or data corrupted.');
      }
    };

    loadAndDecrypt();
  }, [id, searchParams]);

  const handleDownload = (format: DownloadFormat) => {
    if (!decryptedContent) return;

    let content = decryptedContent;
    let mimeType = 'text/plain';
    let extension = 'txt';

    // Simple client-side formatting for demo
    if (format === DownloadFormat.HTML) {
      content = `<!DOCTYPE html><html><body><pre>${decryptedContent}</pre></body></html>`;
      mimeType = 'text/html';
      extension = 'html';
    } else if (format === DownloadFormat.MD) {
        // already markdown-ish
      mimeType = 'text/markdown';
      extension = 'md';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `secure-note-${id}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleAIFormat = async () => {
    if (!decryptedContent) return;
    setIsEnhancing(true);
    const formatted = await formatNoteWithAI(decryptedContent);
    setDecryptedContent(formatted);
    setIsEnhancing(false);
  };

  if (status === 'loading' || status === 'decrypting') {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        <p className="text-gray-400 text-sm font-mono">{status === 'loading' ? 'Fetching encrypted data...' : 'Decrypting locally...'}</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-red-400 mb-2">Access Denied</h3>
        <p className="text-gray-400">{errorMsg}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {summary && (
        <div className="bg-indigo-900/20 border border-indigo-800/50 rounded-md p-4">
            <h4 className="text-xs uppercase tracking-wider text-indigo-400 font-bold mb-1">AI Summary</h4>
            <p className="text-sm text-indigo-200 italic">{summary}</p>
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between p-3 bg-gray-800/50 border-b border-gray-800">
            <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
            </div>
            <div className="flex gap-2">
                 <Button 
                    variant="secondary" 
                    onClick={handleAIFormat} 
                    isLoading={isEnhancing}
                    icon={<Sparkles size={14} />}
                    className="!py-1 !px-3 !text-xs"
                 >
                    Auto-Format
                 </Button>
            </div>
        </div>
        <div className="p-6 overflow-auto max-h-[60vh]">
            <pre className="font-mono text-sm text-gray-300 whitespace-pre-wrap">{decryptedContent}</pre>
        </div>
      </div>

      <div className="border-t border-gray-800 pt-6">
        <h3 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wide">Download Options</h3>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => handleDownload(DownloadFormat.TXT)} variant="outline" icon={<FileText size={16}/>}>
            Plain Text (.txt)
          </Button>
          <Button onClick={() => handleDownload(DownloadFormat.MD)} variant="outline" icon={<Code size={16}/>}>
            Markdown (.md)
          </Button>
          <Button onClick={() => handleDownload(DownloadFormat.HTML)} variant="outline" icon={<Code size={16}/>}>
            HTML (.html)
          </Button>
        </div>
        <p className="mt-4 text-xs text-gray-600">
            Files are generated locally in your browser using the Blob API. The decrypted content is never sent back to the server.
        </p>
      </div>
    </div>
  );
};
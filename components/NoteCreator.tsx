import React, { useState } from 'react';
import { generateKey, exportKey, encryptNote } from '../services/cryptoUtils';
import { Button } from './Button';
import { Lock, Copy, Check, ArrowRight } from 'lucide-react';
import { EncryptedNote } from '../types';

export const NoteCreator: React.FC = () => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleEncrypt = async () => {
    if (!content.trim()) return;
    setIsLoading(true);
    try {
      // 1. Generate Key
      const key = await generateKey();
      
      // 2. Encrypt Content
      const { iv, ciphertext } = await encryptNote(content, key);
      
      // 3. Simulate "Saving" to database (In a real app, this POSTs to backend)
      // We are using localStorage to mimic a backend persistence layer for this demo.
      const noteId = crypto.randomUUID();
      const noteData: EncryptedNote = {
        id: noteId,
        iv,
        ciphertext,
        createdAt: Date.now(),
      };
      
      // Simulated DB Write
      const existingStore = JSON.parse(localStorage.getItem('ciphernotes') || '{}');
      existingStore[noteId] = noteData;
      localStorage.setItem('ciphernotes', JSON.stringify(existingStore));

      // 4. Create Shareable Link
      // The key is put in the fragment (#) or query param. 
      // For optimal zero-knowledge, usually in fragment, but standard URL params 
      // are easier to parse in this HashRouter demo. 
      // We will export the key to JWK string and base64 encode it.
      const jwk = await exportKey(key);
      const keyString = window.btoa(JSON.stringify(jwk));
      
      const link = `${window.location.origin}${window.location.pathname}#/view/${noteId}?k=${keyString}`;
      setGeneratedLink(link);
    } catch (err) {
      console.error("Encryption failed", err);
      alert("Failed to encrypt note.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const reset = () => {
    setContent('');
    setGeneratedLink(null);
  };

  if (generatedLink) {
    return (
      <div className="bg-gray-900 border border-green-900/50 rounded-lg p-6 shadow-2xl shadow-green-900/20 animate-fade-in">
        <div className="flex items-center gap-3 mb-4 text-green-400">
          <div className="p-2 bg-green-900/30 rounded-full">
            <Lock size={24} />
          </div>
          <h2 className="text-xl font-bold">Note Encrypted Successfully</h2>
        </div>
        
        <p className="text-gray-400 mb-4 text-sm">
          This link contains the decryption key. If you lose it, the note is lost forever.
          The server cannot decrypt this note.
        </p>

        <div className="bg-gray-950 p-4 rounded border border-gray-800 break-all font-mono text-xs text-gray-300 mb-4">
          {generatedLink}
        </div>

        <div className="flex gap-3">
          <Button onClick={copyToClipboard} variant="primary" icon={copySuccess ? <Check size={18}/> : <Copy size={18}/>}>
            {copySuccess ? 'Copied!' : 'Copy Link'}
          </Button>
          <Button onClick={reset} variant="outline">
            Create New
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Secure Pastebin</h1>
        <p className="text-gray-400">
          Paste your text below. It will be encrypted in your browser using AES-GCM before being stored.
        </p>
      </div>

      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter your sensitive note here..."
          className="relative w-full h-64 bg-gray-900 text-gray-100 border border-gray-700 rounded-lg p-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none font-mono text-sm placeholder-gray-600"
          spellCheck={false}
        />
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleEncrypt} 
          disabled={!content} 
          isLoading={isLoading}
          icon={<Lock size={18} />}
        >
          Encrypt & Share
        </Button>
      </div>
    </div>
  );
};
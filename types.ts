export interface EncryptedNote {
  id: string;
  iv: string; // Base64
  ciphertext: string; // Base64
  createdAt: number;
}

export interface NoteData {
  content: string;
}

export enum DownloadFormat {
  TXT = 'txt',
  MD = 'md',
  HTML = 'html'
}
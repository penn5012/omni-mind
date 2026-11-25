import type { LocalImageAttachment } from '../types/chat';

/**
 * Browser-side privacy masking for Chinese mobile numbers & 18-digit ID numbers
 * before sending text to cloud LLM endpoints.
 */
export function maskSensitiveText(input: string): { maskedText: string; maskedCount: number } {
  let count = 0;
  const afterPhone = input.replace(/(?<!\d)(1[3-9]\d)\d{4}(\d{4})(?!\d)/g, (_m, p1: string, p2: string) => {
    count += 1;
    return `${p1}****${p2}`;
  });
  const afterId = afterPhone.replace(/(?<!\d)(\d{6})\d{8}(\d{3}[\dXx])(?!\d)/g, (_m, p1: string, p2: string) => {
    count += 1;
    return `${p1}********${p2}`;
  });
  return { maskedText: afterId, maskedCount: count };
}

/**
 * Compress an uploaded/captured image on the client via HTML5 Canvas
 * to save mobile bandwidth and speed up multimodal LLM inference.
 */
export async function compressImageFile(file: File, maxDimension = 1280): Promise<LocalImageAttachment> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (!dataUrl) {
        resolve({
          fileName: file.name,
          mimeType: file.type || 'image/jpeg',
          maskedCount: 1,
        });
        return;
      }

      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve({
            fileName: file.name,
            mimeType: 'image/jpeg',
            previewUrl: compressedUrl,
            base64Data: compressedUrl.split(',')[1],
            maskedCount: 1,
          });
        } else {
          resolve({
            fileName: file.name,
            mimeType: file.type || 'image/jpeg',
            previewUrl: dataUrl,
            maskedCount: 1,
          });
        }
      };
      img.onerror = () => {
        resolve({
          fileName: file.name,
          mimeType: file.type || 'image/jpeg',
          previewUrl: dataUrl,
          maskedCount: 1,
        });
      };
      img.src = dataUrl;
    };
    reader.onerror = () => {
      resolve({
        fileName: file.name,
        mimeType: file.type || 'image/jpeg',
        maskedCount: 1,
      });
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Download a standard iCalendar (.ics) file so iOS/Android/macOS browsers
 * can import the schedule directly into the native System Calendar.
 */
export function downloadCalendarIcs(params: {
  title: string;
  description?: string;
  location?: string;
  startIso?: string;
  endIso?: string;
}): void {
  const start = params.startIso ?? '20261125T150000';
  const end = params.endIso ?? '20261125T163000';
  const nowStamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//OmniMind//H5 AI Assistant//CN',
    'BEGIN:VEVENT',
    `UID:omnimind-${Date.now()}@omnimind.app`,
    `DTSTAMP:${nowStamp}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${params.title}`,
    `DESCRIPTION:${params.description ?? '由 OmniMind H5 AI 助手自动提取并审批写入'}`,
    `LOCATION:${params.location ?? '线上会议 / 工作台'}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  const blob = new Blob([icsLines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `omnimind-schedule-${Date.now()}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

/**
 * Start browser Web Speech Recognition (zh-CN) when available on mobile/desktop browsers.
 */
export function startH5VoiceRecognition(callbacks: {
  onResult: (transcript: string) => void;
  onEnd: () => void;
  onUnsupported: () => void;
}): (() => void) | null {
  const win = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  const RecognitionCtor = win.SpeechRecognition ?? win.webkitSpeechRecognition;
  if (!RecognitionCtor) {
    callbacks.onUnsupported();
    return null;
  }

  const recognition = new RecognitionCtor();
  recognition.lang = 'zh-CN';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const transcript = event.results?.[0]?.[0]?.transcript ?? '';
    if (transcript.trim()) {
      callbacks.onResult(transcript.trim());
    }
  };
  recognition.onerror = () => {
    callbacks.onEnd();
  };
  recognition.onend = () => {
    callbacks.onEnd();
  };

  recognition.start();
  return () => recognition.stop();
}

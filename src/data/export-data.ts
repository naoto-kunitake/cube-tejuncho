import type { Document } from './document';

// ファイル名に入れる端末の日付 (YYYY-MM-DD)
export function exportDateOf(now: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

// 書き出すファイル。中身は保存文書そのもの (読み込みは保存と同じ検証を通す)。名前は文言なので呼ぶ側が付ける
export function createExportFile(document: Document, fileName: string): File {
  const text = JSON.stringify(document, null, 2);
  return new File([text], fileName, { type: 'application/json' });
}

function isAbort(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

// ファイルを渡せる共有シートがあればそれで (iPhoneでは「ファイルに保存」やAirDropが選べる)、なければダウンロード。
// 共有を取りやめたらfalse
export async function saveFile(file: File): Promise<boolean> {
  if ('canShare' in navigator && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return true;
    } catch (error: unknown) {
      if (isAbort(error)) {
        return false;
      }
      console.error('share failed, falling back to download', error);
    }
  }
  const url = URL.createObjectURL(file);
  const anchor = globalThis.document.createElement('a');
  anchor.href = url;
  anchor.download = file.name;
  anchor.click();
  URL.revokeObjectURL(url);
  return true;
}

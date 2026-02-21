export {};

declare global {
  interface Window {
    showSaveFilePicker(options?: any): Promise<FileSystemFileHandle>;
  }

  interface FileSystemFileHandle {
    kind: 'file';
    name: string;
    createWritable(): Promise<FileSystemWritableFileStream>;
  }

  interface FileSystemWritableFileStream extends WritableStream {
    write(data: any): Promise<void>;
    seek(position: number): Promise<void>;
    close(): Promise<void>;
  }
}
export interface FileData {
  fileName: string;
  data: string;
  uploadDate: string;
}

export interface SearchMatch {
  lineNo: number;
  data: string[];
  serialNumber: number;
}

export interface FileResult {
  fileName: string;
  matches: SearchMatch[];
}
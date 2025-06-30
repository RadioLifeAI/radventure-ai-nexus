
declare global {
  interface Window {
    openReportModal?: (reportId: string) => void;
  }
}

export {};

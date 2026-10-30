import { createContext } from 'react';
import type { Report } from '../types';

export interface ReportsContextType {
  reports: Report[];
  upvotedReportIds: string[];
  addReport: (report: Omit<Report, 'id' | 'createdAt' | 'isOwn' | 'isSeed' | 'upvotes'>) => void;
  deleteReport: (id: string) => void;
  toggleReportUpvote: (id: string) => void;
}

export const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

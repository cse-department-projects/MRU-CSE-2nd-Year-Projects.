import React from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { Report } from '../types';
import { ReportsContext } from './reportsContextValue';
import { deleteImage } from '../storage/images';

export const ReportsProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [reports, setReports] = useLocalStorage<Report[]>('ecovision:v1:reports', []);
  const [upvotedReportIds, setUpvotedReportIds] = useLocalStorage<string[]>('ecovision:v1:report-upvotes', []);
  
  const addReport = (data: Omit<Report, 'id' | 'createdAt' | 'isOwn' | 'isSeed' | 'upvotes'>) => {
    const newReport: Report = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      isOwn: true,
      isSeed: false,
      upvotes: 0
    };
    setReports(prev => [newReport, ...prev]);
  };

  const deleteReport = (id: string) => {
    const report = reports.find(item => item.id === id);
    if (!report?.isOwn) return;
    setReports(current => current.filter(item => item.id !== id));
    setUpvotedReportIds(current => current.filter(votedId => votedId !== id));
    if (report.imageId) void deleteImage(report.imageId);
  };

  const toggleReportUpvote = (id: string) => {
    const alreadyUpvoted = upvotedReportIds.includes(id);
    setUpvotedReportIds(current => alreadyUpvoted ? current.filter(votedId => votedId !== id) : [...current, id]);
    setReports(current => current.map(report => report.id === id
      ? { ...report, upvotes: Math.max(0, report.upvotes + (alreadyUpvoted ? -1 : 1)) }
      : report));
  };
  
  return <ReportsContext.Provider value={{ reports, addReport, deleteReport, toggleReportUpvote, upvotedReportIds }}>{children}</ReportsContext.Provider>;
};

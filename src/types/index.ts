export type ReportStatus = 'pending' | 'reviewed' | 'resolved';
export type ProblemType = 'Trash & Litter' | 'Water Pollution' | 'Air Pollution' | 'Deforestation' | 'Government Issue' | 'Roads & Infrastructure' | 'Wildlife Threat' | 'Other';
export interface Report {
  id: string; title: string; description: string; area: string; problemType: ProblemType;
  imageId: string | null; imageUrl?: string; reporterName: string | null; status: ReportStatus;
  upvotes: number; createdAt: string; isSeed: boolean; isOwn: boolean;
}
export type IdeaCategory = 'Plastic' | 'Paper' | 'Glass' | 'Metal' | 'Wood' | 'Fabric' | 'Other';
export interface Idea {
  id: string; title: string; whatItIs: string; requiredItems: string; steps: string;
  category: IdeaCategory; imageId: string | null; imageUrl?: string; creatorName: string | null;
  upvotes: number; createdAt: string; isSeed: boolean; isOwn: boolean;
}

export interface ActivityItem {
  id: string | number;
  type: 'system' | 'profile' | 'security' | 'training' | 'event' | 'match';
  action: string;
  description: string;
  timestamp: string;
}

export const formatActivityTime = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return isoString;
  }
};

import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Trophy, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function BracketViewer({ matches }) {
  const navigate = useNavigate();

  if (!matches || matches.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No tournament bracket generated yet.
      </div>
    );
  }

  // Group matches by round
  const rounds = {};
  matches.forEach(match => {
    const rName = match.round || 'Round 1';
    if (!rounds[rName]) {
      rounds[rName] = [];
    }
    rounds[rName].push(match);
  });

  // Sort rounds based on match logic (Round 1, Round 2, ..., Finals)
  const roundNames = Object.keys(rounds).sort((a, b) => {
    if (a.toLowerCase() === 'finals' || a.toLowerCase() === 'final') return 1;
    if (b.toLowerCase() === 'finals' || b.toLowerCase() === 'final') return -1;
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  });

  return (
    <div className="w-full overflow-x-auto pb-6">
      <div className="flex flex-row min-w-max gap-8 px-2 py-4">
        {roundNames.map((roundName, index) => (
          <div key={roundName} className="flex flex-col flex-1 min-w-[280px] space-y-6">
            <div className="text-center bg-muted/60 border border-border/50 py-2.5 px-4 rounded-2xl">
              <span className="font-extrabold text-xs uppercase tracking-wider text-primary">
                {roundName}
              </span>
              <span className="text-[11px] text-muted-foreground ml-2">
                ({rounds[roundName].length} {rounds[roundName].length === 1 ? 'Match' : 'Matches'})
              </span>
            </div>
            
            <div className="flex flex-col justify-around flex-grow gap-6 relative">
              {rounds[roundName].map((match) => {
                const isCompleted = match.status === 'COMPLETED' || match.status === 'Completed';
                const isLive = match.status === 'LIVE' || match.status === 'Live';

                return (
                  <div key={match.id} className="relative flex flex-col justify-center my-auto w-full group">
                    <Card 
                      onClick={() => navigate(`/dashboard/matches/${match.id}`)}
                      className={`p-0 overflow-hidden shadow-sm border cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/80 ${
                        isCompleted ? 'border-border/80 bg-card' : isLive ? 'border-red-400 bg-red-50/10' : 'border-border/60 bg-card'
                      }`}
                    >
                      {/* Match Card Header */}
                      <div className="px-3.5 py-1.5 bg-muted/30 border-b border-border/40 flex items-center justify-between text-[11px]">
                        <span className="font-mono font-semibold text-muted-foreground">
                          {match.matchCode || `Match #${match.matchNumber || match.id}`}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {isLive && (
                            <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                          )}
                          <span className={`font-semibold capitalize text-[10px] ${isLive ? 'text-red-600 font-bold' : isCompleted ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-muted-foreground'}`}>
                            {match.status || 'SCHEDULED'}
                          </span>
                        </div>
                      </div>

                      {/* Participants */}
                      <div className="flex flex-col text-xs divide-y divide-border/30">
                        {/* Participant 1 */}
                        <div className={`px-3.5 py-2.5 flex justify-between items-center transition-colors ${
                          match.winnerId && match.winnerId === match.participantOneId 
                            ? 'bg-primary/10 font-bold text-foreground' 
                            : 'text-foreground/90'
                        }`}>
                          <div className="flex items-center gap-1.5 truncate pr-2">
                            {match.winnerId && match.winnerId === match.participantOneId && (
                              <Trophy className="h-3.5 w-3.5 text-primary shrink-0" />
                            )}
                            <span className="truncate">{match.participantOneName || 'Participant 1 (TBD)'}</span>
                          </div>
                        </div>

                        {/* Participant 2 */}
                        <div className={`px-3.5 py-2.5 flex justify-between items-center transition-colors ${
                          match.winnerId && match.winnerId === match.participantTwoId 
                            ? 'bg-primary/10 font-bold text-foreground' 
                            : 'text-foreground/90'
                        }`}>
                          <div className="flex items-center gap-1.5 truncate pr-2">
                            {match.winnerId && match.winnerId === match.participantTwoId && (
                              <Trophy className="h-3.5 w-3.5 text-primary shrink-0" />
                            )}
                            <span className="truncate">{match.participantTwoName || 'Participant 2 (TBD)'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Footer Hover Indicator */}
                      <div className="px-3.5 py-1 bg-muted/10 border-t border-border/20 flex items-center justify-between text-[10px] text-muted-foreground group-hover:text-primary transition-colors">
                        <span>{match.venue || 'Venue TBD'}</span>
                        <span className="flex items-center font-medium">View <ChevronRight className="h-3 w-3" /></span>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


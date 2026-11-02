import React, { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { matchApi } from '../../api/matchApi';
import { Card, CardContent } from '../../components/ui/card';
import { Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const MatchCalendarView = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tournamentId = searchParams.get('tournamentId');

  const { data, isLoading, error } = useQuery({
    queryKey: ['matches', { tournamentId }],
    queryFn: async () => {
      const params = tournamentId ? { tournamentId } : {};
      const response = await matchApi.getMatches(params);
      return response.data?.data?.items || response.data?.items || [];
    }
  });

  const matches = data || [];

  // Helper to extract team matchup or participant names
  const getMatchupTitle = (match) => {
    // If remarks contain team matchup (e.g. Thunderbolts vs Warriors), prioritize it
    if (match.remarks && match.remarks.includes(' vs ')) {
      const matchPart = match.remarks.split(':').pop().trim();
      return `${match.round ? `[${match.round}] ` : ''}${matchPart}`;
    }
    const team1 = match.participantOneName || match.homeTeamName || 'Team Alpha';
    const team2 = match.participantTwoName || match.awayTeamName || 'Team Beta';
    return `${match.round ? `[${match.round}] ` : ''}${team1} vs ${team2}`;
  };

  // Transform matches for the calendar
  const events = matches
    .filter(match => match.matchDate) // Prevent invalid date crashes
    .map(match => {
    const startDate = new Date(`${match.matchDate}T${match.startTime || '00:00:00'}`);
    const endDate = new Date(`${match.matchDate}T${match.endTime || '01:00:00'}`);
    
    return {
      id: match.id,
      title: `${getMatchupTitle(match)} (${match.venue || 'TBA'})`,
      start: startDate,
      end: endDate,
      resource: match
    };
  });

  const [calendarDate, setCalendarDate] = useState(() => {
    if (events.length > 0) return events[0].start;
    return new Date();
  });

  // Sync calendar date when events load
  React.useEffect(() => {
    if (events.length > 0) {
      setCalendarDate(events[0].start);
    }
  }, [events.length]);

  // Dynamic distinct color styling per match to prevent identical blue overlap
  const eventPropGetter = (event) => {
    const title = (event.title || '').toLowerCase();
    const round = (event.resource?.round || '').toLowerCase();
    
    let background = 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)';
    let borderColor = '#3b82f6';

    if (round.includes('final') && !round.includes('semi')) {
      // Grand Championship Final: Vibrant Gold / Amber
      background = 'linear-gradient(135deg, #d97706 0%, #b45309 100%)';
      borderColor = '#f59e0b';
    } else if (round.includes('semi') && (round.includes('2') || title.includes('semi-final 2') || title.includes('semi final 2'))) {
      // Semi Final 2: Distinct Violet / Purple (prevents overlapping same blue with Semi Final 1)
      background = 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)';
      borderColor = '#a78bfa';
    } else if (round.includes('semi') && (round.includes('1') || title.includes('semi-final 1') || title.includes('semi final 1'))) {
      // Semi Final 1: Brilliant Sky / Royal Blue
      background = 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)';
      borderColor = '#38bdf8';
    } else if (round.includes('quarter')) {
      // Quarter Finals: Emerald Green
      background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
      borderColor = '#34d399';
    }

    return {
      style: {
        background,
        borderColor,
      }
    };
  };

  return (
    <div className="p-6 min-h-[calc(100vh-100px)] flex flex-col">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Match Calendar View</h1>
          <p className="text-muted-foreground text-sm">
            {tournamentId ? `Viewing matches for Tournament ID: ${tournamentId}` : 'View all scheduled matches'}
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="text-sm font-semibold text-primary hover:underline self-start sm:self-auto"
        >
          &larr; Back to Tournament
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center text-red-500 min-h-[400px]">
          Error loading matches.
        </div>
      ) : (
        <Card className="flex-1 border border-border/60 shadow-md overflow-hidden bg-card text-foreground rounded-2xl min-h-[580px]">
          <CardContent className="p-4 h-full flex flex-col">
            {events.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 bg-muted/20 rounded-lg min-h-[400px]">
                <CalendarIcon className="h-12 w-12 mb-4 opacity-20" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Matches Scheduled</h3>
                <p className="text-sm text-center max-w-sm">
                  There are no upcoming matches to display on the calendar at this time.
                </p>
              </div>
            ) : (
              <div className="flex-1 min-h-[540px]">
                <Calendar
                  localizer={localizer}
                  events={events}
                  date={calendarDate}
                  onNavigate={(newDate) => setCalendarDate(newDate)}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%', minHeight: '520px' }}
                  onSelectEvent={event => {
                    toast.info(`Opening match: ${event.resource.matchCode || 'Details'}`);
                    navigate(`/dashboard/matches/${event.id}`);
                  }}
                  views={['month', 'week', 'day']}
                  className="font-sans"
                  popup={true}
                  eventPropGetter={eventPropGetter}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MatchCalendarView;

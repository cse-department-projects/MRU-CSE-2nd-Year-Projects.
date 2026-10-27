import React, { useEffect, useState } from 'react';
import { UserProfile, VolunteerTask } from '../../types';
import { DataProvider } from '../../lib/supabase';
import { calculateVolunteerMatch } from '../../utils/volunteerMatcher';
import { HeartHandshake, CheckCircle2, Clock, MapPin, Zap, Award } from 'lucide-react';

interface VolunteerPortalProps {
  currentUser: UserProfile;
}

export const VolunteerPortal: React.FC<VolunteerPortalProps> = ({ currentUser }) => {
  const [tasks, setTasks] = useState<VolunteerTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'open' | 'my' | 'completed'>('open');

  const loadData = async () => {
    setLoading(true);
    const allTasks = await DataProvider.getVolunteerTasks();
    setTasks(allTasks);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleAccept = async (taskId: string) => {
    await DataProvider.assignVolunteerTask(taskId, currentUser.id, currentUser.full_name);
    loadData();
  };

  const handleComplete = async (taskId: string) => {
    await DataProvider.completeVolunteerTask(taskId);
    loadData();
  };

  const volunteerSkills = currentUser.skills || [];
  const isAvailable = currentUser.is_available ?? true;

  const filteredTasks = tasks.filter(t => {
    if (activeFilter === 'open') return t.status === 'open';
    if (activeFilter === 'my') return t.assigned_volunteer_id === currentUser.id;
    if (activeFilter === 'completed') return t.status === 'completed';
    return true;
  });

  // Sort open tasks by match score for volunteer
  const tasksWithMatch = filteredTasks.map(t => ({
    ...t,
    matchResult: calculateVolunteerMatch(volunteerSkills, isAvailable, t.required_skills),
  })).sort((a, b) => b.matchResult.matchPercentage - a.matchResult.matchPercentage);

  const openCount = tasks.filter(t => t.status === 'open').length;
  const myCount = tasks.filter(t => t.assigned_volunteer_id === currentUser.id).length;
  const completedCount = tasks.filter(t => t.status === 'completed' && t.assigned_volunteer_id === currentUser.id).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Volunteer Header */}
      <div className="bg-gradient-to-r from-emerald-700 to-green-800 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/15 rounded-2xl border border-white/25">
              <HeartHandshake className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold">Volunteer Operations</h2>
              <p className="text-emerald-200 text-sm">{currentUser.full_name} • Smart Skill-Matched Tasks</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-3xl font-black">{myCount}</div>
              <div className="text-xs text-emerald-200">My Active</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-emerald-300">{completedCount}</div>
              <div className="text-xs text-emerald-200">Completed</div>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
              isAvailable ? 'bg-emerald-400/30 text-white border border-emerald-400/50' : 'bg-white/10 text-emerald-300 border border-white/20'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-300 animate-ping' : 'bg-slate-400'}`} />
              {isAvailable ? 'Available for Dispatch' : 'Currently Unavailable'}
            </div>
          </div>
        </div>

        {/* Skills Display */}
        {volunteerSkills.length > 0 && (
          <div className="mt-4 pt-4 border-t border-emerald-600/50 flex flex-wrap gap-2">
            <span className="text-xs text-emerald-200 font-semibold self-center">My Skills:</span>
            {volunteerSkills.map((skill, i) => (
              <span key={i} className="text-xs bg-white/15 border border-white/25 text-white px-2.5 py-1 rounded-lg font-semibold">
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
        <button onClick={() => setActiveFilter('open')} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeFilter === 'open' ? 'bg-white text-emerald-800 shadow' : 'text-slate-500 hover:text-slate-700'}`}>
          Available Tasks ({openCount})
        </button>
        <button onClick={() => setActiveFilter('my')} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeFilter === 'my' ? 'bg-white text-blue-800 shadow' : 'text-slate-500 hover:text-slate-700'}`}>
          My Active Tasks ({myCount})
        </button>
        <button onClick={() => setActiveFilter('completed')} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeFilter === 'completed' ? 'bg-white text-slate-800 shadow' : 'text-slate-500 hover:text-slate-700'}`}>
          Completed
        </button>
      </div>

      {/* Task Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading volunteer tasks...</div>
      ) : tasksWithMatch.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-card">
          <HeartHandshake className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-semibold">No tasks in this category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {tasksWithMatch.map(task => {
            const match = task.matchResult;
            return (
              <div key={task.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card hover:shadow-card-hover transition space-y-4">
                {/* Task Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-lg ${
                      task.priority === 'high' ? 'bg-red-100 text-red-700' :
                      task.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {task.priority.toUpperCase()} Priority
                    </span>
                    <h3 className="font-extrabold text-slate-900 mt-1.5 text-sm leading-snug">{task.title}</h3>
                  </div>
                  
                  {/* Smart Match Score Badge */}
                  {activeFilter === 'open' && (
                    <div className="text-center">
                      <div className="text-2xl font-black text-emerald-600">{match.matchPercentage}%</div>
                      <div className="text-[10px] font-bold text-slate-500">Match</div>
                    </div>
                  )}
                </div>

                {/* Smart Match Breakdown */}
                {activeFilter === 'open' && (
                  <div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-1.5">
                      <div
                        className={`h-full rounded-full ${match.matchPercentage >= 85 ? 'bg-emerald-500' : match.matchPercentage >= 65 ? 'bg-blue-500' : match.matchPercentage >= 40 ? 'bg-amber-500' : 'bg-slate-400'}`}
                        style={{ width: `${match.matchPercentage}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${match.badgeColor}`}>
                        {match.matchGrade} MATCH
                      </span>
                      {match.availabilityBonus && (
                        <span className="text-[10px] font-semibold text-emerald-600">+25% Available Bonus</span>
                      )}
                    </div>
                  </div>
                )}

                <p className="text-xs text-slate-600 leading-relaxed">{task.description}</p>

                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-red-500" /> {task.location}
                </div>

                {/* Required Skills */}
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Required Skills</div>
                  <div className="flex flex-wrap gap-1">
                    {task.required_skills.map((skill, i) => {
                      const isMatch = match.matchingSkills.includes(skill);
                      return (
                        <span key={i} className={`text-[11px] px-2 py-0.5 rounded-lg font-semibold border ${
                          isMatch ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {isMatch && '✓ '}{skill}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-slate-100">
                  {task.status === 'open' && (
                    <button
                      onClick={() => handleAccept(task.id)}
                      className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-700 text-white font-bold text-xs hover:from-emerald-700 hover:to-green-800 transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
                    >
                      <HeartHandshake className="w-4 h-4" /> Accept This Volunteer Task
                    </button>
                  )}
                  {task.status === 'assigned' && task.assigned_volunteer_id === currentUser.id && (
                    <div className="space-y-2">
                      <div className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 p-2 rounded-xl text-center">
                        ✓ Assigned to You — In Progress
                      </div>
                      <button
                        onClick={() => handleComplete(task.id)}
                        className="w-full py-2.5 rounded-2xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Mark Task Completed
                      </button>
                    </div>
                  )}
                  {task.status === 'completed' && (
                    <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded-xl text-center flex items-center justify-center gap-1.5">
                      <Award className="w-4 h-4" /> Mission Accomplished
                    </div>
                  )}
                  {task.status === 'assigned' && task.assigned_volunteer_id !== currentUser.id && (
                    <div className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 p-2 rounded-xl text-center">
                      Assigned to {task.assigned_volunteer_name}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

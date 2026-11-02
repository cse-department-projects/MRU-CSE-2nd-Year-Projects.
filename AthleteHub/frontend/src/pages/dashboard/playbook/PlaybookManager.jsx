import React, { useState, useRef, useEffect } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Save, Eraser, Undo, Redo, Share2, Plus, ArrowLeft } from 'lucide-react';
import api from '@/api/axios';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const PlaybookManager = () => {
  const [playbooks, setPlaybooks] = useState([]);
  const [selectedPlaybook, setSelectedPlaybook] = useState(null);
  const [activePlay, setActivePlay] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const canvasRef = useRef(null);
  
  const [strokeColor, setStrokeColor] = useState('white');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [eraserMode, setEraserMode] = useState(false);

  useEffect(() => {
    fetchPlaybooks();
  }, [user]);

  const fetchPlaybooks = async () => {
    try {
      setLoading(true);
      // Fallback for demo if coachId isn't on user object directly
      const coachId = user?.coachId || user?.id || 1; 
      const response = await api.get(`/playbooks/coach/${coachId}`);
      if (response.data.success) {
        setPlaybooks(response.data.data);
      }
    } catch (error) {
      console.error("Failed to load playbooks", error);
    } finally {
      setLoading(false);
    }
  };

  const createPlaybook = async () => {
    const title = prompt("Enter playbook name:");
    if (!title) return;
    
    try {
      const coachId = user?.coachId || user?.id || 1; 
      const response = await api.post('/playbooks', {
        title,
        description: "New tactical playbook",
        coachId
      });
      if (response.data.success) {
        toast.success("Playbook created");
        fetchPlaybooks();
      }
    } catch (error) {
      toast.error("Failed to create playbook");
    }
  };

  const addPlay = async () => {
    const title = prompt("Enter play name:");
    if (!title || !selectedPlaybook) return;
    
    try {
      const response = await api.post(`/playbooks/${selectedPlaybook.id}/plays`, {
        title,
        description: "",
        canvasState: "{}" // Empty canvas
      });
      if (response.data.success) {
        toast.success("Play added");
        // Update local state
        const updatedPlaybook = {
          ...selectedPlaybook, 
          plays: [...(selectedPlaybook.plays || []), response.data.data]
        };
        setSelectedPlaybook(updatedPlaybook);
        setActivePlay(response.data.data);
      }
    } catch (error) {
      toast.error("Failed to add play");
    }
  };

  const saveCanvas = async () => {
    if (!activePlay || !canvasRef.current) return;
    
    try {
      const paths = await canvasRef.current.exportPaths();
      const stateStr = JSON.stringify(paths);
      
      const response = await api.put(`/playbooks/plays/${activePlay.id}/canvas`, {
        canvasState: stateStr
      });
      
      if (response.data.success) {
        toast.success("Play saved to cloud");
      }
    } catch (error) {
      toast.error("Failed to save play");
    }
  };

  const loadCanvas = async (play) => {
    setActivePlay(play);
    // Canvas takes a moment to mount
    setTimeout(() => {
      if (canvasRef.current && play.canvasState && play.canvasState !== "{}") {
        try {
          const paths = JSON.parse(play.canvasState);
          canvasRef.current.loadPaths(paths);
        } catch(e) {
          console.error("Could not parse canvas state");
        }
      } else if (canvasRef.current) {
        canvasRef.current.clearCanvas();
      }
    }, 100);
  };
  
  const toggleEraser = () => {
    if (canvasRef.current) {
      canvasRef.current.eraseMode(!eraserMode);
      setEraserMode(!eraserMode);
    }
  };

  // View: Main Playbook Grid
  if (!selectedPlaybook) {
    return (
      <div className="space-y-6 page-enter">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gradient-primary">Playbooks</h1>
            <p className="text-muted-foreground mt-2 text-lg font-medium">Manage your tactical strategies and plays.</p>
          </div>
          <Button onClick={createPlaybook} className="bg-primary hover:bg-primary/90 rounded-full px-6">
            <Plus className="w-5 h-5 mr-2" />
            New Playbook
          </Button>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-48 bg-muted/20 animate-pulse rounded-3xl" />
            <div className="h-48 bg-muted/20 animate-pulse rounded-3xl" />
          </div>
        ) : playbooks.length === 0 ? (
          <div className="text-center py-20 bg-card/30 rounded-3xl border border-dashed border-border">
            <h3 className="text-xl font-bold mb-2">No Playbooks yet</h3>
            <p className="text-muted-foreground mb-6">Create your first playbook to start designing plays.</p>
            <Button onClick={createPlaybook}>Create Playbook</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {playbooks.map(pb => (
              <motion.div 
                whileHover={{ y: -5 }}
                key={pb.id} 
                onClick={() => setSelectedPlaybook(pb)}
                className="card-premium rounded-3xl p-6 cursor-pointer border border-border/50 hover:border-primary/50 transition-all"
              >
                <h3 className="text-xl font-bold mb-2">{pb.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{pb.description}</p>
                <div className="text-xs font-semibold px-3 py-1 bg-primary/10 text-primary rounded-full inline-block">
                  {pb.plays?.length || 0} Plays
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // View: Playbook Details & Canvas
  return (
    <div className="h-[calc(100vh-140px)] flex flex-col page-enter">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setSelectedPlaybook(null)} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">{selectedPlaybook.title}</h1>
            <p className="text-muted-foreground text-sm">{activePlay ? `Editing: ${activePlay.title}` : 'Select a play to edit'}</p>
          </div>
        </div>
        
        {activePlay && (
          <div className="flex items-center gap-3 bg-card p-2 rounded-full border border-border shadow-sm">
            <div className="flex items-center gap-2 px-4 border-r border-border">
              <button onClick={() => { setStrokeColor('white'); setEraserMode(false); canvasRef.current?.eraseMode(false); }} className="w-6 h-6 rounded-full bg-white ring-2 ring-offset-2 ring-offset-background ring-transparent focus:ring-primary"></button>
              <button onClick={() => { setStrokeColor('#ef4444'); setEraserMode(false); canvasRef.current?.eraseMode(false); }} className="w-6 h-6 rounded-full bg-red-500 ring-2 ring-offset-2 ring-offset-background ring-transparent focus:ring-primary"></button>
              <button onClick={() => { setStrokeColor('#3b82f6'); setEraserMode(false); canvasRef.current?.eraseMode(false); }} className="w-6 h-6 rounded-full bg-blue-500 ring-2 ring-offset-2 ring-offset-background ring-transparent focus:ring-primary"></button>
              <button onClick={() => { setStrokeColor('#eab308'); setEraserMode(false); canvasRef.current?.eraseMode(false); }} className="w-6 h-6 rounded-full bg-yellow-500 ring-2 ring-offset-2 ring-offset-background ring-transparent focus:ring-primary"></button>
            </div>
            <Button variant="ghost" size="icon" onClick={() => canvasRef.current?.undo()} className="rounded-full h-8 w-8 text-muted-foreground hover:text-foreground">
              <Undo className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => canvasRef.current?.redo()} className="rounded-full h-8 w-8 text-muted-foreground hover:text-foreground">
              <Redo className="w-4 h-4" />
            </Button>
            <Button variant={eraserMode ? "secondary" : "ghost"} size="icon" onClick={toggleEraser} className="rounded-full h-8 w-8">
              <Eraser className="w-4 h-4" />
            </Button>
            <Button size="sm" onClick={saveCanvas} className="rounded-full ml-2">
              <Save className="w-4 h-4 mr-2" /> Save
            </Button>
          </div>
        )}
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Sidebar */}
        <div className="w-64 bg-card rounded-3xl border border-border p-4 flex flex-col shrink-0 overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Plays</h3>
            <Button variant="ghost" size="icon" onClick={addPlay} className="h-6 w-6 rounded-full">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            {selectedPlaybook.plays?.map(play => (
              <div 
                key={play.id} 
                onClick={() => loadCanvas(play)}
                className={`p-3 rounded-xl cursor-pointer text-sm font-medium transition-colors ${activePlay?.id === play.id ? 'bg-primary/20 text-primary border border-primary/30' : 'hover:bg-muted text-muted-foreground'}`}
              >
                {play.title}
              </div>
            ))}
            {(!selectedPlaybook.plays || selectedPlaybook.plays.length === 0) && (
              <div className="text-center text-xs text-muted-foreground py-4">No plays yet.</div>
            )}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-black/40 rounded-3xl border border-border overflow-hidden relative shadow-inner">
          {activePlay ? (
             <ReactSketchCanvas
                ref={canvasRef}
                strokeWidth={strokeWidth}
                strokeColor={strokeColor}
                canvasColor="transparent"
                className="w-full h-full cursor-crosshair"
              />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              Select or create a play to start drawing.
            </div>
          )}
          
          {/* Tactical Court Overlay (Optional, could be an image) */}
          {activePlay && (
            <div className="absolute inset-0 pointer-events-none opacity-20 border-2 border-white/20 m-8 rounded-lg">
                <div className="absolute top-1/2 left-0 right-0 h-px bg-white/20"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-white/20"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaybookManager;

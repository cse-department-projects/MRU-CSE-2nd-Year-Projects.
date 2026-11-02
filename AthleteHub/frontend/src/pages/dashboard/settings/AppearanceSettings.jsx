import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';
import { Sun, Moon, Laptop } from 'lucide-react';

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Appearance</h2>
        <p className="text-sm text-muted-foreground">Customize the color system and theme of your dashboard.</p>
      </div>
      
      <Card className="card-telemetry-elevated rounded-3xl border border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">Theme & Color Scheme</CardTitle>
          <CardDescription>Select between Light Mode, Dark Mode, or sync with your system preference.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Mode</Label>
            <RadioGroup value={theme} onValueChange={(val) => {
              setTheme(val);
              toast.success(`Theme switched to ${val.charAt(0).toUpperCase() + val.slice(1)} Mode`);
            }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <RadioGroupItem value="light" id="theme-light" className="peer sr-only" />
                <Label htmlFor="theme-light" className="flex flex-col items-center justify-between rounded-2xl border-2 border-border/60 bg-card p-4 hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all shadow-xs">
                  <div className="rounded-xl border border-border/80 p-2 w-full mb-3 bg-white h-24 flex items-center justify-center shadow-xs">
                    <Sun className="h-8 w-8 text-amber-500" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-sm text-foreground">Light Mode</p>
                    <p className="text-[11px] text-muted-foreground">Clean, high-clarity daylight theme</p>
                  </div>
                </Label>
              </div>

              <div>
                <RadioGroupItem value="dark" id="theme-dark" className="peer sr-only" />
                <Label htmlFor="theme-dark" className="flex flex-col items-center justify-between rounded-2xl border-2 border-border/60 bg-card p-4 hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all shadow-xs">
                  <div className="rounded-xl border border-border/80 p-2 w-full mb-3 bg-zinc-950 h-24 flex items-center justify-center shadow-xs">
                    <Moon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-sm text-foreground">Dark Mode</p>
                    <p className="text-[11px] text-muted-foreground">Deep contrast charcoal palette</p>
                  </div>
                </Label>
              </div>

              <div>
                <RadioGroupItem value="system" id="theme-system" className="peer sr-only" />
                <Label htmlFor="theme-system" className="flex flex-col items-center justify-between rounded-2xl border-2 border-border/60 bg-card p-4 hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all shadow-xs">
                  <div className="rounded-xl border border-border/80 p-2 w-full mb-3 bg-gradient-to-r from-zinc-200 to-zinc-900 h-24 flex items-center justify-center shadow-xs">
                    <Laptop className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-sm text-foreground">System Default</p>
                    <p className="text-[11px] text-muted-foreground">Syncs with OS display mode</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" className="rounded-xl" onClick={() => {
          setTheme('light');
          toast.info("Reset to default Light Mode");
        }}>
          Reset to Light
        </Button>
        <Button className="rounded-xl font-bold" onClick={() => toast.success("Appearance preferences saved")}>
          Save Preferences
        </Button>
      </div>
    </div>
  );
}

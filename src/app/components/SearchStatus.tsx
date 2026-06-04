import { motion, AnimatePresence } from 'motion/react';
import { Database, Globe, Brain, Map, TrendingUp, CheckCircle2, Loader2, Sparkles, FileText, Search } from 'lucide-react';
import { useState, useEffect } from 'react';

type SearchPhase = 'knowledge-base' | 'web-sources' | 'preparing' | 'analyzing-risks' | 'comparing-trends' | 'mapping-clusters';

interface SearchStatusProps {
  currentPhase: SearchPhase;
  isBriefing?: boolean;
}

const phasesConfig: Record<SearchPhase, { label: string; icon: any; color: string }> = {
  'knowledge-base': { 
    label: 'Querying Knowledge Base', 
    icon: Database, 
    color: 'text-blue-500' 
  },
  'web-sources': { 
    label: 'Scanning Web Intelligence', 
    icon: Globe, 
    color: 'text-indigo-500' 
  },
  'analyzing-risks': { 
    label: 'Analyzing Risk Vectors', 
    icon: Brain, 
    color: 'text-purple-500' 
  },
  'comparing-trends': { 
    label: 'Evaluating Historical Trends', 
    icon: TrendingUp, 
    color: 'text-amber-500' 
  },
  'mapping-clusters': { 
    label: 'Identifying Regional Clusters', 
    icon: Map, 
    color: 'text-emerald-500' 
  },
  'preparing': { 
    label: 'Synthesizing Response', 
    icon: Sparkles, 
    color: 'text-pink-500' 
  }
};

export function SearchStatus({ currentPhase, isBriefing }: SearchStatusProps) {
  // We want to track which phases have been "completed" for the visual history
  const [history, setHistory] = useState<SearchPhase[]>([]);
  
  useEffect(() => {
    setHistory(prev => {
      if (prev.includes(currentPhase)) return prev;
      return [...prev, currentPhase];
    });
  }, [currentPhase]);

  const activeConfig = phasesConfig[currentPhase];
  const Icon = activeConfig.icon;

  return (
    <div className="flex flex-col gap-2 max-w-md w-full my-4">
      <div className="relative overflow-hidden rounded-xl bg-card border border-slate-200 shadow-sm p-4">
        {/* Animated Background Gradient */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-50 to-transparent"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ opacity: 0.5 }}
        />

        <div className="relative z-10 flex flex-col gap-3">
          {/* Main Status Line */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-8 h-8">
              {/* Spinning ring for active state */}
              <motion.div 
                className="absolute inset-0 rounded-full border-2 border-slate-100 border-t-blue-500"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Icon transition */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPhase}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon size={14} className={activeConfig.color} />
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex flex-col">
              <AnimatePresence mode="wait">
                <motion.span 
                  key={currentPhase}
                  initial={{ y: 5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -5, opacity: 0 }}
                  className="text-sm font-medium text-slate-800"
                >
                  {activeConfig.label}
                </motion.span>
              </AnimatePresence>
              <span className="text-xs text-slate-400">Processing real-time data...</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-blue-500"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ 
                duration: 1.5, 
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "reverse" // Pulse effect
              }}
            />
          </div>

          {/* History/Steps Visualization */}
          <div className="flex gap-2 pt-1">
             {/* We can show "completed" dots or small icons for previous steps if we track them */}
             {/* For now, let's just show a few static "past" dots to imply progress if needed, 
                 or better, show the specific previous steps that led here. */}
             {/* Since the parent component manages phases, we might not know the exact order easily without hardcoding. */}
             {/* Let's infer order based on standard flows or just show the current one highlighted. */}
          </div>
        </div>
      </div>
      
      {/* Optional: Source Scanned Counter (fake for effect, or real if we had data) */}
      {currentPhase === 'web-sources' && (
         <motion.div 
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           className="flex gap-2 px-1"
         >
           {['UNDSS', 'ReliefWeb', 'WHO'].map((source, i) => (
             <motion.div 
               key={source}
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: i * 0.2 }}
               className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full border border-slate-200"
             >
               Scanning {source}...
             </motion.div>
           ))}
         </motion.div>
      )}
    </div>
  );
}

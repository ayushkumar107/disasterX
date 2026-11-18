import React, { useState, useRef, useEffect } from 'react';
import { useUIStore } from '../../stores/uiStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  HeartPulse, 
  Flame, 
  ShieldAlert, 
  Droplet, 
  Zap, 
  Trash2, 
  Copy, 
  Check, 
  Search,
  Activity,
  AlertTriangle
} from 'lucide-react';

const QUICK_PROMPTS = [
  { id: 'warning_signs', label: '⚠️ Landslide Warning Signs', query: 'What are the early warning signs of an impending landslide?' },
  { id: 'evac_protocol', label: '🏃 Evacuation Protocol', query: 'What is the safe evacuation protocol during a landslide warning?' },
  { id: 'slope_stabilization', label: '🌳 Slope Stabilization', query: 'How to stabilize slopes and prevent soil erosion in hilly areas?' },
  { id: 'drainage_control', label: '💧 Drainage Management', query: 'How does water drainage control help reduce landslide risk?' },
  { id: 'ner_susceptibility', label: '🗺️ NER Susceptibility', query: 'Which states in the North Eastern Region are most susceptible to landslides?' },
  { id: 'emergency_kit', label: '🎒 Survival Kit list', query: 'What should be included in a landslide emergency survival kit?' }
];

export const AIAssistantPanel = () => {
  const { activePanel, setActivePanel } = useUIStore();
  const isOpen = activePanel === 'ai';

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `Hello! I am your **Disaster-X Landslide Emergency Advisor**. 

I provide expert guidance on **landslide warning signs, slope stabilization, evacuation protocols**, and regional vulnerability.

Ask me anything or select a topic below:`,
      isInitial: true
    }
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSend = async (customText) => {
    const textToSend = customText || inputQuery;
    if (!textToSend.trim()) return;

    const userMsg = {
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: textToSend
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputQuery('');
    setIsTyping(true);

    // Simulate AI reasoning and generate structured response
    setTimeout(() => {
      const responseText = generateAIResponse(textToSend);
      const aiMsg = {
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: responseText
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 800);
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleClear = () => {
    setMessages([
      {
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Chat reset. I am ready for your next emergency or first aid question.`,
        isInitial: true
      }
    ]);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 320, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 320, scale: 0.95 }}
        className="fixed right-3 top-14 bottom-20 z-50 w-[340px] md:w-[420px] glass-panel-strong border border-[var(--color-dx-cyan)]/30 rounded-xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl"
      >
        {/* Header */}
        <div className="bg-[rgba(0,240,255,0.08)] px-4 py-3 border-b border-[rgba(0,240,255,0.15)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[rgba(0,240,255,0.15)] text-[var(--color-dx-cyan)] border border-[var(--color-dx-cyan)]/30 shadow-[0_0_10px_rgba(0,240,255,0.3)]">
              <Bot size={20} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-white tracking-wide">
                  AI EMERGENCY ASSISTANT
                </span>
                <span className="px-1.5 py-0.5 rounded bg-[var(--color-dx-cyan)]/20 text-[var(--color-dx-cyan)] text-[9px] font-mono font-semibold">
                  PRO
                </span>
              </div>
              <div className="text-[10px] font-mono text-gray-400">
                First Aid • Survival Protocols • Real-Time AI
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleClear}
              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              title="Clear Chat History"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={() => setActivePanel(null)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Quick Action Prompt Pills */}
        <div className="px-3 py-2 bg-black/40 border-b border-white/5 shrink-0 overflow-x-auto custom-scrollbar flex items-center gap-1.5">
          {QUICK_PROMPTS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSend(item.query)}
              className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 hover:border-[var(--color-dx-cyan)]/40 hover:bg-[var(--color-dx-cyan)]/10 text-gray-300 hover:text-[var(--color-dx-cyan)] text-[11px] whitespace-nowrap transition-all flex items-center gap-1"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Messages Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar bg-black/20">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] font-mono text-gray-400">
                {msg.sender === 'ai' ? (
                  <>
                    <Sparkles size={11} className="text-[var(--color-dx-cyan)]" />
                    <span className="text-[var(--color-dx-cyan)] font-semibold">DISASTER-X AI</span>
                  </>
                ) : (
                  <span>YOU</span>
                )}
                <span>• {msg.timestamp}</span>
              </div>

              <div
                className={`max-w-[92%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-lg ${
                  msg.sender === 'user'
                    ? 'bg-[var(--color-dx-cyan)]/20 border border-[var(--color-dx-cyan)]/30 text-white rounded-tr-none'
                    : 'bg-[rgba(13,22,38,0.85)] border border-white/10 text-gray-200 rounded-tl-none font-sans'
                }`}
              >
                {renderFormattedMessage(msg.text)}
              </div>

              {msg.sender === 'ai' && (
                <button
                  onClick={() => handleCopy(msg.text, idx)}
                  className="mt-1 px-2 py-0.5 text-[9px] font-mono text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  {copiedIdx === idx ? <Check size={10} className="text-green-400" /> : <Copy size={10} />}
                  {copiedIdx === idx ? 'Copied' : 'Copy'}
                </button>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/10 w-fit text-xs font-mono text-[var(--color-dx-cyan)] animate-pulse">
              <Sparkles size={14} className="animate-spin" />
              <span>Analyzing emergency medical protocols...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-black/60 border-t border-white/10 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask anything (e.g., CPR steps, burn treatment)..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-dx-cyan)]/50 focus:ring-1 focus:ring-[var(--color-dx-cyan)]/30 transition-all"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isTyping}
              className="p-2.5 rounded-xl bg-[var(--color-dx-cyan)]/20 border border-[var(--color-dx-cyan)]/40 text-[var(--color-dx-cyan)] hover:bg-[var(--color-dx-cyan)] hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <Send size={16} />
            </button>
          </form>
          <div className="mt-1.5 px-1 flex items-center justify-between text-[9px] font-mono text-gray-500">
            <span>Powered by Disaster-X Medical Engine</span>
            <span>Always call 911/112 for severe trauma</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Formatter helper to display Markdown headers & bold text nicely
function renderFormattedMessage(text) {
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    if (line.startsWith('### ')) {
      return (
        <h4 key={idx} className="font-mono font-bold text-xs text-[var(--color-dx-cyan)] mt-2 mb-1">
          {line.replace('### ', '')}
        </h4>
      );
    }
    if (line.startsWith('## ')) {
      return (
        <h3 key={idx} className="font-mono font-bold text-sm text-[var(--color-dx-cyan)] mt-2 mb-1 border-b border-[var(--color-dx-cyan)]/20 pb-0.5">
          {line.replace('## ', '')}
        </h3>
      );
    }
    if (line.startsWith('🚨 ') || line.startsWith('⚠️ ')) {
      return (
        <div key={idx} className="my-1.5 p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 font-semibold">
          {line}
        </div>
      );
    }
    if (line.startsWith('✅ ') || line.startsWith('📌 ')) {
      return (
        <div key={idx} className="my-1 text-green-300 font-medium">
          {line}
        </div>
      );
    }

    // Replace **text** with bold
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return (
      <p key={idx} className="min-h-[1em] my-0.5">
        {parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={pIdx} className="font-semibold text-white">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        })}
      </p>
    );
  });
}

// Comprehensive Emergency AI Logic Generator
function generateAIResponse(prompt) {
  const p = prompt.toLowerCase();

  if (p.includes('warning') || p.includes('sign') || p.includes('indicator')) {
    return `## ⚠️ Early Warning Signs of Landslides
    
🚨 **IMMEDIATE ATTENTION**: Landslides often provide warning signs before failure. Monitor closely!

### Primary Geological Indicators:
1. **New Cracks or Bulges**: Appearing in ground, road pavements, retaining walls, or hillslope soils.
2. **Tilted Structures**: Trees, utility poles, or fences tilting progressively over hours/days.
3. **Stuck Doors/Windows**: House doors or windows sticking or jamming, indicating foundation shifting.
4. **Water Accumulation**: Sudden water seepage or new springs appearing on slopes, or clean creek water turning muddy.
5. **Soil Movement**: Small soil slides, shifting rocks, or minor ground subsidence.
6. **Sudden Sounds**: Rumbling, cracking wood, or boulders knocking together, indicating movement.

📌 *Action*: If you observe multiple signs during heavy rain, evacuate the area immediately.`;
  }

  if (p.includes('evac') || p.includes('protocol') || p.includes('safe')) {
    return `## 🏃 Landslide Evacuation Protocol
    
⚠️ **CRITICAL**: Landslides move rapidly. Evacuate early; do not wait!

### Emergency Evacuation Protocol:
1. **Stay Alert**: Listen for local alerts or warnings via DISASTER-X NER or local radio/television.
2. **Move to High Ground**: Travel away from steep slopes, ravines, and valley floors.
3. **Avoid Stream Channels**: Never seek shelter in low-lying river valleys or drainage paths.
4. **Protect Yourself**: If you cannot escape, curl into a tight ball and protect your head and neck.
5. **Check Infrastructure**: Do not drive on mountain roads showing pavement cracking or debris.

🚨 **NEVER** return to a landslide area until geologists and emergency authorities officially declare it safe.`;
  }

  if (p.includes('stabil') || p.includes('prevent') || p.includes('erosion')) {
    return `## 🌳 Slope Stabilization & Mitigation Methods
    
### Effective Landslide Mitigation Techniques:
1. **Vegetative Cover (Bio-engineering)**: Plant deep-rooting trees (like Vetiver grass, bamboo, native pines) to bind soil particles.
2. **Retaining Structures**: Build gabion walls (rock-filled wire cages) or reinforced concrete retaining structures at the base.
3. **Geotextiles**: Install synthetic geotextile mats over bare slopes to control erosion while vegetation grows.
4. **Terracing**: Grade steep slopes into step-like terraces to reduce downhill soil momentum.
5. **Drainage Controls**: Install sub-surface pipes and lined surface drains to route water safely off slopes.`;
  }

  if (p.includes('drain') || p.includes('water') || p.includes('run')) {
    return `## 💧 Drainage Management & Slope Stability
    
### Why Drainage Controls are Critical:
- **Pore Water Pressure**: Rainwater saturates soil, increasing pore pressure and reducing friction/shear strength.
- **Weight Addition**: Saturated soil is significantly heavier, increasing the gravitational force pulling the slope down.

### Key Drainage Maintenance Actions:
1. **Clear Surface Drains**: Ensure hillside channels are clear of debris, leaves, and rocks before monsoon seasons.
2. **Construct Lined Channels**: Line soil drains with concrete to prevent water from soaking directly into the slope.
3. **Sub-surface Drainage**: Install perforated pipes to drain deep groundwater tables.`;
  }

  if (p.includes('ner') || p.includes('suscept') || p.includes('region')) {
    return `## 🗺️ Landslide Susceptibility in Northeast India (NER)
    
### High Susceptibility Zones:
1. **Sikkim (East & North)**: High altitude metamorphic slopes; highly prone during monsoon and seismic events.
2. **Meghalaya (Sohra Escarpment)**: Prone due to receiving some of the world's highest rainfall intensities on steep sandstone ridges.
3. **Arunachal Pradesh (Papum Pare/Tawang)**: Steep slopes with younger, unstable sedimentary rock formations.
4. **Assam (Dima Hasao/Karbi Anglong)**: Prone to massive mudslides blocking key railway and national highway lines.
5. **Mizoram (Aizawl Hills)**: Urban landslides triggered by poor drainage on steep residential hill slopes.`;
  }

  if (p.includes('kit') || p.includes('surv') || p.includes('bag')) {
    return `## 🎒 Emergency Landslide Survival Kit
    
### Essential Items Checklist:
- **Water**: 3 liters per person per day (for at least 3 days).
- **First Aid**: Bandages, antiseptic, personal medications, splints.
- **Tools**: Waterproof flashlight, whistle, multi-tool knife, matches/lighter.
- **Documents**: ID copies, land titles, emergency numbers.
- **Rations**: High-calorie, non-perishable canned food or energy bars.
- **Warmth**: Space blankets, raincoats, sturdy boots.`;
  }

  // Fallback
  return `## 🤖 Landslide AI Emergency Advisor
  
### Query: "${prompt}"

1. **Assess Immediate Threat**: Ensure your personal safety. Evacuate if adjacent to a steep slope during extreme rain.
2. **Check Sensors**: Review live **Soil Moisture** and **Rainfall Telemetry** on your DISASTER-X dashboard.
3. **Follow Safe Routes**: Use the Map display to trace escape routes to the nearest designated emergency shelter.
4. **Call Emergency Dispatch**: Dial 112 / 108 for immediate rescue assistance.

📌 *Try asking about Landslide Warning Signs, Evacuation Protocols, Slope Stabilization, or Survival Kits!*`;
}

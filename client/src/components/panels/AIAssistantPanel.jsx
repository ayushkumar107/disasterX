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
  { id: 'cpr', label: '🩺 CPR First Aid', query: 'How to perform CPR first aid on an unconscious victim?' },
  { id: 'bleeding', label: '🩸 Stop Severe Bleeding', query: 'Step-by-step guide to stop severe arterial bleeding' },
  { id: 'burn', label: '🩹 Burn Treatment', query: 'First aid treatment for 1st, 2nd, and 3rd degree burns' },
  { id: 'earthquake', label: '🫨 Earthquake Survival', query: 'What to do during and immediately after an earthquake?' },
  { id: 'tsunami', label: '🌊 Tsunami Protocol', query: 'Tsunami warning signs and emergency evacuation steps' },
  { id: 'water', label: '💧 Water Purification', query: 'How to purify contaminated water in an emergency survival situation?' },
  { id: 'fracture', label: '🦴 Fracture & Sprain', query: 'How to splint a suspected broken bone or severe sprain?' },
  { id: 'choking', label: '🫁 Heimlich / Choking', query: 'How to perform the Heimlich maneuver on a choking adult or child?' }
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
      text: `Hello! I am your **Disaster-X AI Emergency Advisor**. 

I provide real-time **first aid methods, medical protocols, disaster survival steps**, and emergency guidance.

Ask me anything or select a quick topic below:`,
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

  if (p.includes('cpr')) {
    return `## 🩺 CPR (Cardiopulmonary Resuscitation) Protocol

🚨 **IMMEDIATE ACTION**: Call Emergency Services (911 / 112) immediately!

### Step-by-Step CPR Method:
1. **Check Responsiveness**: Tap shoulders & shout "Are you okay?".
2. **Check Breathing**: Watch chest for 5-10 seconds.
3. **Hand Placement**: Place heel of one hand in center of chest (lower half of sternum), interlock fingers of second hand.
4. **Chest Compressions**:
   - Push hard & fast (100-120 compressions/min).
   - Push at least **2 inches (5 cm)** deep.
   - Allow complete chest recoil between pushes.
5. **Rescue Breaths** (If trained): Give 2 breaths after every 30 compressions.

📌 *Beat Rhythm*: Push to the beat of "Stayin' Alive". Continue until medical help arrives.`;
  }

  if (p.includes('bleed') || p.includes('blood') || p.includes('cut')) {
    return `## 🩸 Severe Bleeding Control & First Aid

⚠️ **CRITICAL**: Act fast to prevent hemorrhagic shock.

### Emergency Control Steps:
1. **Apply Direct Pressure**: Place clean cloth, sterile gauze, or gloved hand directly over wound. Push HARD.
2. **Elevate Wound**: Raise injured limb above heart level if no fracture suspected.
3. **Apply Pressure Bandage**: Wrap firmly with bandage. Do NOT remove original soaked gauze; layer more on top.
4. **Tourniquet Application** (For life-threatening arm/leg bleeding):
   - Place 2-3 inches above wound (never over a joint).
   - Tighten until bleeding stops completely.
   - Note exact time applied on patient's forehead (e.g. "T 14:30").

🚨 **NEVER** remove embedded objects. Stabilize object with padding instead!`;
  }

  if (p.includes('burn')) {
    return `## 🩹 First Aid for Thermal & Chemical Burns

### 1st & 2nd Degree Burns (Redness / Blisters):
1. **Cool Immediately**: Run cool (NOT ice cold) tap water over burn for **10 to 20 minutes**.
2. **Remove Jewelry/Tight Clothing**: Before swelling begins.
3. **Cover Loose**: Apply clean, sterile, non-stick bandage or clean plastic wrap.
4. **Do NOT Pop Blisters**: Leaves wound vulnerable to infection.

### 3rd Degree Burns (Charred / White / Numb):
🚨 **Call Emergency Medical Services Immediately!**
- Do NOT apply water or ointments.
- Cover loosely with sterile dry dressing.
- Monitor breathing & treat for shock.`;
  }

  if (p.includes('earthquake')) {
    return `## 🫨 Earthquake Emergency Survival Protocol

### INDOORS: **DROP, COVER, HOLD ON**
1. **DROP**: Get down onto hands and knees.
2. **COVER**: Take cover under sturdy table or desk. Protect head & neck with arms.
3. **HOLD ON**: Hold on until shaking stops completely.

### IF OUTDOORS:
- Move to open area away from buildings, streetlights, utility wires, and trees.

### AFTER SHAKING STOPS:
- Check for gas leaks (do NOT light matches).
- Expect aftershocks.
- Follow evacuation routes to open safe zones or shelters.`;
  }

  if (p.includes('tsunami')) {
    return `## 🌊 Tsunami Warning & Evacuation Steps

🚨 **NATURAL WARNING SIGNS**:
- Strong earthquake felt near coast.
- Rapid sea level rise or sudden retreat (ocean disappearing).
- Roaring ocean noise like a train.

### EMERGENCY STEPS:
1. **Move Inland & Uphill Immediately**: Reach at least 100 feet (30m) above sea level or 2 miles (3km) inland.
2. **Do NOT Wait for Official Warning**: If you feel strong shaking near coast, RUN to high ground.
3. **Stay Away from Coast**: Waves come in a series over hours. First wave is rarely the largest.`;
  }

  if (p.includes('water') || p.includes('purif')) {
    return `## 💧 Emergency Water Purification Methods

### Method 1: Boiling (Most Reliable)
- Bring water to a **rolling boil for at least 1 full minute** (3 minutes at high altitude).
- Kills all bacteria, viruses, and parasites.

### Method 2: Unscented Household Bleach
- Add **2 drops of regular liquid bleach** per 1 liter (1 quart) of clear water.
- Stir & let stand for **30 minutes**. Water should have faint chlorine odor.

### Method 3: SODIS (Solar Disinfection)
- Fill clear plastic bottles with clear water & place in direct sunlight for 6 hours.`;
  }

  if (p.includes('fracture') || p.includes('bone') || p.includes('sprain')) {
    return `## 🦴 Fracture & Severe Joint Injury First Aid

### Emergency Care Rules:
1. **Immobilize the Area**: Do NOT attempt to straighten or push bone back in!
2. **Improvise a Splint**: Use rigid material (cardboard, wood, folded newspaper) secured with cloth/tape above and below joint.
3. **Apply Ice**: Wrap ice pack in towel and apply for 15-20 minutes to reduce swelling.
4. **Check Circulation**: Ensure fingers/toes beyond splint are warm and not turning blue.`;
  }

  if (p.includes('chok') || p.includes('heimlich')) {
    return `## 🫁 Heimlich Maneuver for Choking

### Conscious Adult / Child (>1 year):
1. Stand behind victim, wrap arms around waist.
2. Make a fist with one hand, place thumb side above belly button (below ribcage).
3. Grasp fist with other hand & perform **quick, hard, inward and upward thrusts**.
4. Repeat thrusts until object is dislodged or person becomes unconscious.

🚨 **If Unconscious**: Lower to floor, call 911, begin CPR compressions & check mouth before breaths.`;
  }

  // General Emergency AI Advisor Fallback
  return `## 🤖 AI Emergency Advisory Response

### Guidance for: "${prompt}"

1. **Assess Immediate Threat**: Ensure your personal safety before assisting others (Scene Safety).
2. **Call Emergency Responders**: Dial emergency dispatch (911 / 112 / 999) if life or safety is threatened.
3. **Check Vital Signs**: Verify consciousness, airway, breathing, and pulse.
4. **Follow Disaster-X Protocols**: Locate nearest shelter on your live map using **Safe Route**.

📌 *Need specific instructions? Try asking about CPR, Bleeding, Burns, Earthquakes, Tsunamis, or Water Purification!*`;
}

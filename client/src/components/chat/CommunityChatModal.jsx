import React, { useState, useEffect, useRef } from 'react';
import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';
import { useLocationStore } from '../../stores/locationStore';
import { useMapStore } from '../../stores/mapStore';
import { 
  X, 
  Send, 
  MessageSquare, 
  Radio, 
  MapPin, 
  AlertTriangle, 
  Users, 
  ShieldCheck, 
  Compass, 
  Hash, 
  RefreshCw,
  Sparkles,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ROLE_BADGE = {
  OFFICIAL: 'bg-red-500/20 text-red-400 border-red-500/40',
  RESPONDER: 'bg-[#00f0ff]/20 text-[#00f0ff] border-[#00f0ff]/40',
  VOLUNTEER: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  SYSTEM: 'bg-amber-500/20 text-[#e5b849] border-[#e5b849]/40',
  CITIZEN: 'bg-white/10 text-gray-300 border-white/20'
};

const ROOM_ICONS = {
  'emergency-broadcast': <Radio size={16} className="text-red-400" />,
  'ner-landslides': <AlertTriangle size={16} className="text-amber-400" />,
  'rescue-dispatch': <ShieldCheck size={16} className="text-[#00f0ff]" />,
  'community-aid': <Users size={16} className="text-emerald-400" />
};

export const CommunityChatModal = () => {
  const {
    isOpen,
    setOpen,
    rooms,
    activeRoom,
    messages,
    isLoadingRooms,
    isLoadingMessages,
    isSending,
    fetchRooms,
    selectRoom,
    sendMessage
  } = useChatStore();

  const user = useAuthStore((s) => s.user);
  const userLocation = useLocationStore((s) => s.userLocation);
  const flyTo = useMapStore((s) => s.flyTo);

  const [input, setInput] = useState('');
  const [senderName, setSenderName] = useState(user?.name || 'Citizen Responder');
  const [senderRole, setSenderRole] = useState(user?.role === 'ADMIN' ? 'OFFICIAL' : user?.role === 'RESCUE_TEAM' ? 'RESPONDER' : 'CITIZEN');
  const [includeLocation, setIncludeLocation] = useState(false);
  const [isBroadcast, setIsBroadcast] = useState(false);
  const [showChannelsMobile, setShowChannelsMobile] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user?.name) {
      setSenderName(user.name);
      setSenderRole(user.role === 'ADMIN' ? 'OFFICIAL' : user.role === 'RESCUE_TEAM' ? 'RESPONDER' : 'CITIZEN');
    }
  }, [user]);

  useEffect(() => {
    if (isOpen && rooms.length === 0) {
      fetchRooms();
    }
  }, [isOpen, rooms.length, fetchRooms]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isSending) return;

    let locPayload = null;
    let locLabel = null;
    if (includeLocation && userLocation && userLocation.length === 2) {
      locPayload = { coordinates: [userLocation[0], userLocation[1]] };
      locLabel = `GPS: ${userLocation[1].toFixed(3)}°N, ${userLocation[0].toFixed(3)}°E`;
    }

    const ok = await sendMessage(input, {
      senderName,
      senderRole,
      type: isBroadcast ? 'BROADCAST' : locPayload ? 'LOCATION' : 'TEXT',
      location: locPayload,
      locationLabel: locLabel
    });

    if (ok) {
      setInput('');
      setIncludeLocation(false);
      setIsBroadcast(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/80 backdrop-blur-md"
      >
        <div className="w-full max-w-4xl h-[92vh] sm:h-[85vh] max-h-[800px] rounded-2xl bg-[#050a14] border border-[#00f0ff]/40 shadow-[0_0_50px_rgba(0,240,255,0.25)] font-mono flex flex-col overflow-hidden relative">
          
          {/* Top Modal Header */}
          <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-[#03060a] border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded bg-[#070e18] border border-[#00f0ff]/50 flex items-center justify-center text-[#00f0ff] glow-cyan-sm shrink-0">
                <MessageSquare size={16} className="animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-white tracking-wider font-osiris truncate">
                    DISASTERLINK • CHAT
                  </span>
                  <span className="px-1.5 py-0.5 text-[8px] sm:text-[9px] font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0">
                    REAL-TIME
                  </span>
                </div>
                <span className="text-[10px] text-[#94a3b8] hidden sm:block truncate">
                  COORDINATED FIELD DISPATCH, CITIZEN ASSISTANCE & RESCUE MESSAGING
                </span>
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded text-[#64748b] hover:text-[#00f0ff] hover:bg-white/10 transition-colors shrink-0"
            >
              <X size={20} />
            </button>
          </div>

          {/* Main Area: Channel List + Message Thread */}
          <div className="flex-1 flex overflow-hidden relative">
            
            {/* Left Channel Sidebar */}
            <div className={`${showChannelsMobile ? 'flex absolute inset-0 z-30 w-full bg-[#030712]' : 'hidden md:flex w-64'} border-r border-white/10 bg-[#030712]/95 flex flex-col shrink-0 transition-all`}>
              <div className="p-2.5 border-b border-white/10 flex items-center justify-between text-xs text-[#94a3b8]">
                <span className="font-bold uppercase tracking-wider text-[10px] text-[#00f0ff]">
                  Radio Channels
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchRooms()}
                    title="Refresh Channels"
                    className="hover:text-white transition-colors"
                  >
                    <RefreshCw size={13} className={isLoadingRooms ? 'animate-spin' : ''} />
                  </button>
                  <button
                    onClick={() => setShowChannelsMobile(false)}
                    className="md:hidden text-gray-400 hover:text-white p-1"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                {rooms.map((room) => {
                  const isSelected = activeRoom?._id === room._id || activeRoom?.slug === room.slug;
                  return (
                    <button
                      key={room._id}
                      onClick={() => {
                        selectRoom(room);
                        setShowChannelsMobile(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg border transition-all text-xs flex items-start gap-2.5 ${
                        isSelected
                          ? 'bg-[#00f0ff]/15 border-[#00f0ff] text-white shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                          : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {ROOM_ICONS[room.slug] || <Hash size={16} className="text-[#00f0ff]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-[11px] truncate text-white">
                          #{room.slug || room.name}
                        </div>
                        <div className="text-[9px] text-[#94a3b8] truncate mt-0.5">
                          {room.description || room.name}
                        </div>
                        {room.lastMessage && (
                          <div className="text-[8px] text-[#64748b] truncate mt-1 italic">
                            {room.lastMessage.senderName}: {room.lastMessage.content}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Sender Profile Strip */}
              <div className="p-2.5 border-t border-white/10 bg-[#020408] text-[10px] space-y-1.5">
                <div className="text-[#64748b] font-bold text-[9px] uppercase tracking-wider">
                  Your Radio Identity
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Enter callsign / name"
                    className="w-full bg-[#050a14] border border-white/15 rounded px-2 py-1 text-white text-[11px] focus:outline-none focus:border-[#00f0ff]"
                  />
                  <select
                    value={senderRole}
                    onChange={(e) => setSenderRole(e.target.value)}
                    className="bg-[#050a14] border border-white/15 rounded px-1.5 py-1 text-[10px] text-[#00f0ff] focus:outline-none"
                  >
                    <option value="CITIZEN">Citizen</option>
                    <option value="RESPONDER">Responder</option>
                    <option value="VOLUNTEER">Volunteer</option>
                    <option value="OFFICIAL">Official</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right Message View */}
            <div className="flex-1 flex flex-col bg-[#050a14]/95">
              
              {/* Channel Header Banner */}
              <div className="px-3 sm:px-4 py-2 sm:py-2.5 border-b border-white/10 bg-[#070e18] flex items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <button
                    onClick={() => setShowChannelsMobile(true)}
                    className="md:hidden px-2 py-1 rounded bg-white/10 text-[#00f0ff] border border-[#00f0ff]/30 text-[10px] flex items-center gap-1 shrink-0"
                    title="Switch Channel"
                  >
                    <Hash size={12} />
                    <span className="font-bold">CHANNELS</span>
                  </button>

                  <div className="flex items-center gap-1.5 min-w-0 truncate">
                    <span className="font-bold text-white text-xs sm:text-sm truncate">
                      #{activeRoom?.slug || activeRoom?.name || 'general'}
                    </span>
                    <span className="text-[10px] text-[#94a3b8] hidden sm:inline truncate">
                      — {activeRoom?.description}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-[#64748b] shrink-0">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="hidden sm:inline">ENCRYPTED & SYNCED</span>
                    <span className="sm:hidden text-[9px]">LIVE</span>
                  </span>
                </div>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {isLoadingMessages ? (
                  <div className="h-full flex items-center justify-center text-xs text-[#94a3b8] gap-2">
                    <RefreshCw size={16} className="animate-spin text-[#00f0ff]" />
                    <span>Synchronizing radio channel messages...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#64748b]">
                    <MessageSquare size={36} className="mb-2 text-[#00f0ff]/30" />
                    <p className="text-xs text-gray-300 font-bold">Channel is quiet</p>
                    <p className="text-[10px] text-gray-500 mt-1 max-w-sm">
                      Be the first to post a field report, request aid, or send tactical dispatch.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isSystem = msg.type === 'SYSTEM' || msg.senderRole === 'SYSTEM';
                    const isAlert = msg.type === 'BROADCAST';
                    const isMe = msg.senderName === senderName;

                    if (isSystem) {
                      return (
                        <div key={msg._id} className="flex justify-center my-2">
                          <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-[#94a3b8] flex items-center gap-1.5">
                            <Info size={12} className="text-[#e5b849]" />
                            <span>{msg.content}</span>
                            <span className="text-[8px] text-gray-500">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg._id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-xl p-3 border text-xs ${
                            isAlert
                              ? 'bg-red-950/70 border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                              : isMe
                                ? 'bg-[#00f0ff]/10 border-[#00f0ff]/30 text-white'
                                : 'bg-[#0b1320] border-white/10 text-gray-200'
                          }`}
                        >
                          {/* Sender Meta Bar */}
                          <div className="flex items-center gap-2 mb-1 text-[10px]">
                            <span className="font-bold text-white tracking-wide">
                              {msg.senderName}
                            </span>
                            <span
                              className={`px-1.5 py-0.2 rounded border text-[8px] font-bold uppercase tracking-wider ${
                                ROLE_BADGE[msg.senderRole] || ROLE_BADGE.CITIZEN
                              }`}
                            >
                              {msg.senderRole || 'CITIZEN'}
                            </span>
                            {isAlert && (
                              <span className="px-1.5 py-0.2 rounded bg-red-500 text-white font-bold text-[8px] animate-pulse">
                                ALERT
                              </span>
                            )}
                            <span className="text-[9px] text-[#64748b] ml-auto">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {/* Message Content */}
                          <p className="whitespace-pre-wrap leading-relaxed text-[12px] break-words">
                            {msg.content}
                          </p>

                          {/* Location Pin Attachment */}
                          {msg.location?.coordinates && (
                            <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 text-[10px] text-[#00f0ff]">
                                <MapPin size={13} />
                                <span className="font-bold">{msg.locationLabel || 'Attached Location'}</span>
                              </div>
                              <button
                                onClick={() => {
                                  const [lng, lat] = msg.location.coordinates;
                                  flyTo(lng, lat, 12);
                                  setOpen(false);
                                }}
                                className="px-2 py-0.5 rounded bg-[#00f0ff]/20 hover:bg-[#00f0ff]/30 border border-[#00f0ff]/50 text-[#00f0ff] text-[9px] font-bold transition-colors inline-flex items-center gap-1"
                              >
                                <Compass size={11} />
                                <span>VIEW ON MAP</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Bottom Composer */}
              <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-[#03060a]">
                {/* Action buttons row */}
                <div className="flex items-center gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setIncludeLocation(!includeLocation)}
                    className={`px-2 py-1 rounded border text-[10px] inline-flex items-center gap-1.5 transition-colors ${
                      includeLocation
                        ? 'bg-[#00f0ff]/20 border-[#00f0ff] text-[#00f0ff]'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    <MapPin size={12} />
                    <span>{includeLocation ? 'GPS Attached ✓' : 'Attach GPS Location'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsBroadcast(!isBroadcast)}
                    className={`px-2 py-1 rounded border text-[10px] inline-flex items-center gap-1.5 transition-colors ${
                      isBroadcast
                        ? 'bg-red-500/20 border-red-500 text-red-400'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    <AlertTriangle size={12} />
                    <span>{isBroadcast ? 'Alert Broadcast ON ⚠️' : 'Mark as Alert'}</span>
                  </button>
                </div>

                {/* Input & Send button */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                      activeRoom
                        ? `Message #${activeRoom.slug || activeRoom.name}...`
                        : 'Type message...'
                    }
                    className="flex-1 bg-[#050a14] border border-white/15 rounded-xl px-3.5 py-2.5 text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-[#00f0ff] shadow-inner"
                  />

                  <button
                    type="submit"
                    disabled={!input.trim() || isSending}
                    className="px-4 py-2.5 rounded-xl bg-[#00f0ff] hover:bg-[#00f0ff]/90 disabled:opacity-30 disabled:cursor-not-allowed text-black font-bold text-xs inline-flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all"
                  >
                    {isSending ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
                    <span>SEND</span>
                  </button>
                </div>
              </form>

            </div>

          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
};

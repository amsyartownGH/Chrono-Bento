import React, { useState, useEffect, useRef } from 'react';
import { Bell, Plus, Trash2, Moon, Sun, Volume2, VolumeX, Clock, Monitor, Upload } from 'lucide-react';

type Alarm = {
  id: string;
  time: string; // HH:mm
  enabled: boolean;
  label: string;
};

// Helper for Web Audio API sounds
const playSound = (type: string, vol: number) => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  const actualVolume = vol; // 0.1 to 2.0
  
  if (type === 'beep') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(actualVolume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } else if (type === 'radar') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(900, ctx.currentTime);
    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(900, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(actualVolume, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } else if (type === 'digital') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(2000, ctx.currentTime);
    gain.gain.setValueAtTime(actualVolume * 0.3, ctx.currentTime); // square is loud
    gain.gain.setValueAtTime(0, ctx.currentTime + 0.1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  } else if (type === 'siren') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.4);
    osc.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.8);
    gain.gain.setValueAtTime(actualVolume * 0.5, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);
  } else if (type === 'chime') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.2); // E5
    gain.gain.setValueAtTime(actualVolume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.6);
  } else if (type === 'buzzer') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    gain.gain.setValueAtTime(actualVolume, ctx.currentTime);
    gain.gain.setValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } else if (type === 'pulse') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(1000, ctx.currentTime);
    gain.gain.setValueAtTime(actualVolume * 0.2, ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(actualVolume * 0.2, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } else if (type === 'sonar') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    gain.gain.setValueAtTime(actualVolume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);
  } else if (type === 'twinkle') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1108.73, ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(actualVolume * 0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } else if (type === 'foghorn') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    gain.gain.setValueAtTime(actualVolume * 0.5, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.9);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.9);
  } else if (type === 'cricket') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(2500, ctx.currentTime);
    gain.gain.setValueAtTime(actualVolume * 0.1, ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(actualVolume * 0.1, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(actualVolume * 0.1, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0, ctx.currentTime + 0.25);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
  } else if (type === 'telephone') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.setValueAtTime(800, ctx.currentTime + 0.05);
    osc.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(actualVolume * 0.3, ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } else if (type === 'alien') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1000, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.5);
    osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.9);
    gain.gain.setValueAtTime(actualVolume, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.9);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.9);
  } else if (type === 'emergency') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.setValueAtTime(1000, ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(actualVolume * 0.4, ctx.currentTime);
    gain.gain.setValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);
  }
};

// Helper for Notification
const sendNotification = (title: string, body: string) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/vite.svg' });
  }
};

const ScrollPicker = ({ items, value, onChange, width = "w-16" }: { items: string[], value: string, onChange: (val: string) => void, width?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemHeight = 40;
  const isScrolling = useRef(false);
  const scrollEndTimeout = useRef<number | null>(null);
  const targetIndexRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isScrolling.current && targetIndexRef.current === null) {
      const index = items.indexOf(value);
      if (containerRef.current && index !== -1) {
        containerRef.current.scrollTo({ top: index * itemHeight, behavior: 'smooth' });
      }
    }
  }, [value, items]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let accumulatedDelta = 0;
    let lastWheelTime = Date.now();
    
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      const now = Date.now();
      if (now - lastWheelTime > 100) {
        accumulatedDelta = 0;
      }
      lastWheelTime = now;
      
      accumulatedDelta += e.deltaY;
      
      if (Math.abs(accumulatedDelta) >= 30) { 
        const direction = Math.sign(accumulatedDelta);
        accumulatedDelta = 0;
        
        let currentIndex = targetIndexRef.current !== null 
          ? targetIndexRef.current 
          : Math.round(container.scrollTop / itemHeight);
          
        let nextIndex = currentIndex + direction;
        
        if (nextIndex < 0) nextIndex = 0;
        if (nextIndex >= items.length) nextIndex = items.length - 1;
        
        targetIndexRef.current = nextIndex;
        isScrolling.current = true;
        
        container.scrollTo({ top: nextIndex * itemHeight, behavior: 'smooth' });
        
        if (scrollEndTimeout.current) clearTimeout(scrollEndTimeout.current);
        scrollEndTimeout.current = window.setTimeout(() => {
          targetIndexRef.current = null;
          isScrolling.current = false;
        }, 300);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [items]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const index = Math.round(e.currentTarget.scrollTop / itemHeight);
    if (items[index] && items[index] !== value) {
      onChange(items[index]);
    }

    if (targetIndexRef.current === null) {
      isScrolling.current = true;
      if (scrollEndTimeout.current) clearTimeout(scrollEndTimeout.current);
      scrollEndTimeout.current = window.setTimeout(() => {
        isScrolling.current = false;
      }, 150);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`h-[120px] overflow-y-auto snap-y snap-mandatory hide-scrollbar ${width} relative`}
      onScroll={handleScroll}
    >
      <div className="h-[40px]" />
      {items.map(item => (
        <div 
          key={item} 
          className={`h-[40px] flex items-center justify-center snap-center text-2xl font-mono transition-all duration-200 ${item === value ? 'opacity-100 font-bold scale-110' : 'opacity-30 scale-90'}`}
        >
          {item}
        </div>
      ))}
      <div className="h-[40px]" />
    </div>
  );
};

export default function App() {
  const [time, setTime] = useState(new Date());
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [newAlarmTime, setNewAlarmTime] = useState('07:00');
  const [newAlarmLabel, setNewAlarmLabel] = useState('Wake up');
  const [theme, setTheme] = useState<'auto' | 'dark' | 'light' | 'pure-black' | 'ps3-classic' | 'ps3-aurora' | 'ps3-crimson'>('auto');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(1.0);
  const [soundType, setSoundType] = useState('beep');
  const [ringingAlarm, setRingingAlarm] = useState<Alarm | null>(null);
  const [customAudioName, setCustomAudioName] = useState<string>('');
  const [use24HourFormat, setUse24HourFormat] = useState(false);
  
  const lastTriggeredRef = useRef<string | null>(null);
  const ringIntervalRef = useRef<number | null>(null);
  const ringTimeoutRef = useRef<number | null>(null);
  const customAudioRef = useRef<HTMLAudioElement | null>(null);

  const stopAlarm = () => {
    setRingingAlarm(null);
    if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
    if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
    if (customAudioRef.current) {
      customAudioRef.current.pause();
      customAudioRef.current.currentTime = 0;
    }
  };

  // Load settings on mount
  useEffect(() => {
    const savedAlarms = localStorage.getItem('chrono_alarms');
    if (savedAlarms) {
      try { setAlarms(JSON.parse(savedAlarms)); } catch (e) { console.error(e); }
    }
    const savedTheme = localStorage.getItem('chrono_theme');
    if (savedTheme) setTheme(savedTheme as any);
    const savedVol = localStorage.getItem('chrono_volume');
    if (savedVol) setVolume(parseFloat(savedVol));
    const savedSound = localStorage.getItem('chrono_sound');
    if (savedSound) setSoundType(savedSound);
    const saved24h = localStorage.getItem('chrono_24h');
    if (saved24h) setUse24HourFormat(saved24h === 'true');
    
    // Load custom audio from IndexedDB
    import('idb-keyval').then(({ get }) => {
      get('custom_alarm_sound').then((data) => {
        if (data && data.buffer) {
          const blob = new Blob([data.buffer], { type: data.type });
          const url = URL.createObjectURL(blob);
          customAudioRef.current = new Audio(url);
          setCustomAudioName(data.name || 'Custom Sound');
        }
      }).catch(e => console.error("Failed to load custom sound", e));
    });
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Save settings on change
  useEffect(() => {
    localStorage.setItem('chrono_alarms', JSON.stringify(alarms));
    localStorage.setItem('chrono_theme', theme);
    localStorage.setItem('chrono_volume', volume.toString());
    localStorage.setItem('chrono_sound', soundType);
    localStorage.setItem('chrono_24h', use24HourFormat.toString());
  }, [alarms, theme, volume, soundType, use24HourFormat]);

  // Clock heartbeat & Alarm check
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now);
      
      const currentHHMM = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
      
      // Check alarms
      alarms.forEach(alarm => {
        if (alarm.enabled && alarm.time === currentHHMM && lastTriggeredRef.current !== `${alarm.id}-${currentHHMM}`) {
          // Trigger alarm
          lastTriggeredRef.current = `${alarm.id}-${currentHHMM}`;
          
          setRingingAlarm(alarm);
          
          if (soundEnabled) {
            if (soundType === 'custom' && customAudioRef.current) {
              customAudioRef.current.loop = true;
              customAudioRef.current.volume = Math.min(volume, 1.0);
              customAudioRef.current.play().catch(e => console.error("Audio play failed", e));
              
              if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
              ringIntervalRef.current = window.setInterval(() => {
                if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
              }, 2000);
            } else {
              if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
              ringIntervalRef.current = window.setInterval(() => {
                playSound(soundType, volume);
                if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
              }, 1000);
            }
          }
          
          if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
          ringTimeoutRef.current = window.setTimeout(() => {
            stopAlarm();
          }, 60000);
          
          if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200, 100, 200]);
          }
          
          sendNotification('Alarm!', alarm.label || `It's ${alarm.time}`);
        }
      });
      
    }, 1000);
    
    return () => clearInterval(timer);
  }, [alarms, soundEnabled, soundType, volume]);

  // Determine active theme based on time if 'auto'
  const currentHour = time.getHours();
  let activeTheme = theme;
  if (theme === 'auto') {
    activeTheme = (currentHour >= 6 && currentHour < 18) ? 'light' : 'dark';
  }

  // Dynamic Background based on hour
  const getBackgroundClass = () => {
    if (activeTheme === 'pure-black') {
      return 'bg-black text-gray-100';
    } else if (activeTheme === 'dark') {
      return 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white';
    } else if (activeTheme === 'ps3-classic') {
      return 'text-white ps3-bg-classic';
    } else if (activeTheme === 'ps3-aurora') {
      return 'text-white ps3-bg-aurora';
    } else if (activeTheme === 'ps3-crimson') {
      return 'text-white ps3-bg-crimson';
    } else {
      if (currentHour >= 6 && currentHour < 12) {
        return 'bg-gradient-to-br from-amber-100 via-orange-50 to-rose-100 text-slate-900'; // Morning Gold
      } else if (currentHour >= 12 && currentHour < 17) {
        return 'bg-gradient-to-br from-blue-50 via-sky-100 to-indigo-50 text-slate-900'; // Afternoon
      } else {
        return 'bg-gradient-to-br from-orange-100 via-rose-100 to-purple-100 text-slate-900'; // Sunset
      }
    }
  };

  const glassClass = activeTheme === 'pure-black' ? 'glass-pure-black' : (activeTheme === 'dark' || activeTheme.startsWith('ps3') ? 'glass-dark' : 'glass');

  const addAlarm = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure audio context is initialized on user interaction
    if (soundEnabled) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        ctx.resume();
      }
    }

    const newAlarm: Alarm = {
      id: Date.now().toString(),
      time: newAlarmTime,
      label: newAlarmLabel,
      enabled: true
    };
    setAlarms([...alarms, newAlarm].sort((a, b) => a.time.localeCompare(b.time)));
    setNewAlarmLabel('');
  };

  const toggleAlarm = (id: string) => {
    setAlarms(alarms.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  };

  const deleteAlarm = (id: string) => {
    setAlarms(alarms.filter(a => a.id !== id));
  };

  const cycleTheme = () => {
    const themes: ('auto' | 'light' | 'dark' | 'pure-black' | 'ps3-classic' | 'ps3-aurora' | 'ps3-crimson')[] = ['auto', 'light', 'dark', 'pure-black', 'ps3-classic', 'ps3-aurora', 'ps3-crimson'];
    setTheme(themes[(themes.indexOf(theme) + 1) % themes.length]);
  };

  const getNextAlarmTime = () => {
    const enabledAlarms = alarms.filter(a => a.enabled);
    if (enabledAlarms.length === 0) return null;

    let minDiff = Infinity;

    enabledAlarms.forEach(alarm => {
      const [aHours, aMinutes] = alarm.time.split(':').map(Number);
      const alarmDate = new Date(time);
      alarmDate.setHours(aHours, aMinutes, 0, 0);
      
      if (alarmDate.getTime() <= time.getTime()) {
        alarmDate.setDate(alarmDate.getDate() + 1);
      }
      
      const diff = alarmDate.getTime() - time.getTime();
      if (diff < minDiff) {
        minDiff = diff;
      }
    });

    if (minDiff === Infinity) return null;

    const hours = Math.floor(minDiff / (1000 * 60 * 60));
    const minutes = Math.floor((minDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((minDiff % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const handleCustomAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const buffer = await file.arrayBuffer();
      const data = { buffer, type: file.type, name: file.name };
      
      const { set } = await import('idb-keyval');
      await set('custom_alarm_sound', data);
      
      const blob = new Blob([buffer], { type: file.type });
      const url = URL.createObjectURL(blob);
      
      if (customAudioRef.current) {
        customAudioRef.current.pause();
        URL.revokeObjectURL(customAudioRef.current.src);
      }
      
      customAudioRef.current = new Audio(url);
      setCustomAudioName(file.name);
      setSoundType('custom');
      
      // Preview
      customAudioRef.current.volume = Math.min(volume, 1.0);
      customAudioRef.current.play();
      setTimeout(() => {
        if (customAudioRef.current) {
          customAudioRef.current.pause();
          customAudioRef.current.currentTime = 0;
        }
      }, 3000);
    } catch (err) {
      console.error("Failed to save custom audio", err);
      alert("Failed to save custom audio file. It might be too large.");
    }
  };

  const previewSound = (type: string, vol: number) => {
    if (type === 'custom') {
      if (customAudioRef.current) {
        customAudioRef.current.volume = Math.min(vol, 1.0);
        customAudioRef.current.currentTime = 0;
        customAudioRef.current.play().catch(e => console.error(e));
        setTimeout(() => {
          if (customAudioRef.current) {
            customAudioRef.current.pause();
            customAudioRef.current.currentTime = 0;
          }
        }, 3000);
      }
    } else {
      playSound(type, vol);
    }
  };

  const nextAlarm = getNextAlarmTime();

  const hoursList = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutesList = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
  const ampmList = ['AM', 'PM'];

  const [h24, m] = newAlarmTime.split(':').map(Number);
  const isPM = h24 >= 12;
  const h12 = h24 % 12 || 12;
  
  const currentHourStr = h12.toString().padStart(2, '0');
  const currentMinuteStr = (m || 0).toString().padStart(2, '0');
  const currentAmPmStr = isPM ? 'PM' : 'AM';

  const handleTimeChange = (type: 'hour' | 'minute' | 'ampm', val: string) => {
    let newH24 = h24 || 0;
    let newM = m || 0;

    if (type === 'hour') {
      const h = parseInt(val, 10);
      newH24 = isPM ? (h === 12 ? 12 : h + 12) : (h === 12 ? 0 : h);
    } else if (type === 'minute') {
      newM = parseInt(val, 10);
    } else if (type === 'ampm') {
      if (val === 'PM' && !isPM) {
        newH24 = h12 === 12 ? 12 : h12 + 12;
      } else if (val === 'AM' && isPM) {
        newH24 = h12 === 12 ? 0 : h12;
      }
    }

    setNewAlarmTime(`${newH24.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`);
  };

  return (
    <div className={`min-h-screen transition-colors duration-1000 flex items-center justify-center p-4 sm:p-8 ${getBackgroundClass()}`}>
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Card 1: The Hero (Clock) */}
        <div className={`md:col-span-8 rounded-3xl p-8 sm:p-12 flex flex-col justify-center items-center relative overflow-hidden min-h-[400px] ${glassClass} ${ringingAlarm ? 'animate-pulse bg-red-500/20' : ''}`}>
          {ringingAlarm ? (
            <div className="flex flex-col items-center justify-center text-center z-10 w-full h-full">
              <Bell size={48} className="mb-6 animate-bounce text-red-500" />
              <h1 className="font-display text-5xl sm:text-7xl font-bold tracking-tight mb-2 text-red-500">
                {ringingAlarm.time}
              </h1>
              <p className="text-2xl font-medium opacity-90 mb-12">
                {ringingAlarm.label || "Alarm"}
              </p>
              <button 
                onClick={stopAlarm}
                className="btn-tactile py-4 px-12 rounded-2xl font-bold text-xl bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/30 w-full max-w-md"
              >
                STOP ALARM
              </button>
            </div>
          ) : (
            <>
              <div className="absolute top-6 left-6 flex items-center gap-2 opacity-60">
                <Clock size={20} />
                <span className="font-medium tracking-widest uppercase text-sm">Local Time</span>
              </div>
              
              <div className="kinetic-text text-center mt-8">
                <h1 className="font-mono text-6xl sm:text-8xl md:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-tighter" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {time.toLocaleTimeString('en-US', { hour12: !use24HourFormat, hour: '2-digit', minute: '2-digit' })}
                </h1>
                <p className="font-mono text-xl sm:text-3xl mt-4 opacity-80 font-medium">
                  {time.toLocaleTimeString('en-US', { hour12: !use24HourFormat, second: '2-digit' })}
                </p>
              </div>
              
              <div className="mt-12 text-lg font-medium opacity-70 tracking-wide flex flex-col items-center gap-4">
                <div>{time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                {nextAlarm && (
                  <div className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium ${activeTheme === 'pure-black' ? 'bg-white/10 border border-white/10' : 'bg-black/10 dark:bg-white/10 border border-black/5 dark:border-white/5'}`}>
                    <Bell size={16} className="opacity-70" />
                    <span>Next alarm in {nextAlarm}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right Column */}
        <div className="md:col-span-4 flex flex-col gap-6">
          
          {/* Card 4: The Vibe (Controls) */}
          <div className={`rounded-3xl p-6 flex flex-col gap-4 ${glassClass}`}>
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="text-sm font-medium opacity-60 uppercase tracking-widest">
                Settings
              </div>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setUse24HourFormat(!use24HourFormat)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 ${activeTheme === 'dark' || activeTheme === 'pure-black' || activeTheme.startsWith('ps3') ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'}`}
                  aria-label="Toggle 12/24 Hour Format"
                >
                  {use24HourFormat ? '24H' : '12H'}
                </button>
                <button 
                  onClick={cycleTheme}
                  className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 ${activeTheme === 'dark' || activeTheme === 'pure-black' || activeTheme.startsWith('ps3') ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'}`}
                  aria-label="Toggle Theme"
                >
                  {theme === 'auto' && <Monitor size={14} />}
                  {theme === 'light' && <Sun size={14} />}
                  {theme === 'dark' && <Moon size={14} />}
                  {theme === 'pure-black' && <Moon size={14} className="fill-current" />}
                  {theme.startsWith('ps3') && <Monitor size={14} />}
                  {theme.replace('ps3-', '').replace('-', ' ')}
                </button>
                <button 
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-2 rounded-xl transition-colors ${activeTheme === 'dark' || activeTheme === 'pure-black' || activeTheme.startsWith('ps3') ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'}`}
                  aria-label="Toggle Sound"
                >
                  {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </button>
              </div>
            </div>
            
            {soundEnabled && (
              <div className="flex flex-col gap-3 mt-2 border-t border-black/5 dark:border-white/10 pt-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-sm font-medium opacity-80">Alarm Sound</label>
                  <select 
                    value={soundType} 
                    onChange={e => {
                      setSoundType(e.target.value);
                      previewSound(e.target.value, volume);
                    }}
                    className={`text-sm p-1.5 rounded-lg outline-none font-medium cursor-pointer max-w-[150px] truncate ${activeTheme === 'dark' || activeTheme === 'pure-black' || activeTheme.startsWith('ps3') ? 'bg-white/10 text-white [&>option]:bg-slate-900' : 'bg-black/5 text-slate-900 [&>option]:bg-white'}`}
                  >
                    <option value="beep">Classic Beep</option>
                    <option value="radar">Radar</option>
                    <option value="digital">Digital Watch</option>
                    <option value="siren">Warning Siren</option>
                    <option value="chime">Door Chime</option>
                    <option value="buzzer">Harsh Buzzer</option>
                    <option value="pulse">Rapid Pulse</option>
                    <option value="sonar">Submarine Sonar</option>
                    <option value="twinkle">Magic Twinkle</option>
                    <option value="foghorn">Deep Foghorn</option>
                    <option value="cricket">Cricket Chirp</option>
                    <option value="telephone">Retro Telephone</option>
                    <option value="alien">Alien Spaceship</option>
                    <option value="emergency">Emergency Broadcast</option>
                    <option value="custom">Custom Upload...</option>
                  </select>
                </div>
                
                {soundType === 'custom' && (
                  <div className={`flex flex-wrap items-center justify-between gap-2 p-2 rounded-lg text-sm ${activeTheme === 'dark' || activeTheme === 'pure-black' || activeTheme.startsWith('ps3') ? 'bg-white/5' : 'bg-black/5'}`}>
                    <span className="truncate max-w-[180px] opacity-80">
                      {customAudioName || 'No custom sound'}
                    </span>
                    <label className="cursor-pointer flex items-center gap-1 text-indigo-500 hover:text-indigo-600 font-medium">
                      <Upload size={14} />
                      <span>Upload</span>
                      <input 
                        type="file" 
                        accept="audio/*" 
                        className="hidden" 
                        onChange={handleCustomAudioUpload}
                      />
                    </label>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Volume2 size={16} className="opacity-60" />
                  <input 
                    type="range" 
                    min="0.1" max="2.0" step="0.1" 
                    value={volume} 
                    onChange={e => {
                      setVolume(parseFloat(e.target.value));
                    }}
                    onMouseUp={() => previewSound(soundType, volume)}
                    onTouchEnd={() => previewSound(soundType, volume)}
                    className="flex-1 h-2 bg-black/10 dark:bg-white/20 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Card 2: The Input (Set Alarm) */}
          <div className={`rounded-3xl p-6 ${glassClass}`}>
            <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
              <Bell size={20} /> New Alarm
            </h2>
            <form onSubmit={addAlarm} className="flex flex-col gap-4">
              <div className={`flex items-center justify-center gap-2 p-4 rounded-2xl ${activeTheme === 'dark' || activeTheme === 'pure-black' || activeTheme.startsWith('ps3') ? 'bg-white/5' : 'bg-black/5'}`}>
                <ScrollPicker 
                  items={hoursList} 
                  value={currentHourStr} 
                  onChange={(v) => handleTimeChange('hour', v)} 
                  width="w-16"
                />
                <span className="text-2xl font-bold opacity-50 mb-1">:</span>
                <ScrollPicker 
                  items={minutesList} 
                  value={currentMinuteStr} 
                  onChange={(v) => handleTimeChange('minute', v)} 
                  width="w-16"
                />
                <div className="w-2" />
                <ScrollPicker 
                  items={ampmList} 
                  value={currentAmPmStr} 
                  onChange={(v) => handleTimeChange('ampm', v)} 
                  width="w-16"
                />
              </div>
              <input 
                type="text" 
                placeholder="Alarm label (e.g. Wake up)" 
                value={newAlarmLabel}
                onChange={(e) => setNewAlarmLabel(e.target.value)}
                className={`w-full p-3 rounded-xl outline-none transition-all font-medium ${activeTheme === 'dark' || activeTheme === 'pure-black' || activeTheme.startsWith('ps3') ? 'bg-white/10 focus:bg-white/20 placeholder-white/30' : 'bg-white/50 focus:bg-white/80 placeholder-black/30'}`}
              />
              <button 
                type="submit"
                className={`btn-tactile mt-2 py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 ${activeTheme === 'dark' || activeTheme === 'pure-black' || activeTheme.startsWith('ps3') ? 'bg-indigo-500 text-white' : 'bg-slate-900 text-white'}`}
              >
                <Plus size={20} /> Set Alarm
              </button>
            </form>
          </div>

          {/* Card 3: The List (Active Alarms) */}
          <div className={`rounded-3xl p-6 flex-1 flex flex-col min-h-[250px] max-h-[400px] ${glassClass}`}>
            <h2 className="font-display text-xl font-semibold mb-4 flex items-center justify-between">
              <span>Active Alarms</span>
              <span className="text-sm font-normal opacity-60 bg-black/10 dark:bg-white/10 px-2 py-1 rounded-full">{alarms.length}</span>
            </h2>
            
            <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-3">
              {alarms.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-40 text-center p-4">
                  <Bell size={32} className="mb-2 opacity-50" />
                  <p>No alarms set.</p>
                  <p className="text-sm">Enjoy the silence.</p>
                </div>
              ) : (
                alarms.map(alarm => (
                  <div 
                    key={alarm.id} 
                    className={`p-4 rounded-2xl transition-all flex items-center justify-between group ${alarm.enabled ? (activeTheme === 'dark' || activeTheme === 'pure-black' || activeTheme.startsWith('ps3') ? 'bg-white/10' : 'bg-white/60') : 'opacity-50 grayscale'}`}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <button 
                        onClick={() => toggleAlarm(alarm.id)}
                        className={`w-12 h-6 shrink-0 rounded-full relative transition-colors ${alarm.enabled ? (activeTheme === 'dark' || activeTheme === 'pure-black' || activeTheme.startsWith('ps3') ? 'bg-indigo-500' : 'bg-slate-800') : 'bg-gray-400/30'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${alarm.enabled ? 'left-7' : 'left-1'}`} />
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="font-mono text-xl font-bold tracking-tight truncate">{alarm.time}</div>
                        {alarm.label && <div className="text-sm opacity-70 font-medium truncate">{alarm.label}</div>}
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteAlarm(alarm.id)}
                      className="p-2 shrink-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20 hover:text-red-500"
                      aria-label="Delete Alarm"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

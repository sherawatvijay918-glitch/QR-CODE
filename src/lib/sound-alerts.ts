// Synthesize loud and crisp audio alerts using the Web Audio API (no external file dependencies)
export type SoundType = "alarm" | "bell" | "siren" | "chime";

export function playSynthesizedSound(type: SoundType, volume: number = 1.0) {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    
    const ctx = new AudioCtx();
    const mainVolumeNode = ctx.createGain();
    mainVolumeNode.gain.setValueAtTime(volume, ctx.currentTime);
    mainVolumeNode.connect(ctx.destination);
    
    let time = ctx.currentTime;
    
    if (type === "alarm") {
      // Beep Beep Beep alert (repeating high-frequency pitch)
      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(mainVolumeNode);
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(988, time); // B5 note (high and loud)
        
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.8, time + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
        
        osc.start(time);
        osc.stop(time + 0.28);
        
        // Add a secondary sub-oscillator for dual tone thickness
        const osc2 = ctx.createOscillator();
        osc2.connect(gain);
        osc2.type = "triangle";
        osc2.frequency.setValueAtTime(1318, time); // E6 note
        osc2.start(time);
        osc2.stop(time + 0.28);
        
        time += 0.35;
      }
    } else if (type === "bell") {
      // Ding-Dong bell chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(mainVolumeNode);
      
      osc.type = "sine";
      // Ding tone (high)
      osc.frequency.setValueAtTime(880, time); // A5
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.9, time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.1, time + 0.5);
      
      // Dong tone (low)
      osc.frequency.setValueAtTime(587.33, time + 0.5); // D5
      gain.gain.linearRampToValueAtTime(0.8, time + 0.55);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 1.8);
      
      osc.start(time);
      osc.stop(time + 2.0);
    } else if (type === "siren") {
      // Sweeping frequency emergency warning alert
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(mainVolumeNode);
      
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(440, time);
      
      // Sweep sweep sweep
      osc.frequency.linearRampToValueAtTime(1000, time + 0.4);
      osc.frequency.linearRampToValueAtTime(400, time + 0.8);
      osc.frequency.linearRampToValueAtTime(1000, time + 1.2);
      osc.frequency.linearRampToValueAtTime(400, time + 1.6);
      
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.6, time + 0.1);
      gain.gain.setValueAtTime(0.6, time + 1.6);
      gain.gain.linearRampToValueAtTime(0.001, time + 2.0);
      
      osc.start(time);
      osc.stop(time + 2.0);
    } else if (type === "chime") {
      // Arpeggio chime chime
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(mainVolumeNode);
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, time + idx * 0.12);
        
        const noteStart = time + idx * 0.12;
        gain.gain.setValueAtTime(0, noteStart);
        gain.gain.linearRampToValueAtTime(0.5, noteStart + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.6);
        
        osc.start(noteStart);
        osc.stop(noteStart + 0.7);
      });
    }
  } catch (err) {
    console.error("Web Audio synthesis failed:", err);
  }
}

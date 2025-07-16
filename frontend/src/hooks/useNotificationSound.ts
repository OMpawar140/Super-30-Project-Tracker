import { useEffect, useRef } from 'react';
import { NotificationType } from '../types/notification.types';

interface UseNotificationSoundOptions {
  enabled: boolean;
  volume: number;
}

export const useNotificationSound = (options: UseNotificationSoundOptions = { enabled: true, volume: 0.5 }) => {
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (options.enabled && 'AudioContext' in window) {
      audioContextRef.current = new AudioContext();
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [options.enabled]);

  const playNotificationSound = (type: NotificationType) => {
    if (!options.enabled || !audioContextRef.current) return;

    const audioContext = audioContextRef.current;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Different tones for different notification types
    const frequencyMap: Record<NotificationType, number> = {
      [NotificationType.TASK_OVERDUE]: 800, // Higher pitch for urgent
      [NotificationType.TASK_DUE_REMINDER]: 600,
      [NotificationType.TASK_REJECTED]: 400, // Lower pitch for negative
      [NotificationType.TASK_APPROVED]: 500, // Pleasant tone for positive
      [NotificationType.TASK_REVIEW_REQUESTED]: 550,
      [NotificationType.TASK_STARTED]: 450,
      [NotificationType.PROJECT_MEMBER_ADDED]: 480,
    };

    oscillator.frequency.setValueAtTime(
      frequencyMap[type] || 500,
      audioContext.currentTime
    );

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(options.volume, audioContext.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  return { playNotificationSound };
};
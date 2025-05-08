
import React, { useEffect, useState, useRef } from "react";
import { useTaskContext } from "../contexts/TaskContext";
import { toast } from "sonner";

const ScoreDisplay: React.FC = () => {
  const { score } = useTaskContext();
  const [prevScore, setPrevScore] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element for milestone sounds
    const audio = new Audio();
    audioRef.current = audio;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  useEffect(() => {
    // Check if score has increased since last check
    if (score > prevScore) {
      // Store current score for next comparison
      setPrevScore(score);
      
      // Check if we've hit a milestone (multiple of 5)
      if (score % 5 === 0 && score > 0) {
        // Play milestone sound
        if (audioRef.current) {
          audioRef.current.src = `data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gQ29uZ3JhdHVsYXRpb25zIFNvdW5kBERJU1AAAAAoAAAAQ29uZ3JhdHVsYXRpb25zIEFjaGlldmVtZW50IFNvdW5kIEVmZmVjdABUSVQyAAAAHQAAAENvbmdyYXR1bGF0aW9ucyBTb3VuZCBFZmZlY3QAVFlFUgAAAAYAAAAyMDIwAFRTU0UAAAAPAAADTGF2ZjU5LjI3LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAiAAAc7AAYGBgYJCQkJCQwMDAwMDw8PDw8SEhISEhUVFRUVGBgYGBgbGxsbGx4eHh4eISEhISEkJCQkJCcnJycnKioqKiouLi4uLjExMTExNDQ0NDQ3Nzc3Nzk5OTk5PT09PT0AAAAAAAAAAAAAAAAAAAA//sQxAADwAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV`;
          audioRef.current.play().catch(e => console.error("Audio play failed:", e));
        }
        
        // Show toast notification
        toast.success(`${score} points reached!`, {
          description: "Keep up the great work!",
          duration: 3000
        });
      }
    }
  }, [score, prevScore]);

  return (
    <div className="bg-kanban-purple rounded-full px-4 py-1 flex items-center relative">
      <div className="text-white font-bold">
        <span className="text-sm mr-1">Score:</span>
        <span className="text-lg">{score}</span>
      </div>
    </div>
  );
};

export default ScoreDisplay;

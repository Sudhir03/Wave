import { useState, useRef } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/atoms/Button";
import { Mic, Send, Square } from "lucide-react";

export function VoiceMessageSender({ onVoiceSend }) {
  const [open, setOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaBlob, setMediaBlob] = useState(null);
  const [recorder, setRecorder] = useState(null);
  const [stream, setStream] = useState(null);
  const [duration, setDuration] = useState(0);
  const timerRef = useRef(null);

  const startRecording = async () => {
    try {
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      setStream(micStream);

      const mediaRecorder = new MediaRecorder(micStream);
      let chunks = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/mp3" });
        setMediaBlob(blob);
        chunks = [];
        clearInterval(timerRef.current);
        micStream.getTracks().forEach((track) => track.stop());
        setStream(null);
      };

      mediaRecorder.start();
      setRecorder(mediaRecorder);
      setIsRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {}
  };

  const stopRecording = () => {
    if (recorder) {
      recorder.stop();
      setIsRecording(false);
    }
  };

  const handleSend = () => {
    if (!mediaBlob) return;

    const file = new File([mediaBlob], `voice-${Date.now()}.mp3`, {
      type: "audio/mpeg",
    });

    onVoiceSend({
      id: Date.now(),
      type: "audio",
      isVoice: true,
      file,
      url: URL.createObjectURL(file),
      fileName: file.name,
      fileSize: file.size,
    });

    resetState();
  };

  const resetState = () => {
    setMediaBlob(null);
    setIsRecording(false);
    setRecorder(null);
    setDuration(0);
    clearInterval(timerRef.current);
    setOpen(false);

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handlePopoverChange = (val) => {
    setOpen(val);
    if (!val && (isRecording || mediaBlob)) {
      resetState();
    }
  };

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <Popover open={open} onOpenChange={handlePopoverChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="p-2">
          <Mic className="w-5 h-5" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-72 sm:w-80 h-52 sm:h-56 flex flex-col items-center justify-center gap-4">
        <div className="flex flex-col items-center gap-2 relative w-16 h-16 sm:w-20 sm:h-20">
          {/* Pulse background when recording */}
          {isRecording && (
            <div className="absolute inset-0 bg-red-400 opacity-50 rounded-full animate-pulse"></div>
          )}

          {/* Button by state */}
          {!isRecording && !mediaBlob && (
            <Button
              onClick={startRecording}
              className="w-full h-full rounded-full bg-blue-500 text-white flex items-center justify-center relative z-10"
            >
              <Mic className="w-8 h-8 sm:w-10 sm:h-10" />
            </Button>
          )}

          {isRecording && !mediaBlob && (
            <Button
              onClick={stopRecording}
              className="w-full h-full rounded-full bg-red-500 text-white flex items-center justify-center relative z-10"
            >
              <Square className="w-8 h-8 sm:w-10 sm:h-10" />
            </Button>
          )}

          {mediaBlob && !isRecording && (
            <Button
              onClick={handleSend}
              className="w-full h-full rounded-full bg-accent text-white flex items-center justify-center relative z-10"
            >
              <Send className="w-8 h-8 sm:w-10 sm:h-10" />
            </Button>
          )}

          {/* Duration */}
          <span className="text-base sm:text-lg font-medium text-gray-800 absolute -bottom-7 sm:bottom-[-30px]">
            {formatDuration(duration)}
          </span>
        </div>
      </PopoverContent>
    </Popover>
  );
}

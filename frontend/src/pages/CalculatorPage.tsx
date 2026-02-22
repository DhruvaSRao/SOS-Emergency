import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createSOS, fetchMySOS, uploadSOSAudio } from "../services/api";
import { History, LogOut, X } from "lucide-react";
import { useToast } from "../hooks/use-toast";

const TRIGGER_CODES = ["911", "112"];

interface SOSRecord {
  _id: string;
  dispatchId: string;
  status: "Verification Pending" | "Dispatched" | "Resolved";
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  audioUrl?: string | null;
  createdAt: string;
}

const STATUS_COLOR: Record<string, string> = {
  "Verification Pending": "#ef4444",
  Dispatched: "#f59e0b",
  Resolved: "#22c55e",
};

const STATUS_LABEL: Record<string, string> = {
  "Verification Pending": "Pending",
  Dispatched: "Dispatched",
  Resolved: "Resolved",
};

const CalculatorPage = () => {
  const { isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [display, setDisplay] = useState("0");
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [inputSequence, setInputSequence] = useState("");

  const [sosActive, setSosActive] = useState(false);
  const [sosCountdown, setSosCountdown] = useState(10);

  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<SOSRecord[]>([]);
  const [histLoading, setHistLoading] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const locationRef = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate("/login");
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    return () => {
      stopRecording();
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    navigator.geolocation?.getCurrentPosition(
      (pos) => { locationRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude }; },
      () => {},
      { enableHighAccuracy: true }
    );
    navigator.mediaDevices?.getUserMedia({ audio: true })
      .then((stream) => stream.getTracks().forEach((t) => t.stop()))
      .catch(() => {});
  }, [isAuthenticated]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream?.getTracks().forEach((t) => t.stop());
    }
    mediaRecorderRef.current = null;
  }, []);

  const startLocationWatch = useCallback(() => {
    if (!navigator.geolocation) return;
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => { locationRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude }; },
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
  }, []);

  const cancelSOS = useCallback(() => {
    setSosActive(false);
    stopRecording();
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setSosCountdown(10);
  }, [stopRecording]);

  const sendSOS = useCallback(async () => {
    try {
      const loc = locationRef.current || { lat: 0, lng: 0 };
      console.log("[SOS] Sending with location:", loc);

      // 1. Create SOS
      const res = await createSOS({ latitude: loc.lat, longitude: loc.lng });
      console.log("[SOS] createSOS response:", res.data);
      const dispatchId = res.data.dispatchId;
      console.log("[SOS] dispatchId:", dispatchId);

      if (!dispatchId) {
        console.error("[SOS] No dispatchId returned from backend!");
        setSosActive(false);
        return;
      }

      // 2. Start audio recording
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        console.log("[SOS] Audio blob size:", audioBlob.size, "bytes");
        console.log("[SOS] Uploading audio to dispatchId:", dispatchId);
        try {
          const uploadRes = await uploadSOSAudio(dispatchId, audioBlob);
          console.log("[SOS] Audio upload success:", uploadRes.data);
        } catch (err) {
          console.error("[SOS] Audio upload failed:", err);
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;

      // Record for 10 seconds then stop and upload
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          console.log("[SOS] Stopping recording after 10s");
          mediaRecorderRef.current.stop();
        }
      }, 10000);

      // Return calculator to normal after 2s
      setTimeout(() => {
        setSosActive(false);
        setSosCountdown(10);
        setDisplay("0");
        setInputSequence("");
      }, 2000);

    } catch (err) {
      console.error("[SOS] sendSOS failed:", err);
      setSosActive(false);
    }
  }, []);

  const triggerSOS = useCallback(() => {
    setSosActive(true);
    setSosCountdown(10);
    startLocationWatch();

    let count = 10;
    countdownRef.current = setInterval(() => {
      count--;
      setSosCountdown(count);
      if (count <= 0) {
        clearInterval(countdownRef.current!);
        countdownRef.current = null;
        sendSOS();
      }
    }, 1000);
  }, [startLocationWatch, sendSOS]);

  const loadHistory = async () => {
    setShowHistory(true);
    setHistLoading(true);
    try {
      const res = await fetchMySOS();
      setHistory(res.data.data as SOSRecord[]);
    } catch {
      setHistory([]);
    } finally {
      setHistLoading(false);
    }
  };

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === "0" ? digit : display.length < 12 ? display + digit : display);
    }
    setInputSequence((prev) => prev + digit);
  };

  const inputDecimal = () => {
    if (waitingForOperand) { setDisplay("0."); setWaitingForOperand(false); return; }
    if (!display.includes(".")) setDisplay(display + ".");
  };

  const performOperation = (nextOp: string) => {
    const current = parseFloat(display);
    if (prevValue !== null && operator && !waitingForOperand) {
      let result = prevValue;
      switch (operator) {
        case "+": result = prevValue + current; break;
        case "-": result = prevValue - current; break;
        case "×": result = prevValue * current; break;
        case "÷": result = current !== 0 ? prevValue / current : 0; break;
      }
      setDisplay(String(parseFloat(result.toFixed(8))));
      setPrevValue(result);
    } else {
      setPrevValue(current);
    }
    setOperator(nextOp);
    setWaitingForOperand(true);
  };

  const handleEquals = () => {
    const fullSeq = inputSequence;
    setInputSequence("");

    if (!sosActive && TRIGGER_CODES.some((code) => fullSeq.endsWith(code))) {
      triggerSOS();
      setDisplay("0");
      setPrevValue(null);
      setOperator(null);
      setWaitingForOperand(false);
      return;
    }

    if (prevValue !== null && operator) {
      const current = parseFloat(display);
      let result = prevValue;
      switch (operator) {
        case "+": result = prevValue + current; break;
        case "-": result = prevValue - current; break;
        case "×": result = prevValue * current; break;
        case "÷": result = current !== 0 ? prevValue / current : 0; break;
      }
      setDisplay(String(parseFloat(result.toFixed(8))));
      setPrevValue(null);
      setOperator(null);
      setWaitingForOperand(true);
    }
  };

  const clearAll = () => {
    setDisplay("0");
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(false);
    setInputSequence("");
    if (sosActive) cancelSOS();
  };

  const toggleSign = () => setDisplay(String(parseFloat(display) * -1));
  const inputPercent = () => setDisplay(String(parseFloat(display) / 100));

  const buttons = [
    { label: "AC", action: clearAll, style: "bg-[#a5a5a5] text-black" },
    { label: "±", action: toggleSign, style: "bg-[#a5a5a5] text-black" },
    { label: "%", action: inputPercent, style: "bg-[#a5a5a5] text-black" },
    { label: "÷", action: () => performOperation("÷"), style: "bg-orange-400 text-white" },
    { label: "7", action: () => inputDigit("7"), style: "bg-[#333] text-white" },
    { label: "8", action: () => inputDigit("8"), style: "bg-[#333] text-white" },
    { label: "9", action: () => inputDigit("9"), style: "bg-[#333] text-white" },
    { label: "×", action: () => performOperation("×"), style: "bg-orange-400 text-white" },
    { label: "4", action: () => inputDigit("4"), style: "bg-[#333] text-white" },
    { label: "5", action: () => inputDigit("5"), style: "bg-[#333] text-white" },
    { label: "6", action: () => inputDigit("6"), style: "bg-[#333] text-white" },
    { label: "-", action: () => performOperation("-"), style: "bg-orange-400 text-white" },
    { label: "1", action: () => inputDigit("1"), style: "bg-[#333] text-white" },
    { label: "2", action: () => inputDigit("2"), style: "bg-[#333] text-white" },
    { label: "3", action: () => inputDigit("3"), style: "bg-[#333] text-white" },
    { label: "+", action: () => performOperation("+"), style: "bg-orange-400 text-white" },
    { label: "0", action: () => inputDigit("0"), style: "bg-[#333] text-white col-span-2" },
    { label: ".", action: inputDecimal, style: "bg-[#333] text-white" },
    { label: "=", action: handleEquals, style: "bg-orange-400 text-white" },
  ];

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 relative">
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3">
        <span className="text-xs text-[#444] font-mono">Calculator</span>
        <div className="flex items-center gap-3">
          <button onClick={loadHistory} className="p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors text-[#444] hover:text-[#888]">
            <History className="h-4 w-4" />
          </button>
          <button onClick={() => { logout(); navigate("/"); }} className="p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors text-[#444] hover:text-[#888]">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {sosActive && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 w-48">
          <div className="h-0.5 bg-[#222] rounded-full overflow-hidden">
            <div
              className="h-full bg-red-600 transition-all duration-1000 ease-linear"
              style={{ width: `${(sosCountdown / 10) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="w-full max-w-xs">
        <div className="text-right mb-4 px-2">
          {operator && prevValue !== null && (
            <div className="text-sm text-[#888] font-mono mb-1">{prevValue} {operator}</div>
          )}
          <div
            className="font-light font-mono truncate transition-colors duration-300"
            style={{
              fontSize: display.length > 9 ? "2.5rem" : "4rem",
              lineHeight: 1.1,
              color: sosActive ? "#ef4444" : "white",
            }}
          >
            {sosActive ? sosCountdown : display}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {buttons.map((btn) => (
            <button
              key={btn.label}
              onClick={btn.action}
              className={`${btn.style} ${btn.label === "0" ? "col-span-2" : ""} h-16 rounded-2xl text-xl font-medium transition-all active:scale-95 active:brightness-75`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {showHistory && (
        <div className="fixed inset-0 bg-black/80 flex items-end justify-center z-50 p-4">
          <div className="bg-[#1c1c1e] rounded-2xl w-full max-w-xs max-h-[70vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <span className="text-white font-semibold text-sm">SOS History</span>
              <button onClick={() => setShowHistory(false)} className="text-[#888] hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {histLoading ? (
                <div className="flex items-center justify-center h-24 text-[#888] text-sm">Loading...</div>
              ) : history.length === 0 ? (
                <div className="flex items-center justify-center h-24 text-[#888] text-sm">No SOS history</div>
              ) : (
                history.map((sos) => (
                  <div key={sos._id} className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-white text-xs font-mono">{sos.dispatchId}</p>
                      <p className="text-[#888] text-[10px] mt-0.5">{new Date(sos.createdAt).toLocaleString()}</p>
                    </div>
                    <span
                      className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
                      style={{
                        color: STATUS_COLOR[sos.status],
                        borderColor: STATUS_COLOR[sos.status] + "40",
                        backgroundColor: STATUS_COLOR[sos.status] + "15",
                      }}
                    >
                      {STATUS_LABEL[sos.status]}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalculatorPage;

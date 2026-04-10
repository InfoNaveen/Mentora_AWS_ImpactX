import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { apiService, EvalResult } from "../services/api";

// ── Helpers ──────────────────────────────────────────────────────────────────
const scoreColor = (s: number) => s >= 8 ? "#10b981" : s >= 6.5 ? "#f59e0b" : "#ef4444";
const scoreLabel = (s: number) => s >= 8 ? "Excellent" : s >= 6.5 ? "Good" : "Needs Work";

function ScoreCard({ label, score, icon }: { label: string; score: number; icon: string }) {
  const pct = (score / 10) * 100;
  const color = scoreColor(score);
  return (
    <div className="glass p-5 flex flex-col gap-3 animate-fade-in">
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: color + "22", color }}>{scoreLabel(score)}</span>
      </div>
      <div>
        <div className="text-3xl font-bold font-mono" style={{ color }}>{score.toFixed(1)}</div>
        <div className="text-sm text-slate-400 mt-1">{label}</div>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function Spinner() {
  return <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />;
}

// ── Landing ──────────────────────────────────────────────────────────────────
function Landing({ onLogin, loading }: { onLogin: () => void; loading: boolean }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(124,58,237,.25) 0%, #050810 60%)" }}>
      <div className="text-center max-w-3xl animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-8" style={{ background: "rgba(139,92,246,.15)", border: "1px solid rgba(139,92,246,.3)", color: "#a78bfa" }}>
          ✦ AI Teaching Intelligence System
        </div>
        <h1 className="text-6xl font-black mb-4 leading-tight">
          <span className="gradient-text">Mentora AI</span>
        </h1>
        <p className="text-xl text-slate-400 mb-4 leading-relaxed">
          Evaluate, analyze, and improve teaching quality using<br />
          <span className="text-white font-semibold">Explainable AI + Emotion Detection + AWS</span>
        </p>
        <p className="text-sm text-slate-500 mb-10">Built by Team SOLACE · Preetam Hosamani & Hemanth Kumar</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="btn-primary text-base px-8 py-4" onClick={onLogin} disabled={loading}>
            {loading ? <><Spinner /> Connecting...</> : <><span>🚀</span> Start Evaluation</>}
          </button>
          <a href="#features" className="btn-primary text-base px-8 py-4" style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)" }}>
            <span>📊</span> See Features
          </a>
        </div>
        <div id="features" className="grid grid-cols-3 gap-4 mt-16 text-left">
          {[
            { icon: "🧠", title: "AI Coach", desc: "Personalized 'If I were the teacher...' feedback" },
            { icon: "💡", title: "Emotion Detection", desc: "Detects confident, engaging, or confusing delivery" },
            { icon: "☁️", title: "AWS Powered", desc: "S3 storage · Bedrock AI · Transcribe · Rekognition" },
          ].map((f, i) => (
            <div key={i} className="glass p-5">
              <div className="text-3xl mb-3">{f.icon}</div>
              <div className="font-semibold text-white mb-1">{f.title}</div>
              <div className="text-sm text-slate-400">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Results Dashboard ─────────────────────────────────────────────────────────
function ResultsDashboard({ result, onReset }: { result: EvalResult; onReset: () => void }) {
  const { scores, reasoning, suggestions, sentiment, ai_coach, evaluation_source } = result;
  const emotionColors: Record<string, string> = { engaging: "#10b981", confident: "#60a5fa", informative: "#a78bfa", confusing: "#ef4444", neutral: "#94a3b8" };
  const eColor = emotionColors[sentiment?.emotion_label] || "#94a3b8";

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="glass p-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Evaluation Results</h2>
          <p className="text-slate-400 text-sm mt-1">
            Source: <span className="text-purple-400 font-mono">{evaluation_source}</span> · {new Date(result.evaluated_at).toLocaleString()}
          </p>
        </div>
        <div className="text-center">
          <div className="text-5xl font-black font-mono" style={{ color: scoreColor(scores.overall_score) }}>{scores.overall_score.toFixed(1)}</div>
          <div className="text-xs text-slate-400 mt-1">Overall Score / 10</div>
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ScoreCard label="Engagement" score={scores.engagement_score} icon="🎯" />
        <ScoreCard label="Clarity" score={scores.clarity_score} icon="💡" />
        <ScoreCard label="Coverage" score={scores.concept_coverage_score} icon="📚" />
        <ScoreCard label="Pedagogy" score={scores.pedagogy_score} icon="👨‍🏫" />
      </div>

      {/* Emotion + Sentiment */}
      {sentiment && (
        <div className="glass p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-slate-400 mb-1">Emotion Detected</div>
            <div className="text-lg font-bold capitalize" style={{ color: eColor }}>
              {sentiment.emotion_label}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">Sentiment Score</div>
            <div className="text-lg font-bold text-white">{sentiment.sentiment_score}/10</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">Engagement Ratio</div>
            <div className="text-lg font-bold text-blue-400">{(sentiment.engagement_ratio * 100).toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">Question Density</div>
            <div className="text-lg font-bold text-purple-400">{sentiment.question_density}</div>
          </div>
        </div>
      )}

      {/* AI Insights */}
      <div className="glass p-6">
        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><span>🧠</span> AI Analysis</h3>
        <p className="text-slate-300 leading-relaxed">{reasoning}</p>
      </div>

      {/* AI Coach */}
      {ai_coach && (
        <div className="glass p-6" style={{ border: "1px solid rgba(139,92,246,.3)", background: "rgba(139,92,246,.05)" }}>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: "#a78bfa" }}>
            <span>🎯</span> AI Teaching Coach
          </h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl" style={{ background: "rgba(139,92,246,.1)" }}>
              <div className="text-xs font-semibold text-purple-400 mb-1">PRIMARY TIP</div>
              <p className="text-white">{ai_coach.primary_tip}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: "rgba(96,165,250,.08)" }}>
              <div className="text-xs font-semibold text-blue-400 mb-1">IF I WERE THE TEACHER...</div>
              <p className="text-slate-200">{ai_coach.if_i_were_teacher}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: "rgba(52,211,153,.08)" }}>
              <div className="text-xs font-semibold text-emerald-400 mb-1">RECOMMENDED STRATEGY</div>
              <p className="text-slate-200">{ai_coach.recommended_strategy}</p>
            </div>
            {ai_coach.emotion_advice && (
              <div className="p-4 rounded-xl" style={{ background: "rgba(245,158,11,.08)" }}>
                <div className="text-xs font-semibold text-amber-400 mb-1">EMOTION INSIGHT</div>
                <p className="text-slate-200">{ai_coach.emotion_advice}</p>
              </div>
            )}
            <div className="p-4 rounded-xl bg-white/5">
              <div className="text-xs font-semibold text-slate-400 mb-1">OVERALL COACHING</div>
              <p className="text-slate-200">{ai_coach.overall_coaching}</p>
            </div>
          </div>
        </div>
      )}

      {/* Suggestions */}
      {suggestions?.length > 0 && (
        <div className="glass p-6">
          <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><span>📈</span> Improvement Suggestions</h3>
          <ul className="space-y-2">
            {suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-300">
                <span className="text-purple-400 mt-0.5 shrink-0">→</span>{s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Priority */}
      {ai_coach?.improvement_priority && (
        <div className="glass p-6">
          <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><span>🏆</span> Improvement Priority</h3>
          <div className="flex gap-3 flex-wrap">
            {ai_coach.improvement_priority.map((p, i) => (
              <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold" style={{ background: i === 0 ? "rgba(239,68,68,.15)" : i === 1 ? "rgba(245,158,11,.15)" : "rgba(255,255,255,.06)", color: i === 0 ? "#ef4444" : i === 1 ? "#f59e0b" : "#94a3b8", border: `1px solid ${i === 0 ? "rgba(239,68,68,.3)" : i === 1 ? "rgba(245,158,11,.3)" : "rgba(255,255,255,.1)"}` }}>
                <span>{i + 1}</span> {p.charAt(0).toUpperCase() + p.slice(1)}
              </div>
            ))}
          </div>
        </div>
      )}

      <button className="btn-primary w-full justify-center py-4" onClick={onReset}>
        ← Run Another Evaluation
      </button>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function Home() {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"input" | "uploading" | "evaluating" | "done">("input");
  const [file, setFile] = useState<File | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [syllabus, setSyllabus] = useState("");
  const [objectives, setObjectives] = useState("");
  const [result, setResult] = useState<EvalResult | null>(null);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"video" | "text">("text");
  const [transcript, setTranscript] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setAuthed(apiService.isAuth()); }, []);

  const login = async () => {
    setLoading(true);
    try { await apiService.login(); setAuthed(true); } catch { setError("Login failed — is the backend running on port 8000?"); }
    setLoading(false);
  };

  const uploadFile = async (f: File) => {
    setStep("uploading");
    try {
      const r = await apiService.uploadVideo(f);
      setVideoId(r.video_id);
      setStep("input");
    } catch (e: any) {
      setError("Upload failed: " + (e?.response?.data?.detail || e.message));
      setStep("input");
    }
  };

  const runEval = async () => {
    if (!syllabus.trim()) { setError("Please enter syllabus content"); return; }
    if (mode === "video" && !videoId) { setError("Please upload a video first"); return; }
    if (mode === "text" && !transcript.trim()) { setError("Please enter transcript text"); return; }
    setError(""); setStep("evaluating");
    try {
      let r: EvalResult;
      if (mode === "video" && videoId) {
        r = await apiService.evaluate({ video_id: videoId, syllabus_text: syllabus, teaching_objectives: objectives });
      } else {
        r = await apiService.quickEvaluate(transcript, syllabus, objectives);
      }
      setResult(r); setStep("done");
    } catch (e: any) {
      setError("Evaluation failed: " + (e?.response?.data?.detail || e.message));
      setStep("input");
    }
  };

  const reset = () => { setResult(null); setStep("input"); setFile(null); setVideoId(null); setSyllabus(""); setTranscript(""); setObjectives(""); setError(""); };

  if (!authed) return (
    <>
      <Head><title>Mentora AI — Teaching Intelligence System</title></Head>
      <Landing onLogin={login} loading={loading} />
      {error && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl text-sm font-medium" style={{ background: "rgba(239,68,68,.15)", border: "1px solid rgba(239,68,68,.3)", color: "#ef4444" }}>{error}</div>}
    </>
  );

  return (
    <>
      <Head><title>Mentora AI — Teaching Intelligence System</title></Head>
      <div className="min-h-screen" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(124,58,237,.15) 0%, #050810 60%)" }}>
        {/* Nav */}
        <nav className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between" style={{ background: "rgba(5,8,16,.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black" style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}>M</div>
            <span className="font-bold text-white text-lg">Mentora AI</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(139,92,246,.15)", color: "#a78bfa" }}>v3.0</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">Team SOLACE</span>
            <button onClick={() => { apiService.logout(); setAuthed(false); }} className="text-xs text-slate-500 hover:text-white transition-colors">Logout</button>
          </div>
        </nav>

        <main className="max-w-4xl mx-auto px-4 py-10">
          {step === "done" && result ? (
            <ResultsDashboard result={result} onReset={reset} />
          ) : (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-black gradient-text mb-2">AI Teaching Evaluation</h1>
                <p className="text-slate-400">Analyze teaching quality with AI · Emotion Detection · Personalized Coaching</p>
              </div>

              {/* Mode Toggle */}
              <div className="glass p-1 flex rounded-xl w-fit mx-auto">
                {(["text","video"] as const).map(m => (
                  <button key={m} onClick={() => setMode(m)} className="px-6 py-2 rounded-lg text-sm font-semibold transition-all" style={{ background: mode === m ? "linear-gradient(135deg,#7c3aed,#4f46e5)" : "transparent", color: mode === m ? "white" : "#94a3b8" }}>
                    {m === "text" ? "📝 Paste Transcript" : "🎥 Upload Video"}
                  </button>
                ))}
              </div>

              {/* Input Panel */}
              <div className="glass p-6 space-y-5">
                {mode === "video" ? (
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Lecture Video</label>
                    <div
                      className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all"
                      style={{ borderColor: file ? "rgba(16,185,129,.5)" : "rgba(255,255,255,.1)", background: file ? "rgba(16,185,129,.05)" : "rgba(255,255,255,.02)" }}
                      onClick={() => fileRef.current?.click()}
                    >
                      <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { setFile(f); uploadFile(f); } }} />
                      {step === "uploading" ? (
                        <div className="flex flex-col items-center gap-3"><Spinner /><span className="text-slate-400 text-sm">Uploading to AWS S3...</span></div>
                      ) : file && videoId ? (
                        <div><div className="text-3xl mb-2">✅</div><div className="text-emerald-400 font-semibold">{file.name}</div><div className="text-xs text-slate-500 mt-1">Uploaded · {(file.size/1024/1024).toFixed(1)} MB</div></div>
                      ) : (
                        <div><div className="text-4xl mb-3 opacity-50">🎥</div><div className="text-slate-300 font-medium">Click to upload lecture video</div><div className="text-xs text-slate-500 mt-1">MP4, MOV, AVI · Max 100MB</div></div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Lecture Transcript</label>
                    <textarea value={transcript} onChange={e => setTranscript(e.target.value)} rows={5} placeholder="Paste the lecture transcript here... (or type a summary of what was taught)" />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Course Syllabus & Topics <span className="text-red-400">*</span></label>
                  <textarea value={syllabus} onChange={e => setSyllabus(e.target.value)} rows={5} placeholder="Paste your course syllabus, learning objectives, and key topics that should be covered..." />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Teaching Objectives <span className="text-slate-500 font-normal">(optional)</span></label>
                  <textarea value={objectives} onChange={e => setObjectives(e.target.value)} rows={2} placeholder="e.g. Students should understand recursion and be able to implement binary search..." />
                </div>

                {error && (
                  <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.2)", color: "#ef4444" }}>{error}</div>
                )}

                <button className="btn-glow" onClick={runEval} disabled={step === "evaluating" || step === "uploading"}>
                  {step === "evaluating" ? <><Spinner /> Running AI Analysis...</> : <><span>🚀</span> Run AI Evaluation</>}
                </button>
              </div>

              {/* AWS Architecture */}
              <div className="glass p-6">
                <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">AWS Architecture</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { label: "S3", desc: "Video Storage", color: "#f59e0b" },
                    { label: "→", desc: "", color: "#475569" },
                    { label: "Transcribe", desc: "Speech-to-Text", color: "#60a5fa" },
                    { label: "→", desc: "", color: "#475569" },
                    { label: "Bedrock", desc: "AI Reasoning", color: "#a78bfa" },
                    { label: "→", desc: "", color: "#475569" },
                    { label: "Rekognition", desc: "Visual Analysis", color: "#34d399" },
                  ].map((s, i) => s.label === "→" ? (
                    <span key={i} className="text-slate-600 text-xl">→</span>
                  ) : (
                    <div key={i} className="px-3 py-2 rounded-lg text-center" style={{ background: s.color + "15", border: `1px solid ${s.color}30` }}>
                      <div className="text-xs font-bold" style={{ color: s.color }}>{s.label}</div>
                      <div className="text-xs text-slate-500">{s.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

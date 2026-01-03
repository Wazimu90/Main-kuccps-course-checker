"use client"

export default function BannedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-surface/80 rounded-2xl border border-white/10 p-8 shadow-[0_0_20px_rgba(0,0,0,0.25)] backdrop-blur-xl text-center">
        <h1 className="text-2xl font-bold">Access restricted due to policy violation</h1>
        <p className="text-white mt-2">Contact support if you believe this is a mistake.</p>
      </div>
    </div>
  )
}


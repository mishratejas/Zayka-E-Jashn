// src/components/shared/LoadingScreen.jsx
export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-2xl">🍽️</div>
      </div>
      <p className="font-display text-xl text-brand-600 animate-pulse">Zayka-E-Jashn</p>
      <p className="text-sm text-gray-400 font-body">Preparing your experience...</p>
    </div>
  );
}

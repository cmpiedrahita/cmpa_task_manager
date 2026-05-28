export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-400 dark:bg-blue-600 rounded-full opacity-20 blur-3xl animate-blob" />
      <div className="absolute top-1/3 -right-40 w-80 h-80 bg-purple-400 dark:bg-purple-600 rounded-full opacity-20 blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-indigo-400 dark:bg-indigo-600 rounded-full opacity-20 blur-3xl animate-blob animation-delay-4000" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-400 dark:bg-cyan-600 rounded-full opacity-10 blur-3xl animate-blob animation-delay-3000" />
    </div>
  );
}

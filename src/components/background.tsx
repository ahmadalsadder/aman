export function Background() {
  return (
    <div className="absolute inset-0 -z-10 h-full w-full bg-background dark:hidden">
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient
            id="gradient1"
            cx="20%"
            cy="20%"
            r="50%"
            fx="10%"
            fy="10%"
          >
            <stop offset="0%" stopColor="#316ccc" stopOpacity="0.2"></stop>
            <stop
              offset="100%"
              stopColor="#316ccc"
              stopOpacity="0"
            ></stop>
          </radialGradient>
          <radialGradient
            id="gradient2"
            cx="80%"
            cy="80%"
            r="60%"
            fx="90%"
            fy="90%"
          >
            <stop offset="0%" stopColor="#8f43eb" stopOpacity="0.2"></stop>
            <stop
              offset="100%"
              stopColor="#8f43eb"
              stopOpacity="0"
            ></stop>
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#gradient1)"></rect>
        <rect width="100%" height="100%" fill="url(#gradient2)"></rect>
      </svg>
    </div>
  );
}
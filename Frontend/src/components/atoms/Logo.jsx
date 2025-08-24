export function Logo() {
  return (
    <div
      className="w-12 h-12 p-2 flex items-center justify-center rounded-sm
                 bg-accent dark:bg-background 
                 transition-colors group"
    >
      <svg
        className="w-6 h-6 transition-colors"
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g
          className="stroke-white dark:stroke-accent"
          strokeWidth="36"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M64 176 C128 128 192 128 256 176 S384 224 448 176" />
          <path d="M64 256 C128 208 192 208 256 256 S384 304 448 256" />
          <path d="M64 336 C128 288 192 288 256 336 S384 384 448 336" />
        </g>
      </svg>
    </div>
  );
}

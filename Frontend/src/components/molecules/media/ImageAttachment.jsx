export function ImageAttachment({ url, onClick, showRemaining, remaining }) {
  return (
    <div
      className="relative w-16 h-16 rounded overflow-hidden flex items-center justify-center
        bg-[theme('colors.bg')] dark:bg-[theme('colors.bg-dark')] cursor-pointer"
      onClick={onClick}
    >
      <img
        src={url}
        alt="Shared Image"
        className="w-full h-full object-cover rounded"
      />

      {showRemaining && remaining > 0 && (
        <div
          className="absolute inset-0 flex items-center justify-center rounded
            bg-muted text-muted-foreground text-sm font-medium cursor-pointer"
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}

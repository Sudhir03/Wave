export const IncomingCallActions = ({ onAccept, onDecline }) => {
  return (
    <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-40 flex gap-10">
      <button
        onClick={onAccept}
        className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full"
      >
        Accept
      </button>

      <button
        onClick={onDecline}
        className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-full"
      >
        Decline
      </button>
    </div>
  );
};

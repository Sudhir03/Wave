import { createContext, useContext } from "react";
import { useWebRTCInternal } from "./useWebRTCInternal";

const CallContext = createContext(null);

export const CallProvider = ({ children }) => {
  const call = useWebRTCInternal();

  return <CallContext.Provider value={call}>{children}</CallContext.Provider>;
};

export const useWebRTC = () => {
  const ctx = useContext(CallContext);

  if (!ctx) {
    throw new Error("useWebRTC must be used inside <CallProvider>");
  }

  return ctx;
};

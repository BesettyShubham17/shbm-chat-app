import { create } from "zustand";

interface CallState {
  isReceivingCall: boolean;
  caller: string | null;
  callerName: string | null;
  callerSignal: any | null;
  callAccepted: boolean;
  callEnded: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  
  setReceivingCall: (status: boolean, caller?: string | null, callerName?: string | null, signal?: any) => void;
  setCallAccepted: (status: boolean) => void;
  setCallEnded: (status: boolean) => void;
  setLocalStream: (stream: MediaStream | null) => void;
  setRemoteStream: (stream: MediaStream | null) => void;
  endCallState: () => void;
}

export const useCallStore = create<CallState>((set) => ({
  isReceivingCall: false,
  caller: null,
  callerName: null,
  callerSignal: null,
  callAccepted: false,
  callEnded: false,
  localStream: null,
  remoteStream: null,

  setReceivingCall: (status, caller = null, callerName = null, signal = null) => 
    set({ isReceivingCall: status, caller: caller || null, callerName: callerName || null, callerSignal: signal || null }),
    
  setCallAccepted: (status) => set({ callAccepted: status }),
  setCallEnded: (status) => set({ callEnded: status }),
  setLocalStream: (stream) => set({ localStream: stream }),
  setRemoteStream: (stream) => set({ remoteStream: stream }),
  
  endCallState: () => set({
    isReceivingCall: false,
    caller: null,
    callerName: null,
    callerSignal: null,
    callAccepted: false,
    callEnded: true,
    localStream: null,
    remoteStream: null
  }),
}));

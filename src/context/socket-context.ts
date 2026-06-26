import { createContext } from "react";

export type WsFrame<T = unknown> = {
    type: string;
    data: T;
};

export type SocketHandler<T = unknown> = (data: T) => void;

export type Ctx = {
    isConnected: boolean;
    subscribe: <T = unknown>(type: string, handler: SocketHandler<T>) => () => void;
};

export const SocketContext = createContext<Ctx | null>(null);
import React, { createContext, ReactNode } from "react";
import { ThreadedStyleConfig } from "../interfaces/style-props/ThreadedStyleConfig";

export interface ThreadedStyleConfigContextProps {
  styleConfig: ThreadedStyleConfig;
  children: ReactNode;
}

export interface ThreadedStyleConfigContextValues {
  styleConfig?: ThreadedStyleConfig;
}

export const ThreadedStyleConfigContext =
  createContext<ThreadedStyleConfigContextValues>({});

export const ThreadedStyleConfigProvider: React.FC<
  ThreadedStyleConfigContextProps
> = ({ styleConfig, children }: ThreadedStyleConfigContextProps) => {
  if (!styleConfig) throw new Error("Missing style config");

  return (
    <ThreadedStyleConfigContext.Provider value={{ styleConfig }}>
      {children}
    </ThreadedStyleConfigContext.Provider>
  );
};

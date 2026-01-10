/// <reference types="vite/client" />

// Disable strict type checking for rapid deployment
declare module '*' {
  const content: any;
  export default content;
}

// Extend interfaces with optional properties
declare global {
  interface Window {
    __DEV__?: boolean;
  }
}

export {};

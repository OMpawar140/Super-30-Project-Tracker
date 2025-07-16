/* eslint-disable @typescript-eslint/no-explicit-any */

declare module 'eventsource-polyfill' {
  interface EventSourceInit {
    withCredentials?: boolean;
    headers?: Record<string, string>;
    proxy?: string;
    https?: any;
    rejectUnauthorized?: boolean;
    heartbeatTimeout?: number;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface EventSourceErrorEvent extends Event {
    status?: number;
    message?: string;
  }

  namespace EventSourcePolyfill {
    interface EventSourceErrorEvent extends Event {
      status?: number;
      message?: string;
    }
  }

  class EventSourcePolyfill extends EventTarget {
    constructor(url: string, eventSourceInitDict?: EventSourceInit);
    
    readonly CONNECTING: 0;
    readonly OPEN: 1;
    readonly CLOSED: 2;
    readonly readyState: 0 | 1 | 2;
    readonly url: string;
    readonly withCredentials: boolean;
    
    onopen: ((this: EventSource, ev: Event) => any) | null;
    onmessage: ((this: EventSource, ev: MessageEvent) => any) | null;
    onerror: ((this: EventSource, ev: Event) => any) | null;
    
    close(): void;
  }

  export = EventSourcePolyfill;
}
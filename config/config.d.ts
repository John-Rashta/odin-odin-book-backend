import { DefaultEventsMap, type Server } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "../util/socketTypesInters";

declare global {
    namespace Express {
      interface User {
        id: string;
        username: string;
      }
    }
  }

declare global {
    namespace Express {
        interface Request {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            io?: Server<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, any>
        }
    }
}
  
  export {};
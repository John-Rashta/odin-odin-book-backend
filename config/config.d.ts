import { type Server } from "socket.io";

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
            io?: Server
        }
    }
}
  
  export {};
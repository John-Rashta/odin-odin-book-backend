/* eslint-disable @typescript-eslint/no-explicit-any */
import { type Server, type DefaultEventsMap, type Socket } from "socket.io";
import { type PrismaClient } from "../generated/prisma";

interface PayloadStuff {
    id: string,
    comments?: string
};
export function joinPost({io, socket, prisma} : 
    {
        io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
        socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
        prisma: PrismaClient

    }) {
    return async (payload: PayloadStuff, callback: (res: Response) => void) => {
        if (typeof callback !== "function") {
            return;
        };

        socket.join(`post-${payload.id}`);

        return callback({
            status: "OK",
        })
    };
}
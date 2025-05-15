import { type DefaultEventsMap, type Socket } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "../util/socketTypesInters";
import { basicSchema } from "../util/socketValidator";

export function joinPost({socket} : 
    {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        socket: Socket<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, any>,
    }) :ClientToServerEvents["post:join"] {
    return (payload, callback) => {
        if (typeof callback !== "function") {
          return;
        };
        const { error, value } = basicSchema.validate(payload);
        if (error) {
            return callback({
            error: "Invalid Payload",
            errorDetails: error.details,
            });
        };
        socket.join(`post-${value.id}`);
        if (value.comment === "yes") {
            socket.join(`post-${value.id}-comments`);
        };
        return callback({
                status: "OK",
        });
    };
};
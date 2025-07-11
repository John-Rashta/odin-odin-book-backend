import { type DefaultEventsMap, type Socket } from "socket.io";
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "../util/socketTypesInters";
import { basicSchema } from "../util/socketValidator";
import { mapErrorDetails } from "../util/socketUtil";

export function leaveUser({
  socket,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  socket: Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    DefaultEventsMap,
    any
  >;
}): ClientToServerEvents["user:leave"] {
  return async (payload, callback) => {
    if (typeof callback !== "function") {
      return;
    }
    const { error, value } = basicSchema.validate(payload);
    if (error) {
      return callback({
        error: "Invalid Payload",
        errorDetails: mapErrorDetails(error.details),
      });
    }

    socket.leave(`user:${value.id}`);
    return callback({
      status: "OK",
    });
  };
}

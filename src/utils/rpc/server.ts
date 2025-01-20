import { NextApiRequest, NextApiResponse } from "next";

import { RPCRouteHandler, RouteBody, RouteReturn, RPCError } from "./common";
import { omitUndefined } from "../js/objects";
import { unpromise } from "../js/promises";

export function wrapRPC<TBody extends RouteBody, TReturn extends RouteReturn>(
  handler: RPCRouteHandler<TBody, TReturn>
) {
  return async function NextAPIRoute(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    // Strangely the api request does not guarantee the method variable is present
    // Generally this should never occur
    if (typeof req.method !== "string") {
      return res.status(400).end("Missing request method");
    }
    if (!["GET", "POST", "PUT", "DELETE"].includes(req.method)) {
      return res.status(405).end("Method Not Allowed");
    }
    try {
      // Handlers are permitted to be synchronous
      // But 99% of the time they will be asynchronous
      const result = await unpromise(
        handler({
          body: req.body,
          query: req.query,
          req,
          res,
        })
      );

      // This is proper practice in the industry
      // Note that at runtime `void` type is treated as undefined
      // As in Javascript, all void functions actually return undefined
      // Although this gets complicated with the newer "void 0" feature and
      // how it interacts with typescript
      // TODO: do more research on this
      if (typeof result === "undefined") {
        return res.status(204).end(); // No Content
      }
      // Respond with the result as json
      // Our previous handling of undefined made it such that
      // If the code reaches this point
      // the return value will be some form of valid json
      return res.status(200).json(result);
    } catch (e) {
      // Handle the error:

      // TODO: Add additional information to the RPCError class
      // Such that we can track info such as whether the error details should be displayed in the UI
      // Or whether the error message is "User Facing" and should be displayed as a popup
      // We can also consider adding an error kind, or subclasses of RPCError for specific
      // purposes such as route argument validation
      // We can also add a feature to RPCError to identify if the error was client side or server side
      // But we can develop these features as we go along

      if (RPCError.isLike(e)) {
        const incomingIpAddress =
          req.headers["x-forwarded-for"] ??
          req.socket.remoteAddress ??
          undefined;
        const incomingUserAgent = req.headers["user-agent"] ?? undefined;
        // IIRC NextJS saves logs.
        // TODO: Switch to a logging service. Bonus if the logging service can hook into console.error
        // So we do not need to call any specialized APIs
        console.error(
          omitUndefined(
            {
              incomingIpAddress,
              incomingUserAgent,
              method: req.method,
              url: req.url,
              body: req.body,
              query: req.query,
              // We do not strip out the error stack, we want to save it for logging
              ...RPCError.fromLike(e).toRPCErrorData(false),
            },
            false,
            0
          )
        );
        // When sending the error back to the client, we strip out the stack trace
        return res
          .status(e.code ?? 500)
          .json(RPCError.fromLike(e).toRPCErrorData(true));
      } else {
        console.error(
          omitUndefined(
            {
              method: req.method,
              url: req.url,
              body: req.body,
              query: req.query,
              // We do not strip out the error stack, we want to save it for logging
              ...RPCError.fromAny(e, {
                message: "An server error occurred",
                code: 500,
              }).toRPCErrorData(false),
            },
            false,
            0
          )
        );
        // When sending the error back to the client, we strip out the stack trace
        return res.status(500).json(
          RPCError.fromAny(e, {
            message: "A server error occurred",
          }).toRPCErrorData(true)
        );
      }
    }
  };
}

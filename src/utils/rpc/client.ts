import { omitUndefined } from "../js/objects";
import { Unpromise } from "../js/promises";
import { RPCError, RouteBody, RouteReturn } from "./common";

export interface RouteClientOptions {
  url: string | (() => string);
  method: "GET" | "PUT" | "POST" | "DELETE";
  timeoutSeconds?: number | undefined;
}

export type RouteClient<
  TBody extends RouteBody,
  TReturn extends RouteReturn
> = (tbody: TBody) => Promise<Unpromise<TReturn>>;

/**
 *
 * Creates a reusable RPC client for a particular route
 *
 * @param url
 * @param body
 */
export function createRouteClient<
  TBody extends RouteBody,
  TReturn extends RouteReturn
>({
  url,
  method = "POST",
  timeoutSeconds = undefined,
}: RouteClientOptions): RouteClient<TBody, TReturn> {
  return async function route(body: TBody): Promise<Unpromise<TReturn>> {
    const urlThisCall = typeof url === "function" ? url() : url;
    const options: RequestInit = omitUndefined(
      {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
        timeout: timeoutSeconds ? timeoutSeconds * 1000 : undefined,
      },
      false,
      0
    );
    try {
      console.log("Calling:", urlThisCall, options);
      const response = await fetch(urlThisCall, options);
      const responseText = await response.text();
      console.log(response.status, responseText);
      if (!response.ok) {
        if (response.status === 404) {
          throw new RPCError(`url not found: ${urlThisCall}`, 404, {
            responseText,
          });
        }
        try {
          // Valid JSON
          const parsedResponse = JSON.parse(responseText);
          if (RPCError.isLike(parsedResponse)) {
            throw RPCError.fromLike(parsedResponse);
          } else {
            throw RPCError.fromAny(parsedResponse, {
              code: response.status,
            });
          }
        } catch (e) {
          throw RPCError.fromAny(e, {});
        }
      } else {
        return JSON.parse(responseText) as Unpromise<TReturn>;
      }
    } catch (error) {
      if (error instanceof RPCError) {
        throw error;
      }
      if (RPCError.isLike(error)) {
        throw RPCError.fromLike(error);
      }
      throw RPCError.fromAny(error, {});
    }
  };
}

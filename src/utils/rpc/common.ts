import { NextApiRequest, NextApiResponse } from "next";
import { omitUndefined } from "../js/objects";

/**
 * Represents the plain data contained in any instance of the RPCError class.
 * Useful when defining how RPCError data can be serialized and deserialized.
 * Useful for determining how to handle caught errors in server and client code.
 */
export interface RPCErrorData<TData> {
  name: "RPCError";
  message: string;
  stack?: string;
  code?: number;
  data?: TData;
}

/**
 * A more robust error handling class for RPC calls.
 */
export class RPCError<TData> extends Error {
  public name: "RPCError";
  public message: string;
  public stack?: string;
  public code?: number;
  public data?: TData;
  constructor(message: string, code?: number, data?: TData) {
    super(message);
    this.message = message;
    this.code = code;
    this.data = data;
    this.name = "RPCError";
  }
  static isLike<TData>(
    obj: unknown
  ): obj is RPCError<TData> | RPCErrorData<TData> {
    return (
      typeof obj === "object" &&
      obj !== null &&
      "name" in obj &&
      "message" in obj &&
      obj.name === "RPCError" &&
      (typeof (obj as Partial<RPCErrorData<TData>>).stack === "undefined" ||
        typeof (obj as Partial<RPCErrorData<TData>>).stack === "string")
    );
  }
  static is<TData>(obj: unknown): obj is RPCError<TData> {
    return obj instanceof RPCError;
  }
  static fromRPCError<TData>(err: RPCErrorData<TData>): RPCError<TData> {
    const result = new RPCError<TData>(err.message, err.code, err.data);
    if (err.stack) {
      result.stack = err.stack;
    }
    return result;
  }
  static fromRPCErrorData<TData>(
    errData: RPCErrorData<TData>
  ): RPCError<TData> {
    const result = new RPCError<TData>(
      errData.message,
      errData.code,
      errData.data
    );
    if (errData.stack) {
      result.stack = errData.stack;
    }
    return result;
  }
  static fromLike<TData>(
    errLike: RPCErrorData<TData> | RPCError<TData>
  ): RPCError<TData> {
    return errLike instanceof RPCError
      ? RPCError.fromRPCError<TData>(errLike as RPCError<TData>)
      : RPCError.fromRPCErrorData<TData>(errLike);
  }
  static fromError<TData>(
    e: Error,
    {
      code,
      data,
    }: {
      code?: number;
      data?: TData;
    }
  ) {
    const result = new RPCError<TData>(e.message, code, data);
    if (e.stack) {
      result.stack = e.stack;
    }
    return result;
  }
  static fromAny<TData>(
    d: TData,
    {
      message,
      code,
    }: {
      message?: string;
      code?: number;
    }
  ) {
    if (d instanceof Error) {
      const ret = RPCError.fromError(d, {
        code,
      });
      if (typeof message === "string") {
        ret.message = message;
      }
      return ret;
    }
    return new RPCError<TData>(message ?? "Unknown Error", code, d);
  }
  toRPCErrorData(omitStack: boolean = false): RPCErrorData<TData> {
    return omitUndefined(
      {
        name: this.name,
        message: this.message,
        code: this.code,
        data: this.data,
        stack: omitStack ? undefined : this.stack,
      },
      false,
      0
    );
  }
}

export type JSONDataPrimitive = string | number | boolean | null;
export type JSONData =
  | JSONDataPrimitive
  | Array<JSONData>
  | { [key: string]: JSONData };

export type RouteBody = JSONData | void | undefined;
export type RouteReturn =
  | JSONData
  | void
  | undefined
  | Promise<JSONData | void | undefined>;

export type RPCRouteHandler<
  TBody extends RouteBody,
  TReturn extends RouteReturn
> = ({
  body,
  query,
  req,
  res,
}: {
  body?: TBody;
  query: NextApiRequest["query"];
  req: NextApiRequest;
  res: NextApiResponse;
}) => TReturn | Promise<TReturn>;

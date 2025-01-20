import { wrapRPC } from "@/utils/rpc/server";

import { TBody, TReturn } from "@/api-types/hello";

export default wrapRPC<TBody, TReturn>(async ({}) => {
  return "Hello, World!";
});

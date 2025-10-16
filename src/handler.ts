import serverless from "serverless-http";
import app from "./app";
// Lambda handler export
export const handler = serverless(app);
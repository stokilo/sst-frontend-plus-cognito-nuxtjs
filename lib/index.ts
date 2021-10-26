import ApiAndAuthStack from "./ApiAndAuthStack";
import * as sst from "@serverless-stack/resources";

export default function main(app: sst.App): void {
  app.setDefaultFunctionProps({
    runtime: "nodejs14.x"
  });

  new ApiAndAuthStack(app, "ApiAndAuthStack");
}

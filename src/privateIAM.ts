import { APIGatewayProxyEventV2, APIGatewayProxyHandlerV2 } from "aws-lambda";

export const handler: APIGatewayProxyHandlerV2 = async (
  event: APIGatewayProxyEventV2
) => {

  console.info('------------ private IAM -------')
  console.log(event)

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/plain" },
    body: `Your request was received at ${event.requestContext.time}.`,
  };
};

import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// DynamoDB table
const dynamoTable = new aws.dynamodb.Table("my-table", {
  attributes: [
    {
      name: "id",
      type: "S",
    },
  ],
  hashKey: "id",
  readCapacity: 2,
  writeCapacity: 2,
});

// Lambda function
const lambdaRole = new aws.iam.Role("lambdaRole", {
    assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [
            {
                Action: "sts:AssumeRole",
                Effect: "Allow",
                Principal: {
                    Service: "lambda.amazonaws.com",
                },
            },
        ],
    }),
});

const lambdaPolicy = new aws.iam.RolePolicy("lambdaPolicy", {
    role: lambdaRole.id,
    policy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [
            {
                Action: [
                    "dynamodb:GetItem",
                    "dynamodb:PutItem",
                ],
                Effect: "Allow",
                Resource: dynamoTable.arn,
            },
        ],
    }),
});

const lambdaFunction = new aws.lambda.Function("my-lambda", {
  role: lambdaRole.arn,
  handler: "index.handler",
  runtime: aws.lambda.Runtime.NodeJS12dX,
  code: new pulumi.asset.AssetArchive({
    "index.js": new pulumi.asset.StringAsset(`
exports.handler = async function (event, context) {
  console.log('Event: ' + JSON.stringify(event, null, 2));
  return {
    statusCode: 200,
    headers: {},
    body: "Hello world!",
  };
};
`),
  }),
});

// API Gateway
const api = new aws.apigateway.RestApi("my-api", {
  description: "API with Lambda and DynamoDB integration",
});

const integration = new aws.apigateway.Integration("api-integration", {
  resourceId: api.rootResourceId,
  restApi: api,
  httpMethod: "ANY",
  type: "AWS_PROXY",
  uri: lambdaFunction.invokeArn,
});

const rootResource = new aws.apigateway.Resource("rootResource", {
  restApi: api,
  parentId: api.rootResourceId,
  pathPart: "{proxy+}",
});

const method = new aws.apigateway.Method("rootMethod", {
  restApi: api,
  resourceId: rootResource.id,
  httpMethod: "ANY",
  authorization: "NONE",
});

// Lambda integration with API Gateway
const integrationResponse = new aws.apigateway.IntegrationResponse("api-integration-response", {
  restApi: api,
  resourceId: rootResource.id,
  httpMethod: method.httpMethod,
  statusCode: "200",
});

const methodResponse = new aws.apigateway.MethodResponse("api-method-response", {
  restApi: api,
  resourceId: rootResource.id,
  httpMethod: method.httpMethod,
  statusCode: "200",
});

const deployment = new aws.apigateway.Deployment("api-deployment", {
  restApi: api,
  stageName: "prod",
}, { dependsOn: [methodResponse, integrationResponse] });

export const apiUrl = deployment.invokeUrl;
export const tableName = dynamoTable.name;
export const lambdaArn = lambdaFunction.arn;

# Serverless plugin Swagger API
Create severless function events from `swagger` definition.

## Install
`npm i -D serverless-plugin-swagger-api`

## Usage:
### serverless.yml

Add Swagge file to custom.swaggerApi.swagger

```yaml
custom:
  swaggerApi:
    swagger: ${file(swagger.yml)}

functions:
  ExampleLambda:
    handler: src/example.js
```

### swagger.yml

Add `x-attr-serverless` to your swagger path definition

```yaml
swagger: "2.0"
schemes:
- "https"
info:
  description: "Serverless Plugin Swagger API test yml"
  version: "1.0.0"
  title: "Serverless Plugin Swagger API"
paths:
  /hello:
    get:
      produces:
      - "application/json"
      responses:
        200:
          description: "200 response"
          schema:
            $ref: "#/definitions/Empty"
      x-attr-serverless:
        functionName: ExampleLambda # LambdaFunction in serverless.yml
        cors: true # Turn on CORS for this endpoint, but don't forget to return the right header in your response
        private: true # Requires clients to add API keys values in the `x-api-key` header of their request
        authorizer: # An AWS API Gateway custom authorizer function
          name: authorizerFunc # The name of the authorizer function (must be in this service)
          arn: xxx:xxx:Lambda-Name # Can be used instead of name to reference a function outside of service
          resultTtlInSeconds: 0
          identitySource: method.request.header.Authorization
          identityValidationExpression: someRegex
          type: token # token or request. Determines input to the authorier function, called with the auth token or the entire request event. Defaults to token
definitions:
  Empty:
    type: "object"
    title: "Empty Schema"
```

## Contributing
PR's are welcome! :)

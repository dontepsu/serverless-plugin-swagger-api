import { omit } from 'lodash';

const PLUGIN_CONFIG_ATTRIBUTE_KEY = 'x-attr-serverless';

export type HTTPMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';

// https://serverless.com/framework/docs/providers/aws/guide/serverless.yml/
export interface HandlerEvent {
  http: BaseEventConfig & {
    path: string;
    method: HTTPMethod;
  };
}

export interface BaseEventConfig {
  cors?: boolean;
  private?: boolean;
  authorizer?: {
    name?: string;
    arn?: string;
    resultTtlInSeconds?: number;
    identitySource?: string;
    identityValidationExpression?: string | RegExp;
    type?: string;
  };
}

export interface SwaggerFile {
  paths: Record<string, Record<HTTPMethod, SwaggerPath>>;
}

export interface SwaggerPath {
  produces: string[];
  responses: Record<number, {
    description: string;
    schema: {
      $ref: string;
    }
  }>;
  'x-attr-serverless': BaseEventConfig & {
    functionName: string;
  };
}

export const mapSwaggerFileToFunctionEvents = (swagger: SwaggerFile, log = console.log): Record<string, HandlerEvent[]> => {
  const paths = swagger.paths;
  if (!paths) {
    log('WARNING: Swaggerfile is missing property: `paths`');

    return {};
  }

  return Object.keys(paths).reduce((handlers, path) => {
    const routes = paths[path];

    Object.keys(routes).forEach((method: HTTPMethod) => {
      const route = routes[method];
      const serverless = route[PLUGIN_CONFIG_ATTRIBUTE_KEY];
      // if has serverless definition, let's add the events
      if (serverless) {
        if (!serverless.functionName) {
          return log(`Warning: Missing functionName: '[${method}]: ${path}'`);
        }
        if (!handlers[serverless.functionName]) {
          handlers[serverless.functionName] = [];
        }

        handlers[serverless.functionName].push({
          http: {
            method,
            path,
            ...omit(serverless, 'functionName'),
          },
        });
      }
    });

    return handlers;
  }, {});
};

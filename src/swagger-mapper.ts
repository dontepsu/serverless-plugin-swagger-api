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

export type SecurityDefinition = {
  'x-attr-arn'?: string;
  'x-attr-name'?: string;
};
export interface SwaggerFile {
  paths: Record<string, Record<HTTPMethod, SwaggerPath>>;
  securityDefinitions: Record<string, SecurityDefinition>;
}

export interface SwaggerPath {
  security?: Record<string, any>[];
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
  const securityDefinitions = swagger.securityDefinitions || {};

  const getSecurityDefinition = (name: string): any => {
    const def = securityDefinitions[name] || {};
    if (def['x-attr-name']) {
      return {
        name: def['x-attr-name'],
      };
    } else if (def['x-attr-arn']) {
      return {
        arn: def['x-attr-arn'],
      };
    }
  };

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

        const params = {} as any;

        if (Array.isArray(route.security) && route.security[0]) {
          for (let key in route.security[0]) {
            const def = getSecurityDefinition(key);
            if (def) {
              params.authorizer = def;
              break;
            }
          }
        }

        handlers[serverless.functionName].push({
          http: {
            method,
            path,
            ...params,
            ...omit(serverless, 'functionName'),
          },
        });
      }
    });

    return handlers;
  }, {});
};

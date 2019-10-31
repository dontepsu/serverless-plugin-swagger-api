import * as yaml from 'js-yaml';
import * as fs from 'fs';
import { mapSwaggerFileToFunctionEvents, HandlerEvent } from './swagger-mapper';

const loadTestSwagger = (): any => {
  const doc = yaml.safeLoad(fs.readFileSync('./data/test-swagger.yml', 'utf8'));
  return doc;
};

test('should map swagger to serverless events', () => {
  const swagger = loadTestSwagger();
  const handlerEvents = mapSwaggerFileToFunctionEvents(swagger);
  expect(handlerEvents.HelloLambda).toEqual([
    {
      http: {
        path: '/hello',
        method: 'get',
      },
    },
    {
      http: {
        path: '/hello/{name}',
        method: 'get',
      },
    },
  ] as HandlerEvent[]);

  expect(handlerEvents.RestLambda).toEqual([
    {
      http: {
        path: '/rest/cars',
        method: 'get',
        cors: true,
        authorizer: {
          arn: 'arn:to-resource',
        },
      },
    },
    {
      http: {
        path: '/rest/cars',
        method: 'post',
        cors: true,
        authorizer: {
          arn: 'arn:to-resource',
        },
      },
    },
    {
      http: {
        path: '/rest/cars/{id}',
        method: 'get',
        cors: true,
        authorizer: {
          arn: 'arn:to-resource',
        },
      },
    },
    {
      http: {
        path: '/rest/cars/{id}',
        method: 'put',
        cors: true,
        authorizer: {
          arn: 'arn:to-resource',
        },
      },
    },
    {
      http: {
        path: '/rest/cars/{id}',
        method: 'delete',
        cors: true,
        authorizer: {
          arn: 'arn:to-resource',
        },
      },
    },
    {
      http: {
        path: '/rest/cars/{id}',
        method: 'patch',
        cors: true,
        authorizer: {
          arn: 'arn:to-resource',
        },
      },
    },
  ] as HandlerEvent[]);
});

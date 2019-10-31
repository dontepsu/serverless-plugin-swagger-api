import { mapSwaggerFileToFunctionEvents } from './swagger-mapper';
import { get } from 'lodash';
import Serverless from 'serverless';

const HookEvents = [
  'before:offline:start',
  'before:run:run',
  'before:package:createDeploymentArtifacts',
  'before:deploy:function:packageFunction',
  'before:invoke:local:invoke',
];

const PLUGIN_CONFIG_ROOT_PATH = 'service.custom.swaggerApi';

export default class ServerlessPlugin {
  hooks: Record<string, Function>;

  constructor (private serverless: Serverless, public options) {
    this.hooks = HookEvents.reduce((h, k) => {
      h[k] = this.addRoutes.bind(this);
      return h;
    }, {});
  }

  addRoutes () {
    const swaggerFile = get(this.serverless, PLUGIN_CONFIG_ROOT_PATH + '.swagger');
    if (!swaggerFile) {
      throw new Error('No swagger file found! Add swagger file to `custom.swaggerApi.swagger`');
    }
    const handlerEvents = mapSwaggerFileToFunctionEvents(swaggerFile);

    Object.keys(handlerEvents).forEach(lambdaName => {
      (this.serverless.service as any).functions[lambdaName].events = handlerEvents[lambdaName];
    });
  }
}

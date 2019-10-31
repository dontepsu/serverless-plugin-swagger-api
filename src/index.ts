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

class ServerlessPlugin {
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
      this.serverless.cli.log('WARNING: No swagger file found! Add swagger file to `custom.swaggerApi.swagger`');
      return;
    }
    const handlerEvents = mapSwaggerFileToFunctionEvents(swaggerFile);

    Object.keys(handlerEvents).forEach(lambdaName => {
      try {
        (this.serverless.service as any).functions[lambdaName].events = handlerEvents[lambdaName];
      } catch (e) {
        this.serverless.cli.log(`WARNING: No such lambda: '${lambdaName}'`);
      }
    });
  }
}

export = ServerlessPlugin;

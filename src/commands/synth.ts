import { App } from 'aws-cdk-lib';
import { parse } from 'yaml';
import * as fs from 'fs-extra';
import { createTransformer } from '../transformer/transformer-factory';
import { envNamePositional, AmplifyCommandBase } from './command-components';
import { ConstructMap, ProjectConfig, projectConfig } from '../manifest/ir-definition';
import { createOption } from '@commander-js/extra-typings';
import path from 'path';
import { buildResult } from '../manifest/amplify-builder-base';

class SynthCommand extends AmplifyCommandBase {
  constructor() {
    super();
    this.name('synth')
      .description("Synthesize the deployment artifacts for an Amplify project but don't deploy them")
      .addArgument(envNamePositional)
      .addOption(createOption('--from-declarative', 'If true, project definition will be read from manifest.amplify.yml instead of amplify.ts'))
      .action(this.handler);
  }

  private handler = async (envName: string, { fromDeclarative }: { fromDeclarative?: boolean }) => {
    const config = fromDeclarative ? await declarativeConfigLoader() : await imperativeConfigLoader();

    const amplifyTransform = await createTransformer(envName, config.constructMap);

    const app = new App({ outdir: 'cdk.out' });
    // the AmplifyTransform operates on a CDK app created externally
    // this means it can seamlessly be plugged into an existing CDK app
    amplifyTransform.transform(app);
    app.synth();
  };
}

const declarativeConfigLoader = async (): Promise<ProjectConfig> => {
  return projectConfig.parse(parse(await fs.readFile('manifest.amplify.yml', 'utf8')));
};

const imperativeConfigLoader = async (): Promise<ProjectConfig> => {
  let constructMap: ConstructMap = {};
  const def = (await import(path.resolve(process.cwd(), 'amplify.js'))) as Record<string, unknown>;
  Object.entries(def).forEach(([constructName, constructBuilder]) => {
    const builder = getConstructBuilderFunction(constructName, constructBuilder);
    const result = buildResult.parse(builder());
    constructMap[constructName] = result.config;
    Object.entries(result.inlineConstructs).forEach(([name, config]) => {
      constructMap[name] = config;
    });
  });
  return {
    constructMap,
  };
};

const getConstructBuilderFunction = (constructName: string, constructBuilder: unknown): Function => {
  if (typeof constructBuilder !== 'object') {
    throw new Error(`${constructName} is not an object`);
  }
  if (constructBuilder === null) {
    throw new Error(`${constructName} is null`);
  }
  if (!('_build' in constructBuilder)) {
    throw new Error(`${constructName} does not have a _build member`);
  }
  if (typeof constructBuilder._build !== 'function') {
    throw new Error(`${constructName} _build member is not a function`);
  }
  return constructBuilder._build;
};

export const getCommand = () => new SynthCommand();

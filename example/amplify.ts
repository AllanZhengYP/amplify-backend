import { Auth } from '@aws-amplify/construct-auth';
import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import type { Construct } from 'constructs';

/**
 * Build is an exported method that will be invoked by the samsara system to orchestrate an Amplify app.
 * Build receives a construct that can be passed to Amplify's L3 constructs.
 * @param ctx A context that can be passed to Amplify constructs.
 */
export const build = (ctx: Construct) => {
  new Auth(ctx as any, 'myAuthId', {
    loginMechanisms: ['email'],
  });
};

function main() {
  const app = new App();
  const stack = new Stack(app, 'my-stack');

  build(stack);
  const template = Template.fromStack(stack);
  console.log(template.toJSON());
}
main();

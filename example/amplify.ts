import { Auth } from '@aws-amplify/construct-auth';
import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { Construct } from 'constructs';

/**
 * Build builds
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
  // console.log(JSON.stringify(template.toJSON(), null, 2));
  console.log(template.toJSON());
}
main();

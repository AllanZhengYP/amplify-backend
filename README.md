## Getting Started

1. Run `npm install && npm run install:local`

This will build the project and link the vnext CLI so it is available at `vnext`

Run `npm run test` to execute the test suite

## Adding a package

This repo uses a monorepo structure using npm workspaces. To add a new package to the monorepo, you'll need to

1. Create a new folder under `packages`
2. Create a `package.json` and `tsconfig.json` file within the new folder. The `tsconfig.json` should probably be the same as other packages in the repo. The package.json should be similar to existing packages as well.
3. Add the workspace folder to the `workspaces` list in the root `package.json` in topological build order

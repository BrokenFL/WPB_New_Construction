import { spawnSync } from "node:child_process";

const defaultDeployCommand = "npx wrangler pages deploy dist --project-name wpbnewconstruction";
const deployCommand = process.env.LIVE_DEPLOY_COMMAND?.trim() || defaultDeployCommand;

console.log(`Publishing live site with: ${deployCommand}`);

const result = spawnSync(deployCommand, {
  cwd: process.cwd(),
  env: process.env,
  shell: true,
  stdio: "inherit",
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);

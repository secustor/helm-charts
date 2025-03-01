import * as fs from "node:fs/promises";
import * as process from "node:process";
import * as path from "node:path";
import { execSync } from "node:child_process";

const CR_RELEASE_PACKAGE_PATH = ".cr-release-packages";

interface Archive {
  path: string;
  fileName: string;
}

export async function main(rawArgs: string[]) {
  // remove file path node and script name
  const args = rawArgs.slice(2);
  const archives = await getChangedChartsArchives(args);

  console.log("Pushing charts");
  for (const archive of archives) {
    const cmd = `helm push "${archive.path}" "oci://ghcr.io/${process.env.GITHUB_REPOSITORY}"`;
    console.log(cmd);
    console.log(execSync(cmd).toString());
  }
}

export async function getChangedChartsArchives(
  args: string[],
): Promise<Archive[]> {
  const chartArchives = await getChartArchives();
  const tags = getGitTags();

  // translate chart names to chart archives
  const changedChartArchives: Archive[] = [];
  for (const [, value] of Object.entries(chartArchives)) {
    if (tags.includes(value.fileName)) {
      // the chart has already pushed
      console.log(
        `Skipping ${value.path}. Tag ${value.fileName} already exists`,
      );
      continue;
    }
    changedChartArchives.push(value);
  }
  return changedChartArchives;
}

async function getChartArchives(): Promise<Record<string, Archive>> {
  const archiveList = await fs.readdir(CR_RELEASE_PACKAGE_PATH, {
    withFileTypes: true,
  });
  const chartNames: Record<string, Archive> = {};
  for (const dirent of archiveList) {
    if (dirent.isFile() && dirent.name.endsWith(".tgz")) {
      const parsed = /^(?<name>[\w-]+?)-\d/.exec(dirent.name);
      // immich --> .cr-release-packages/immich-1.0.0.tgz
      chartNames[parsed.groups.name] = {
        path: path.join(CR_RELEASE_PACKAGE_PATH, dirent.name),
        fileName: path.parse(dirent.name).name,
      };
    }
  }
  return chartNames;
}

export function getGitTags(): string[] {
  const result = execSync("git tag");
  const tagString = result.toString();
  return tagString.split("\n");
}

// do not run main if this script is being tested
if (!process.env.VITEST_WORKER_ID) {
  main(process.argv);
}

import * as fs from "node:fs/promises";
import * as process from "node:process";
import * as path from "node:path";
import { exec } from "node:child_process";

const CR_RELEASE_PACKAGE_PATH = ".cr-release-packages";

export async function main(rawArgs: string[]) {
  // remove file path node and script name
  const args = rawArgs.slice(2);
  const archives = await getChangedChartsArchives(args);

  console.log("Pushing charts:");
  for (const archive of archives) {
    console.log(`- ${archive}`);
    exec(
      `helm push "${archive}" "oci://ghcr.io/${process.env.GITHUB_REPOSITORY}"`,
    );
  }
}

export async function getChangedChartsArchives(
  args: string[],
): Promise<string[]> {
  if (args.length === 0) {
    console.log("Usage: push-charts <chart-list>");
    process.exit(1);
  }

  const changedCharts = parseChartList(args[0]);
  const chartArchives = await getChartArchives();

  // translate chart names to chart archives
  const changedChartArchives: string[] = [];
  for (const chart of changedCharts) {
    if (chartArchives[chart]) {
      const archive = chartArchives[chart];
      changedChartArchives.push(archive);
    }
  }
  return changedChartArchives;
}

function parseChartList(chartListArg: string): string[] {
  const parsed: string[] = [];
  for (const chartPath of chartListArg.split(",")) {
    const name = path.parse(chartPath).name;
    parsed.push(name);
  }
  return parsed;
}

async function getChartArchives(): Promise<Record<string, string>> {
  const archiveList = await fs.readdir(CR_RELEASE_PACKAGE_PATH, {
    withFileTypes: true,
  });
  const chartNames: Record<string, string> = {};
  for (const dirent of archiveList) {
    if (dirent.isFile() && dirent.name.endsWith(".tgz")) {
      const parsed = /^(?<name>[\w-]+?)-\d/.exec(dirent.name);
      // immich --> .cr-release-packages/immich-1.0.0.tgz
      chartNames[parsed.groups.name] = path.join(
        CR_RELEASE_PACKAGE_PATH,
        dirent.name,
      );
    }
  }
  return chartNames;
}

// do not run main if this script is being tested
if (!process.env.VITEST_WORKER_ID) {
  main(process.argv);
}

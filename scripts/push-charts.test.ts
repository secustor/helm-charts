import { describe, assert, expect, test, vi, beforeEach } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import { getChangedChartsArchives, main } from "./push-charts.ts";
import { Dirent } from "node:fs";

vi.mock("node:fs/promises");
import * as _fs from "node:fs/promises";
const fs = vi.mocked(_fs);

vi.mock("node:child_process");
import * as _child_process from "node:child_process";
import { exec } from "child_process";
const child_process = vi.mocked(_child_process);

process.env.GITHUB_REPOSITORY = "lore/ipsum";

describe("push-charts", () => {
  const myChartDirentMock = mockDeep<Dirent>();
  myChartDirentMock.name = "my-chart-1.0.0.tgz";

  const fooChartDirentMock = mockDeep<Dirent>();
  fooChartDirentMock.name = "foo-2.0.0.tgz";

  beforeEach(() => {
    vi.resetAllMocks();

    myChartDirentMock.isFile.mockReturnValue(true);
    fooChartDirentMock.isFile.mockReturnValue(true);
  });

  describe("main", () => {
    test("should push single chart", async () => {
      fs.readdir.mockResolvedValue([myChartDirentMock]);
      // mock `git tag` to return empty string
      child_process.execSync.mockReturnValue(Buffer.from(""));
      await main(["node", "push-chart.ts", "charts/my-chart"]);
      expect(child_process.execSync).toHaveBeenNthCalledWith(
        2,
        `helm push ".cr-release-packages/my-chart-1.0.0.tgz" "oci://ghcr.io/lore/ipsum"`,
      );
    });

    test("should push multiple charts", async () => {
      fs.readdir.mockResolvedValue([myChartDirentMock, fooChartDirentMock]);
      child_process.execSync.mockReturnValue(Buffer.from(""));

      await main(["node", "push-chart.ts", "charts/my-chart,charts/foo"]);
      expect(child_process.execSync).toHaveBeenNthCalledWith(
        2,
        `helm push ".cr-release-packages/my-chart-1.0.0.tgz" "oci://ghcr.io/lore/ipsum"`,
      );
      expect(child_process.execSync).toHaveBeenNthCalledWith(
        3,
        `helm push ".cr-release-packages/foo-2.0.0.tgz" "oci://ghcr.io/lore/ipsum"`,
      );
    });
  });

  describe("getChangedCharts", () => {
    test("should return changed chart if only one exists", async () => {
      fs.readdir.mockResolvedValue([myChartDirentMock]);
      child_process.execSync.mockReturnValue(Buffer.from(""));
      await expect(getChangedChartsArchives(["my-chart"])).resolves.toEqual([
        {
          path: ".cr-release-packages/my-chart-1.0.0.tgz",
          fileName: "my-chart-1.0.0",
        },
      ]);
    });

    test("should return multiple", async () => {
      fs.readdir.mockResolvedValue([fooChartDirentMock, myChartDirentMock]);
      child_process.execSync.mockReturnValue(Buffer.from(""));
      await expect(getChangedChartsArchives(["foo"])).resolves.toEqual([
        {
          path: ".cr-release-packages/foo-2.0.0.tgz",
          fileName: "foo-2.0.0",
        },
        {
          path: ".cr-release-packages/my-chart-1.0.0.tgz",
          fileName: "my-chart-1.0.0",
        },
      ]);
    });

    test("should return multiple changed charts if multiple exists and changed", async () => {
      fs.readdir.mockResolvedValue([fooChartDirentMock, myChartDirentMock]);
      child_process.execSync.mockReturnValue(Buffer.from(""));
      await expect(getChangedChartsArchives(["my-chart,foo"])).resolves.toEqual(
        [
          {
            path: ".cr-release-packages/foo-2.0.0.tgz",
            fileName: "foo-2.0.0",
          },
          {
            path: ".cr-release-packages/my-chart-1.0.0.tgz",
            fileName: "my-chart-1.0.0",
          },
        ],
      );
    });

    test("should skip already existing image", async () => {
      fs.readdir.mockResolvedValue([fooChartDirentMock, myChartDirentMock]);
      child_process.execSync.mockReturnValue(Buffer.from("my-chart-1.0.0\n"));
      await expect(getChangedChartsArchives(["my-chart,foo"])).resolves.toEqual(
        [
          {
            path: ".cr-release-packages/foo-2.0.0.tgz",
            fileName: "foo-2.0.0",
          },
        ],
      );
    });
  });
});

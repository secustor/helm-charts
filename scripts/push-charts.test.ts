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
      await main(["node", "push-chart.ts", "my-chart"]);
      expect(child_process.exec).toHaveBeenCalledWith(
        `helm push ".cr-release-packages/my-chart-1.0.0.tgz" "oci://ghcr.io/lore/ipsum"`,
      );
    });

    test("should push multiple charts", async () => {
      fs.readdir.mockResolvedValue([myChartDirentMock, fooChartDirentMock]);
      await main(["node", "push-chart.ts", "my-chart,foo"]);
      expect(child_process.exec).toHaveBeenNthCalledWith(
        1,
        `helm push ".cr-release-packages/my-chart-1.0.0.tgz" "oci://ghcr.io/lore/ipsum"`,
      );
      expect(child_process.exec).toHaveBeenNthCalledWith(
        2,
        `helm push ".cr-release-packages/foo-2.0.0.tgz" "oci://ghcr.io/lore/ipsum"`,
      );
    });
  });

  describe("getChangedCharts", () => {
    test("should return changed chart if only one exists", async () => {
      fs.readdir.mockResolvedValue([myChartDirentMock]);
      await expect(getChangedChartsArchives(["my-chart"])).resolves.toEqual([
        ".cr-release-packages/my-chart-1.0.0.tgz",
      ]);
    });

    test("should return changed chart if multiple exists", async () => {
      fs.readdir.mockResolvedValue([fooChartDirentMock, myChartDirentMock]);
      await expect(getChangedChartsArchives(["foo"])).resolves.toEqual([
        ".cr-release-packages/foo-2.0.0.tgz",
      ]);
    });

    test("should return multiple changed charts if multiple exists and changed", async () => {
      fs.readdir.mockResolvedValue([fooChartDirentMock, myChartDirentMock]);
      await expect(getChangedChartsArchives(["my-chart,foo"])).resolves.toEqual(
        [
          ".cr-release-packages/my-chart-1.0.0.tgz",
          ".cr-release-packages/foo-2.0.0.tgz",
        ],
      );
    });
  });
});

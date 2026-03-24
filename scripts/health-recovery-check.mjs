import process from "node:process";

async function fetchRuns({ token, repo, workflowFile }) {
  const url = new URL(
    `https://api.github.com/repos/${repo}/actions/workflows/${workflowFile}/runs`,
  );
  url.searchParams.set("per_page", "40");

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "undangan-hbh-health-monitor",
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Gagal mengambil workflow runs (${response.status}): ${text}`,
    );
  }

  return response.json();
}

async function main() {
  const token = String(process.env.GITHUB_TOKEN || "").trim();
  const repo = String(process.env.GITHUB_REPOSITORY || "").trim();
  const workflowFile = String(
    process.env.HEALTH_WORKFLOW_FILE || "health-monitor.yml",
  ).trim();
  const currentRunId = Number(process.env.GITHUB_RUN_ID || "0");

  if (!token || !repo) {
    throw new Error("GITHUB_TOKEN atau GITHUB_REPOSITORY tidak tersedia.");
  }

  const payload = await fetchRuns({ token, repo, workflowFile });
  const runs = Array.isArray(payload.workflow_runs)
    ? payload.workflow_runs
    : [];
  const completedRuns = runs
    .filter((run) => run.id !== currentRunId && run.status === "completed")
    .sort((a, b) => b.run_number - a.run_number);

  const previous = completedRuns[0];
  if (!previous || previous.conclusion !== "failure") {
    console.log("health_recovered=false");
    const outputPath = process.env.GITHUB_OUTPUT;
    if (outputPath) {
      const { appendFile } = await import("node:fs/promises");
      await appendFile(outputPath, "recovered=false\nstreak=0\n", "utf8");
    }
    return;
  }

  let streak = 1;
  for (let i = 1; i < completedRuns.length; i += 1) {
    const run = completedRuns[i];
    if (run.conclusion === "failure") {
      streak += 1;
      continue;
    }
    break;
  }

  console.log(`health_recovered=true (recovered from ${streak} failure runs)`);

  const outputPath = process.env.GITHUB_OUTPUT;
  if (outputPath) {
    const { appendFile } = await import("node:fs/promises");
    await appendFile(outputPath, `recovered=true\nstreak=${streak}\n`, "utf8");
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});

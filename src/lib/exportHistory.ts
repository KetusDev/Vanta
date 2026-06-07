import type { MetricsHistory } from "../types/metrics";

function downloadTextFile(filename: string, contents: string, mime: string) {
  const blob = new Blob([contents], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function exportHistoryCsv(history: MetricsHistory) {
  const length = Math.max(
    history.cpu.length,
    history.ram.length,
    history.disk.length,
    history.download.length,
    history.upload.length,
  );

  const lines = ["second,cpu_pct,ram_pct,disk_pct,download_kbps,upload_kbps"];

  for (let index = 0; index < length; index += 1) {
    lines.push(
      [
        index + 1,
        history.cpu[index] ?? "",
        history.ram[index] ?? "",
        history.disk[index] ?? "",
        history.download[index] ?? "",
        history.upload[index] ?? "",
      ].join(","),
    );
  }

  downloadTextFile(
    `vanta-history-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.csv`,
    lines.join("\n"),
    "text/csv;charset=utf-8",
  );
}

export function exportHistoryJson(history: MetricsHistory) {
  downloadTextFile(
    `vanta-history-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.json`,
    JSON.stringify(history, null, 2),
    "application/json;charset=utf-8",
  );
}

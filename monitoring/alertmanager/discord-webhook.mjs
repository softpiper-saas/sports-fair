import http from "node:http";

const webhookUrl = process.env.DISCORD_ALERT_WEBHOOK_URL;
const username = process.env.DISCORD_ALERT_USERNAME || "Sportsfair Alerts";
const avatarUrl = process.env.DISCORD_ALERT_AVATAR_URL || undefined;
const port = Number(process.env.PORT || 8080);

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        request.destroy();
        reject(new Error("Payload too large"));
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function alertColor(status, severity) {
  if (status === "resolved") return 0x2ecc71;
  if (severity === "critical") return 0xe74c3c;
  return 0xf1c40f;
}

function truncate(value, maxLength) {
  if (!value) return "";
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}...` : value;
}

function formatAlert(alert) {
  const labels = alert.labels || {};
  const annotations = alert.annotations || {};
  const status = alert.status || "firing";
  const severity = labels.severity || "warning";
  const startsAt = alert.startsAt ? new Date(alert.startsAt).toISOString() : undefined;
  const endsAt = alert.endsAt && alert.endsAt !== "0001-01-01T00:00:00Z" ? new Date(alert.endsAt).toISOString() : undefined;

  return {
    title: truncate(`${status.toUpperCase()}: ${labels.alertname || "Sportsfair alert"}`, 256),
    description: truncate(annotations.description || annotations.summary || "No description provided.", 2048),
    color: alertColor(status, severity),
    fields: [
      { name: "Severity", value: severity, inline: true },
      labels.instance ? { name: "Instance", value: truncate(labels.instance, 256), inline: true } : null,
      labels.job ? { name: "Job", value: truncate(labels.job, 256), inline: true } : null,
      startsAt ? { name: "Started", value: startsAt, inline: false } : null,
      endsAt ? { name: "Resolved", value: endsAt, inline: false } : null
    ].filter(Boolean),
    timestamp: new Date().toISOString()
  };
}

async function postToDiscord(payload) {
  if (!webhookUrl) throw new Error("DISCORD_ALERT_WEBHOOK_URL is not set");

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Discord webhook failed with ${response.status}: ${text}`);
  }
}

const server = http.createServer(async (request, response) => {
  if (request.method === "GET" && request.url === "/health") {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ status: "ok" }));
    return;
  }

  if (request.method !== "POST" || request.url !== "/alertmanager") {
    response.writeHead(404);
    response.end("not found");
    return;
  }

  try {
    const body = await readBody(request);
    const alertmanagerPayload = JSON.parse(body);
    const alerts = Array.isArray(alertmanagerPayload.alerts) ? alertmanagerPayload.alerts : [];
    const embeds = alerts.slice(0, 10).map(formatAlert);
    const overflowCount = Math.max(alerts.length - embeds.length, 0);
    const status = alertmanagerPayload.status || "firing";
    const groupLabels = alertmanagerPayload.groupLabels || {};
    const alertName = groupLabels.alertname || "";

    await postToDiscord({
      username,
      avatar_url: avatarUrl,
      content: overflowCount > 0
        ? `Sportsfair ${status} alert group ${alertName} (${overflowCount} more alerts omitted)`
        : `Sportsfair ${status} alert group ${alertName}`.trim(),
      embeds
    });

    response.writeHead(202, { "content-type": "application/json" });
    response.end(JSON.stringify({ status: "accepted", alerts: alerts.length }));
  } catch (error) {
    console.error(error);
    response.writeHead(500, { "content-type": "application/json" });
    response.end(JSON.stringify({ status: "error", message: error instanceof Error ? error.message : "Unknown error" }));
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Discord alert bridge listening on ${port}`);
});

import express from "express";

const app = express();
const PORT = process.env.PORT || 8080;
const UA = "sneed-contribution-3d/1.0 (github.com/AgileIndustrialComplex/sneed)";

app.use(express.static("public"));

// Fetch a user's contribution data for the last ~53 weeks directly from the
// public GitHub profile page (no API token required). The contribution
// calendar HTML is well-structured: each day carries data-count and
// data-date attributes.
async function fetchContributions(username) {
  const res = await fetch(`https://github.com/users/${encodeURIComponent(username)}/contributions`, {
    headers: { "User-Agent": UA, Accept: "text/html" },
  });
  if (!res.ok) {
    if (res.status === 404) throw new HttpError(404, `GitHub user "${username}" not found`);
    throw new HttpError(res.status, `GitHub returned ${res.status}`);
  }
  const html = await res.text();

  // GitHub's calendar structure: each day is a <td class="ContributionCalendar-day">
  // carrying data-date/data-level + an id, and the exact count lives in a sibling
  // <tool-tip for="<that id>"> containing "N contributions on …" (or "No contributions").
  const countMap = new Map();
  const tipRe = /<tool-tip[^>]*for="([^"]+)"[^>]*>([\s\S]*?)<\/tool-tip>/g;
  let tm;
  while ((tm = tipRe.exec(html))) {
    const text = tm[2].replace(/<[^>]+>/g, "").trim();
    const mm = text.match(/(\d+)\s+contribution/);
    countMap.set(tm[1], mm ? parseInt(mm[1], 10) : 0);
  }

  const days = [];
  const dayRe = /<td[^>]*class="[^"]*ContributionCalendar-day[^>]*>/g;
  let dm;
  while ((dm = dayRe.exec(html))) {
    const td = dm[0];
    const date = (td.match(/data-date="([^"]+)"/) || [])[1];
    const id = (td.match(/id="([^"]+)"/) || [])[1];
    if (!date) continue;
    let count = id ? countMap.get(id) : undefined;
    if (count == null) {
      const level = parseInt((td.match(/data-level="(\d+)"/) || [])[1] || "0", 10);
      count = level;
    }
    days.push({ date, count });
  }
  if (days.length === 0) {
    // Brand-new/empty profile or an unexpected page shape: return a friendly empty result
    return { user: username, days: [], max: 0 };
  }
  const max = Math.max(...days.map((d) => d.count), 0);
  return { user: username, days, max };
}

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

app.get("/api/three/:username", async (req, res) => {
  const user = (req.params.username || "").trim();
  if (!/^[a-zA-Z0-9-]{1,39}$/.test(user)) {
    return res.status(400).json({ error: "Invalid GitHub username" });
  }
  try {
    const data = await fetchContributions(user);
    res.set("Cache-Control", "public, max-age=300");
    res.json(data);
  } catch (e) {
    const status = e.status && e.status < 600 ? e.status : 500;
    res.status(status).json({ error: e.message || "Failed to fetch contributions" });
  }
});

app.use((req, res) => res.status(404).json({ error: "Not found" }));

app.listen(PORT, () => {
  console.log(`sneed 3D contribution graph listening on http://localhost:${PORT}`);
});
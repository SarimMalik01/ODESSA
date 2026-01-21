import fetch from "node-fetch";

export async function isRepoPublic(repoUrl) {
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);

  if (!match) {
    throw new Error("Invalid GitHub repository URL");
  }

  const [, owner, repo] = match;
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;

  const res = await fetch(apiUrl, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "odessa-backend"
    }
  });

  if (res.status === 200) return true;
  if ([401, 403, 404].includes(res.status)) return false;

  throw new Error(`Unexpected GitHub response: ${res.status}`);
}

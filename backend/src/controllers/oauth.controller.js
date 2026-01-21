import fetch from "node-fetch";
import OAuthToken from "../models/oauthToken.db.js";
import { encrypt } from "../utils/crypto.js";
import { resumePrivateScan } from "../services/resumePrivateScan.js";

export const startGithubOAuth = async (req, res) => {
  const { repoUrl, projectName } = req.query;
   console.log(" req : ",req.userId);
  req.session.oauthContext = { repoUrl, projectName ,userId:req.userId};

  const redirectUri = `${process.env.BACKEND_URL}/auth/github/callback`;

  const githubAuthUrl =
    `https://github.com/login/oauth/authorize` +
    `?client_id=${process.env.GITHUB_CLIENT_ID}` +
    `&redirect_uri=${redirectUri}` +
    `&scope=repo`;

  res.redirect(githubAuthUrl);
};

export const githubCallback = async (req, res) => {
    try {
      const { code } = req.query;
  
      // ✅ READ EVERYTHING FROM SESSION
      const oauthContext = req.session.oauthContext;
  
      if (!oauthContext) {
        return res.status(400).json({ message: "OAuth context missing" });
      }
  
      const { repoUrl, projectName, userId } = oauthContext;
  
      if (!userId) {
        return res.status(400).json({ message: "User not found in session" });
      }
  
      // 1️⃣ Exchange code → access token
      const tokenRes = await fetch(
        "https://github.com/login/oauth/access_token",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code,
          }),
        }
      );
  
      const { access_token } = await tokenRes.json();
  
      if (!access_token) {
        return res.status(500).json({ message: "OAuth failed" });
      }
  
      // 2️⃣ Store encrypted token
      const tokenDoc = await OAuthToken.create({
        userId, // ✅ NOW DEFINED
        provider: "github",
        encryptedToken: encrypt(access_token),
      });
  
      // 3️⃣ Resume scan
      await resumePrivateScan({
        userId, // ✅ NOW DEFINED
        repoUrl,
        projectName,
        tokenReference: tokenDoc._id.toString(),
      });
  
      // 4️⃣ Cleanup session (important)
      delete req.session.oauthContext;
  
      // 5️⃣ Redirect user
      res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  
    } catch (err) {
      console.error("GitHub OAuth callback error:", err);
      res.status(500).json({ message: "OAuth callback failed" });
    }
  };
  
import * as p from "@clack/prompts";
import path from "path";
import fs from "fs";

export async function dockerEnv() {
  const websiteEnvFilePath = path.resolve(
    process.cwd(),
    "../website/.env.docker"
  );

  if (fs.existsSync(websiteEnvFilePath)) {
    // p.log.success("Environment files already setup");
    // await new Promise<void>((res) => setTimeout(res, 500));
    // return;
    const answer = await p.confirm({
      message:
        "Environment file already exists at website/.env.docker\nDo you want to use it?",
      initialValue: true,
    });

    if (typeof answer !== "boolean") {
      p.log.error("You must select Yes or No");
      process.exit(0);
    }

    if (answer === true) {
      p.log.success("Environment file setup");
      return;
    }

    fs.rmSync(websiteEnvFilePath);
  }

  await new Promise<void>((res) => setTimeout(res, 1000));
  p.note(
    `This is needed for logging in on the website. You must create a GitHub OAuth app on your GitHub account.
You can do this by visiting this link:

https://github.com/settings/applications/new

1. Enter values for the parameters:
Application name          = AI Studybuddy
Homepage URL              = http://localhost:3000
Application description   = The worlds best AI studying assistant
Authorization calback URL = http://localhost:3000/api/auth/callback/github

2. Press "Register application"
3. Paste the Client ID value below. It should be 20 characters long and look similar to '58eb52a9c123100d54d4i'.`,
    // 4. Click the "Generate a new client secret" button and copy the generated value. It should be 40 characters long.
    // Enter the client id and client secret below.`,
    "GitHub OAuth"
  );

  const githubId = await p.text({
    message: "GitHub OAuth client id:",
    // placeholder: "********************",
    validate(value) {
      if (value.length < 10 && value.length > 30) {
        return "GitHub id must be between 10 and 30 characters long!";
      }

      return undefined;
    },
  });

  if (typeof githubId !== "string") {
    p.log.error("Invalid GitHub ID");
    process.exit(1);
  }

  await new Promise<void>((res) => setTimeout(res, 1000));

  p.note(
    `4. Click the "Generate a new client secret" button and paste the generated value below. It should be 40 characters long.`,
    "GitHub OAuth"
  );

  const githubSecret = await p.password({
    message: "GitHub OAuth secret key:",
    validate(value) {
      if (value.length < 20 && value.length > 50) {
        return "GitHub id must be between 20 and 50 characters long!";
      }

      return undefined;
    },
  });

  if (typeof githubSecret !== "string") {
    p.log.error("Invalid GitHub secret");
    process.exit(1);
  }

  const templateFilePath = path.resolve(
    process.cwd(),
    "../website/.env.docker.template"
  );
  fs.copyFileSync(templateFilePath, websiteEnvFilePath);
  let data = fs.readFileSync(websiteEnvFilePath, { encoding: "utf-8" });
  data = data.replace("********************", githubId);
  data = data.replace("****************************************", githubSecret);
  fs.writeFileSync(websiteEnvFilePath, data);
  p.log.info(".env.docker file made");

  p.log.success(`Environment files created!`);
}

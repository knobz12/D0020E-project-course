import * as p from "@clack/prompts";
import {
  getModelFilePathFromFolder,
  llmFileExists,
  printLogo,
  sleep,
} from "./utils";
import { LLM_FILE_PATH, MODEL_FOLDER_PATH } from "./constants";
import {
  selectModelUrl as selectModelUrl,
  downloadModelUrl,
} from "./steps/models";
import { dockerEnv } from "./steps/envs";
import fs from "fs";
import path from "path";

async function main() {
  printLogo();
  p.intro("Service setup");

  p.log.info("Download LLM model");
  p.log.message(
    `Select which model to download and later use to run the AI server.`
  );

  const exists = await llmFileExists(MODEL_FOLDER_PATH);

  if (exists) {
    p.log.warn(
      `You already have a model downloaded at: ${getModelFilePathFromFolder(
        MODEL_FOLDER_PATH
      )}`
    );

    const useExisting = await p.confirm({
      message: `Do you want to use this file?`,
      initialValue: true,
    });

    if (p.isCancel(useExisting) || typeof useExisting !== "boolean") {
      p.log.error("You must select Yes or No");
      process.exit(0);
    }

    if (useExisting === false) {
      const renameFile = await p.confirm({
        message: `Do you want to rename the old file?`,
        initialValue: true,
      });

      if (typeof renameFile !== "boolean") {
        p.log.error("You must select Yes or No");
        process.exit(0);
      }

      const filename = await p.text({
        message: `What do you want to call this file?`,
      });

      if (typeof filename !== "string") {
        p.log.error("You must select Yes or No");
        process.exit(0);
      }

      const newfilepath = path.join(MODEL_FOLDER_PATH, `/${filename}`);
      console.log(`Renaming file to ${newfilepath}`);

      if (renameFile) {
        fs.renameSync(
          LLM_FILE_PATH,
          path.join(MODEL_FOLDER_PATH, `/${filename}`)
        );
      }

      const url = await selectModelUrl();
      await downloadModelUrl(url);
    } else {
      p.log.success("Using already existing model");
    }
  } else {
    const url = await selectModelUrl();
    await downloadModelUrl(url);
  }

  p.log.info("Docker environent files");
  await dockerEnv();

  p.outro(
    "Setup finished! You should now be ready to run the service with Docker."
  );
  await sleep(1000);

  console.log("\n\n");

  p.intro("What's next");
  p.note(
    `To start the AI Studybuddy service you can now run:

docker compose -f ./docker-compose.local.yml up -d --build

From the root of the repository folder.`,
    "How to run the service"
  );

  await new Promise<void>((res) => setTimeout(res, 2000));

  p.note(
    `If you run into any issues or have questions you can contact us at:

info@aistudybuddy.se`,
    "Contact"
  );
}

main();

import got from "got";
import {
  confirm,
  intro,
  outro,
  select,
  spinner,
  text,
  log as log,
} from "@clack/prompts";
import fs, { createWriteStream, write } from "fs";
import path from "path";
import { stdout } from "process";
import { pipeline } from "stream/promises";

async function main() {
  intro("setup-ai-studybuddy");

  log.step("Download LLM model");
  const options = [
    { value: "Z7B", label: "zephyr-7b-beta" },
    { value: "Z3B", label: "stablelm-zephyr-3b" },
    { value: "L7B", label: "llama-2-7b-chat" },
    { value: "L13B", label: "llama-2-13b-chat" },
  ];
  const model_version = await select({
    message: "Choose a model to download:",
    options,
  });
  const val = model_version as "Z7B" | "Z3B" | "L7B" | "L13B";

  const models: Partial<Record<typeof val, any>> = {
    Z7B: [
      {
        value:
          "https://huggingface.co/TheBloke/zephyr-7B-beta-GGUF/resolve/main/zephyr-7b-beta.Q2_K.gguf",
        label: "zephyr-7b-beta.Q2",
      },
      {
        value:
          "https://huggingface.co/TheBloke/zephyr-7B-beta-GGUF/resolve/main/zephyr-7b-beta.Q3_K_M.gguf",
        label: "zephyr-7b-beta.Q3",
      },
      {
        value:
          "https://huggingface.co/TheBloke/zephyr-7B-beta-GGUF/resolve/main/zephyr-7b-beta.Q4_K_M.gguf",
        label: "zephyr-7b-beta.Q4",
      },
      {
        value:
          "https://huggingface.co/TheBloke/zephyr-7B-beta-GGUF/resolve/main/zephyr-7b-beta.Q5_K_M.gguf",
        label: "zephyr-7b-beta.Q5",
      },
      {
        value:
          "https://huggingface.co/TheBloke/zephyr-7B-beta-GGUF/resolve/main/zephyr-7b-beta.Q6_K.gguf",
        label: "zephyr-7b-beta.Q6",
      },
      {
        value:
          "https://huggingface.co/TheBloke/zephyr-7B-beta-GGUF/resolve/main/zephyr-7b-beta.Q8_0.gguf",
        label: "zephyr-7b-beta.Q8",
      },
    ],
  };

  const model_quantization = await select({
    message: "Pick a project type.",
    options: models[val],
  });
  const modelUrl = model_quantization as string;

  const modelFolderPath = path.resolve(process.cwd(), "../backend/models");
  const exists = await llmExists(modelFolderPath);

  async function download() {
    const s = spinner();
    s.start("Downloading model...");
    await downloadLlmToFolder(modelUrl, modelFolderPath, s);
    s.stop("Finished");
    log.success("Model downloaded!");
  }

  if (exists) {
    const answer = await confirm({
      message: `You already have a model at: ${getModelPathFromFolder(
        modelFolderPath
      )}\nDo you want to download and override?`,
      initialValue: false,
    });

    if (answer === true) {
      await download();
    } else {
      log.success("Using already existing model");
    }
  } else {
    await download();
  }

  log.step(".env.docker");
  await dockerEnv();

  outro(
    "Setup finished! You should now be ready to run the service with Docker."
  );
}

async function dockerEnv() {
  const dockerEnvFilePath = path.resolve(
    process.cwd(),
    "../website/.env.docker"
  );

  if (fs.existsSync(dockerEnvFilePath)) {
    log.success("Already exists");
    return;
  }

  const githubId = await text({
    message: "GitHub OAuth client id:",
    placeholder: "********************",
    validate(value) {
      if (value.length < 10 && value.length > 30) {
        return "GitHub id must be between 10 and 30 characters long!";
      }

      return undefined;
    },
  });

  if (typeof githubId !== "string") {
    log.error("Invalid GitHub ID");
    process.exit(1);
  }

  const githubSecret = await text({
    message: "GitHub OAuth secret key:",
    placeholder: "****************************************",
    validate(value) {
      if (value.length < 20 && value.length > 50) {
        return "GitHub id must be between 20 and 50 characters long!";
      }

      return undefined;
    },
  });

  if (typeof githubSecret !== "string") {
    log.error("Invalid GitHub secret");
    process.exit(1);
  }

  const templateFilePath = path.resolve(
    process.cwd(),
    "../website/.env.docker.template"
  );
  fs.copyFileSync(templateFilePath, dockerEnvFilePath);
  let data = fs.readFileSync(dockerEnvFilePath, { encoding: "utf-8" });
  data = data.replace("********************", githubId);
  data = data.replace("****************************************", githubSecret);
  fs.writeFileSync(dockerEnvFilePath, data);

  log.success(`.env.docker created! ${githubId} ${githubSecret}`);
}

function getModelPathFromFolder(folderPath: string) {
  return path.resolve(folderPath, "./llm.gguf");
}

async function llmExists(folderPath: string) {
  return fs.existsSync(getModelPathFromFolder(folderPath));
}

async function downloadLlmToFolder(
  url: string,
  folderPath: string,
  s: {
    start: (msg?: string | undefined) => void;
    stop: (msg?: string | undefined, code?: number | undefined) => void;
    message: (msg?: string | undefined) => void;
  }
) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }

  const filepath = path.resolve(folderPath, "./llm.gguf");
  // console.log("DOWLOADING TO PATH:", filepath);
  // console.log("STARTING DOWNLOAD OF:", url);
  await new Promise<void>(async (res) => {
    const writeStream = createWriteStream(filepath);
    await pipeline(
      got
        .stream(url, { encoding: "binary" })
        .on("downloadProgress", (progress) => {
          // console.log(progress.perce);
          s.message(
            `Progress: ${humanFileSize(progress.transferred)}/${humanFileSize(
              progress.total ?? 0
            )} (${(progress.percent * 100).toFixed(1)}%)`
          );
        }),
      writeStream
    );
    res();
  });
}

function humanFileSize(bytes: number, si = false, dp = 1) {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + " B";
  }

  const units = si
    ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh &&
    u < units.length - 1
  );

  return bytes.toFixed(dp) + " " + units[u];
}

main();

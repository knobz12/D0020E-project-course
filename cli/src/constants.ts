import path from "path";

export const MODEL_FOLDER_PATH = path.resolve(
  process.cwd(),
  "../backend/models"
);

export const LLM_FILE_PATH = path.join(MODEL_FOLDER_PATH, "/llm.gguf");

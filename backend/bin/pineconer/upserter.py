"""
For upserting documents to the chroma vector database used by other files

# Improvements:
* Turn into executable
* Argument for dataset path
* Add fitting metadata fields such as: upload datetime
"""

import pathlib
from datasets import load_dataset
from chromadb import Collection

def upsert_data(collection: Collection) -> None:
    dataset_file_path = pathlib.Path("./result-D7032E-good-data.jsonl")
    print("Loading dataset...")
    data = load_dataset("json", data_files=str(dataset_file_path.resolve()),split="train")
    print("Loaded dataset:")
    print(data)

    ids: list[str] = []
    for i in range(0, min(len(data), 200)):
        print(f"Upserting doc {i}")
        obj = data[i]
        ident = obj["id"] + str(obj["chunk-id"])
        ids.append(ident)
        id = str(obj["id"])
        text = str(obj["text"])
        chunkId = str(obj["chunk-id"])

        course = str(obj["course"])
        collection.upsert([ident],metadatas={'id':id,'chunk-id':chunkId, 'course':course,'text': text},documents=[text])
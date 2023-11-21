import os
import pathlib
from torch import cuda
from langchain.embeddings.huggingface import HuggingFaceEmbeddings
from langchain.vectorstores import Pinecone
import pinecone

pinecone_api_key = os.environ["PINECONE_API_KEY"]
index_name = os.environ["PINECONE_INDEX_NAME"]
pinecone_environment='gcp-starter'
os.path

# Folder to read .jsonl's from (assuming program is run pineconer folder)
resultPath = pathlib.Path("./files").resolve()
print("Path:", resultPath)

def create_embed():
    embed_model_id = 'sentence-transformers/all-MiniLM-L6-v2'
    device = f'cuda:{cuda.current_device()}' if cuda.is_available() else 'cpu'
    return HuggingFaceEmbeddings(
        model_name=embed_model_id,
        model_kwargs={'device': device},
        encode_kwargs={'device': device, 'batch_size': 32}
    )


def create_index():
    pinecone.init(
        api_key=pinecone_api_key,
        environment=pinecone_environment
    )

    return pinecone.Index(index_name)

def create_vectorstore(index: pinecone.index, embed_model: HuggingFaceEmbeddings):
    vectorstore = Pinecone(
        index, embed_model, "text"
    )
    return vectorstore

def get_chunk_filepaths() -> list[pathlib.Path]:
    """Gets list of chunk files, only ending with .jsonl from the 'resultPath' folder"""
    filesPaths = os.listdir(resultPath)

    resolvedPaths = []
    for filepath in filesPaths:
        if not filepath.endswith(".jsonl"):
            continue
        realpath = pathlib.Path(resultPath, filepath)
        resolvedPaths.append(realpath)

    return resolvedPaths

def upsert_chunk_file(filepath: pathlib.Path, index: pinecone.Index, embed_model: HuggingFaceEmbeddings, batch_size: int):
    """Upserts the chunk to the index database"""
    assert batch_size > 0, "Batch size must be greater than 0"
    assert batch_size < 300, "Batch size must be less than 300"

    print(f"Upserting chunks from: {filepath.resolve()}")
    from datasets import load_dataset
    # data = load_dataset("json",data_files=filepath.resolve(), split="train")
    data = load_dataset("json",data_files="C:\\dev\\projects\\python\\D0020E-project-course\\bin\\pineconer\\files\\chunks.jsonl", split="train").to_pandas()

    for i in range(0, len(data), batch_size):
        i_end = min(len(data), i+batch_size)
        batch = data.iloc[i:i_end]
        # ids = [f"{x['id']}-{x['chunkIdx']}" for _, x in batch.iterrows()]
        ids = [f"{x['id']}-{x['chunk-id']}" for _, x in batch.iterrows()]
        texts = [x['chunk'] for _, x in batch.iterrows()]
        embeds = embed_model.embed_documents(texts)
        # get metadata to store in Pinecone
        metadata = [
            {
                'text': x['chunk'],
                # 'courseId': x["courseId"],
            } for _, x in batch.iterrows()
        ]
        # add to Pinecone
        # index.upsert(vectors=zip(ids, embeds, metadata))
        print("Upserting:",ids)


if __name__ == "__main__":
    # The amount of documents to upsert at the same time
    BATCH_SIZE = 32
    index = create_index()
    embed_model = create_embed()
    # vectorstore = create_vectorstore(index, embed_model)
    paths = get_chunk_filepaths()
    for path in paths:
        upsert_chunk_file(path, index, embed_model, BATCH_SIZE)

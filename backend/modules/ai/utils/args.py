from argparse import ArgumentParser
import pathlib
import os
from dataclasses import dataclass

args = None

from typing import Any

@dataclass
class Args:
    prod: Any | None
    model_path: str
    gpu_layers: int
    db_host: str
    chroma_host: str


def init_args():
    global args
    if args != None:
        print("ERROR can not initalize args multiple times")
        exit(1)

    parser = ArgumentParser()
    parser.add_argument("--model-path", required=True, help="The path to the llama-cpp supported LLM model")
    parser.add_argument("--gpu-layers", type=int, default=0, help="The amount of GPU layers to use: Default 0")
    parser.add_argument("--ctx-size", type=int, default=2048, help="The size of the LLM context to use. Default: 2048")
    parser.add_argument("--temperature", type=float, default=1.1, help="LLM temperature setting. Default: 1.1")
    parser.add_argument("--max-tokens", type=int, default=512, help="LLM temperature setting. Default: 512")
    parser.add_argument("--verbose", type=bool, default=True, help="Whether to print LLM verbose information. Default: true")
    parser.add_argument("--db-host", required=False, help="The hostname where the database is listening.", default="localhost")
    parser.add_argument("--chroma-host", required=False, help="The hostname where the database is listening.", default="localhost")
    parser.add_argument("--prod", required=False, help="If the server should be run using a production ready WSGI server.")
    args = parser.parse_args()

    path = args.model_path
    model_path = str(pathlib.Path(path).resolve())
    exists = os.path.exists(model_path)
    if not exists:
        raise FileNotFoundError("Model does not exist at path: "+ model_path)


    print(f"--model-path = {args.model_path}")
    print(f"--gpu-layers = {args.gpu_layers}")
    print(f"--prod = {args.prod}")

def get_args() -> Args:
    return args 
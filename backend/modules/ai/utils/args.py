from argparse import ArgumentParser
import pathlib
import os
from dataclasses import dataclass





args = None



@dataclass
class Args:
    model_path: str
    gpu_layers: int


def init_args():
    global args
    if args != None:
        print("ERROR can not initalize args multiple times")
        exit(1)

    parser = ArgumentParser()
    parser.add_argument("--model-path", required=True, help="The path to the llama-cpp supported LLM model")
    parser.add_argument("--gpu-layers", type=int, default=0, help="The amount of GPU layers to use")
    args = parser.parse_args()


    gpu_layers: int = args.gpu_layers
    path = args.model_path
    model_path = str(pathlib.Path(path).resolve())
    exists = os.path.exists(model_path)
    if not exists:
        raise FileNotFoundError("Model does not exist at path: "+ model_path)


    print(f"--model-path = {args.model_path}")
    print(f"--gpu-layers = {args.gpu_layers}")

def get_args() -> Args:
    return args 
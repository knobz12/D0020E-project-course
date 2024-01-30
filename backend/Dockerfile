FROM nvidia/cuda:12.3.1-runtime-ubuntu22.04

RUN apt update
RUN apt-get install software-properties-common -y
RUN add-apt-repository ppa:deadsnakes/ppa -y
RUN apt update

# To stop it from asking about timezone
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get install python3.11 python3.11-venv curl -y
RUN apt-get install gcc build-essential sqlite3 -y

RUN curl -sS https://bootstrap.pypa.io/get-pip.py | python3.11
RUN apt-get install python3.11-dev libev-dev -y

COPY requirements-no-torch.txt .
RUN python3.11 -m pip install -r requirements-no-torch.txt --ignore-installed

RUN python3.11 -m pip install torch

RUN python3.11 -m pip install pysqlite3-binary

RUN python3.11 -m pip install bjoern

RUN apt-get install git nvidia-cuda-toolkit -y
RUN PATH=/usr/local/cuda/bin:$PATH
RUN CUDA_TOOLKIT_ROOT=/usr/local/cuda CMAKE_ARGS="-DLLAMA_CUBLAS=on" python3.11 -m pip install llama_cpp_python --verbose

COPY . .

EXPOSE 3030
# CMD [ "python3.11", "__main__.py", "--gpu-layers", "49", "--model-path", "/var/data/llm.gguf", "--prod", "true" ]
CMD [ "python3.11", "__main__.py", "--gpu-layers", "49", "--model-path", "/var/data/llm.gguf"]
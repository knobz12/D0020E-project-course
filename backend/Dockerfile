FROM python:3.11.8-bookworm

RUN pip install llama_cpp_python

COPY requirements.docker.txt requirements.txt
RUN python -m pip install -r requirements.txt --ignore-installed

RUN pip install triton==2.2.0

RUN pip install llama_cpp_python==0.2.37

COPY . .

EXPOSE 3030
CMD [ "python3.11", "__main__.py", "--ctx-size", "8192", "--gpu-layers", "0", "--model-path", "/var/data/llm.gguf", "--db-host", "database", "--chroma-host", "chroma", "--prod", "true"]
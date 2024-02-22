FROM python:3.11.8-bookworm
WORKDIR /app

COPY requirements.docker.txt requirements.txt
RUN python -m pip install -r requirements.txt --ignore-installed

COPY . .

EXPOSE 3030
CMD [ "python3.11", "__main__.py", "--ctx-size", "2048", "--gpu-layers", "0", "--model-path", "/var/data/llm.gguf", "--db-host", "database", "--chroma-host", "chroma", "--prod", "true"]
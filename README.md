AIStudyBuddy

<img src="https://raw.githubusercontent.com/knobz12/D0020E-project-course/main/media/2145c09460c44d609f4293cf7c0a1380.png" alt="drawing" width="200"  />

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**Supported platforms via Docker:**

- [x] Linux
- [x] Windows
- [x] Docker
- [x] Mac OS

## Install and run

### Requirements

- In order to run the entire service locally you need to have [Docker and Docker Compose](https://www.docker.com/products/docker-desktop/) installed.

#### Download an LLM model of your choice

Download any one of the .gguf files in one of the links below. The bigger the model the better AI responses.
Choose a model size which fits the amount of RAM on your system. We recommend the size of the model you choose to be at most
1/2 of your available RAM. So if you have 8GB of RAM download a <= 4GB size gguf model.

##### Models ordered by (our opinion) performance/size ratio

[zephyr-7b-beta](https://huggingface.co/TheBloke/zephyr-7B-beta-GGUF/tree/main) (3.08 - 7.7 GB)

[zephyr-3b](https://huggingface.co/TheBloke/stablelm-zephyr-3b-GGUF/tree/main) (1.2 - 2.97 GB)

[Llama-2-13B-Chat](https://huggingface.co/TheBloke/Llama-2-13B-chat-GGUF/tree/main) (5.43 - 13.8 GB)

[Llama-2-7B-Chat](https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF/tree/main) (2.83 - 7.16 GB)

Move the downloaded model file to `backend/models` and rename the file to `llm.gguf`. You should now have a file called `llm.gguf` at the path `./backend/models/llm.gguf`.

#### Enable GitHub OAuth2.0

Create a duplicate of `backend/.env.docker.template` with name `backend/.env.docker`.

1. Visit [GitHub - OAuth Apps](https://github.com/settings/developers) and press "New OAuth App" at the top right.
2. Enter values for the parameters:

- Application Name = AI Studybuddy
- Homepage URL = http://localhost:3000
- Authorization calback URL = http://localhost:3000/api/auth/callback/github

3. Press "Register application"
4. Copy the Client ID value, you will need to use it later. It should be 20 characters long and look like `58eb52a9c123100d54d4`.
5. Click "Generate a new client secret" and copy the generated value. Should be 40 characters.
6. Paste your client id and client secret to GITHUB_ID and GITHUB_SECRET in the `backend/.env.docker` respectively.

#### Start the service

Assuming you have Docker and Docker Compose installed you should now be able to run the application with the following command:

```bash
docker compose -f ./docker-compose.local.yml up -d --build
```

If successful the last thing you should see is something like:

```bash
[+] Running 4/0
 ✔ Container aisb-vectorstore  Running
 ✔ Container aisb-llm          Running
 ✔ Container aisb-database     Running
 ✔ Container aisb-web          Running
```

Once the command has finished you can check that the four services are running:

```bash
$ docker compose -f ./docker-compose.local.yml ps
NAME               IMAGE                               COMMAND                  SERVICE    CREATED         STATUS         PORTS
aisb-database      postgres:alpine                     "docker-entrypoint.s…"   database   6 seconds ago   Up 5 seconds   0.0.0.0:5432->5432/tcp, :::5432->5432/tcp
aisb-llm           llm:latest                          "python3.11 __main__…"   llm        6 seconds ago   Up 5 seconds   0.0.0.0:3030->3030/tcp, :::3030->3030/tcp
aisb-vectorstore   ghcr.io/chroma-core/chroma:latest   "/docker_entrypoint.…"   chroma     6 seconds ago   Up 5 seconds   0.0.0.0:8000->8000/tcp, :::8000->8000/tcp
aisb-web           web:latest                          "docker-entrypoint.s…"   web        6 seconds ago   Up 5 seconds   0.0.0.0:3000->3000/tcp, :::3000->3000/tcp
```

You can check the logs of service by running:

```bash
$ docker compose -f ./docker-compose.local.yml logs llm web -f
aisb-web  |    ▲ Next.js 14.1.0
aisb-web  |    - Local:        http://1daea2c5f2d0:3000
aisb-web  |    - Network:      http://172.27.0.5:3000
aisb-web  |
aisb-web  |  ✓ Ready in 269ms
aisb-llm  | --model-path = /var/data/llm.gguf
aisb-llm  | --gpu-layers = 0
aisb-llm  | --prod = true
aisb-llm  | Starting app
aisb-llm  | Running bjoern server at http://d6baa113b393:3030
aisb-llm  |  * Serving Flask app 'webserver.app'
aisb-llm  |  * Debug mode: on
aisb-llm  | WARNING: This is a development server. Do not use it in a production deployment. Use a production WSGI server instead.
aisb-llm  |  * Running on http://d6baa113b393:3030
aisb-llm  | Press CTRL+C to quit
aisb-llm  |  * Restarting with stat
aisb-llm  |  * Debugger is active!
aisb-llm  |  * Debugger PIN: 651-147-336
```

### Play

Visit http://localhost:3000 and you should now be able to visit, login and use the service!

### Contact

If you have questions or need help contact us at info@aistudybuddy.se

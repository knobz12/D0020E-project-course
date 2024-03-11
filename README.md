<!-- <div style="display:flex;align-items: center; margin-bottom: 2rem; flex-wrap: wrap; justify-content: center;"> -->

<p align="center">
    <img src="https://raw.githubusercontent.com/knobz12/D0020E-project-course/main/media/logo.png" alt="AI Studybuddy logo" width="200" height="213"  />
</p>

<p align="center">
    <h1 align="center">AI Studybuddy</h1>
    <h3 align="center">The worlds best AI studying assistant</h3>
</p>

[![](https://img.shields.io/badge/license-AI_Studybuddy_license-blue.svg)](https://github.com/knobz12/D0020E-project-course/blob/main/LICENSE)

**Supported platforms via Docker:**

- [x] Linux
- [x] Windows
- [x] Mac OS

## Install and run

### Requirements

- In order to run the service locally you need to have [Docker and Docker Compose](https://www.docker.com/products/docker-desktop/) installed.

#### Setup

From your shell enter the folder `bin`. Then run, depending on platform:

On MacOS

```sh
./cli-macos
```

On Linux

```sh
./cli-linux
```

On Windows

```sh
.\cli-win.exe
```

#### Start the service

Assuming you've run the CLI and it exited successfully you can now run:

```sh
docker compose -f ./docker-compose.local.yml up -d --build
```

If successful you should see something similar to this:

```sh
[+] Running 4/0
 ✔ Container aisb-vectorstore  Running
 ✔ Container aisb-llm          Running
 ✔ Container aisb-database     Running
 ✔ Container aisb-web          Running
```

Once the command has finished you can check that the four services are running:

```sh
$ docker compose -f ./docker-compose.local.yml ps
NAME               IMAGE                               COMMAND                  SERVICE    CREATED         STATUS         PORTS
aisb-database      postgres:alpine                     "docker-entrypoint.s…"   database   6 seconds ago   Up 5 seconds   0.0.0.0:5432->5432/tcp, :::5432->5432/tcp
aisb-llm           llm:latest                          "python3.11 __main__…"   llm        6 seconds ago   Up 5 seconds   0.0.0.0:3030->3030/tcp, :::3030->3030/tcp
aisb-vectorstore   ghcr.io/chroma-core/chroma:latest   "/docker_entrypoint.…"   chroma     6 seconds ago   Up 5 seconds   0.0.0.0:8000->8000/tcp, :::8000->8000/tcp
aisb-web           web:latest                          "docker-entrypoint.s…"   web        6 seconds ago   Up 5 seconds   0.0.0.0:3000->3000/tcp, :::3000->3000/tcp
```

You can follow the service logs in real time by running:

```sh
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
aisb-llm  | Running server at http://d6baa113b393:3030
aisb-llm  |  * Serving Flask app 'webserver.app'
aisb-llm  |  * Debug mode: on
aisb-llm  | WARNING: This is a development server. Do not use it in a production deployment. Use a production WSGI server instead.
aisb-llm  |  * Running on http://d6baa113b393:3030
aisb-llm  | Press CTRL+C to quit
aisb-llm  |  * Restarting with stat
aisb-llm  |  * Debugger is active!
aisb-llm  |  * Debugger PIN: 651-147-336
```

### Demo

1. Visit http://localhost:3000/auth/login. Click "Sign in with GitHub"

2. Visit https://cdn.aistudybuddy.se/SOLID%20Principles.html, right click, press save as and save it somewhere on your filesystem such that you can access it for the next steps.

3. Visit the summary generation page http://localhost:3000/courses/D7032E/summary

4. Click on the upload file field and select the downloaded file.

5. Click generate

6. Watch the best summary of a course file you'll ever see stream into view.

### Contact

If you have questions or need help contact us at info@aistudybuddy.se
# AIStudyBuddy

<img src="https://raw.githubusercontent.com/knobz12/D0020E-project-course/main/media/2145c09460c44d609f4293cf7c0a1380.png" alt="drawing" width="600"/>

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

### Hot topics

- AI study buddies are cool
- Here use this https://tesseract-ocr.github.io/tessdoc/Installation.html

----

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#description">Description</a>
    </li>
    <li>
      <a href="#usage">Usage</a>
      <ul>
        <li><a href="#get-the-code">Get the Code</a></li>
        <li><a href="#build">Build</a></li>
        <li><a href="#blas-build">BLAS Build</a></li>
        <li><a href="#prepare-data--run">Prepare Data & Run</a></li>
        <li><a href="#memorydisk-requirements">Memory/Disk Requirements</a></li>
        <li><a href="#quantization">Quantization</a></li>
        <li><a href="#interactive-mode">Interactive mode</a></li>
        <li><a href="#constrained-output-with-grammars">Constrained output with grammars</a></li>
        <li><a href="#instruction-mode-with-alpaca">Instruction mode with Alpaca</a></li>
        <li><a href="#using-openllama">Using OpenLLaMA</a></li>
        <li><a href="#using-gpt4all">Using GPT4All</a></li>
        <li><a href="#using-pygmalion-7b--metharme-7b">Using Pygmalion 7B & Metharme 7B</a></li>
        <li><a href="#obtaining-the-facebook-llama-original-model-and-stanford-alpaca-model-data">Obtaining the Facebook LLaMA original model and Stanford Alpaca model data</a></li>
        <li><a href="#verifying-the-model-files">Verifying the model files</a></li>
        <li><a href="#seminal-papers-and-background-on-the-models">Seminal papers and background on the models</a></li>
        <li><a href="#perplexity-measuring-model-quality">Perplexity (measuring model quality)</a></li>
        <li><a href="#android">Android</a></li>
        <li><a href="#docker">Docker</a></li>
      </ul>
    </li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#coding-guidelines">Coding guidelines</a></li>
    <li><a href="#docs">Docs</a></li>
  </ol>
</details>

## Description

Something cool maybe

**Supported platforms:**

- [x] Linux
- [x] Windows (via CMake)
- [x] Docker
- [x] Mac OS(questionable) Needs to be fixed

**Supported models:**

- [X] LLaMA 🦙
- [x] LLaMA 2 🦙🦙
- [x] LLaMA 3 🦙🦙🦙

---

## Usage

### Get the Code

```bash
git clone https://github.com/knobz12/D0020E-project-course
cd D0020E-project-course
```

### Build
- #### For developers
	- Install dependencies

      - ```
        pip install -r requirements.txt
        ```
      - ### Install llama.cpp with right arguments for your operating system
        - On Windows:
        ```
        pip uninstall llama-cpp-python -y
        $env:CMAKE_ARGS="-DLLAMA_CUBLAS=on -DCMAKE_CUDA_ARCHITECTURES=all-major"
        pip install -U llama-cpp-python --no-cache-dir
        ```
        - On Linux:
        ```
        pip uninstall llama-cpp-python -y
        CMAKE_ARGS="-DLLAMA_CUBLAS=1 -DCMAKE_CUDA_ARCHITECTURES=all-major"
        pip install -U llama-cpp-python --no-cache-dir
        ```
        - On Mac:
        ```
        pip uninstall llama-cpp-python -y
    CMAKE_ARGS="-DLLAMA_METAL=on" pip install -U llama-cpp-python --no-cache-dir
    pip install 'llama-cpp-python[server]
        ```
- #### For users
	- On Windows
	```
	make install
	```
	- On Linux
	- ```
	make install
	```
	- On Mac
	```
	make install
	```
### Prepare Data & Run

Run using the sample data:

```
python aistudybuddy.py
```

### Contributing
- Contributors can open PRs
- Collaborators can push to branches in the `D0020E-project-course` repo and merge PRs into the `main` branch
- Collaborators will be invited based on contributions
- Any help with managing issues and PRs is very appreciated!
### Coding guidelines

- Avoid adding third-party dependencies, extra files, extra headers, etc.
- Always consider cross-compatibility with other operating systems and architectures
- Avoid fancy looking modern STL constructs, use basic `for` loops, avoid templates, keep it simple
- There are no strict rules for the code style, but try to follow the patterns in the code (indentation, spaces, etc.). Vertical alignment makes things more readable and easier to batch edit
### Docs

- [main](./website//README.md)
- [server](./backend/webserver/README.md)
- [Performance troubleshooting](./docs/token_generation_performance_tips.md)
PROJECT_NAME ?= AiStudyBuddy
PROJECT_DIR ?= $(CURDIR)
OS:= $(shell uname)
PYTHON_VERSION ?= 3.10
PYTHON_BACKUP ?= $(PROJECT_DIR)/backup
SHELL:=/bin/bash




help:
	@echo "clean - remove all build, test, coverage and Python artifacts"

build: ## Install dockerfile for frontend
	@echo $(OS);
	@echo $(PROJECT_DIR);
	@# docker compose -f $(PROJECT_DIR)/docker-compose.gpu.yml up -d;
	@# docker compose -f $(PROJECT_DIR)/docker-compose.web.yml up -d;

ifeq ($(OS), Linux)
	docker compose -f $(PROJECT_DIR)/docker-compose.gpu.yml up -d; 
	docker compose -f $(PROJECT_DIR)/docker-compose.web.yml up -d;
	python -m webbrowser "http://localhost:3000"
endif

ifeq ($(OS), Win32)
	docker compose -f $(PROJECT_DIR)/docker-compose.gpu.yml up -d;
	docker compose -f $(PROJECT_DIR)/docker-compose.web.yml up -d;
	python -m webbrowser "http://localhost:3000"
endif

ifeq ($(OS), Darwin)
	python -m pip install -r $(PROJECT_DIR)/requirements_metal.txt \ 
	CMAKE_ARGS="-DLLAMA_BLAS=ON -DLLAMA_BLAS_VENDOR=OpenBLAS" pip install -U llama-cpp-python --force-reinstall --no-cache-dir \
	docker compose -f $(PROJECT_DIR)/docker-compose.web.yml up -d;
	python -m webbrowser "http://localhost:3000"
endif
	
	

clean: ## Remove build and cache files
	rm -rf *.egg-info
	rm -rf build
	rm -rf dist
	rm -rf .pytest_cache
	# Remove all pycache
	find . | grep -E "(__pycache__|\.pyc|\.pyo$)" | xargs rm -rf
PROJECT_NAME ?= AiStudyBuddy
PROJECT_DIR ?= $(CURDIR)
PYTHON_VERSION ?= 3.10
PYTHON_BACKUP ?= $(PROJECT_DIR)/backup


all: docker_frontend docker_backend

help:
	@echo "clean - remove all build, test, coverage and Python artifacts"

docker_frontend: ## Install dockerfile for frontend
	echo PROJECT_DIR
	cd website && \ docker-compose up -d

docker_backend: ## Install dockerfile for frontend
	cd backend && \ docker-compose up -d

clean: ## Remove build and cache files
	rm -rf *.egg-info
	rm -rf build
	rm -rf dist
	rm -rf .pytest_cache
	# Remove all pycache
	find . | grep -E "(__pycache__|\.pyc|\.pyo$)" | xargs rm -rf
VERSION := $(shell cat VERSION)
TAGGED_VERSION := $(VERSION)
NEXT_VERSION := $(shell echo $(VERSION) | awk -F. '{$$NF = $$NF + 1;} 1' | sed 's/ /./g')
GIT_COMMIT := $(shell git rev-parse --short HEAD)


.PHONY: ensure-git-repo-pristine
ensure-git-repo-pristine:
	@echo "Ensuring git repo is pristine"
	@[[ $(shell git status --porcelain=v1 2>/dev/null | wc -l) -gt 0 ]] && echo "Git repo is not pristine" && exit 1 || echo "Git repo is pristine"

.PHONY: bump-version
bump-version:
	@echo "Bumping version to $(NEXT_VERSION)"
	@echo $(NEXT_VERSION) > VERSION
	git add VERSION


.PHONY: update-package-json-with-next-version
update-package-json-with-next-version:
	@echo "Updating package.json with version $(VERSION)"
	sed "s/\"version\": \".*\"/\"version\": \"$(VERSION)\"/" ./package.json > ./package.json.tmp
	mv ./package.json.tmp ./package.json
	git add package.json


.PHONY: build
build:
	@echo "Building the project"
	yarn build

.PHONY: release
release: build ensure-git-repo-pristine bump-version update-package-json-with-next-version
	@echo "Preparing release..."
	@echo "Version: $(VERSION)"
	@echo "Commit: $(GIT_COMMIT)"
	git tag -a $(TAGGED_VERSION) -m "Release $(VERSION)"
	git push origin $(TAGGED_VERSION)
	@echo "Tag $(TAGGED_VERSION) created and pushed to origin"
	git commit -m "Released $(VERSION) and prepared for $(NEXT_VERSION)"
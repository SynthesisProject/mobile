#!/bin/bash

# Name of the repo for which this build must run
SYNTHESIS_MOBILE_REPO="SynthesisProject/mobile";

# Directory from which to get the generated js docs
JS_DOCS_SRC="js-docs"

# Directory to which the docs is copied before moving it into a git directory
JS_DOCS_DEST="$HOME/js-docs-latest"

# Directory within the gh-pages repo where the docs must be placed
JS_DOCS_GIT="./js-docs"

if [ "$TRAVIS_REPO_SLUG" == "$SYNTHESIS_MOBILE_REPO" ] && [ "$TRAVIS_PULL_REQUEST" == "false" ] && [ "$TRAVIS_BRANCH" == "master" ]; then

  echo -e "Publishing esdocs...\n"
  cp -R $JS_DOCS_SRC $JS_DOCS_DEST

  cd $HOME
  git config --global user.email "travis@travis-ci.org"
  git config --global user.name "travis-ci"
  git clone --quiet --branch=gh-pages https://${GH_TOKEN}@github.com/${SYNTHESIS_MOBILE_REPO} gh-pages > /dev/null

  cd gh-pages
  # Remove previous esdocs
  git rm -rf $JS_DOCS_GIT
  cp -Rf $JS_DOCS_DEST JS_DOCS_GIT
  git add -f .
  git commit -m "Latest js-docs on successful travis build $TRAVIS_BUILD_NUMBER auto-pushed to gh-pages"
  git push -fq origin gh-pages > /dev/null

  echo -e "Published js-docs to gh-pages.\n"

else
	echo -e "$TRAVIS_REPO_SLUG";
	echo -e "$TRAVIS_PULL_REQUEST";
	echo -e "$TRAVIS_BRANCH";
	echo -e "Not running script";
fi

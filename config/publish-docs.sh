#!/bin/bash
SYNTHESIS_MOBILE_REPO="SynthesisProject/mobile";
if [ "$TRAVIS_REPO_SLUG" == "$SYNTHESIS_MOBILE_REPO" ] && [ "$TRAVIS_PULL_REQUEST" == "false" ] && [ "$TRAVIS_BRANCH" == "master" ]; then

  echo -e "Publishing esdocs...\n"
  cp -R js-docs $HOME/js-docs-latest

  cd $HOME
  git config --global user.email "travis@travis-ci.org"
  git config --global user.name "travis-ci"
  git clone --quiet --branch=gh-pages https://${GH_TOKEN}@github.com/${SYNTHESIS_MOBILE_REPO} gh-pages > /dev/null

  cd gh-pages
  # Remove previous esdocs
  git rm -rf ./js-docs
  cp -Rf $HOME/js-docs-latest ./js-docs
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

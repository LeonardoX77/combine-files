#!/bin/bash

# Run the combine-files script with the specified arguments
ts-node src/combine-files.ts \
  -p /Users/leo/projects/iFIT/Fleebe-TT/Fleebe-TT-Front \
  -o ./output/fleebe-tt-fe.txt \
  -d node_modules,.next,public,build,translate,scripts \
  -f package-lock.json,.npmrc,.eslintrc.js,.gitignore \
  -e .png,.ico,.css,.md \
  -x '.*env*' \
  -m 10000


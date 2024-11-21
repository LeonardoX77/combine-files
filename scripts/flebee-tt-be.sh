#!/bin/bash

# Run the combine-files script with the specified arguments
ts-node src/combine-files.ts \
  -p /Users/leo/projects/iFIT/Fleebe-TT/Fleebe-TT-Back \
  -o ./output/fleebe-tt-be.txt \
  -d bin,obj,build,Migrations,Areas,wwwroot,Views,DTOs,Interfaces,Seeds \
  -f .DS_Store,.gitignore \
  -e .npmrc,.nupkg,.png,.ico,.xml,.json,.config,.DotSettings,.cd,.resx,.sql,.js \
  -x 'SharedResources*,DTO*' \
  -m 10000

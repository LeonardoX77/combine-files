#!/bin/bash

# Run the combine-files script with the specified arguments
ts-node src/combine-files.ts \
  -p /Users/leo/projects/iFIT/Fleebe-TM/Fleebe/src \
  -o ./output/fleebe-tm-be.txt \
  -d bin,obj,build,Migrations,Areas,wwwroot,Views,DTOs,Interfaces,Seeds,WebApp,Fleebe.ChatBot \
  -f .DS_Store,.gitignore \
  -e .npmrc,.nupkg,.png,.ico,.xml,.json,.config,.DotSettings,.cd,.resx,.sql,.js \
  -x 'SharedResources*,DTO*' \
  -m 10000

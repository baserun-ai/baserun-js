#!/usr/bin/env /bin/bash
# grpc_tools_node_protoc \
# --plugin=protoc-gen-ts=./node_modules/.bin/protoc-gen-ts \
# --plugin=protoc-gen-grpc=./node_modules/.bin/grpc_tools_node_protoc_plugin \
# --proto_path=src/v1/protos \
# --js_out=import_style=commonjs,binary:src/v1/generated \
# --grpc_out=grpc_js:src/v1/generated \
# --ts_out=grpc_js:src/v1/generated \
# src/v1/protos/baserun.proto


grpc_tools_node_protoc \
--plugin=protoc-gen-ts=./node_modules/.bin/protoc-gen-ts \
--plugin=protoc-gen-grpc=./node_modules/.bin/grpc_tools_node_protoc_plugin \
--proto_path=src/v1/protos \
--js_out=import_style=commonjs,binary:src/v1/generated \
--grpc_out=grpc_js:src/v1/generated \
--ts_out=grpc_js:src/v1/generated \
src/v1/protos/baserun.proto
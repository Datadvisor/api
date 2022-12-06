# Generate scrapper
mkdir -p scrapper
protoc \
  --plugin="./node_modules/.bin/protoc-gen-ts_proto" \
  --ts_proto_out=./scrapper scrapper.proto           \
  --ts_proto_opt=nestJs=true,addGrpcMetadata=true,outputEncodeMethods=false,outputJsonMethods=false,outputClientImpl=false

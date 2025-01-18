#!/bin/bash
set -e
IFS='|'

# Print variable values for debugging
echo "accessKeyId: ${accessKeyId}"
echo "secretAccessKey: ${secretAccessKey}"
echo "appId: ${appId}"

REACTCONFIG="{\
\"SourceDir\":\"src\",\
\"DistributionDir\":\"build\",\
\"BuildCommand\":\"npm run-script build\",\
\"StartCommand\":\"npm run-script start\"\
}"
AWSCLOUDFORMATIONCONFIG="{\
\"configLevel\":\"project\",\
\"useProfile\":false,\
\"profileName\":\"default\",\
\"accessKeyId\":\"${accessKeyId}\",\
\"secretAccessKey\":\"${secretAccessKey}\",\
\"region\":\"eu-west-1\"\
}"
AMPLIFY="{\
\"projectName\":\"axeFrontend\",\
\"appId\":\"${appId}\",\
\"envName\":\"dev\",\
\"defaultEditor\":\"code\"\
}"
FRONTEND="{\
\"frontend\":\"javascript\",\ 
\"framework\":\"angular\",\
\"config\":$REACTCONFIG\
}"
PROVIDERS="{\
\"awscloudformation\":$AWSCLOUDFORMATIONCONFIG\
}"

amplify pull \
--amplify $AMPLIFY \
--frontend $FRONTEND \
--providers $PROVIDERS \
--yes
#!/bin/bash
set -e

echo "Create and deploy the various versions for k8s docker image"

kubectl_versions=("1" "1.11" "1.10" "1.9" "1.8")
image="smartive/kubernetes-deploy"

echo "Build latest docker image"
echo "docker build --build-arg KUBECTL_VERSION=\"1\" -t $image:latest ."
echo "docker push $image:latest"

for version in ${kubectl_versions[@]}; do
  echo "Build docker image with kubectl version v$version"

  version_tag="kubectl-v$version-k8s-$CI_COMMIT_TAG"
  latest_tag="kubectl-v$version-k8s-latest"

  echo "Use tag: $version_tag"
  echo "And latest tag: $latest_tag"

  echo "docker build --build-arg KUBECTL_VERSION=$version -t $image:$version_tag ."
  echo "docker tag $image:$version_tag $image:$latest_tag"
  echo "docker push $image:$version_tag"
  echo "docker push $image:$latest_tag"

done

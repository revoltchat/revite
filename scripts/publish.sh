#!/bin/bash
version=$(cat VERSION)

                  docker build -t revoltchat/client:${version} . &&
docker tag revoltchat/client:${version} revoltchat/client:latest &&
                        docker push revoltchat/client:${version} &&
                            docker push revoltchat/client:latest

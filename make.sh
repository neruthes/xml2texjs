#!/bin/bash


case "$1" in
    testcases | testcases/ )
        find testcases -name '*.tex.xml' | while read -r line; do
            ./make.sh "$line"
        done
        ;;
    testcases/*.tex.xml )
        node cli.js "$1" > "${1/.xml/}"
        ;;
    ntex )
        ntex testcases/*.tex
        ;;
esac

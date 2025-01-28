#!/usr/bin/env bash

# mysql -u root -proot midific < "/docker-entrypoint-initdb.d/000-create-databases.sql"
mysql -uroot -proot midific < "/docker-entrypoint-initdb.d/init.sql"

mysql
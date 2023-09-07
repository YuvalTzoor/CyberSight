#!/usr/bin/env bash

set -e # Exit script immediately on first error.
ENABLE_OPTIMIZATIONS=${1:-"false"} # If true, the build will take longer but the resulting Python binary will run faster.

install_python() {
  # Install dependencies.
  apt-get install wget build-essential libreadline-dev libncursesw5-dev libssl-dev libsqlite3-dev tk-dev libgdbm-dev libc6-dev libbz2-dev libffi-dev zlib1g-dev -y
  # Download and install Python 3.10.10
  wget https://www.python.org/ftp/python/3.10.10/Python-3.10.10.tar.xz
  tar -Jxvf Python-3.10.10.tar.xz
  cd Python-3.10.10 || exit
  config_args=""
  if [ "${ENABLE_OPTIMIZATIONS}" = "true" ]; then
    config_args="--enable-optimizations"
  fi
  ./configure --with-ensurepip=install ${config_args}
  make -j 4
  make install

  python3.10 -m pip install --upgrade pip
  apt autoremove -y
}

# Install Python if it is not already installed.
if ! type python3.10 >/dev/null 2>&1; then
  echo "Installing Python 3.10..."
  install_python
else
  echo "Python 3.10 already installed. Skipping."
fi

ARG VARIANT=18
FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:${VARIANT}

ARG PYTHON_OPTIMIZE_BUILD_FROM_SOURCE="true"
RUN apt-get update && apt-get upgrade -y
RUN apt-get install -y libgl1-mesa-glx

COPY .devcontainer/scripts/*.sh /tmp/scripts/
RUN bash /tmp/scripts/install-python.sh ${PYTHON_OPTIMIZE_BUILD_FROM_SOURCE}

# Install packages for the image detection app (Python)
COPY python_apps/image_detect_flask/requirements.txt /tmp/pip-tmp/
RUN pip3 --disable-pip-version-check --no-cache-dir install -r /tmp/pip-tmp/requirements.txt \
  && rm -rf /tmp/pip-tmp

# Make zsh the default shell
RUN chsh -s "$(which zsh)"

# Install pnpm
SHELL ["/bin/zsh", "--login", "-i", "-c"]
RUN npm install --global pnpm \
  && SHELL=zsh pnpm setup \
  && source /root/.zshrc

# Install JavaScript packages
RUN pnpm install -g \
  typescript \
  @angular/cli \
  @nestjs/cli \
  turbo

# Install oh-my-zsh plugins
RUN git clone "https://github.com/zsh-users/zsh-autosuggestions" "${ZSH_CUSTOM}/plugins/zsh-autosuggestions"
RUN git clone "https://github.com/zsh-users/zsh-syntax-highlighting.git" "${ZSH_CUSTOM}/plugins/zsh-syntax-highlighting"
RUN git clone --depth 1 -- "https://github.com/marlonrichert/zsh-autocomplete.git" "${ZSH_CUSTOM}/plugins/zsh-autocomplete"
# Add the plugins to the .zshrc file
RUN sed -i 's/plugins=(git)/plugins=(git zsh-autosuggestions zsh-syntax-highlighting zsh-autocomplete)/g' ~/.zshrc

# Add Angular CLI autocompletion command to .zshrc
RUN printf "\n# Angular CLI autocompletion\nsource <(ng completion script)" >> ~/.zshrc

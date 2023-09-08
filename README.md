
# Cybersight 👁️

Cybersight is our final project at Bar-Ilan University. We have been  working on this project as part of our academic degree in the Department of Information Sciences at Bar-Ilan University.
Deepfakes, or realistic synthetic media generated using machine learning algorithms, have become a major concern in recent years. Deepfakes can be used to spread disinformation or for malicious purposes, and it is often difficult to discern what's real and what's not. We have created an application that can identify whether a picture of a face is real or fake (i.e. created by artificial intelligence).


## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Running the Application](#running-the-application)
4. [Database UI Access](#database-ui-access)
5. [Authors](#authors)
6. [License](#license)

## Prerequisites

- Docker Desktop
- Visual Studio Code
- Dev Containers extension for VS Code

## Setup

1. **Download Docker Desktop:**  
   Visit the [Docker Desktop download page](https://www.docker.com/products/docker-desktop/#) and choose the package suitable for your system.

2. **Launch Docker Desktop:**  
   After installation, launch the Docker Desktop application.

3. **Clone the Repository:**  
   Clone this repository locally and open it in VS Code.

4. **Install Dev Containers Extension:**  
   In VS Code, navigate to the Extensions Marketplace and install the 'Dev Containers' extension.

## Running the Project

1. **Build Dev Container:**  
   Press `Ctrl+Shift+P` to open the command palette. Then, Type and select: 'Dev Containers: Build and Open in Container'. The container build process will start; this may take a few minutes.

    - **View Build Logs:**  
      Click on 'Show Log' in the bottom right corner to monitor the build process in real-time.

2. **Run Project:**  
   After the build completes, wait for the ZSH terminal to display 'Done. Press any key to close the terminal.' Then, navigate to the top bar in VS Code and click on 'Run Task' and select 'Run Server, Client, and Flask'. <br />
   Alternatively, the following commands can be run: `pnpm -F server dev`, `pnpm -F client dev`, `flask --app main run` <br />
   ![Example GIF](./run_tasks.gif)


4. **Open the Web Application:**  
   When the tasks are finished loading, open your web browser and go to [http://localhost:4200](http://localhost:4200) to access the client-side homepage.

## Database UI Access

To access the UI of the databases (Prisma Studio), go back to 'Run Task' in VS Code and select 'Run Prisma Studio (Postgres)', and then run another task and select: 'Run Prisma Studio (Mongo)'. <br />
Alternatively, the following commands can be run: <br />
Prisma Studio - Postgres: `pnpm -F database postgres:studio`<br />
Prisma Studio - Mongo: `pnpm -F database mongo:studio`

## Authors

👤 **Yuval Tzoor**  
- [GitHub](https://github.com/YuvalTzoor)

👤 **Saar Rozenthal**  
- [GitHub](https://github.com/SaarRoz)

👤 **Shaked Partush**  
- [GitHub](https://github.com/shak4560)

👤 **Yuval Abramovich**  
- [GitHub](https://github.com/Yuvalabra)


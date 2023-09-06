
# Cybersight 👁️

Cybersight is a web application designed to operate seamlessly within a Dev Container. This setup simplifies the development process, allowing you to focus on building amazing features.

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

## Installation

1. **Download Docker Desktop:**  
   Visit the [Docker Desktop download page](https://www.docker.com/products/docker-desktop/#) and choose the package suitable for your system. Follow the installation instructions.

2. **Launch Docker Desktop:**  
   After installation, launch the Docker Desktop application.

3. **Clone the Repository:**  
   Clone this repository locally and open it in Visual Studio Code.

4. **Install Dev Containers Extension:**  
   In VS Code, navigate to the Extensions Marketplace and install the 'Dev Containers' extension.

## Running the Application

1. **Build Dev Container:**  
   Press `Ctrl+Shift+P` to open the command palette. Type and select 'Dev Containers: Build and Open in Container'. The container build process will start; this may take a few minutes.

    - **View Build Logs:**  
      Click on 'Show Log' in the bottom right corner to monitor the build process in real time.

2. **Run Server and Client:**  
   After the build completes, wait for the terminal to display 'Done. Press any key to close the terminal.' Then, navigate to the top bar in VS Code and click on 'Run Task'. Select 'Run Server, Client and Flask'.

3. **Access the Application:**  
   Once the tasks are complete, open your web browser and go to [http://localhost:4200](http://localhost:4200) to access the client-side homepage.

## Database UI Access

To access the UI of the databases, go back to 'Run Task' in VS Code and select 'Prisma Studio (All)'.

## Authors

👤 **Yuval Tzoor**  
- [GitHub](https://github.com/YuvalTzoor)

👤 **Saar Rozental**  
- [GitHub](https://github.com/SaarXD)

👤 **Shaked Partush**  
- [GitHub](https://github.com/shak4560)

👤 **Yuval Abramovich**  
- [GitHub](https://github.com/Yuvalabra)

## License

This project is licensed under the [MIT License](https://choosealicense.com/licenses/mit/).


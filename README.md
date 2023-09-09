<section align="center">
<img src="/apps/client/src/favicon.ico" width="110" alt="Cybersight logo"/>

# CyberSight

**CyberSight is our final project at Bar-Ilan University. We have been working on this project as part of our academic degree in the Department of Information Sciences.**

Deepfakes, or realistic synthetic media generated using machine learning algorithms, have become a major concern in recent years. Deepfakes can be used to spread disinformation or for malicious purposes, and it is often difficult to discern what's real and what's not. We have created an application that can identify whether a picture of a face is real or fake (i.e. created by artificial intelligence).

</section>

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setup](#setup)
3. [Running the Project](#running-the-project)
4. [Databases UI Access](#databases-ui-access)
5. [Authors](#authors)
6. [An article on the technique](#an-article-on-the-technique)

## Prerequisites

- Docker Desktop
- Visual Studio Code
- Dev Containers extension for VS Code

## Setup

1. **Download Docker Desktop:**  
   Visit the [Docker Desktop download page](https://www.docker.com/products/docker-desktop/#) and choose the package suitable for your system.

2. **Launch Docker Desktop:**  
   After installation, launch the Docker Desktop application.
   
3. **Install Dev Containers Extension:**  
   In VS Code, navigate to the Extensions Marketplace and install the 'Dev Containers' extension.
   
4. **Clone The Repository:**  
   Clone this repository locally and open it in VS Code.



## Running the Project

1. **Build The Dev Container:**  
   Press `F1` or `Ctrl+Shift+P` to open the VS Code command palette. Then, type and select: 'Dev Containers: Build and Open in Container' (or 'Dev Containers: Rebuild and Reopen in Container'). The container build process will start; this may take several minutes on the first run.

   - **View Build Logs:**  
     Click on 'Show Log' in the bottom right corner to monitor the build process in real-time.
     <img src="https://i.ibb.co/Yj87Yn1/showlog-vscode.jpg" width="410" alt="Showlog bottom in VS Code"/>

2. **Run Project:**  
   After the build completes, wait for the ZSH terminal to display 'Done. Press any key to close the terminal.'
   <img src="https://i.ibb.co/3ywxZMN/build-done.jpg" width="750" alt="Showlog bottom in VS Code"/>
   
   Then, press `F1` or `Ctrl+Shift+P` again to open the VS Code command palette, and select 'Tasks: Run Task'. Next, choose the following option: 'Run Server, Client, and Flask'
   - Alternatively, the following commands can be run: `pnpm -F server dev`, `pnpm -F client dev`, and `cd python_apps/image_detect_flask/ && flask --app main run`.

4. **Open the Web Application:**  
   When the tasks are finished loading, open your web browser and go to: [http://localhost:4200](http://localhost:4200), to access the client-side homepage.

## Databases UI Access

To access the UI of the databases (Prisma Studio), go back to 'Run Task' in VS Code and choose 'Run Prisma Studio (Postgres)', and then run another task and choose: 'Run Prisma Studio (Mongo)'.
- Alternatively, the following commands can be run: `pnpm -F database postgres:studio`, and `pnpm -F database mongo:studio`.

## Authors

👤 **Yuval Tzoor**

- [GitHub](https://github.com/YuvalTzoor)

👤 **Saar Rozenthal**

- [GitHub](https://github.com/SaarRoz)

<section>

👤 **Shaked Partush**

- [GitHub](https://github.com/shak4560)

👤 **Yuval Abramovich**

- [GitHub](https://github.com/Yuvalabra)



## An article on the technique

**The technique for identifying deepfakes is based on the following article:**

Durall, R., Keuper, M., Pfreundt, F. J., & Keuper, J. (2019). *Unmasking deepfakes with simple features*. </br>
&nbsp;&nbsp;&nbsp;&nbsp;arXiv preprint arXiv:1911.00686.

<section>
  <h1>Running instructions(dev container)!!!</h1>
  <p>
    In order to use the dev container you need to install the followings-
    **Docker(**[https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/))
    and the vs-code extension **dev container**
    <ui>
      <li>
        <strong> For the Client: </strong>
        pnpm -F client dev
      </li>
      <li>
        <strong> For the Server: </strong>
        pnpm -F server dev
      </li>
      <li>
        <strong> For the Flask: </strong>
        cd python_apps/image_detect_flask/ →flask --app main run
      </li>
      <li>
        <strong> To access the DB UI: </strong>
        cd packages/database/ → then run npx prisma studio
      </li>
    </ui>
  </p>
  <pre>
    To enter the git cardinals: 
        git config user.name "<>"   
        git config user.email "<>" 
    For editing the shared files:
        pnpm -F shared dev
  </pre>
</section>

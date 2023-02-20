# Firewalld GUI
This repo offers a web-based GUI for managing firewalld rules such as public ports and forwarded ports.

![image](https://user-images.githubusercontent.com/12012168/187710124-7e5f722d-5009-43c3-862d-2b9495364351.png)

![image](https://user-images.githubusercontent.com/12012168/187709972-7a75b94c-b899-441e-91b5-df10d640da78.png)


## Installation

First of all, you need to clone the repository:

`git clone git@github.com:erfansahaf/firewalld-gui.git`

Then, you can chose to run the application via Docker or running it directory with Node command.

Be aware that this project needs write permission for `public.xml` file. It's living in `/etc/firewalld/zones/public.xml` by default.

### Using Docker

In the first step, copy the `.env.example` file to `.env`. Then edit the `.env` file and adjust the required parameters (`HTTP Port` and `public.xml` file path).

After that, use docker compose to bring the ui service up:

```sh
docker compose up -d
```

***Since the container doesn't have access to Firewalld socket, the `reload` action in GUI won't work in Docker installation.***

### Using Node.js

Just install dependencies and run the index.js file with following command:

```
npm install # installing the dependencies
node index.js # running the application
```

The node application reads the `APP_PORT` and `PUBLIC_ZONE_PATH` environment variables. The default port is `3000` but you can set it to something else.

Also, you should pass your firewalld public zone file as `PUBLIC_ZONE_PATH` environment variable value:

```
APP_PORT=3000 PUBLIC_ZONE_PATH=/etc/firewalld/zones/public.xml node index.js
```

## Authentication
I have not implemented any kind of authentication system yet. But you can use Basic Auth feature of your Web Server to protect the app web pages. I personally use Nginx for proxy-pass and basic-auth.

```
server
{
    server_name you-server.com;
    listen 80;

    auth_basic           "FWGUI";
    auth_basic_user_file /etc/nginx/.htpasswd;

    location / {
        try_files _ @nodeserver; # the _ is the filename that never exists.
    }

    location @nodeserver {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    error_page  404 /;
}

```

## TODO

- Opening port for a specific source address
- Drop zone integration
- Authentication

# Firewalld GUI
This repo offers a web-based GUI for managing firewalld rules such as public ports and forwarded ports.

## Stack
This project uses Node.js for server side and html+css (and bootstrap) for visualization.

## Installation
Just clone the repository and run the index.js file with following command:

```js
$ node index.js
```

The node application reads the `APP_PORT` and `PUBLIC_ZONE_PATH` environment variables. The default port is `3000` but you can set something else.

Also, you should pass your firewalld public zone file as `PUBLIC_ZONE_PATH` environment variable value:

```js
$ APP_PORT=3000 PUBLIC_ZONE_PATH=/etc/firewalld/zones/public.xml node index.js
```

## Authentication
I have not implemented any kind of authentication system yet. But you can use Basic Auth feature of your Web Server to protect the app web pages. I personally use Nginx for proxy-pass and basic-auth.

## TODO

- Opening port for a specific source address
- Drop zone integration
- Authentication
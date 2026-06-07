# HTTPS Setup for ResQ Meal

In production, terminate TLS at a reverse proxy (Nginx, Caddy, or a cloud load balancer) and forward HTTP to the Spring Boot app on port 8080.

## Environment

Set on the Spring Boot host or container:

```env
FORCE_HTTPS=true
```

With `FORCE_HTTPS=true`, Spring Security requires HTTPS for all `/api/**` requests. The proxy must send standard forwarded headers (`X-Forwarded-Proto`, `X-Forwarded-For`). The app uses `server.forward-headers-strategy=NATIVE` so Tomcat honors those headers.

## Sample Nginx configuration

Replace `your-domain.com` and certificate paths with your values.

```nginx
upstream resqmeal_backend {
    server 127.0.0.1:8080;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate     /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # REST API
    location /api/ {
        proxy_pass http://resqmeal_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Socket.IO (real-time)
    location /socket.io/ {
        proxy_pass http://resqmeal_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static uploads
    location /uploads/ {
        proxy_pass http://resqmeal_backend;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SPA / static frontend (if served from the same host)
    location / {
        root /var/www/resqmeal;
        try_files $uri $uri/ /index.html;
    }
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$host$request_uri;
}
```

## Checklist

1. Obtain TLS certificates (Let's Encrypt recommended).
2. Point DNS to the proxy server.
3. Configure Nginx with the snippet above.
4. Set `FORCE_HTTPS=true` on the backend.
5. Set frontend `VITE_API_URL=https://your-domain.com` at build time.
6. Verify: `curl -I https://your-domain.com/api/health` returns 200.

FROM public.ecr.aws/amazonlinux/amazonlinux:2022

RUN dnf -y update \
 && dnf -y install \
    gcc-c++ \
    httpd \
    nodejs \
    npm \
    make \
 && dnf clean all

RUN mkdir -p /app/client

WORKDIR /app/client

COPY client/package.json /app/client/

RUN npm install

COPY client /app/client/

RUN npm run build

ARG APP_PATH

RUN mkdir -p /var/www/html/${APP_PATH} \
 && cp -r /app/client/build/* /var/www/html/${APP_PATH}

COPY docker/frontend.conf /etc/httpd/conf.d/frontend.conf

WORKDIR /var/www/html

EXPOSE 80
EXPOSE 443

CMD rm -rf /run/httpd/* /tmp/httpd* \
 && exec /usr/sbin/httpd -DFOREGROUND
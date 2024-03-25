FROM public.ecr.aws/amazonlinux/amazonlinux:2023

RUN dnf -y update \
 && dnf -y install \
    cmake \
    gcc-c++ \
    gzip \
    libcurl-devel \
    libjpeg-turbo-devel \
    libxml2-devel \
    make \
    nodejs \
    npm \
    python3-devel \
    R \
    tar \
 && dnf clean all

RUN mkdir -p /app/server

WORKDIR /app/server

COPY server/renv.lock /app/server/
COPY server/.Rprofile /app/server/
COPY server/renv/activate.R /app/server/renv/
COPY server/renv/settings.dcf /app/server/renv/

RUN R -e "options(Ncpus=parallel::detectCores()); renv::restore()"

COPY server/package.json server/package-lock.json ./

RUN npm install

COPY server ./

CMD npm start

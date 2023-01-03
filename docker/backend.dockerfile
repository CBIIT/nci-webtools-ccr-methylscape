FROM public.ecr.aws/amazonlinux/amazonlinux:2022

RUN dnf -y update \
 && dnf -y install \
    cmake \
    gcc-c++ \
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

COPY server/renv.lock ./

RUN R -e "\
    options(Ncpus=parallel::detectCores()); \
    install.packages('renv', repos = 'https://cloud.r-project.org/'); \
    renv::restore();"

COPY server/package.json server/package-lock.json ./

RUN npm install

COPY server ./

CMD npm start

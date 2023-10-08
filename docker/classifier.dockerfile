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

RUN mkdir -p /app/classifier

WORKDIR /app/classifier

COPY classifier/renv.lock ./

RUN R -e "\
    options(Ncpus=parallel::detectCores());\
    install.packages('renv', repos = 'https://cloud.r-project.org/');\
    renv::init(bare = T);\
    renv::restore();"

COPY classifier/package.json classifier/package-lock.json ./

RUN npm install

COPY classifier ./

CMD npm start

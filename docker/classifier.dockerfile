FROM public.ecr.aws/amazonlinux/amazonlinux:2023

RUN dnf -y update \
 && dnf -y install \
    gcc \
    gcc-c++ \
    gzip \
    fribidi-devel \
    gmp-devel \
    harfbuzz-devel \
    libcurl-devel \
    openssl-devel \
    freetype-devel \
    libpng-devel \
    libtiff-devel \
    libjpeg-turbo-devel \
    libxml2-devel \
    make \
    nodejs \
    npm \    
    python3-devel \
    R \
    tar \
    xz \
    zlib-devel \
 && dnf clean all

# install ghcup, cabal
ENV BOOTSTRAP_HASKELL_NONINTERACTIVE=1

ENV PATH=/root/.ghcup/bin/:/root/.cabal/bin/:$PATH

RUN curl -sSL https://get-ghcup.haskell.org | sh

# install pandoc
RUN cabal install pandoc-cli

RUN mkdir -p /classifier

WORKDIR /classifier

COPY classifier/renv.lock ./

RUN R -e "\
    options(Ncpus=parallel::detectCores());\
    install.packages('renv', repos = 'https://cloud.r-project.org/');\
    renv::init(bare = T);\
    renv::restore();"

COPY classifier/ ./

COPY classifier/package.json classifier/package-lock.json ./

RUN npm install

COPY classifier ./

ENV TZ=America/New_York

RUN ln -s /data/classifier/files /classifier/files

CMD npm start

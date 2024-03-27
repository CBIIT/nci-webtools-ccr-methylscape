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
    R-4.1.3 \
    tar \
    xz \
    zlib-devel \
 && dnf clean all

# install pandoc
ENV PANDOC_VERSION=3.1.8

RUN pushd /tmp \
 && curl -ssL https://github.com/jgm/pandoc/releases/download/${PANDOC_VERSION}/pandoc-${PANDOC_VERSION}-linux-amd64.tar.gz | tar xvz \
 && cp pandoc-${PANDOC_VERSION}/bin/pandoc* /usr/local/bin \
 && rm -rf pandoc-${PANDOC_VERSION} \
 && popd

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

RUN mkdir -p /input /output /data /classifier

RUN ln -s /data/classifier/files /classifier/files

RUN ln -s /data/classifier/supplements /supplements

CMD npm start

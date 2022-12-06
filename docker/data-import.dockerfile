FROM public.ecr.aws/lambda/nodejs:18

RUN yum -y update \
 && yum clean all

RUN mkdir -p ${LAMBDA_TASK_ROOT}

WORKDIR ${LAMBDA_TASK_ROOT}

COPY database/package.json ${LAMBDA_TASK_ROOT}

RUN npm install

COPY database ${LAMBDA_TASK_ROOT}

ENV NODE_ENV=production

CMD ["app.handler"]

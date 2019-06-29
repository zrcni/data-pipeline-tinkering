FROM nginx:1.13.9

RUN rm -rf /etc/nginx/conf.d/*
COPY ./config/app.conf /etc/nginx/conf.d/app.conf

CMD ["nginx", "-g", "daemon off;"]

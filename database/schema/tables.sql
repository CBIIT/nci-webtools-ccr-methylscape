create table annotation
(
    "id" integer primary key,
    "organSystem" text,
    "embedding" text,
    "class" text,
    "label" text,
    "x" real,
    "y" real
);
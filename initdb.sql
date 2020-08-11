--
-- PostgreSQL database dump
--

-- Dumped from database version 12.3 (Debian 12.3-1.pgdg100+1)
-- Dumped by pg_dump version 12.3 (Debian 12.3-1.pgdg100+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Recovery; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Recovery" (
    id integer NOT NULL,
    recovery_type_id integer,
    user_id integer,
    encrypted_seed text,
    key text,
    extra_information text,
    created_at bigint
);


ALTER TABLE public."Recovery" OWNER TO postgres;

--
-- Name: Recovery_Type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Recovery_Type" (
    id integer NOT NULL,
    name text
);


ALTER TABLE public."Recovery_Type" OWNER TO postgres;

INSERT INTO "public"."Recovery_Type" ("id", "name") VALUES ('1', 'Password');

INSERT INTO "public"."Recovery_Type" ("id", "name") VALUES ('2', 'Facebook');

INSERT INTO "public"."Recovery_Type" ("id", "name") VALUES ('3', 'Google');

INSERT INTO "public"."Recovery_Type" ("id", "name") VALUES ('4', 'Twitter');

INSERT INTO "public"."Recovery_Type" ("id", "name") VALUES ('5', 'VKontakte');
--
-- Name: Recovery_Type_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Recovery_Type_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Recovery_Type_id_seq" OWNER TO postgres;

--
-- Name: Recovery_Type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Recovery_Type_id_seq" OWNED BY public."Recovery_Type".id;


--
-- Name: Recovery_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Recovery_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Recovery_id_seq" OWNER TO postgres;

--
-- Name: Recovery_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Recovery_id_seq" OWNED BY public."Recovery".id;


--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id integer NOT NULL,
    email text,
    created_at bigint
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."User_id_seq" OWNER TO postgres;

--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- Name: Recovery id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Recovery" ALTER COLUMN id SET DEFAULT nextval('public."Recovery_id_seq"'::regclass);


--
-- Name: Recovery_Type id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Recovery_Type" ALTER COLUMN id SET DEFAULT nextval('public."Recovery_Type_id_seq"'::regclass);


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Data for Name: Recovery; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Recovery" (id, recovery_type_id, user_id, encrypted_seed, key, extra_information, created_at) FROM stdin;
\.


--
-- Data for Name: Recovery_Type; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Recovery_Type" (id, name) FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, email, created_at) FROM stdin;
\.


--
-- Name: Recovery_Type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Recovery_Type_id_seq"', 1, false);


--
-- Name: Recovery_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Recovery_id_seq"', 1, false);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."User_id_seq"', 1, false);


--
-- Name: Recovery_Type Recovery_Type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Recovery_Type"
    ADD CONSTRAINT "Recovery_Type_pkey" PRIMARY KEY (id);


--
-- Name: Recovery Recovery_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Recovery"
    ADD CONSTRAINT "Recovery_pkey" PRIMARY KEY (id);


--
-- Name: User User_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_email_key" UNIQUE (email);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Recovery Recovery_recovery_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Recovery"
    ADD CONSTRAINT "Recovery_recovery_type_id_fkey" FOREIGN KEY (recovery_type_id) REFERENCES public."Recovery_Type"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Recovery Recovery_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Recovery"
    ADD CONSTRAINT "Recovery_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."User"(id) ON UPDATE CASCADE;


--
-- PostgreSQL database dump complete
--


PGDMP  1    2                }            db_product_lifecycle    17.5    17.5 6    ?           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false            @           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false            A           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false            B           1262    16387    db_product_lifecycle    DATABASE     �   CREATE DATABASE db_product_lifecycle WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_Indonesia.1252';
 $   DROP DATABASE db_product_lifecycle;
                     postgres    false            �            1259    16436    tbl_attachment_produk    TABLE     G  CREATE TABLE public.tbl_attachment_produk (
    id integer NOT NULL,
    produk_id integer NOT NULL,
    nama_attachment character varying NOT NULL,
    url_attachment character varying,
    size character varying,
    type character varying,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);
 )   DROP TABLE public.tbl_attachment_produk;
       public         heap r       postgres    false            �            1259    16435    tbl_attachment_produk_id_seq    SEQUENCE     �   ALTER TABLE public.tbl_attachment_produk ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_attachment_produk_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            public               postgres    false    230            �            1259    16388    tbl_jabatan    TABLE     �   CREATE TABLE public.tbl_jabatan (
    id integer NOT NULL,
    jabatan character varying NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);
    DROP TABLE public.tbl_jabatan;
       public         heap r       postgres    false            �            1259    16430    tbl_jabatan_id_seq    SEQUENCE     �   ALTER TABLE public.tbl_jabatan ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_jabatan_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            public               postgres    false    217            �            1259    16444    tbl_kategori    TABLE     �   CREATE TABLE public.tbl_kategori (
    id integer NOT NULL,
    kategori character varying NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    icon_light character varying,
    icon_dark character varying
);
     DROP TABLE public.tbl_kategori;
       public         heap r       postgres    false            �            1259    16443    tbl_kategori_id_seq    SEQUENCE     �   ALTER TABLE public.tbl_kategori ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_kategori_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            public               postgres    false    232            �            1259    16393 
   tbl_produk    TABLE     x  CREATE TABLE public.tbl_produk (
    id integer NOT NULL,
    produk character varying(255),
    deskripsi text,
    id_kategori integer,
    id_segmen integer,
    id_stage integer,
    harga bigint,
    tanggal_launch date,
    pelanggan character varying(255),
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    tanggal_stage_end date
);
    DROP TABLE public.tbl_produk;
       public         heap r       postgres    false            �            1259    16398    tbl_produk_dev_histori    TABLE     j  CREATE TABLE public.tbl_produk_dev_histori (
    id integer NOT NULL,
    id_produk integer NOT NULL,
    tipe_pekerjaan character varying(100),
    tanggal_mulai date,
    tanggal_akhir date,
    version character varying(10),
    deskripsi text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    status character varying
);
 *   DROP TABLE public.tbl_produk_dev_histori;
       public         heap r       postgres    false            �            1259    16433    tbl_produk_dev_histori_id_seq    SEQUENCE     �   ALTER TABLE public.tbl_produk_dev_histori ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_produk_dev_histori_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            public               postgres    false    219            �            1259    16432    tbl_produk_id_seq    SEQUENCE     �   ALTER TABLE public.tbl_produk ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_produk_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            public               postgres    false    218            �            1259    16403    tbl_role    TABLE     �   CREATE TABLE public.tbl_role (
    id integer NOT NULL,
    role character varying(100) NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);
    DROP TABLE public.tbl_role;
       public         heap r       postgres    false            �            1259    16431    tbl_role_id_seq    SEQUENCE     �   ALTER TABLE public.tbl_role ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_role_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            public               postgres    false    220            �            1259    16452 
   tbl_segmen    TABLE     �   CREATE TABLE public.tbl_segmen (
    id integer NOT NULL,
    segmen character varying NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    icon_light character varying,
    icon_dark character varying
);
    DROP TABLE public.tbl_segmen;
       public         heap r       postgres    false            �            1259    16451    tbl_segmen_id_seq    SEQUENCE     �   ALTER TABLE public.tbl_segmen ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_segmen_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            public               postgres    false    234            �            1259    16460 	   tbl_stage    TABLE     �   CREATE TABLE public.tbl_stage (
    id integer NOT NULL,
    stage character varying,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    icon_light character varying,
    icon_dark character varying
);
    DROP TABLE public.tbl_stage;
       public         heap r       postgres    false            �            1259    16406    tbl_stage_histori    TABLE       CREATE TABLE public.tbl_stage_histori (
    id integer NOT NULL,
    id_produk integer NOT NULL,
    stage_previous character varying(150),
    stage_now character varying(150),
    catatan text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);
 %   DROP TABLE public.tbl_stage_histori;
       public         heap r       postgres    false            �            1259    16434    tbl_stage_histori_id_seq    SEQUENCE     �   ALTER TABLE public.tbl_stage_histori ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_stage_histori_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            public               postgres    false    221            �            1259    16459    tbl_stage_id_seq    SEQUENCE     �   ALTER TABLE public.tbl_stage ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_stage_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            public               postgres    false    236            �            1259    16411    tbl_user    TABLE     x  CREATE TABLE public.tbl_user (
    id integer NOT NULL,
    username character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    photo character varying(255),
    role integer NOT NULL,
    jabatan integer,
    password text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    fullname character varying(100)
);
    DROP TABLE public.tbl_user;
       public         heap r       postgres    false            �            1259    16428    tbl_user_id_seq    SEQUENCE     �   ALTER TABLE public.tbl_user ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_user_id_seq
    START WITH 2
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 999999
    CACHE 1
);
            public               postgres    false    222            6          0    16436    tbl_attachment_produk 
   TABLE DATA                 public               postgres    false    230   �?       )          0    16388    tbl_jabatan 
   TABLE DATA                 public               postgres    false    217   �@       8          0    16444    tbl_kategori 
   TABLE DATA                 public               postgres    false    232   �A       *          0    16393 
   tbl_produk 
   TABLE DATA                 public               postgres    false    218   �B       +          0    16398    tbl_produk_dev_histori 
   TABLE DATA                 public               postgres    false    219   �D       ,          0    16403    tbl_role 
   TABLE DATA                 public               postgres    false    220   �D       :          0    16452 
   tbl_segmen 
   TABLE DATA                 public               postgres    false    234   pE       <          0    16460 	   tbl_stage 
   TABLE DATA                 public               postgres    false    236   �F       -          0    16406    tbl_stage_histori 
   TABLE DATA                 public               postgres    false    221   �G       .          0    16411    tbl_user 
   TABLE DATA                 public               postgres    false    222   �G       C           0    0    tbl_attachment_produk_id_seq    SEQUENCE SET     K   SELECT pg_catalog.setval('public.tbl_attachment_produk_id_seq', 10, true);
          public               postgres    false    229            D           0    0    tbl_jabatan_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.tbl_jabatan_id_seq', 36, true);
          public               postgres    false    224            E           0    0    tbl_kategori_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.tbl_kategori_id_seq', 5, true);
          public               postgres    false    231            F           0    0    tbl_produk_dev_histori_id_seq    SEQUENCE SET     L   SELECT pg_catalog.setval('public.tbl_produk_dev_histori_id_seq', 1, false);
          public               postgres    false    227            G           0    0    tbl_produk_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.tbl_produk_id_seq', 7, true);
          public               postgres    false    226            H           0    0    tbl_role_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.tbl_role_id_seq', 34, true);
          public               postgres    false    225            I           0    0    tbl_segmen_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.tbl_segmen_id_seq', 5, true);
          public               postgres    false    233            J           0    0    tbl_stage_histori_id_seq    SEQUENCE SET     G   SELECT pg_catalog.setval('public.tbl_stage_histori_id_seq', 1, false);
          public               postgres    false    228            K           0    0    tbl_stage_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.tbl_stage_id_seq', 5, true);
          public               postgres    false    235            L           0    0    tbl_user_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.tbl_user_id_seq', 25, true);
          public               postgres    false    223            �           2606    16442 .   tbl_attachment_produk tbl_attachment_produk_pk 
   CONSTRAINT     l   ALTER TABLE ONLY public.tbl_attachment_produk
    ADD CONSTRAINT tbl_attachment_produk_pk PRIMARY KEY (id);
 X   ALTER TABLE ONLY public.tbl_attachment_produk DROP CONSTRAINT tbl_attachment_produk_pk;
       public                 postgres    false    230            �           2606    16417    tbl_jabatan tbl_jabatan_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public.tbl_jabatan
    ADD CONSTRAINT tbl_jabatan_pkey PRIMARY KEY (id);
 F   ALTER TABLE ONLY public.tbl_jabatan DROP CONSTRAINT tbl_jabatan_pkey;
       public                 postgres    false    217            �           2606    16450    tbl_kategori tbl_kategori_pk 
   CONSTRAINT     Z   ALTER TABLE ONLY public.tbl_kategori
    ADD CONSTRAINT tbl_kategori_pk PRIMARY KEY (id);
 F   ALTER TABLE ONLY public.tbl_kategori DROP CONSTRAINT tbl_kategori_pk;
       public                 postgres    false    232            �           2606    16419    tbl_produk tbl_product_pkey 
   CONSTRAINT     Y   ALTER TABLE ONLY public.tbl_produk
    ADD CONSTRAINT tbl_product_pkey PRIMARY KEY (id);
 E   ALTER TABLE ONLY public.tbl_produk DROP CONSTRAINT tbl_product_pkey;
       public                 postgres    false    218            �           2606    16421 2   tbl_produk_dev_histori tbl_produk_dev_histori_pkey 
   CONSTRAINT     p   ALTER TABLE ONLY public.tbl_produk_dev_histori
    ADD CONSTRAINT tbl_produk_dev_histori_pkey PRIMARY KEY (id);
 \   ALTER TABLE ONLY public.tbl_produk_dev_histori DROP CONSTRAINT tbl_produk_dev_histori_pkey;
       public                 postgres    false    219            �           2606    16423    tbl_role tbl_role_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.tbl_role
    ADD CONSTRAINT tbl_role_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.tbl_role DROP CONSTRAINT tbl_role_pkey;
       public                 postgres    false    220            �           2606    16458    tbl_segmen tbl_segmen_pk 
   CONSTRAINT     V   ALTER TABLE ONLY public.tbl_segmen
    ADD CONSTRAINT tbl_segmen_pk PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.tbl_segmen DROP CONSTRAINT tbl_segmen_pk;
       public                 postgres    false    234            �           2606    16425 (   tbl_stage_histori tbl_stage_histori_pkey 
   CONSTRAINT     f   ALTER TABLE ONLY public.tbl_stage_histori
    ADD CONSTRAINT tbl_stage_histori_pkey PRIMARY KEY (id);
 R   ALTER TABLE ONLY public.tbl_stage_histori DROP CONSTRAINT tbl_stage_histori_pkey;
       public                 postgres    false    221            �           2606    16466    tbl_stage tbl_stage_pk 
   CONSTRAINT     T   ALTER TABLE ONLY public.tbl_stage
    ADD CONSTRAINT tbl_stage_pk PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.tbl_stage DROP CONSTRAINT tbl_stage_pk;
       public                 postgres    false    236            �           2606    16427    tbl_user tbl_users_pkey 
   CONSTRAINT     U   ALTER TABLE ONLY public.tbl_user
    ADD CONSTRAINT tbl_users_pkey PRIMARY KEY (id);
 A   ALTER TABLE ONLY public.tbl_user DROP CONSTRAINT tbl_users_pkey;
       public                 postgres    false    222            6     x���OK�0��>�{�b����ԓ`�b�F�M<�lUήh�����N�K��$?�$+⼄$+��t��zE���������Ǻu�۶�^`���<�N�(�2���U:�?��t "��p3_W���>����z��a?��%LZ��7dȔ2j��M��Ʒ�m�O)��'L�H��#QB!7T��l��痣�Lf��>�2�;�<Ve�T3q������RFkiѲ��d E�l�����h�~q��&e�Q�C�cX\EBd�{��F�B��      )   �   x����
�@�O1��2VSV�$(�`�&t����	��}ѱS ��a��͌�eZ(�Z��Q��0�U��b�X�iQ�D�K�;���q�M?U�Л��4�Vw�;�����e��8�h�sƧ�ǣ`�8��m������	Za�g��f��;�Y�@�v@��x:�&�)MW"ĵ�@�O����Qo+p���}|?�̣�Q�(�ׄVp��~�}      8   �   x�őQK�0���+�6EW��7��i`�@���>��f5�t%M��{Ü�||�ˁ�9�{�($/+$�j��iי&t��>(�ۣ5h��e)�D�䫬�ڮ��R�n�{�X��;9Ӹq�G��l���h�>�;̼[l����>�b���v�f�H��CY=G��3�n&k�i>�O�m;�x���V��N�����_n�aC����םi�]M��4�8��*���`�z��݂�����      *   !  x�͔M��@�������Ӡ �'w���q&�Ӧ���t��q⿟n�+��&{1!B}t��T�X'�v����&�,����̛������y��C����͖�qw&�����e�Ê
Z`�BÆS�!U�c,4�J�!k���P�֪�t��[X-y��&,�è�yB�I�������T�TT;�%p���'���M��Da� ���_���?{���)ԙ-`&(?i�հ����W4�3���*�D��D�9�Mm��5�K�q7���8��Y�ĳɞ�i�����T�,���	���S����S4g�%倷	PX�Fe����i!��g^D{�K³�GC=�Te�8B�Y��>A�0���'YV
�(jv4�ݹ�xdFr}�vZ�A���+h�ob�l�ӓ�M�"?����9
4\�;��H��ۺ7�R
��ꐏ�!��'W��K��vo�L��{�����r֨?�:\�<)��P(�C~�w��9�~pO=r}��=�U�z�J�r�������^���.��M&�]Z߷�_���5���?���V��^�=�Ɛ      +   
   x���          ,   �   x���v
Q���W((M��L�+Iʉ/��IU�s
�t��sW�q�Us�	u���
�:
�)��y�@�����������������������������9P�_����5�'��	-N-"�:.. M�:8      :   -  x���]K�0����\9E��ӓ�+aE��k7�j�ZjX���
�{S�8�wB���!I���$i>%����ϴ+�U[V�ґ�2�ϓq�ޓ�)��G���,����K~C��\�Y�)��ֶ�'����&LGRDRSDq��O��d�3��Um��n�$B(�A����$^L��@ U���$��_�7Ƶ��j�8P�vRt����s��yԁ�x�6�mc�ZE��$Y(��U#P�y��+fem>�3��7WU���,⒆B���ޏG��sd�<~�+ƶ�[��+1I��_�>�w��%�W      <     x����j�@�}�bv�����3�]"A04	t%j��Z-fl��wH!)��E��0�˜oq�0��5���
��Y]����Ӳ@��E��(~���mg����1�#���ݵ�>�U�X�M1�)�S� � \�m	�K��� 0;�ߓ�*�:!�)`���Gi�vi�z�)�S~�4�����`ѵ�z?��.f6|̫Ǌ��U�����L�2�}W�㠘I3:*� �".��D�M����)��!��@\KFot`
f�KzDoi�v������٠�O�e����T�G      -   
   x���          .   f  x���Ks�0����,���j&c(�T*2(����D�D���/T�:�v���=���OY������pC����E�`<Wg3���4`�X�j�y�p��i�����rP�E����]7z������W��ISN�W#0��R@���U'n���N�N�2eK��i_i1t��B��([Ӭ�������o�㳲!���-�H�	��������Q�a��D:��U�ۇ��2�B��Dܸ����I�H�X_�F%��-Dg�4������<H=e�i���i��{��7۽B�b'n���{2�ӟx�"��y��D0�c����(e��Ydy���)���*}��uȗ�     
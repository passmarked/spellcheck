RUN apt-get install -y aspell hunspell

# install required utils
RUN apt-get install -y tofrodos dos2unix

# install languages to be used
RUN apt-get install -y hunspell-an
RUN apt-get install -y hunspell-de-de
RUN apt-get install -y hunspell-fr
RUN apt-get install -y hunspell-fr-comprehensive
RUN apt-get install -y hunspell-ar
RUN apt-get install -y hunspell-ru
RUN apt-get install -y hunspell-be
RUN apt-get install -y hunspell-se
RUN apt-get install -y hunspell-br
RUN apt-get install -y hunspell-en-ca
RUN apt-get install -y hunspell-en-med
RUN apt-get install -y hunspell-en-us
RUN apt-get install -y hunspell-eu-es
RUN apt-get install -y hunspell-gl-es
RUN apt-get install -y hunspell-da
RUN apt-get install -y hunspell-hu
RUN apt-get install -y hunspell-kk
RUN apt-get install -y hunspell-ko
RUN apt-get install -y hunspell-de-ch
RUN apt-get install -y hunspell-ml
RUN apt-get install -y hunspell-uz
RUN apt-get install -y hunspell-ne
RUN apt-get install -y hunspell-vi

RUN apt-get install -y myspell-af
RUN apt-get install -y myspell-en-us
RUN apt-get install -y myspell-en-za
RUN apt-get install -y myspell-he
RUN apt-get install -y myspell-ns
RUN apt-get install -y myspell-th
RUN apt-get install -y myspell-hr
RUN apt-get install -y myspell-pl
RUN apt-get install -y myspell-tl
RUN apt-get install -y myspell-ca
RUN apt-get install -y myspell-eo
RUN apt-get install -y myspell-hu
RUN apt-get install -y myspell-pt
RUN apt-get install -y myspell-tn
RUN apt-get install -y myspell-cs
RUN apt-get install -y myspell-es
RUN apt-get install -y myspell-hy
RUN apt-get install -y myspell-pt-br
RUN apt-get install -y myspell-da
RUN apt-get install -y myspell-et
RUN apt-get install -y myspell-it
RUN apt-get install -y myspell-ts
RUN apt-get install -y myspell-ru
RUN apt-get install -y myspell-uk
RUN apt-get install -y myspell-sk
RUN apt-get install -y myspell-uk
RUN apt-get install -y myspell-ga
RUN apt-get install -y myspell-nl
RUN apt-get install -y myspell-en-au
RUN apt-get install -y myspell-en-gb
RUN apt-get install -y myspell-nl
RUN apt-get install -y myspell-nr
RUN apt-get install -y myspell-sw

RUN apt-get install -y scowl

RUN apt-get install -y unzip wget

RUN mkdir -p /Library/Spelling
RUN wget -O /tmp/build.zip https://package.passmarked.com/dictionaries/scowl/2016/06/build.zip
RUN unzip /tmp/build.zip -d /Library/Spelling
RUN rm /tmp/build.zip || true

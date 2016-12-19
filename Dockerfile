# install the actual 
RUN apt-get install -y aspell hunspell

# install required utils
RUN apt-get install -y tofrodos dos2unix

# install the hunspell dictionaries
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
RUN apt-get install -y hunspell-en-za
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

# install the dictionaries from hunspell
RUN apt-get install -y hunspell-af
RUN apt-get install -y hunspell-he
RUN apt-get install -y myspell-ns
RUN apt-get install -y hunspell-th
RUN apt-get install -y hunspell-hr
RUN apt-get install -y hunspell-pl
RUN apt-get install -y hunspell-tl
RUN apt-get install -y hunspell-ca
RUN apt-get install -y hunspell-eo
RUN apt-get install -y hunspell-hu
RUN apt-get install -y myspell-pt
RUN apt-get install -y myspell-tn
RUN apt-get install -y hunspell-cs
RUN apt-get install -y hunspell-es
RUN apt-get install -y myspell-hy
RUN apt-get install -y hunspell-pt-br
RUN apt-get install -y hunspell-da
RUN apt-get install -y hunspell-et
RUN apt-get install -y hunspell-it
RUN apt-get install -y myspell-ts
RUN apt-get install -y hunspell-ru
RUN apt-get install -y hunspell-uk
RUN apt-get install -y hunspell-sk
RUN apt-get install -y hunspell-uk
RUN apt-get install -y myspell-ga
RUN apt-get install -y hunspell-nl
RUN apt-get install -y hunspell-en-au
RUN apt-get install -y hunspell-en-gb
RUN apt-get install -y hunspell-nl
RUN apt-get install -y myspell-nr
RUN apt-get install -y hunspell-sw

# install the scrowl modules from the repos
RUN apt-get install -y scowl

# make sure we can actually download and unzip the packages
RUN apt-get install -y unzip wget

# make sure the folder exists for our custom dictionaries
RUN mkdir -p /Library/Spelling

# download SCOWL dictionary
RUN wget -O /tmp/build.zip https://package.passmarked.com/dictionaries/scowl-20160910.zip
RUN unzip /tmp/build.zip -d /Library/Spelling
RUN rm /tmp/build.zip || true

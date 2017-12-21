# update
RUN apt-get update

# install the actual 
RUN apt-get install -y aspell hunspell

# install required utils
RUN apt-get install -y tofrodos dos2unix

# install the hunspell dictionaries
RUN apt-get install -y hunspell-an || true
RUN apt-get install -y hunspell-de-de || true
RUN apt-get install -y hunspell-fr || true
RUN apt-get install -y hunspell-fr-comprehensive || true
RUN apt-get install -y hunspell-ar || true
RUN apt-get install -y hunspell-ru || true
RUN apt-get install -y hunspell-be || true
RUN apt-get install -y hunspell-se || true
RUN apt-get install -y hunspell-br || true
RUN apt-get install -y hunspell-en-ca || true
RUN apt-get install -y hunspell-en-med || true
RUN apt-get install -y hunspell-en-us || true
RUN apt-get install -y hunspell-en-za || true
RUN apt-get install -y myspell-en-za || true
RUN apt-get install -y hunspell-eu-es || true
RUN apt-get install -y hunspell-gl-es || true
RUN apt-get install -y hunspell-da || true
RUN apt-get install -y hunspell-hu || true
RUN apt-get install -y hunspell-kk || true
RUN apt-get install -y hunspell-ko || true
RUN apt-get install -y hunspell-de-ch || true
RUN apt-get install -y hunspell-ml || true
RUN apt-get install -y hunspell-uz || true
RUN apt-get install -y hunspell-ne || true
RUN apt-get install -y hunspell-vi || true

# install the dictionaries from hunspell
RUN apt-get install -y hunspell-af || true
RUN apt-get install -y hunspell-he || true
RUN apt-get install -y myspell-ns || true
RUN apt-get install -y hunspell-th || true
RUN apt-get install -y hunspell-hr || true
RUN apt-get install -y hunspell-pl || true
RUN apt-get install -y hunspell-tl || true
RUN apt-get install -y hunspell-ca || true
RUN apt-get install -y hunspell-eo || true
RUN apt-get install -y hunspell-hu || true
RUN apt-get install -y myspell-pt || true
RUN apt-get install -y myspell-tn || true
RUN apt-get install -y hunspell-cs || true
RUN apt-get install -y hunspell-es || true
RUN apt-get install -y myspell-hy || true
RUN apt-get install -y hunspell-pt-br || true
RUN apt-get install -y hunspell-da || true
RUN apt-get install -y hunspell-et || true
RUN apt-get install -y hunspell-it || true
RUN apt-get install -y myspell-ts || true
RUN apt-get install -y hunspell-ru || true
RUN apt-get install -y hunspell-uk || true
RUN apt-get install -y hunspell-sk || true
RUN apt-get install -y hunspell-uk || true
RUN apt-get install -y myspell-ga || true
RUN apt-get install -y hunspell-nl || true
RUN apt-get install -y hunspell-en-au || true
RUN apt-get install -y hunspell-en-gb || true
RUN apt-get install -y hunspell-nl || true
RUN apt-get install -y myspell-nr || true
RUN apt-get install -y hunspell-sw || true

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
# ptn 🗞️

Need to read the news but stuck out in the bush with only one bar of 3G? Only have a few kilobytes of precious cellular data left and really need to read the news? You'll love ptn! ❤️

ptn (plain text news) is the service which runs [news.pancake.nz](https://news.pancake.nz) (and maybe another domain in the future). The goal of ptn is to provide an up to date index of news headlines as efficiently as possible. At the moment the homepage is only ~6.4kB depending on the headlines that day. Single source pages are usually ~5kB.

ptn works by reading the metadata of news articles it finds on news website homepages. That info is used to generate some HTML files that are then sent to an AWS S3 bucket. It also invalidates the current CloudFront cache so users always see the current version.

You must populate a .env file with the following fields and their values: (see .example.env)

```env
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
CLOUDFRONT_DISTRIBUTION_ID
REGION
BUCKET_NAME
```

## Requirements

```
node (tested on v16.14.2)
yarn
```

## Install

```bash
yarn install
```

## Run

```bash
yarn start
```

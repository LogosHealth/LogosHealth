# Ionic App Deploy Manual

* Reference 1: <https://ionicframework.com/getting-started>

* Reference 2: <https://ionicframework.com/docs/pro/devapp/>

* Reference 3: <https://github.com/ionic-team/starters/tree/master/ionic-angular/official/aws>

* Reference 4: <https://dashboard.ionicjs.com/app/af331d91/code/builds/list>

## Pre-requisites
* Install Node
  `https://nodejs.org/en/`

* Install clis:
  `sudo npm install -g cordova ionic`
  and
  `sudo npm install -g awsmobile-cli`

* Download 'Ionic View' and 'Ionic DevApp' from app store

## Start [ion template pro] app on local machine

* download app zip file, unzip, cd into content

* Serve app using default setting
  `ionic serve -c`

* Browse on Ionic DevApp on your phone (Your phone and your machine need to be one same network)

## Start aws demo [AwsDemoApp] on aws

`ionic start AwsDemoApp aws` 

  * follow prompt instruction 

  * app name: AwsDemoApp

  * select y on all y/n questions

`cd ./AwsDemoApp`

`awsmobile init`

  * follow prompt instruction 

  * use default setting when prompted, **EXCEPT**

    * use IAM user ionic-deploy, secret 4WuwtGTMZv77e1agN8yUwITekt0rDzV2uf/oZiCD

`awsmobile features` (select all)

`awsmobile database configure`

  * follow instruction: [readme](https://github.com/ionic-team/starters/tree/master/ionic-angular/official/aws#creating-aws-mobile-hub-project) configure database section
  
`awsmobile run`

[Browse app in your web browser]

[Browse on Ionic DevApp on your phone]

[Validate AWS database backend]

## Publish test [app] in ionic dashboard

[Browse on Ionic View on your phone]


## Make changes to test [app] and review changes


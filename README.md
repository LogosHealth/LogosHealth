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

You should be able to:

* Browse on Ionic DevApp on your phone (Your phone and your machine need to be one same network)

* Browse app in web browser (an browser tab should be opened automatically displaying login page)

`npm run build`

`awsmobile publish`

You should be able to:

* Browse web app using S3 endpoint provided in the terminal window

`git push ionic master`

You should be able to:

* See AwsDemoApp in your ionic account dashboard

## Publish test [app] in ionic dashboard

[Browse on Ionic View on your phone]

Next Steps:
* Go to your newly created project: cd ./AwsDemoApp
* Get Ionic DevApp for easy device testing: https://bit.ly/ionic-dev-app
* Finish setting up Ionic Pro Error Monitoring: https://ionicframework.com/docs/pro/monitoring/#getting-started
* Finally, push your code to Ionic Pro to perform real-time updates, and more: git push ionic master


## Make changes to test [app] and review changes


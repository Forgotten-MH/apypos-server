# Apypos (Monster Hunter Explore Server Emulator)
This repository contains the source code for a server emulator for the game Monster Hunter Explore.

The code you may find is in a `WIP` state. 

If you paid for any of this you was scammed. 

## DISCLAIMER

This project is an unofficial, fan-made private server created for educational and personal use only. It is not affiliated with, endorsed by, or connected in any way to Capcom or its affiliates. All trademarks and copyrights related to MHXR are the property of their respective owners.
This server and its associated software are provided “AS IS,” without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose, and non-infringement.
The developers and contributors of this project are not responsible for any damages, losses, or legal consequences arising from the use of this server or its software.
Use of this server may violate the terms of service of Capcom and could result in suspension or banning from official services. Users assume all risk and responsibility for participating.

## License
This project is licensed under the AGPL-3.0 License - see the [LICENSE](./LICENSE) file for details.

### Important
If you modify this software and make it available to others over a network (for example, by hosting a web service), you must provide the complete source code of your modified version to all users of that service, per the AGPL terms.

## Why the Name?
The server is called Apypos. To keep with the theme Erupe set. It was originally called Boromir, after the Guild Executive from MHXR and was randomly chosen name by the initial framework developer as they had not played the game when it was live. It was changed because LOTR association just felt like it didnt fit MH which we also found it might have been a localization error.

## Prerequisites

* Node.js and npm
    * Using NVM [Download NVM here](https://github.com/nvm-sh/nvm/releases/)
        ```bash
        nvm install [version_number]
        ```
        For example:
        ```bash
        nvm install 20
        ```
    * Direct Download
        [Download Node.js and npm](https://nodejs.org/)
* Yarn
    ```bash
    npm install -g yarn
    ```
* Git (Optional)
    [Download Git for Windows](https://gitforwindows.org/)

* Mongo DB
    Install it locally [Download Mongo](https://www.mongodb.com/products/self-managed/community-edition)
    or you can run `docker-compose up` in the root of this directory if you have `https://www.docker.com/` installed.

## Setup

1. Clone the repository (if you haven't already):

2. Install the dependencies:

    ```bash
    yarn install
    ```
    ```bash
    yarn run install:clean
    ```

3. Configuration:

    * Ensure you have set the necessary environment variables or configurations needed by the project. Including DB Connection config.
    * Edit any configuration files if necessary.

4. Build the project:
   
    ```bash
    yarn build
    ```


## Resource Files
The server expects you to place some files for the game to download within `src\public\res\download` for your platform of choosing. Andriod or iOS. These files are FPK files a compressed archive which has the game arc files within. As the only files ive been able to get are `v0282` this is all the server supports. You can use a backup of the games files and run the FPK Packer script over the files to generate these fpks.

## Banner resources
The game would download extra banners on start up for events. This is disabled but if you want to enable this you need to populate the API in `src\controllers\bannerController.ts` and then place your respective files in `src\public\res\banner` for your platform of choosing. Pre installed files would have these files bundled in you would need to seperate them out from resource files. 


## Running the Project

After setting up and Putting the resource files in you can run the project using:

  ```bash
    yarn start
  ```
Alternatively you can run it in dev mode which enables nodemon for automatic file refresh

  ```bash
    yarn run start:dev
  ```

Your server should start, and you should be able to access it on `http://localhost:80` or whatever port you've configured.

# ID's and Quests
Most IDs can be found in the game files under `arc_cmn\resident` you will need to extract the arcs and then convert the xfs files to xml. There is a tool called Revil Toolkit `https://github.com/PredatorCZ/RevilLib`

## Logging

This project uses Winston for logging. Logs are displayed in the console in the format:


Request: [HTTP_METHOD] [URL] | Response: [STATUS_CODE] [RESPONSE_TIME]ms

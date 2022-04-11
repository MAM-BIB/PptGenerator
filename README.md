<!-- PROJECT LOGO -->
<br />
<div align="center">
        <img src="pics/pptLogo128x128.png" alt="Logo" width="80" height="80">
    <h3 align="center">PptGenerator</h3>
    <p align="center">
        A software to manage huge PowerPoint slide collections.
        <br />
        <br />
        <a href="#">Report Bug</a>
        ·
        <a href="#">Request Feature</a>
    </p>
</div>

<br />
<br />
  
<div align="center">
    <img src="pics/ProgrammScreenshot.png" alt="Main Window" width="1000" height="563">
</div>  

<br />
<br />

<!-- ABOUT THE PROJECT -->
## About The Project  

If you have a collection of PowerPoint slides that you will reuse for different presentation, you can easily create o new presentation with the slides from your collection.  

Features: 
* You can create a new presentation without opening PowerPoint
* You can easily select multiple slides from your collection
* You can use placeholders that will be replaced by the program
* You can save presentations as a preset and load them up again to change them
* You can load pptx files created with this program similar to presets (presets have smaller file size)

<br />

__IMPORTANT__  
All slides need to have a `UID`  
A UID is written in the notes a presentation and looks like this:  
```sh
  UID:LTCyabi1keUKQEvQd7aKnQ
  ```
Since the UIDs are required and every slide from your collections needs to a unique one, the program will check the UIDs and tells if the UIDs are missing or if there a duplicated ones. You will then have the ability to change them manually or let the program do it for you.

<br />

### Built With  

* [Electron](https://www.electronjs.org/)
* [Open XML SDK](https://docs.microsoft.com/de-de/office/open-xml/open-xml-sdk)

<br />

<!-- GETTING STARTED -->
## Getting Started

### Prerequisites  

* [Visual Studio](https://visualstudio.microsoft.com/)
* npm
  ```sh
  npm install npm@latest -g
  ```

### Installation  

1. Clone the repository
   ```sh
   git clone https://github.com/username/project-name.git
   ```

<br />

2. Install npm packages
   ```sh
   npm i
   ```

<br />

3. Create config.json in frontend/config/config.json with the following content:
   ```sh
   {
        "metaJsonPath": "",
        "metaPicsPath": "",
        "coreApplication": "",
        "picsApplication": "../../backend/powershell/pics.ps1",
        "specificPicsApplication": "../../backend/powershell/specificPics.ps1",
        "pdfApplication": "../../backend/powershell/pdf.ps1",
        "presetPath": "",
        "basePath": "",
        "defaultExportPath": "",
        "backupPath": "",
        "presentationMasters": [],
        "ignoreHiddenSlides": true,
        "showTutorial": true,
        "imgZoom": 70
    }
    ```

<br />

4. Create the following folders and files in your project and set the location in the config:
    * A 'meta.json' file -> metaJsonPath
    * A 'pics' folder -> metaPicsPath
    * A 'preset' folder -> presetPath
    * A 'export' folder -> defaultExportPath
    * A 'backup' folder -> backupPath 

<br />

5. Build the C# project and set the path to the builded file to 'coreApplication'

<br />

6. You should now be able to start the application with:
   ```sh
   npm run start
   ```

<br />

7. To build/distribute the project use
   ```sh
   npm run dist
   ```

<br />

<!-- USAGE -->
## Usage  

<br />

### Scanning a Presentation  
When you start the program for the first time you don't have slides on the left side. When you added a presentation in your settings, you can Scan all the added pptx-files.
When dong that all the necessary information will be saved in a meta.json. The location to that json is set in you options. The GUI only loads slides from that meta file
so that you don't scan a presentation every time you start the program. However you should scan your presentation once a day when multiple people can edit your collection.  
<br />
While scanning your presentations the program will check the uids from all slides. If there is anything wrong with them the program will warn you and give you the options
to fix the problem automatically by generating new UIDs for the slides or let you fix it manually.

<br />

### Create a Presentation  
You can create a new presentation out of the slides from your collections. You simply click on one slide to toggle a selection.
If a slide is selected they appear on the right side under the header New Presentation. After you selected all slides you want you can click on export.
Then a new window will open where you need to enter a name for the presentation and set a location where it will be saved.

<br />

### Replace Placeholder  
If one of the selected slides contains at least one Placeholder an other window will open before you get to the export window.
There you can enter a value for all placeholders that are found in the slides you selected.
It is important that a placeholder is formatted like this: `~$Placeholder$~`

<br />

### Create and Load Templates  
While creating a new presentation you have the option to select that you want to create a preset of this presentation. That means while creating a pptx file,
the program will also create a .json file with the name you entered for the presentation in the preset path that is set in the config (You can change this in the options).
After you created this file, you have the ability to load this json, so the program will select all slides that were selected when creating this preset.


<br />

### Loading a Pptx File  
When you didn't create a preset you have the ability to load a pptx file directly. When doing this the program will select all slides in that are in the pptx file
based on the UID. When there are slides with UIDs that are not in your collections, the program will give you a warning with the slides. 


<br />

### Scanning a Folder
When you click Scan a folder under Menu>File>Scan Folder you are able to select a folder. This folder wil be scanned for *.pptx files recursive.
When there a slides with UIDs that are contained in the slide masters and have different content, you will se a the orignal slide (from the slideMaster) and all version
that were found. You can only select one slide under this UID and update the slide master.  
If there are slides with UIDs that are not in the slide Masters, you will be abel to select a slide master and select the slides to add to the master.  
Slides with no UID will be ignored. 
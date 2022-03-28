# PptGenerator  

Witch this project you can manage pptx-files. You can select a presentation as a template and copy specific slides into a new presentation.  
If there are Variables in the Presentation, the program will detect these and ask the user to fill in Values. The Variables will be replaced in the new presentation.  

## Frontend  

The frontend is a GUI based on electron and communicates with the local backend via NodeJS.

## Backend  

The backend is a program in C# which takes arguments from the GUI and creates presentations according to them.
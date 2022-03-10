import { ipcRenderer, OpenDialogReturnValue } from "electron";

export function addAllBrowseHandler() {
    for (const button of document.getElementsByClassName("browse-btn")) {
        button.addEventListener("click", async () => {
            const input = button.parentElement?.getElementsByTagName("input")[0] as HTMLInputElement;

            const options = {
                properties: [] as string[],
                defaultPath: input.value,
            };

            if (button.classList.contains("directory")) {
                options.properties.push("openDirectory");
            } else if (button.classList.contains("file")) {
                options.properties.push("openFile");
            }

            try {
                const directoryPath: OpenDialogReturnValue = await ipcRenderer.invoke("openDialog", options);
                if (!directoryPath.canceled && directoryPath.filePaths.length > 0) {
                    [input.value] = directoryPath.filePaths;
                    input.dispatchEvent(new Event("change"));
                }
            } catch (error) {
                console.log(error);
            }
        });
    }
}

export function addBrowseHandler(button: HTMLButtonElement) {}

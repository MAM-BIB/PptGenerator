using System;
using System.Collections.Generic;
using System.Text;
using PptGenerator.Manager;
using PptGenerator.CommandLine;
using System.IO;

namespace PptGenerator.Creator {
    class PresentationCreator {


        public static void Create(CommandLineArgument clArg) {

            string outPath = clArg.OutPath;
            string inPath = clArg.InPaths[0];
            List<uint> slidePos = clArg.SlidePos;
            bool ignoreTheme = clArg.IgnoreTheme;
            bool deleteFirstSlide = clArg.DeleteFirstSlide;
            string basePath = clArg.BasePath;

            if(basePath != null) {
                try {
                    File.Copy(basePath, outPath, true);
                } catch (IOException e) {
                    throw e;
                }
            }

            PptFileManager.Copy(inPath, slidePos, outPath);

            if (deleteFirstSlide) {
                PptFileManager.DeleteOneSlide(outPath, 0);
            }

            if (!ignoreTheme) {
                PptFileManager.ApplyThemeToPresentation(outPath, inPath);
            }
        }
    }
}

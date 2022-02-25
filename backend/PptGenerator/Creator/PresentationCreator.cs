using System;
using System.Collections.Generic;
using System.Text;
using PptGenerator.Manager;
using PptGenerator.CommandLine;

namespace PptGenerator.Creator {
    class PresentationCreator {
        public static void Create(CommandLineArgument arguments) {
            string outPath = arguments.OutPath;
            string inPath = arguments.InPaths[0];
            List<uint> slidePos = arguments.SlidePos;
            bool ignoreTheme = arguments.IgnoreTheme;

            PptFileManager.Copy(inPath, slidePos, outPath);

            if (!ignoreTheme) {
                PptFileManager.ApplyThemeToPresentation(outPath, inPath);
            }
        }
    }
}

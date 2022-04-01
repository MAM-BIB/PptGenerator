using System;
using System.Collections.Generic;
using System.Text;
using PptGenerator.Manager;
using PptGenerator.CommandLine;
using System.IO;

namespace PptGenerator.Creator {
    class PresentationCreator {
        /// <summary>
        /// Creates a new presentation for a command-line argument
        /// </summary>
        /// <param name="clArg">A command-line argument</param>
        public static void Create(CommandLineArgument clArg) {
            string outPath = clArg.OutPath;
            string inPath = clArg.InPaths[0];
            List<uint> slidePos = clArg.SlidePos;
            bool ignoreTheme = clArg.IgnoreTheme;
            bool deleteFirstSlide = clArg.DeleteFirstSlide;
            string basePath = clArg.BasePath;
            List<KeyValuePair<string, string>> placeholders = clArg.Placeholders;

            if (basePath != null) {
                File.Copy(basePath, outPath, true);
            }

            PptFileManager.Copy(inPath, slidePos, outPath, placeholders);

            if (deleteFirstSlide) {
                PptFileManager.DeleteOneSlide(outPath, 0);
            }

            if (!ignoreTheme) {
                PptFileManager.ApplyThemeToPresentation(outPath, inPath);
            }
        }
    }
}

using System;
using System.Collections.Generic;
using System.Text;
using System.Linq;

namespace PptGenerator.CommandLine {
    class CommandLineArgumentParser {
        public static CommandLineArgument Parse(string[] args) {
            List<string> argList = new List<string>(args);

            // Parse -help
            if (argList.Contains("-help") || argList.Count == 0) {
                Console.WriteLine("-help");
                Console.WriteLine("-mode <scan|create>");
                Console.WriteLine("-outPath <path>");
                Console.WriteLine("-inPath <path> (<path>? ...)");
                Console.WriteLine("-slidePos <slidePos,slidePos,...>");
                return null;
            }

            // Parse the -mode <scan|create> argument
            Mode mode = Mode.scan;
            int modeIndex = argList.IndexOf("-mode");
            if (modeIndex < 0 || modeIndex >= argList.Count - 1) {
                Console.WriteLine("the mode is not defined so mode is set to 'scan'");
            } else {
                try {
                    mode = (Mode)Enum.Parse(typeof(Mode), argList[modeIndex + 1], true);
                } catch (Exception) {
                    Console.WriteLine("the mode is not defined correctly so mode is set to 'scan'");
                }
            }

            // Parse the -outPath <path> argument
            string outPath;
            int outIndex = argList.IndexOf("-outPath");
            if (outIndex < 0 || outIndex >= argList.Count - 1) {
                throw new Exception("'-outPath' is not given. Invoke the program with the argument '-outPath <path>'");
            } else {
                outPath = argList[outIndex + 1];
                if (outPath.StartsWith("-")) {
                    throw new Exception("'-outPath' is not given. Invoke the program with the argument '-outPath <path>'");
                }
            }

            // Parse -inPath <path> (<path>? ...)
            List<string> inPaths = new List<string>();
            int inIndex = argList.IndexOf("-inPath");
            if (inIndex < 0 || inIndex >= argList.Count - 1) {
                throw new Exception("'-inIndex' is not given. Invoke the program wwith the argument '-inIndex <path> (<path>? ...)'");
            } else {
                string firstInPath = argList[inIndex + 1];
                if (firstInPath.StartsWith("-")) {
                    throw new Exception("'-inIndex' is not given. Invoke the program with the argument '-inIndex <path> (<path>? ...)'");
                }
                inPaths.Add(firstInPath);
                for (int i = inIndex + 2; i < argList.Count; i++) {
                    string inPath = argList[i];
                    if (inPath.StartsWith("-")) {
                        break;
                    }
                    inPaths.Add(inPath);
                }
            }

            if (mode == Mode.create) {
                // Parse -slidePos <slidePos,slidePos,...>
                List<uint> slidePositions = new List<uint>();
                int slidePosIndex = argList.IndexOf("-slidePos");
                if (slidePosIndex < 0 || slidePosIndex >= argList.Count - 1) {
                    throw new Exception("'-slidePos' is not given. Invoke the program with the argument '-slidePos <slidePos,slidePos,...>'");
                } else {
                    string slidePositionsString = argList[slidePosIndex + 1];
                    if (slidePositionsString.StartsWith("-")) {
                        throw new Exception("'-slidePos' is not given. Invoke the program with the argument '-slidePos <slidePos,slidePos,...>'");
                    }
                    try {
                        foreach (String pos in slidePositionsString.Split(",")) {
                            slidePositions.Add(uint.Parse(pos));
                        }
                    } catch (Exception) {
                        throw new Exception("'-slidePos' is not given. Invoke the program with the argument '-slidePos <slidePos,slidePos,...>'");
                    }
                }

                // Parse -basePath <path>
                string basePath;
                int basePathIndex = argList.IndexOf("-basePath");
                if (basePathIndex < 0 || basePathIndex >= argList.Count - 1) {
                    throw new Exception("'-basePath' is not given. Invoke the program with the argument '-basePath <path>'");
                } else {
                    basePath = argList[basePathIndex + 1];
                    if (basePath.StartsWith("-")) {
                        throw new Exception("'-basePath' is not given. Invoke the program with the argument '-basePath <path>'");
                    }
                }

                // Parse -ignoreTheme
                bool ignoreTheme = argList.Contains("-ignoreTheme");

                // Parse -deleteFirstSlide
                bool deleteFirstSlide = argList.Contains("-deleteFirstSlide");

                return new CommandLineArgument(mode, outPath, inPaths, slidePositions, ignoreTheme, deleteFirstSlide, basePath);
            }

            return new CommandLineArgument(mode, outPath, inPaths);
        }

        public static List<string> getArgument(string argument, string[] args) {
            List<string> argList = new List<string>(args);

            int argIndex = argList.IndexOf(argument);
            if (argIndex < 0) {
                return null;
            }

            List<string> argParam = new List<string>();
            for (int i = argIndex + 1; i < argList.Count; i++) {
                string param = argList[i];
                if (param.StartsWith("-")) {
                    break;
                }
                argParam.Add(param);
            }


            return argParam;
        }
    }
}

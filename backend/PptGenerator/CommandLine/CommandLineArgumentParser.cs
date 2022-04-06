using System;
using System.Collections.Generic;
using System.Text;
using System.Linq;

namespace PptGenerator.CommandLine {
    class CommandLineArgumentParser {

        /// <summary>
        /// Get the matching CommandLineArgument for the given mode
        /// </summary>
        /// <param name="args">The args given to the program</param>
        /// <returns>The matching CommandLineArgument for the given mode</returns>
        public static CommandLineArgument Parse(string[] args) {
            List<string> argList = new List<string>(args);

            Console.WriteLine($"argList.Count: {argList.Count}");

            if (argList.Count == 0) {
                throw new Exception("No argument are given! Try '-help' to get a list of arguments.");
            }

            // Parse -help
            if (argList.Contains("-help")) {

                Console.WriteLine("");
                Console.WriteLine("-----ARGUMENTS--------------------------------");
                Console.WriteLine("");

                Console.WriteLine("-help");
                Console.WriteLine("  Shows a list of arguments that are necessary or optional.");

                Console.WriteLine("");
                Console.WriteLine("-mode <scan|create|addUid>");
                Console.WriteLine("  Define the type of operation you want to execute.");
                Console.WriteLine("  'scan' creates a meta-jsonfile of one or more presentations.");
                Console.WriteLine("  'create' creates a new presentation based of slides of another.");
                Console.WriteLine("  'addUid' creates uids for given slides of a presentation.");

                Console.WriteLine("");
                Console.WriteLine("-inPath <path> (<path>? ...)");
                Console.WriteLine("  In scan mode: The source presentaion-file or files that will be scanned.");
                Console.WriteLine("  In create mode: The source presentaion-file that contains slides for the new presentation.");
                Console.WriteLine("  In addUid mode: The presentaion-file that contains slides that will get new uids.");

                Console.WriteLine("");
                Console.WriteLine("-outPath <path>");
                Console.WriteLine("  In scan mode: The path and name of the generated meta-file.");
                Console.WriteLine("  In create mode: The path and name of the generated presentaion-file.");

                Console.WriteLine("");
                Console.WriteLine("-slidePos <slidePos,slidePos,...>");
                Console.WriteLine("  In create mode: The slide positions that will be included in the new presentaion.");
                Console.WriteLine("  In addUid mode: The slide positions that will get new uids.");
                Console.WriteLine("  The position starts at 0 not 1!");

                Console.WriteLine("");
                Console.WriteLine("-basePath <path>");
                Console.WriteLine("  In create mode: The path to a presentaion that is the base for the new presentaion.");
                Console.WriteLine("  All slideds will be appended to the base-presentaion.");

                Console.WriteLine("");
                Console.WriteLine("-placeholders <name,value> (<name,value>? ...)");
                Console.WriteLine("  In create mode: A list of placeholders (name) that will be replaced in the new presentaion (with value).");
                Console.WriteLine("  Placeholder in the presentaion must be in form ~$Name$~");
                Console.WriteLine("  but as parameter you just pass the name without the  ~$ and $~");
                Console.WriteLine("  example: -placeholders Name,Peter Date,02-02-2222");

                Console.WriteLine("");
                Console.WriteLine("-ignoreTheme");
                Console.WriteLine("  In create mode: If not set the theme of the inPath-presentaion will be applied to the outPath-presentaion.");

                Console.WriteLine("");
                Console.WriteLine("-deleteFirstSlide");
                Console.WriteLine("  In create mode: If set the first slide of the outPath-presentaion will be deleted.");

                Console.WriteLine("");
                Console.WriteLine("-existingUids <uid> (<uid>? ...)");
                Console.WriteLine("  In addUid mode: The uids that are currently in use will be ignored so that there are no duplicated uids.");

                Console.WriteLine("");
                Console.WriteLine("-replace <slidePos,slidePos,...>");
                Console.WriteLine("  In create mode: Slides will not be appended, but replaced");


                Console.WriteLine("");
                Console.WriteLine("-----MODES------------------------------------");
                Console.WriteLine("");

                Console.WriteLine("SCAN      :");
                Console.WriteLine("optional  : -mode scan");
                Console.WriteLine("necessary : -inPath <path> (<path>? ...)");
                Console.WriteLine("necessary : -outPath <path>");

                Console.WriteLine("");
                Console.WriteLine("CREATE    :");
                Console.WriteLine("necessary : -mode create");
                Console.WriteLine("necessary : -inPath <path>");
                Console.WriteLine("necessary : -outPath <path>");
                Console.WriteLine("necessary : -slidePos <slidePos,slidePos,...>");
                Console.WriteLine("optional  : -basePath <path>");
                Console.WriteLine("optional  : -placeholders <name,value> (<name,value>? ...)");
                Console.WriteLine("optional  : -ignoreTheme");
                Console.WriteLine("optional  : -deleteFirstSlide");

                Console.WriteLine("");
                Console.WriteLine("ADDUID    :");
                Console.WriteLine("necessary : -mode addUid");
                Console.WriteLine("necessary : -inPath <path>");
                Console.WriteLine("necessary : -slidePos <slidePos,slidePos,...>");
                Console.WriteLine("optional  : -existingUids <uid> (<uid>? ...)");

                return new CommandLineArgument(Mode.undefined, "", null);
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

            switch (mode) {
                case Mode.scan:
                    return scanArgs(args, argList);
                case Mode.create:
                    return createArgs(args, argList);
                case Mode.addUid:
                    return addUidArgs(args, argList);
            }
            return new CommandLineArgument(Mode.undefined, "", null);
        }

        /// <summary>
        /// Get all CommandLineArguments for scan
        /// </summary>
        /// <param name="args">The args given to the program</param>
        /// <param name="argList">The args given to the program as List</param>
        /// <returns>The CommandLineArgument for scan</returns>
        private static CommandLineArgument scanArgs(string[] args, List<string> argList) {
            string outPath = getOutPath(argList);
            List<string> inPaths = getInPath(argList);
            return new CommandLineArgument(Mode.scan, outPath, inPaths);
        }

        /// <summary>
        /// Get all CommandLineArguments for create
        /// </summary>
        /// <param name="args">The args given to the program</param>
        /// <param name="argList">The args given to the program as List</param>
        /// <returns>The CommandLineArgument for create</returns>
        private static CommandLineArgument createArgs(string[] args, List<string> argList) {
            string outPath = getOutPath(argList);
            List<string> inPaths = getInPath(argList);
            List<uint> slidePositions = getSlidePositions(argList);
            List<uint> replacePositions = getReplacePositions(args);
            string basePath = getBasePath(argList);
            List<KeyValuePair<string, string>> placeholders = getPlacehoders(args);

            // Parse -ignoreTheme
            bool ignoreTheme = argList.Contains("-ignoreTheme");

            // Parse -deleteFirstSlide
            bool deleteFirstSlide = argList.Contains("-deleteFirstSlide");

            return new CommandLineArgument(Mode.create, outPath, inPaths, slidePositions, ignoreTheme, deleteFirstSlide, basePath, placeholders, replacePositions);
        }

        /// <summary>
        /// Get all CommandLineArguments for replace
        /// </summary>
        /// <param name="args">The args given to the program</param>
        /// <returns>The CommandLineArgument for replace</returns>
        private static List<uint> getReplacePositions(string[] args) {
            List<uint> replacePos = new List<uint>();
            List<string> arguments = getArgument("-replace", args);
            if (arguments != null && arguments.Count > 0) {
                foreach (var item in arguments[0].Split(",")) {
                    uint result;
                    if(uint.TryParse(item, out result)) {
                        replacePos.Add(result);
                    }
                }
            }
            return replacePos;
        }

        /// <summary>
        /// Get all CommandLineArguments for addUid
        /// </summary>
        /// <param name="args">The args given to the program</param>
        /// <param name="argList">The args given to the program as List</param>
        /// <returns>The CommandLineArgument for addUid</returns>
        private static CommandLineArgument addUidArgs(string[] args, List<string> argList) {
            List<string> inPaths = getInPath(argList);
            List<string> existingUids = getArgument("-existingUids", args);
            if (existingUids == null) {
                existingUids = new List<string>();
            }
            List<uint> slidePositions = getSlidePositions(argList);

            return new CommandLineArgument(Mode.addUid, inPaths, existingUids, slidePositions);
        }

        /// <summary>
        /// Parse -placeholders <name,value> (<name,value>? ...)
        /// </summary>
        /// <param name="args">The args given to the program</param>
        /// <returns>The placeholders</returns>
        private static List<KeyValuePair<string, string>> getPlacehoders(string[] args) {
            List<KeyValuePair<string, string>> placeholders = new List<KeyValuePair<string, string>>();
            List<string> arguments = getArgument("-placeholders", args);
            if (arguments != null) {
                foreach (string item in arguments) {
                    string[] items = item.Split(",");
                    if (items.Length < 2) {
                        throw new Exception("Placeholder have to be in form: '-placeholders <name,value> (<name,value>? ...)'");
                    }
                    placeholders.Add(new KeyValuePair<string, string>(items[0], item.Substring(items[0].Length + 1)));
                    Console.WriteLine(item.Substring(items[0].Length));
                }
            }

            return placeholders;
        }

        /// <summary>
        /// Parse -basePath <path>
        /// </summary>
        /// <param name="argList">The args given to the program as List</param>
        /// <returns>The basePath</returns>
        private static string getBasePath(List<string> argList) {
            string basePath = null;
            int basePathIndex = argList.IndexOf("-basePath");
            if (basePathIndex < 0 || basePathIndex >= argList.Count - 1) {
                // Basepath is now optional
            } else {
                basePath = argList[basePathIndex + 1];
                if (basePath.StartsWith("-")) {
                    throw new Exception("'-basePath' is not given. Invoke the program with the argument '-basePath <path>'");
                }
            }

            return basePath;
        }

        /// <summary>
        /// Parse -slidePos <slidePos,slidePos,...>
        /// </summary>
        /// <param name="argList">The args given to the program as List</param>
        /// <returns>The slidePos</returns>
        private static List<uint> getSlidePositions(List<string> argList) {
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
            return slidePositions;
        }

        /// <summary>
        /// Parse -inPath <path> (<path>? ...)
        /// </summary>
        /// <param name="argList">The args given to the program as List</param>
        /// <returns>The inPath</returns>
        private static List<string> getInPath(List<string> argList) {
            List<string> inPaths = new List<string>();
            int inIndex = argList.IndexOf("-inPath");
            if (inIndex < 0 || inIndex >= argList.Count - 1) {
                throw new Exception("'-inPath' is not given. Invoke the program with the argument '-inPath <path> (<path>? ...)'");
            } else {
                string firstInPath = argList[inIndex + 1];
                if (firstInPath.StartsWith("-")) {
                    throw new Exception("'-inPath' is not given. Invoke the program with the argument '-inPath <path> (<path>? ...)'");
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

            return inPaths;
        }

        /// <summary>
        /// Parse the -outPath <path> argument
        /// </summary>
        /// <param name="argList">The args given to the program as List</param>
        /// <returns>The outPath</returns>
        private static string getOutPath(List<string> argList) {
            string outPath = "";
            int outIndex = argList.IndexOf("-outPath");
            if (outIndex < 0 || outIndex >= argList.Count - 1) {
                throw new Exception("'-outPath' is not given. Invoke the program with the argument '-outPath <path>'");
            } else {
                outPath = argList[outIndex + 1];
                if (outPath.StartsWith("-")) {
                    throw new Exception("'-outPath' is not given. Invoke the program with the argument '-outPath <path>'");
                }
            }

            return outPath;
        }

        /// <summary>
        /// Parse an argument and get the following arguments that don't start with a dash
        /// </summary>
        /// <param name="argument">The argument name</param>
        /// <param name="args">The args given to the program</param>
        /// <returns>The following arguments that don't start with a dash</returns>
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

using System;
using System.Collections.Generic;
using System.Text;
using System.Linq;

namespace PptGenerator.CommandLine {
    class CommandLineArgumentParser {
        public static void Parse(string[] args) {
            List<string> argList = new List<string>(args);

            Mode mode = Mode.scan;
            string outPath;
            List<string> inPaths = new List<string>();

            // Parse the -mode <scan|create> argument
            int modeIndex = argList.IndexOf("-mode");
            if (modeIndex < 0 || modeIndex >= argList.Count - 1) {
                Console.WriteLine("the mode is not defined so mode is set to 'scan'");
            } else {
                try {
                    mode = (Mode)Enum.Parse(typeof(Mode), argList[modeIndex + 1], true);
                } catch (Exception e) {
                    Console.WriteLine("the mode is not defined correctly so mode is set to 'scan'");
                }
            }

            // Parse the -outPath <path> argument
            int outIndex = argList.IndexOf("-outPath");
            if (outIndex < 0 || outIndex >= argList.Count - 1) {
                throw new Exception("'-outPath' is not given. Invoke the program with the argument '-outPath <path>'");
            } else {
                outPath = argList[outIndex + 1];
                if (outPath.StartsWith("-")) {
                    throw new Exception("'-outPath' is not given. Invoke the program with the argument '-outPath <path>'");
                }
            }

            // Parse -inPath
            int inIndex = argList.IndexOf("-outPath");
            if (inIndex < 0 || inIndex >= argList.Count - 1) {
                throw new Exception("'-inIndex' is not given. Invoke the program with the argument '-inIndex <path> (<path>? ...)'");
            } else {
                string firstInPath = argList[inIndex + 1];
                if (firstInPath.StartsWith("-")) {
                    throw new Exception("'-inIndex' is not given. Invoke the program with the argument '-inIndex <path> (<path>? ...)'");
                }
                inPaths.Add(firstInPath);
                for (int i = inIndex + 2; i < argList.Count; i++) {
                    string inPath = argList[inIndex + 1];
                    if (inPath.StartsWith("-")) {
                        break;
                    }
                    inPaths.Add(inPath);
                }
            }

        }
    }
}

using System;
using System.Collections.Generic;
using System.Text;
using System.Linq;

namespace PptGenerator.CommandLine {
    class CommandLineArgumentParser {
        public static void Parse(string[] args) {
            List<string> argList = new List<string>(args);

            Mode mode = Mode.scan;

            int modeIndex = argList.IndexOf("-mode");
            if (modeIndex != -1 && modeIndex - 1 <= argList.Count) {
                try {
                    mode = (Mode)Enum.Parse(typeof(Mode), argList[modeIndex + 1], true);
                } catch (Exception e) {
                    Console.WriteLine("the mode is not defined correct so mode is set to 'scan'");
                }
            } else {
                Console.WriteLine("the mode is not defined so mode is set to 'scan'");
            }
        }
    }
}

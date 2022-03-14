using System;
using System.Collections.Generic;
using System.Text;

namespace PptGenerator.CommandLine {

    public enum Mode {
        undefined,
        scan,
        create
    }

    class CommandLineArgument {

        private Mode _mode;
        private string _outPath;
        private List<string> _inPaths;
        private List<uint> _slidePos;
        private bool _ignoreTheme;
        private bool _deleteFirstSlide;
        private string _basePath;
        private List<KeyValuePair<string, string>> _placeholders;

        public Mode Mode { get => _mode; }
        public string OutPath { get => _outPath; }
        public List<string> InPaths { get => _inPaths; }
        public List<uint> SlidePos { get => _slidePos; }
        public bool IgnoreTheme { get => _ignoreTheme; }
        public bool DeleteFirstSlide { get => _deleteFirstSlide; }
        public string BasePath { get => _basePath; }
        public List<KeyValuePair<string, string>> Placeholders { get => _placeholders; }

        public CommandLineArgument(
            Mode mode,
            string outPath,
            List<string> inPaths
         ) {
            _mode = mode;
            _outPath = outPath;
            _inPaths = inPaths;
        }

        public CommandLineArgument(
            Mode mode,
            string outPath,
            List<string> inPaths,
            List<uint> slidePos,
            bool ignoreTheme,
            bool deletFirstSlide,
            string basePath,
            List<KeyValuePair<string, string>> placeholders
         ) {
            _mode = mode;
            _outPath = outPath;
            _inPaths = inPaths;
            _slidePos = slidePos;
            _ignoreTheme = ignoreTheme;
            _deleteFirstSlide = deletFirstSlide;
            _basePath = basePath;
            _placeholders = placeholders;
        }
    }
}

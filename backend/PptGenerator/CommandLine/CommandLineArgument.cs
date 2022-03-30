using System;
using System.Collections.Generic;
using System.Text;

namespace PptGenerator.CommandLine {

    /// <summary>
    /// The different modes
    /// </summary>
    public enum Mode {
        undefined,
        scan,
        create,
        addUid
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
        private List<string> _existingUids;

        public Mode Mode { get => _mode; }
        public string OutPath { get => _outPath; }
        public List<string> InPaths { get => _inPaths; }
        public List<uint> SlidePos { get => _slidePos; }
        public bool IgnoreTheme { get => _ignoreTheme; }
        public bool DeleteFirstSlide { get => _deleteFirstSlide; }
        public string BasePath { get => _basePath; }
        public List<KeyValuePair<string, string>> Placeholders { get => _placeholders; }
        public List<string> ExistingUids { get => _existingUids; }

        /// <summary>
        /// Creates an object of the contianer class CommandLineArgument
        /// This constructor is used for the mode 'scan'
        /// </summary>
        /// <param name="mode">The mode</param>
        /// <param name="outPath">The path where the result of the scan will be saved</param>
        /// <param name="inPaths">The path of the presentation that will be scanned</param>
        public CommandLineArgument(
            Mode mode,
            string outPath,
            List<string> inPaths
         ) {
            _mode = mode;
            _outPath = outPath;
            _inPaths = inPaths;
        }

        /// <summary>
        /// Creates an object of the contianer class CommandLineArgument
        /// This constructor is used for the mode 'create' 
        /// </summary>
        /// <param name="mode">The mode</param>
        /// <param name="outPath">The path where the presentation will be saved</param>
        /// <param name="inPaths">The path from where the slides are taken</param>
        /// <param name="slidePos">The positions of the slides that will be copied</param>
        /// <param name="ignoreTheme">A boolean if the theme of the copied slides will beignored</param>
        /// <param name="deletFirstSlide">A boolean if the first slide of the created presentation will be delted</param>
        /// <param name="basePath">The basePath where slides slides will be copied to</param>
        /// <param name="placeholders">A Collection of placeholders that will be replaced</param>
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

        /// <summary>
        /// Creates an object of the contianer class CommandLineArgument
        /// This constructor is used for the mode 'addUid' 
        /// </summary>
        /// <param name="mode">The mode</param>
        /// <param name="inPaths">The  path of the presentation with the modiefied uids</param>
        /// <param name="existingUids">A collection of existings uids</param>
        /// <param name="slidePos">The slide positions of the slides which need a new uids</param>
        public CommandLineArgument(
            Mode mode,
            List<string> inPaths,
            List<string> existingUids,
            List<uint> slidePos
        ) {
            _mode = mode;
            _inPaths = inPaths;
            _slidePos = slidePos;
            _existingUids = existingUids;
        }

    }
}

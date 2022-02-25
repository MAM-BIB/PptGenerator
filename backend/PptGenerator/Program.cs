﻿using System;
using System.Linq;
using DocumentFormat.OpenXml.Presentation;
using DocumentFormat.OpenXml.Packaging;
using System.IO;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading;
using PptGenerator.TemplateInfo;
using PptGenerator.CommandLine;
using PptGenerator.Creator;

namespace PptGenerator {
    class Program {

        static uint _uniqueId;

        public static uint uniqueId { get => _uniqueId; set => _uniqueId = value; }

        static void Main(string[] args) {

            CommandLineArgument clArg = CommandLineArgumentParser.Parse(args);

            switch (clArg.Mode) {
                case Mode.scan:
                    TemplateReader templateReader = new TemplateReader(clArg.InPaths);
                    templateReader.ExportAsJson(clArg.OutPath);
                    break;
                case Mode.create:
                    PresentationCreator.Create(clArg);
                    break;
                case Mode.undefined:
                    Console.WriteLine("mode is undefined");
                    break;
            }
        }
    }
}

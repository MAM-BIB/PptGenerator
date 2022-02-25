using System;
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

            CommandLineArgument clArgument = CommandLineArgumentParser.Parse(args);

            switch (clArgument.Mode) {
                case Mode.scan:
                    TemplateReader templateReader = new TemplateReader(clArgument.InPaths);
                    templateReader.ExportAsJson(clArgument.OutPath);
                    break;
                case Mode.create:
                    string emptyPresentationPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, @"..\..\..\..\slides\Slide Master paiqo v0.4 - with one slide.pptx");
                    File.Copy(emptyPresentationPath, clArgument.OutPath, true);
                    PresentationCreator.Create(clArgument);
                    break;
                case Mode.undefined:
                    Console.WriteLine("mode is undefined");
                    break;
            }
        }
    }
}

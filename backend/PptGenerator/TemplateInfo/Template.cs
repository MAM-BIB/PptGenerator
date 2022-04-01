using System;
using System.Collections.Generic;
using System.Text;

namespace PptGenerator.TemplateInfo {
    class Template {
        private string _path;
        private List<Section> _sections;

        public string Path { get => _path; set => _path = value; }
        public List<Section> Sections { get => _sections; set => _sections = value; }

        /// <summary>
        /// Creates an object of the contianer class Template
        /// </summary>
        /// <param name="path">The path to the template</param>
        /// <param name="sections">All sections of the template</param>
        public Template(string path, List<Section> sections = null) {
            Path = path;
            Sections = (sections == null) ? new List<Section>() : sections;
        }
    }
}

using System;
using System.Collections.Generic;
using System.Text;

namespace PptGenerator.TemplateInfo {
    class Template {
        private string _path;
        private List<Section> _sections;

        public string Path { get => _path; set => _path = value; }
        public List<Section> Sections { get => _sections; set => _sections = value; }

        public Template(string path, List<Section> sections = null) {
            Path = path;
            Sections = (sections == null) ? new List<Section>() : sections;
        }
    }
}

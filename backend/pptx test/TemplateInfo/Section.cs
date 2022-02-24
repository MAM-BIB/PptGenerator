using System;
using System.Collections.Generic;
using System.Text;

namespace PptGenerator.TemplateInfo {
    class Section {
        private string _name;
        private List<Slide> _slides;

        public string Name { get => _name; set => _name = value; }
        public List<Slide> Slides { get => _slides; set => _slides = value; }

        public Section(string name, List<Slide> slides = null) {
            Name = name;

            Slides = slides == null ? new List<Slide>() : slides;
        }

        public override string ToString() {
            string str = $"{Name} ({Slides.Count})";
            foreach (Slide slide in Slides) {
                str += $"\n\t{slide}";
            }
            return str;
        }
    }
}

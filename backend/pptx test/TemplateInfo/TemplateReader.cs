using System;
using System.Linq;
using DocumentFormat.OpenXml.Presentation;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml;
using System.IO;
using System.Collections.Generic;
using System.Text.Json;

namespace PptGenerator.TemplateInfo {
    class TemplateReader {

        private List<Template> _templates;

        public List<Template> Templates { get => _templates; set => _templates = value; }

        /// <summary>
        /// A class to read the sections and slides of presentation-templates and export them as json
        /// </summary>
        /// <param name="presentationPaths">A list of paths to presentation-templates</param>
        public TemplateReader(List<string> presentationPaths) {
            Templates = new List<Template>();
            foreach (string presentationPath in presentationPaths) {
                Templates.Add(new Template(presentationPath, ReadSlides(presentationPath)));
            }
        }

        /// <summary>
        /// Export the Sections as json
        /// </summary>
        /// <param name="path">The path to export</param>
        public void ExportAsJson(string path) {
            JsonSerializerOptions options = new JsonSerializerOptions { WriteIndented = true };
            string jsonString = JsonSerializer.Serialize(Templates, options);
            File.WriteAllText(path, jsonString);
        }

        /// <summary>
        /// Get all Section from a presentation
        /// </summary>
        /// <param name="presentationPath">The path to the presentation</param>
        /// <returns>A list of Sections</returns>
        public List<Section> ReadSlides(string presentationPath) {
            using (PresentationDocument presentationDocument = PresentationDocument.Open(presentationPath, true)) {

                List<Section> sections = new List<Section>();

                PresentationPart presentationPart = presentationDocument.PresentationPart;
                Presentation presentation = presentationPart.Presentation;

                var extLst = selectElementByTag(presentation, "extLst");
                foreach (var ext in extLst) {
                    var sectionLst = selectElementByTag(ext, "sectionLst");
                    if (sectionLst == null) continue;
                    foreach (var sectionElem in sectionLst) {
                        if(sectionElem is DocumentFormat.OpenXml.Office2010.PowerPoint.Section of2010Section) {
                            Section section = new Section(of2010Section.Name);
                            sections.Add(section);

                            foreach (DocumentFormat.OpenXml.Office2010.PowerPoint.SectionSlideIdListEntry item in of2010Section.SectionSlideIdList) {

                                uint position = 0;
                                foreach (SlideId slideId in presentation.SlideIdList) {
                                    if (slideId.Id == item.Id) {
                                        SlidePart slidePart = presentationPart.GetPartById(slideId.RelationshipId) as SlidePart;
                                        NotesSlidePart notesSlidePart = slidePart.GetPartsOfType<NotesSlidePart>().FirstOrDefault();

                                        string[] uidArr = notesSlidePart.NotesSlide.InnerText.Split("UID:");
                                        string uid = (uidArr.Length > 1) ? uidArr[1] : null;

                                        section.Slides.Add(new Slide(slideId.RelationshipId, uid, position));
                                    }
                                    position++;
                                }
                            }
                        }
                    }
                }

                presentationDocument.Close();
                return sections;
            }
        }

        /// <summary>
        /// Find an xmlElement by tag-name.
        /// If more then one are found returns the first on
        /// </summary>
        /// <param name="element">The parent element of the searched element</param>
        /// <param name="tag">The tag-name</param>
        /// <returns>The first childElement with given tag-name or null</returns>
        private OpenXmlElement selectElementByTag(OpenXmlElement element, string tag) {
            return element.Where((el) => {
                return el.LocalName == tag;
            }).FirstOrDefault();
        }

        /// <summary>
        /// Find xmlElements by tag-name.
        /// </summary>
        /// <param name="element">The parent element of the searched element</param>
        /// <param name="tag">The tag-name</param>
        /// <returns>The childElements with given tag-name or null</returns>
        private IEnumerable<OpenXmlElement> selectElementsByTag(OpenXmlElement element, string tag) {
            return element.Where((el) => {
                return el.LocalName == tag;
            });
        }
    }
}

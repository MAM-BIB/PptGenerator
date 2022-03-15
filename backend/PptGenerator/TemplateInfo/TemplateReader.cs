using System;
using System.Linq;
using DocumentFormat.OpenXml.Presentation;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml;
using System.IO;
using System.Collections.Generic;
using System.Text.Json;
using System.Text;
using D = DocumentFormat.OpenXml.Drawing;
using System.Text.RegularExpressions;

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

                bool foundSections = false;

                var extLst = selectElementByTag(presentation, "extLst");
                foreach (var ext in extLst) {
                    var sectionLst = selectElementByTag(ext, "sectionLst");
                    if (sectionLst == null) continue;
                    foreach (var sectionElem in sectionLst) {
                        if(sectionElem is DocumentFormat.OpenXml.Office2010.PowerPoint.Section of2010Section) {
                            foundSections = true;
                            Section section = new Section(of2010Section.Name);
                            sections.Add(section);

                            foreach (DocumentFormat.OpenXml.Office2010.PowerPoint.SectionSlideIdListEntry item in of2010Section.SectionSlideIdList) {

                                uint position = 0;
                                foreach (SlideId slideId in presentation.SlideIdList) {
                                    if (slideId.Id == item.Id) {
                                        SlidePart slidePart = presentationPart.GetPartById(slideId.RelationshipId) as SlidePart;
                                        Slide slide = getSlideFromPart(position, slideId, slidePart);

                                        section.Slides.Add(slide);
                                    }
                                    position++;
                                }
                            }
                        }
                    }
                }

                if (!foundSections) {
                    Section section = new Section("__defaultSection");
                    sections.Add(section    );
                    uint position = 0;
                    foreach (SlideId slideId in presentation.SlideIdList) {
                        SlidePart slidePart = presentationPart.GetPartById(slideId.RelationshipId) as SlidePart;
                        Slide slide = getSlideFromPart(position, slideId, slidePart);

                        section.Slides.Add(slide);
                        position++;
                    }
                }

                presentationDocument.Close();
                return sections;
            }
        }

        private static Slide getSlideFromPart(uint position, SlideId slideId, SlidePart slidePart) {
            string title = "";
            try {
                title = GetSlideTitle(slidePart);
            } catch (Exception) { }

            NotesSlidePart notesSlidePart = slidePart.GetPartsOfType<NotesSlidePart>().FirstOrDefault();
            string uid = "";
            if (notesSlidePart != null) {
                string[] uidArr = notesSlidePart.NotesSlide.InnerText.Split("UID:");
                uid = (uidArr.Length > 1) ? uidArr[1] : "";
            }

            // Match Placeholder
            string text = slidePart.Slide.InnerText;
            Regex regex = new Regex(@"~\$[^~]*\$~", RegexOptions.Compiled);
            MatchCollection matches = regex.Matches(text);

            List<String> placeholders = new List<string>();

            foreach (Match match in matches) {
                Console.WriteLine($"placehonder: {match.Value}");
                placeholders.Add(match.Value.Substring(2, match.Value.Length - 4));
            }

            bool isHidden = false;
            if (slidePart.Slide.Show != null && !slidePart.Slide.Show.Value) {
                isHidden = true;
            }

            Slide slide = new Slide(slideId.RelationshipId, uid, position, title, isHidden, placeholders);
            return slide;
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

        // Get the title string of the slide.
        public static string GetSlideTitle(SlidePart slidePart) {
            if (slidePart == null) {
                throw new ArgumentNullException("presentationDocument");
            }

            // Declare a paragraph separator.
            string paragraphSeparator = null;

            if (slidePart.Slide != null) {
                // Find all the title shapes.
                var shapes = from shape in slidePart.Slide.Descendants<Shape>()
                             where IsTitleShape(shape)
                             select shape;

                StringBuilder paragraphText = new StringBuilder();

                foreach (var shape in shapes) {
                    // Get the text in each paragraph in this shape.
                    foreach (var paragraph in shape.TextBody.Descendants<D.Paragraph>()) {
                        // Add a line break.
                        paragraphText.Append(paragraphSeparator);

                        foreach (var text in paragraph.Descendants<D.Text>()) {
                            paragraphText.Append(text.Text);
                        }

                        paragraphSeparator = "\n";
                    }
                }

                return paragraphText.ToString();
            }

            return string.Empty;
        }

        // Determines whether the shape is a title shape.
        private static bool IsTitleShape(Shape shape) {
            var placeholderShape = shape.NonVisualShapeProperties.ApplicationNonVisualDrawingProperties.GetFirstChild<PlaceholderShape>();
            if (placeholderShape != null && placeholderShape.Type != null && placeholderShape.Type.HasValue) {
                switch ((PlaceholderValues)placeholderShape.Type) {
                    // Any title shape.
                    case PlaceholderValues.Title:

                    // A centered title.
                    case PlaceholderValues.CenteredTitle:
                        return true;

                    default:
                        return false;
                }
            }
            return false;
        }
    }
}
